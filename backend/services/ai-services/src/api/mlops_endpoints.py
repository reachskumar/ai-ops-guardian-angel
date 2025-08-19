"""
MLOps API Endpoints
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

from typing import Optional, Dict, Any

from ..orchestrator.agent_orchestrator import orchestrator
from ..config.settings import AgentType


router = APIRouter(prefix="/mlops", tags=["mlops"])


class LineageRequest(BaseModel):
    dataset: Optional[str] = None


@router.post("/feature/lineage")
async def feature_lineage(req: LineageRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.FEATURE_STORE_OPS)
    if not agent:
        raise HTTPException(status_code=503, detail="FeatureStoreOpsAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="lineage_query", description="Query feature lineage", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class FeatureDriftRequest(BaseModel):
    feature: Optional[str] = None


@router.post("/feature/drift")
async def feature_drift(req: FeatureDriftRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.FEATURE_STORE_OPS)
    if not agent:
        raise HTTPException(status_code=503, detail="FeatureStoreOpsAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="feature_drift_monitor", description="Monitor feature drift", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class ACLUpdateRequest(BaseModel):
    principal: str
    role: str


@router.post("/feature/acl")
async def feature_acl(req: ACLUpdateRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.FEATURE_STORE_OPS)
    if not agent:
        raise HTTPException(status_code=503, detail="FeatureStoreOpsAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="acl_update", description="Update feature ACL", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


@router.post("/model/canary")
async def model_canary():
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.MODEL_ROLLBACK)
    if not agent:
        raise HTTPException(status_code=503, detail="ModelRollbackAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="canary_eval", description="Model canary evaluation")
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class ModelRollbackRequest(BaseModel):
    previous_version: Optional[str] = None


@router.post("/model/rollback")
async def model_rollback(req: ModelRollbackRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.MODEL_ROLLBACK)
    if not agent:
        raise HTTPException(status_code=503, detail="ModelRollbackAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="rollback", description="Model rollback", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


@router.post("/model/safety_gate")
async def model_safety_gate():
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.MODEL_ROLLBACK)
    if not agent:
        raise HTTPException(status_code=503, detail="ModelRollbackAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="safety_gate", description="Model safety gating")
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class DataDriftDetectRequest(BaseModel):
    feature: Optional[str] = None


@router.post("/data/drift/detect")
async def data_drift_detect(req: DataDriftDetectRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.DATA_DRIFT)
    if not agent:
        raise HTTPException(status_code=503, detail="DataDriftAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="drift_detect", description="Detect data drift", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class RetrainRequest(BaseModel):
    pipeline: Optional[str] = None


@router.post("/data/retrain")
async def data_retrain(req: RetrainRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.DATA_DRIFT)
    if not agent:
        raise HTTPException(status_code=503, detail="DataDriftAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="trigger_retrain", description="Trigger retraining", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


