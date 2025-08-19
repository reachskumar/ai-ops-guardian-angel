"""
SRE & Observability API Endpoints
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


router = APIRouter(prefix="/sre", tags=["sre"])


class IncidentManageRequest(BaseModel):
    tenant_id: Optional[str] = None
    service: Optional[str] = None
    alerts: List[Dict[str, Any]]


@router.post("/incident/manage")
async def incident_manage(req: IncidentManageRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.INCIDENT_MANAGER)
    if not agent:
        raise HTTPException(status_code=503, detail="IncidentManagerAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="incident_manager", description="Incident management", context={
        "tenant_id": req.tenant_id,
        "service": req.service,
        "alerts": req.alerts,
    })
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class SLOEvaluateRequest(BaseModel):
    slo: Dict[str, Any]


@router.post("/slo/evaluate")
async def slo_evaluate(req: SLOEvaluateRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.SLO_MANAGER)
    if not agent:
        raise HTTPException(status_code=503, detail="SLOManagerAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="slo_manager", description="SLO evaluate", context={"slo": req.slo})
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class ChangeCorrelationRequest(BaseModel):
    incident_id: str
    service: Optional[str] = None


@router.post("/change/correlate")
async def change_correlate(req: ChangeCorrelationRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.CHANGE_CORRELATION)
    if not agent:
        raise HTTPException(status_code=503, detail="ChangeCorrelationAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="change_correlation", description="Change correlation", context={
        "incident_id": req.incident_id,
        "service": req.service,
    })
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class RunbookGenerateRequest(BaseModel):
    tenant_id: Optional[str] = None
    incident: Dict[str, Any]


@router.post("/runbook/generate")
async def runbook_generate(req: RunbookGenerateRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.RUNBOOK_GENERATOR)
    if not agent:
        raise HTTPException(status_code=503, detail="RunbookGeneratorAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="runbook_generator", description="Runbook generate", context={
        "tenant_id": req.tenant_id,
        "incident": req.incident,
    })
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


