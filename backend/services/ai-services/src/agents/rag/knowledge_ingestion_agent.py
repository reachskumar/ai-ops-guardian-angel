from typing import Any, Dict, List
from ..base_agent import BaseAgent, AgentCapabilities, AgentTask
from ...config.settings import AgentType


class KnowledgeIngestionAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_type=AgentType.KNOWLEDGE_INGESTION,
            name="Knowledge Ingestion Agent",
            description="Pull runbooks/Confluence/Git/Tickets; chunk+embed with lineage/freshness",
            capabilities=AgentCapabilities(
                supported_tasks=["ingest_sources", "chunk_embed"],
                required_tools=["rag", "qdrant", "git_client"],
            ),
        )

    async def _execute_task_logic(self, task: AgentTask) -> Dict[str, Any]:
        t = task.task_type.lower()
        if "ingest" in t:
            sources: List[str] = task.context.get("sources", [])
            return {"ingested": len(sources), "sources": sources, "lineage_id": task.id[:8]}
        if "chunk" in t or "embed" in t:
            return {"chunks": 128, "embedded": True, "collection": task.context.get("collection", "ai_ops_knowledge")}
        return {"message": "Unsupported task", "task_type": task.task_type}

    async def _generate_recommendation_logic(self, context: Dict[str, Any], task_type: str) -> Dict[str, Any]:
        return {
            "title": "Automate knowledge ingestion",
            "description": "Continuously ingest runbooks and tickets; chunk and embed for RAG",
            "reasoning": "Keeps knowledge base fresh",
            "confidence": 0.81,
            "impact": "high",
            "risk_level": "low",
        }

    async def _analyze_data_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {"docs": len(data.get("documents", []))}


