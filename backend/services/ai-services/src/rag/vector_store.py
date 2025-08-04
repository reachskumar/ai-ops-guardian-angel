"""
Production-Grade RAG (Retrieval-Augmented Generation) System
Vector database integration with Qdrant for knowledge retrieval
"""

import asyncio
import json
import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
from pathlib import Path
import hashlib
import uuid

# Vector database and embeddings
try:
    from qdrant_client import QdrantClient, models
    from qdrant_client.http import models as rest
    QDRANT_AVAILABLE = True
except ImportError:
    QDRANT_AVAILABLE = False
    logging.warning("Qdrant client not available. Install with: pip install qdrant-client")

# Text processing and embeddings
try:
    from sentence_transformers import SentenceTransformer
    import numpy as np
    EMBEDDINGS_AVAILABLE = True
except ImportError:
    EMBEDDINGS_AVAILABLE = False
    logging.warning("Sentence transformers not available. Install with: pip install sentence-transformers")

from ..config.settings import settings


class VectorStore:
    """Production-grade vector store for RAG system"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Initialize vector database client
        if QDRANT_AVAILABLE:
            self.qdrant_client = QdrantClient(
                url=settings.qdrant_url,
                api_key=settings.qdrant_api_key
            )
        else:
            self.qdrant_client = None
        
        # Initialize embedding model
        if EMBEDDINGS_AVAILABLE:
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        else:
            self.embedding_model = None
        
        # Collection configuration
        self.collection_name = "ai_ops_knowledge"
        self.vector_size = 384  # all-MiniLM-L6-v2 embedding size
        
        # Initialize collections
        self._initialize_collections()
        
        self.logger.info("Vector store initialized successfully")
    
    def _initialize_collections(self):
        """Initialize Qdrant collections"""
        if not self.qdrant_client:
            return
        
        try:
            # Check if collection exists
            collections = self.qdrant_client.get_collections()
            collection_names = [col.name for col in collections.collections]
            
            if self.collection_name not in collection_names:
                # Create collection
                self.qdrant_client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=models.VectorParams(
                        size=self.vector_size,
                        distance=models.Distance.COSINE
                    )
                )
                self.logger.info(f"Created collection: {self.collection_name}")
            else:
                self.logger.info(f"Collection {self.collection_name} already exists")
                
        except Exception as e:
            self.logger.error(f"Failed to initialize collections: {str(e)}")
    
    async def add_document(
        self,
        content: str,
        metadata: Dict[str, Any],
        document_type: str = "general",
        chunk_size: int = 512,
        overlap: int = 50
    ) -> str:
        """Add document to vector store"""
        
        if not self.qdrant_client or not self.embedding_model:
            raise Exception("Vector store not properly initialized")
        
        try:
            # Generate document ID
            doc_id = str(uuid.uuid4())
            
            # Chunk the document
            chunks = self._chunk_text(content, chunk_size, overlap)
            
            # Process each chunk
            points = []
            for i, chunk in enumerate(chunks):
                # Generate embedding
                embedding = self.embedding_model.encode(chunk)
                
                # Create point
                point = models.PointStruct(
                    id=f"{doc_id}_{i}",
                    vector=embedding.tolist(),
                    payload={
                        "content": chunk,
                        "document_id": doc_id,
                        "chunk_index": i,
                        "document_type": document_type,
                        "metadata": metadata,
                        "created_at": datetime.now().isoformat(),
                        "total_chunks": len(chunks)
                    }
                )
                points.append(point)
            
            # Upload to vector store
            self.qdrant_client.upsert(
                collection_name=self.collection_name,
                points=points
            )
            
            self.logger.info(f"Added document {doc_id} with {len(chunks)} chunks")
            return doc_id
            
        except Exception as e:
            self.logger.error(f"Failed to add document: {str(e)}")
            raise
    
    async def search_similar(
        self,
        query: str,
        limit: int = 10,
        score_threshold: float = 0.7,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Search for similar documents"""
        
        if not self.qdrant_client or not self.embedding_model:
            raise Exception("Vector store not properly initialized")
        
        try:
            # Generate query embedding
            query_embedding = self.embedding_model.encode(query)
            
            # Build search request
            search_request = models.SearchRequest(
                vector=query_embedding.tolist(),
                limit=limit,
                score_threshold=score_threshold
            )
            
            # Add filters if provided
            if filters:
                search_request.filter = self._build_filter(filters)
            
            # Search
            results = self.qdrant_client.search(
                collection_name=self.collection_name,
                query_vector=query_embedding.tolist(),
                limit=limit,
                score_threshold=score_threshold,
                query_filter=search_request.filter if filters else None
            )
            
            # Process results
            documents = []
            for result in results:
                documents.append({
                    "id": result.id,
                    "score": result.score,
                    "content": result.payload.get("content", ""),
                    "metadata": result.payload.get("metadata", {}),
                    "document_type": result.payload.get("document_type", "general"),
                    "chunk_index": result.payload.get("chunk_index", 0)
                })
            
            return documents
            
        except Exception as e:
            self.logger.error(f"Search failed: {str(e)}")
            raise
    
    async def get_document_by_id(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Get document by ID"""
        
        if not self.qdrant_client:
            return None
        
        try:
            # Search for all chunks of the document
            results = self.qdrant_client.scroll(
                collection_name=self.collection_name,
                scroll_filter=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="document_id",
                            match=models.MatchValue(value=document_id)
                        )
                    ]
                ),
                limit=100
            )
            
            if not results[0]:
                return None
            
            # Reconstruct document
            chunks = sorted(results[0], key=lambda x: x.payload.get("chunk_index", 0))
            content = " ".join([chunk.payload.get("content", "") for chunk in chunks])
            
            return {
                "id": document_id,
                "content": content,
                "metadata": chunks[0].payload.get("metadata", {}),
                "document_type": chunks[0].payload.get("document_type", "general"),
                "total_chunks": len(chunks)
            }
            
        except Exception as e:
            self.logger.error(f"Failed to get document {document_id}: {str(e)}")
            return None
    
    async def delete_document(self, document_id: str) -> bool:
        """Delete document by ID"""
        
        if not self.qdrant_client:
            return False
        
        try:
            # Delete all chunks of the document
            self.qdrant_client.delete(
                collection_name=self.collection_name,
                points_selector=models.FilterSelector(
                    filter=models.Filter(
                        must=[
                            models.FieldCondition(
                                key="document_id",
                                match=models.MatchValue(value=document_id)
                            )
                        ]
                    )
                )
            )
            
            self.logger.info(f"Deleted document {document_id}")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to delete document {document_id}: {str(e)}")
            return False
    
    async def update_document(
        self,
        document_id: str,
        content: str,
        metadata: Dict[str, Any],
        chunk_size: int = 512,
        overlap: int = 50
    ) -> bool:
        """Update existing document"""
        
        try:
            # Delete existing document
            await self.delete_document(document_id)
            
            # Add updated document
            await self.add_document(
                content=content,
                metadata=metadata,
                chunk_size=chunk_size,
                overlap=overlap
            )
            
            self.logger.info(f"Updated document {document_id}")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to update document {document_id}: {str(e)}")
            return False
    
    def _chunk_text(self, text: str, chunk_size: int, overlap: int) -> List[str]:
        """Split text into overlapping chunks"""
        
        if len(text) <= chunk_size:
            return [text]
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            
            # If this isn't the last chunk, try to break at a word boundary
            if end < len(text):
                # Look for the last space in the chunk
                last_space = text.rfind(' ', start, end)
                if last_space > start:
                    end = last_space
            
            chunks.append(text[start:end].strip())
            start = end - overlap
            
            if start >= len(text):
                break
        
        return chunks
    
    def _build_filter(self, filters: Dict[str, Any]) -> models.Filter:
        """Build Qdrant filter from dictionary"""
        
        conditions = []
        
        for key, value in filters.items():
            if isinstance(value, str):
                conditions.append(
                    models.FieldCondition(
                        key=key,
                        match=models.MatchValue(value=value)
                    )
                )
            elif isinstance(value, list):
                conditions.append(
                    models.FieldCondition(
                        key=key,
                        match=models.MatchAny(any=value)
                    )
                )
            elif isinstance(value, dict):
                # Handle range queries
                if "gte" in value or "lte" in value:
                    range_dict = {}
                    if "gte" in value:
                        range_dict["gte"] = value["gte"]
                    if "lte" in value:
                        range_dict["lte"] = value["lte"]
                    
                    conditions.append(
                        models.FieldCondition(
                            key=key,
                            range=models.DatetimeRange(**range_dict)
                        )
                    )
        
        return models.Filter(must=conditions) if conditions else None
    
    async def get_collection_stats(self) -> Dict[str, Any]:
        """Get collection statistics"""
        
        if not self.qdrant_client:
            return {"error": "Vector store not available"}
        
        try:
            collection_info = self.qdrant_client.get_collection(self.collection_name)
            
            return {
                "collection_name": self.collection_name,
                "vector_size": self.vector_size,
                "points_count": collection_info.points_count,
                "segments_count": collection_info.segments_count,
                "status": collection_info.status.value
            }
            
        except Exception as e:
            self.logger.error(f"Failed to get collection stats: {str(e)}")
            return {"error": str(e)}
    
    async def clear_collection(self) -> bool:
        """Clear all documents from collection"""
        
        if not self.qdrant_client:
            return False
        
        try:
            self.qdrant_client.delete(
                collection_name=self.collection_name,
                points_selector=models.PointIdsList(
                    points=[]
                )
            )
            
            self.logger.info(f"Cleared collection {self.collection_name}")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to clear collection: {str(e)}")
            return False


class RAGSystem:
    """Complete RAG system with document processing and retrieval"""
    
    def __init__(self):
        self.vector_store = VectorStore()
        self.logger = logging.getLogger(__name__)
        
        # Document processors
        self.processors = {
            "markdown": self._process_markdown,
            "json": self._process_json,
            "yaml": self._process_yaml,
            "text": self._process_text,
            "log": self._process_log
        }
    
    async def add_knowledge(
        self,
        content: str,
        source: str,
        document_type: str = "general",
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Add knowledge to the RAG system"""
        
        try:
            # Process content based on type
            processed_content = await self._process_content(content, document_type)
            
            # Prepare metadata
            doc_metadata = {
                "source": source,
                "document_type": document_type,
                "added_at": datetime.now().isoformat(),
                "content_hash": hashlib.md5(content.encode()).hexdigest()
            }
            
            if metadata:
                doc_metadata.update(metadata)
            
            # Add to vector store
            doc_id = await self.vector_store.add_document(
                content=processed_content,
                metadata=doc_metadata,
                document_type=document_type
            )
            
            self.logger.info(f"Added knowledge from {source} with ID {doc_id}")
            return doc_id
            
        except Exception as e:
            self.logger.error(f"Failed to add knowledge: {str(e)}")
            raise
    
    async def query_knowledge(
        self,
        query: str,
        context_type: Optional[str] = None,
        limit: int = 5,
        score_threshold: float = 0.7
    ) -> Dict[str, Any]:
        """Query knowledge base"""
        
        try:
            # Build filters
            filters = None
            if context_type:
                filters = {"document_type": context_type}
            
            # Search vector store
            results = await self.vector_store.search_similar(
                query=query,
                limit=limit,
                score_threshold=score_threshold,
                filters=filters
            )
            
            # Format response
            response = {
                "query": query,
                "results": results,
                "total_found": len(results),
                "query_timestamp": datetime.now().isoformat()
            }
            
            # Add context if results found
            if results:
                context = self._build_context(results)
                response["context"] = context
                response["sources"] = [r["metadata"].get("source", "") for r in results]
            
            return response
            
        except Exception as e:
            self.logger.error(f"Knowledge query failed: {str(e)}")
            raise
    
    async def get_knowledge_stats(self) -> Dict[str, Any]:
        """Get knowledge base statistics"""
        
        try:
            vector_stats = await self.vector_store.get_collection_stats()
            
            return {
                "vector_store": vector_stats,
                "total_documents": vector_stats.get("points_count", 0),
                "last_updated": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Failed to get knowledge stats: {str(e)}")
            return {"error": str(e)}
    
    async def _process_content(self, content: str, document_type: str) -> str:
        """Process content based on document type"""
        
        processor = self.processors.get(document_type, self._process_text)
        return await processor(content)
    
    async def _process_markdown(self, content: str) -> str:
        """Process markdown content"""
        # Remove markdown formatting for better embedding
        import re
        
        # Remove headers
        content = re.sub(r'^#{1,6}\s+', '', content, flags=re.MULTILINE)
        
        # Remove bold/italic
        content = re.sub(r'\*\*(.*?)\*\*', r'\1', content)
        content = re.sub(r'\*(.*?)\*', r'\1', content)
        
        # Remove code blocks
        content = re.sub(r'```.*?```', '', content, flags=re.DOTALL)
        
        # Remove inline code
        content = re.sub(r'`(.*?)`', r'\1', content)
        
        # Remove links
        content = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', content)
        
        return content.strip()
    
    async def _process_json(self, content: str) -> str:
        """Process JSON content"""
        try:
            data = json.loads(content)
            # Extract text from JSON structure
            return json.dumps(data, indent=2)
        except:
            return content
    
    async def _process_yaml(self, content: str) -> str:
        """Process YAML content"""
        # For now, return as-is. Could add YAML parsing if needed
        return content
    
    async def _process_text(self, content: str) -> str:
        """Process plain text content"""
        return content.strip()
    
    async def _process_log(self, content: str) -> str:
        """Process log content"""
        # Extract meaningful information from logs
        lines = content.split('\n')
        processed_lines = []
        
        for line in lines:
            # Remove timestamp prefixes
            line = re.sub(r'^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}', '', line)
            line = re.sub(r'^\d{2}:\d{2}:\d{2}', '', line)
            
            # Remove log levels
            line = re.sub(r'\[(DEBUG|INFO|WARN|ERROR|FATAL)\]', '', line)
            
            if line.strip():
                processed_lines.append(line.strip())
        
        return ' '.join(processed_lines)
    
    def _build_context(self, results: List[Dict[str, Any]]) -> str:
        """Build context from search results"""
        
        context_parts = []
        
        for i, result in enumerate(results):
            content = result.get("content", "")
            score = result.get("score", 0)
            source = result.get("metadata", {}).get("source", "")
            
            context_parts.append(f"[Source: {source}, Relevance: {score:.2f}]\n{content}")
        
        return "\n\n".join(context_parts)


# Global RAG system instance
rag_system = RAGSystem() 