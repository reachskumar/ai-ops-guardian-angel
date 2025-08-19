"""
Cloud & Infra API endpoints to trigger agents without chat
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
        def __init__(self, status_code, detail):
            self.status_code = status_code
            self.detail = detail

from typing import Optional, Dict, Any, List

from ..orchestrator.agent_orchestrator import orchestrator
from ..config.settings import AgentType


router = APIRouter(prefix="/cloud/infra", tags=["cloud_infra"])


class NetworkAuditRequest(BaseModel):
    tenant_id: str


@router.post("/network/policy/audit")
async def network_policy_audit(req: NetworkAuditRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.NETWORK_POLICY)
    if not agent:
        raise HTTPException(status_code=503, detail="NetworkPolicyAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="network_policy", description="Audit network policies", context={"tenant_id": req.tenant_id})
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class BackupDRRequest(BaseModel):
    tenant_id: str
    action: Optional[str] = "plan"  # plan|drill|validate_restore
    env: Optional[str] = "staging"
    snapshots: Optional[str] = None
    retention_days: Optional[int] = None
    drill_schedule: Optional[str] = None


@router.post("/backup/dr")
async def backup_dr(req: BackupDRRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.BACKUP_DR)
    if not agent:
        raise HTTPException(status_code=503, detail="BackupAndDRAgent unavailable")
    from ..agents.base_agent import AgentTask
    context = {
        "tenant_id": req.tenant_id,
        "action": req.action,
        "env": req.env,
    }
    if req.snapshots is not None:
        context["snapshots"] = req.snapshots
    if req.retention_days is not None:
        context["retention_days"] = req.retention_days
    if req.drill_schedule is not None:
        context["drill_schedule"] = req.drill_schedule
    task = AgentTask(task_type="backup_dr", description="Backup/DR operation", context=context)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class SafeCutoverRequest(BaseModel):
    tenant_id: str
    name: str
    strategy: str = "blue_green"
    source_env: str = "blue"
    target_env: str = "green"
    steps: List[Dict[str, Any]]


@router.post("/cutover/execute")
async def cutover_execute(req: SafeCutoverRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.SAFE_CUTOVER)
    if not agent:
        raise HTTPException(status_code=503, detail="SafeCutoverAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="safe_cutover", description=req.name, context={
        "tenant_id": req.tenant_id,
        "name": req.name,
        "strategy": req.strategy,
        "source_env": req.source_env,
        "target_env": req.target_env,
        "steps": req.steps,
    })
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class BulkCleanupRequest(BaseModel):
    tenant_id: str
    provider: str = "aws"
    policy_id: Optional[str] = None
    execute: bool = False
    dry_run: bool = True


@router.post("/cleanup/scan_execute")
async def cleanup_scan_execute(req: BulkCleanupRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.BULK_CLEANUP)
    if not agent:
        raise HTTPException(status_code=503, detail="BulkCleanupAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="bulk_cleanup", description="Bulk cleanup", context={
        "tenant_id": req.tenant_id,
        "provider": req.provider,
        "policy_id": req.policy_id,
        "execute": req.execute,
        "dry_run": req.dry_run,
    })
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class MultiRegionRequest(BaseModel):
    regions: List[str]
    strategy: str = "canary"
    batch_size: int = 1


@router.post("/multi-region/plan")
async def multi_region_plan(req: MultiRegionRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.MULTI_REGION_ORCHESTRATOR)
    if not agent:
        raise HTTPException(status_code=503, detail="MultiRegionOrchestratorAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="multi_region", description="Multi-region plan", context={
        "regions": req.regions,
        "strategy": req.strategy,
        "batch_size": req.batch_size,
    })
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


