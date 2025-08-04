"""
RAG (Retrieval-Augmented Generation) API Endpoints
Knowledge management and intelligent document retrieval
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime

from ..rag.vector_store import rag_system
from ..auth.auth_middleware import get_current_user
from ..config.settings import settings

router = APIRouter(prefix="/rag", tags=["RAG System"])
logger = logging.getLogger(__name__)


class KnowledgeRequest(BaseModel):
    """Request for adding knowledge"""
    content: str = Field(..., description="Document content")
    source: str = Field(..., description="Source of the document")
    document_type: str = Field(default="general", description="Type of document")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional metadata")


class KnowledgeResponse(BaseModel):
    """Response from knowledge operations"""
    success: bool
    document_id: Optional[str] = None
    message: str
    timestamp: datetime


class QueryRequest(BaseModel):
    """Request for knowledge query"""
    query: str = Field(..., description="Search query")
    context_type: Optional[str] = Field(default=None, description="Filter by document type")
    limit: int = Field(default=5, description="Number of results to return")
    score_threshold: float = Field(default=0.7, description="Minimum relevance score")


class QueryResponse(BaseModel):
    """Response from knowledge query"""
    query: str
    results: List[Dict[str, Any]]
    total_found: int
    context: Optional[str] = None
    sources: List[str] = []
    query_timestamp: datetime


class DocumentUpdateRequest(BaseModel):
    """Request for updating document"""
    document_id: str = Field(..., description="Document ID to update")
    content: str = Field(..., description="New document content")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Updated metadata")


@router.post("/knowledge/add", response_model=KnowledgeResponse)
async def add_knowledge(
    request: KnowledgeRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> KnowledgeResponse:
    """Add knowledge to the RAG system"""
    
    try:
        logger.info(f"Adding knowledge from {request.source} for user {current_user.get('user_id')}")
        
        # Add user info to metadata
        metadata = request.metadata or {}
        metadata["added_by"] = current_user.get('user_id')
        metadata["user_organization"] = current_user.get('organization_id')
        
        # Add to RAG system
        document_id = await rag_system.add_knowledge(
            content=request.content,
            source=request.source,
            document_type=request.document_type,
            metadata=metadata
        )
        
        return KnowledgeResponse(
            success=True,
            document_id=document_id,
            message=f"Knowledge added successfully from {request.source}",
            timestamp=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"Failed to add knowledge: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to add knowledge: {str(e)}")


@router.post("/knowledge/query", response_model=QueryResponse)
async def query_knowledge(
    request: QueryRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> QueryResponse:
    """Query knowledge base"""
    
    try:
        logger.info(f"Knowledge query: {request.query} by user {current_user.get('user_id')}")
        
        # Query RAG system
        result = await rag_system.query_knowledge(
            query=request.query,
            context_type=request.context_type,
            limit=request.limit,
            score_threshold=request.score_threshold
        )
        
        return QueryResponse(
            query=result["query"],
            results=result["results"],
            total_found=result["total_found"],
            context=result.get("context"),
            sources=result.get("sources", []),
            query_timestamp=datetime.fromisoformat(result["query_timestamp"])
        )
        
    except Exception as e:
        logger.error(f"Knowledge query failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")


@router.get("/knowledge/stats")
async def get_knowledge_stats(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get knowledge base statistics"""
    
    try:
        stats = await rag_system.get_knowledge_stats()
        return {
            "success": True,
            "stats": stats,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to get knowledge stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")


@router.get("/knowledge/document/{document_id}")
async def get_document(
    document_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get document by ID"""
    
    try:
        document = await rag_system.vector_store.get_document_by_id(document_id)
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return {
            "success": True,
            "document": document,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get document {document_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get document: {str(e)}")


@router.put("/knowledge/document/{document_id}")
async def update_document(
    document_id: str,
    request: DocumentUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> KnowledgeResponse:
    """Update existing document"""
    
    try:
        logger.info(f"Updating document {document_id} for user {current_user.get('user_id')}")
        
        # Add user info to metadata
        metadata = request.metadata or {}
        metadata["updated_by"] = current_user.get('user_id')
        metadata["updated_at"] = datetime.now().isoformat()
        
        # Update document
        success = await rag_system.vector_store.update_document(
            document_id=document_id,
            content=request.content,
            metadata=metadata
        )
        
        if not success:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return KnowledgeResponse(
            success=True,
            document_id=document_id,
            message=f"Document {document_id} updated successfully",
            timestamp=datetime.now()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update document {document_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update document: {str(e)}")


@router.delete("/knowledge/document/{document_id}")
async def delete_document(
    document_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> KnowledgeResponse:
    """Delete document by ID"""
    
    try:
        logger.info(f"Deleting document {document_id} for user {current_user.get('user_id')}")
        
        success = await rag_system.vector_store.delete_document(document_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return KnowledgeResponse(
            success=True,
            document_id=document_id,
            message=f"Document {document_id} deleted successfully",
            timestamp=datetime.now()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete document {document_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")


@router.post("/knowledge/upload")
async def upload_document(
    file: UploadFile = File(...),
    source: str = None,
    document_type: str = "general",
    metadata: Optional[Dict[str, Any]] = None,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> KnowledgeResponse:
    """Upload and process document"""
    
    try:
        logger.info(f"Uploading document {file.filename} for user {current_user.get('user_id')}")
        
        # Read file content
        content = await file.read()
        content_str = content.decode('utf-8')
        
        # Determine source if not provided
        if not source:
            source = f"upload:{file.filename}"
        
        # Determine document type from filename if not specified
        if document_type == "general":
            if file.filename.endswith('.md'):
                document_type = "markdown"
            elif file.filename.endswith('.json'):
                document_type = "json"
            elif file.filename.endswith(('.yml', '.yaml')):
                document_type = "yaml"
            elif file.filename.endswith('.log'):
                document_type = "log"
        
        # Add user info to metadata
        doc_metadata = metadata or {}
        doc_metadata["uploaded_by"] = current_user.get('user_id')
        doc_metadata["original_filename"] = file.filename
        doc_metadata["file_size"] = len(content)
        
        # Add to RAG system
        document_id = await rag_system.add_knowledge(
            content=content_str,
            source=source,
            document_type=document_type,
            metadata=doc_metadata
        )
        
        return KnowledgeResponse(
            success=True,
            document_id=document_id,
            message=f"Document {file.filename} uploaded and processed successfully",
            timestamp=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"Failed to upload document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.post("/knowledge/bulk-add")
async def bulk_add_knowledge(
    documents: List[KnowledgeRequest],
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """Add multiple documents to knowledge base"""
    
    try:
        logger.info(f"Bulk adding {len(documents)} documents for user {current_user.get('user_id')}")
        
        results = []
        for doc in documents:
            try:
                # Add user info to metadata
                metadata = doc.metadata or {}
                metadata["added_by"] = current_user.get('user_id')
                metadata["bulk_upload"] = True
                
                document_id = await rag_system.add_knowledge(
                    content=doc.content,
                    source=doc.source,
                    document_type=doc.document_type,
                    metadata=metadata
                )
                
                results.append({
                    "source": doc.source,
                    "success": True,
                    "document_id": document_id
                })
                
            except Exception as e:
                results.append({
                    "source": doc.source,
                    "success": False,
                    "error": str(e)
                })
        
        success_count = sum(1 for r in results if r["success"])
        
        return {
            "success": True,
            "total_documents": len(documents),
            "successful": success_count,
            "failed": len(documents) - success_count,
            "results": results,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Bulk add failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Bulk add failed: {str(e)}")


@router.get("/knowledge/search")
async def search_documents(
    query: str,
    document_type: Optional[str] = None,
    limit: int = 10,
    score_threshold: float = 0.7,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """Search documents with filters"""
    
    try:
        logger.info(f"Searching documents with query: {query}")
        
        # Build filters
        filters = None
        if document_type:
            filters = {"document_type": document_type}
        
        # Search vector store directly
        results = await rag_system.vector_store.search_similar(
            query=query,
            limit=limit,
            score_threshold=score_threshold,
            filters=filters
        )
        
        return {
            "success": True,
            "query": query,
            "results": results,
            "total_found": len(results),
            "filters": filters,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Search failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.post("/knowledge/clear")
async def clear_knowledge_base(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> KnowledgeResponse:
    """Clear all documents from knowledge base"""
    
    try:
        logger.warning(f"Clearing knowledge base for user {current_user.get('user_id')}")
        
        success = await rag_system.vector_store.clear_collection()
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to clear knowledge base")
        
        return KnowledgeResponse(
            success=True,
            message="Knowledge base cleared successfully",
            timestamp=datetime.now()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to clear knowledge base: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to clear knowledge base: {str(e)}")


@router.get("/knowledge/supported-types")
async def get_supported_document_types() -> Dict[str, Any]:
    """Get supported document types"""
    
    return {
        "success": True,
        "document_types": [
            {
                "type": "general",
                "description": "General text documents",
                "extensions": [".txt", ".text"]
            },
            {
                "type": "markdown",
                "description": "Markdown documents",
                "extensions": [".md", ".markdown"]
            },
            {
                "type": "json",
                "description": "JSON documents",
                "extensions": [".json"]
            },
            {
                "type": "yaml",
                "description": "YAML documents",
                "extensions": [".yml", ".yaml"]
            },
            {
                "type": "log",
                "description": "Log files",
                "extensions": [".log"]
            }
        ],
        "timestamp": datetime.now().isoformat()
    } 