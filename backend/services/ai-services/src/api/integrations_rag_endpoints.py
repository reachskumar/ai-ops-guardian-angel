"""
Integrations & RAG API Endpoints
"""

try:
    from fastapi import APIRouter, HTTPException
    from pydantic import BaseModel
    FASTAPI_AVAILABLE = True
except ImportError:
    FASTAPI_AVAILABLE = False
    class APIRouter:
        def __init__(self, *args, **kwargs): pass
        def post(self, *args, **kwargs):
            def decorator(func): return func
            return decorator
    class BaseModel: pass
    class HTTPException(Exception):
        def __init__(self, status_code, detail): self.status_code = status_code; self.detail = detail

from typing import Optional, Dict, Any, List

from ..orchestrator.agent_orchestrator import orchestrator
from ..config.settings import AgentType


router = APIRouter(prefix="/integrations_rag", tags=["integrations_rag"])


class InstallRequest(BaseModel):
    provider: str
    config: Optional[Dict[str, Any]] = None


@router.post("/install")
async def marketplace_install(req: InstallRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.INTEGRATION_INSTALLER)
    if not agent:
        raise HTTPException(status_code=503, detail="IntegrationInstallerAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="marketplace_install", description="Marketplace install", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class OAuthRequest(BaseModel):
    provider: str


@router.post("/oauth/authorize")
async def oauth_authorize(req: OAuthRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.INTEGRATION_INSTALLER)
    if not agent:
        raise HTTPException(status_code=503, detail="IntegrationInstallerAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="oauth_authorize", description="OAuth authorization", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class ConfigApplyRequest(BaseModel):
    provider: str
    config: Dict[str, Any]


@router.post("/config/apply")
async def config_apply(req: ConfigApplyRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.INTEGRATION_INSTALLER)
    if not agent:
        raise HTTPException(status_code=503, detail="IntegrationInstallerAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="config_apply", description="Apply integration config", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class HealthCheckRequest(BaseModel):
    provider: str


@router.post("/health/check")
async def health_check(req: HealthCheckRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.INTEGRATION_INSTALLER)
    if not agent:
        raise HTTPException(status_code=503, detail="IntegrationInstallerAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="health_check", description="Integration health check", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class WebhookEventRequest(BaseModel):
    provider: str
    event: Dict[str, Any]


@router.post("/webhook/normalize")
async def webhook_normalize(req: WebhookEventRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.WEBHOOK_NORMALIZER)
    if not agent:
        raise HTTPException(status_code=503, detail="WebhookNormalizerAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="normalize_event", description="Normalize webhook event", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class IngestRequest(BaseModel):
    sources: List[str]
    collection: Optional[str] = None


@router.post("/knowledge/ingest")
async def knowledge_ingest(req: IngestRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.KNOWLEDGE_INGESTION)
    if not agent:
        raise HTTPException(status_code=503, detail="KnowledgeIngestionAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="ingest_sources", description="Ingest knowledge sources", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class ChunkEmbedRequest(BaseModel):
    collection: Optional[str] = None


@router.post("/knowledge/chunk_embed")
async def knowledge_chunk_embed(req: ChunkEmbedRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.KNOWLEDGE_INGESTION)
    if not agent:
        raise HTTPException(status_code=503, detail="KnowledgeIngestionAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="chunk_embed", description="Chunk and embed knowledge", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


@router.post("/freshness/scan")
async def freshness_scan():
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.FRESHNESS_GUARDIAN)
    if not agent:
        raise HTTPException(status_code=503, detail="FreshnessGuardianAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="freshness_scan", description="Scan for stale knowledge")
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


@router.post("/freshness/prioritize")
async def freshness_prioritize():
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.FRESHNESS_GUARDIAN)
    if not agent:
        raise HTTPException(status_code=503, detail="FreshnessGuardianAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="prioritize_reingestion", description="Prioritize knowledge re-ingestion")
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


