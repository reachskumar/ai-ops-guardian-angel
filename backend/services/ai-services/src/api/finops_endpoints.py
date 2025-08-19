"""
FinOps API Endpoints
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


router = APIRouter(prefix="/finops", tags=["finops"])


class CostAnomalyDetectRequest(BaseModel):
    window: Optional[str] = "1d"
    granularity: Optional[str] = "service"


@router.post("/cost/anomaly/detect")
async def cost_anomaly_detect(req: CostAnomalyDetectRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.COST_ANOMALY)
    if not agent:
        raise HTTPException(status_code=503, detail="CostAnomalyAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="cost_anomaly_detect", description="Detect cost anomalies", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class CostAnomalyExplainRequest(BaseModel):
    anomaly_id: str


@router.post("/cost/anomaly/explain")
async def cost_anomaly_explain(req: CostAnomalyExplainRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.COST_ANOMALY)
    if not agent:
        raise HTTPException(status_code=503, detail="CostAnomalyAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="cost_anomaly_explain", description="Explain cost anomaly", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class DataTieringRequest(BaseModel):
    bucket: Optional[str] = None
    after_days: Optional[int] = 30


@router.post("/data/tiering/plan")
async def data_tiering_plan(req: DataTieringRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.DATA_LIFECYCLE)
    if not agent:
        raise HTTPException(status_code=503, detail="DataLifecycleAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="tiering_plan", description="Data tiering plan", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class RetentionPolicyRequest(BaseModel):
    dataset: Optional[str] = None
    retain_days: Optional[int] = 365


@router.post("/data/retention/policy")
async def retention_policy(req: RetentionPolicyRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.DATA_LIFECYCLE)
    if not agent:
        raise HTTPException(status_code=503, detail="DataLifecycleAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="retention_policy", description="Retention policy", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class CleanupRequest(BaseModel):
    path_prefix: Optional[str] = None
    min_size_gb: Optional[float] = 50


@router.post("/data/cleanup/scan")
async def data_cleanup_scan(req: CleanupRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.DATA_LIFECYCLE)
    if not agent:
        raise HTTPException(status_code=503, detail="DataLifecycleAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="large_object_cleanup", description="Large object cleanup scan", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class EgressHotspotRequest(BaseModel):
    window: Optional[str] = "7d"


@router.post("/egress/hotspots")
async def egress_hotspots(req: EgressHotspotRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.EGRESS_OPTIMIZER)
    if not agent:
        raise HTTPException(status_code=503, detail="EgressOptimizerAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="egress_hotspot_detect", description="Detect egress hotspots", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class EgressSuggestRequest(BaseModel):
    service: Optional[str] = None


@router.post("/egress/suggest")
async def egress_suggest(req: EgressSuggestRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.EGRESS_OPTIMIZER)
    if not agent:
        raise HTTPException(status_code=503, detail="EgressOptimizerAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="egress_routing_suggest", description="Suggest egress optimizations", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class UnitEconomicsMapRequest(BaseModel):
    basis: Optional[str] = "per_request"


@router.post("/unit/map")
async def unit_map(req: UnitEconomicsMapRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.UNIT_ECONOMICS)
    if not agent:
        raise HTTPException(status_code=503, detail="UnitEconomicsAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="unit_cost_map", description="Map unit costs", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class UnitEconomicsRegressionRequest(BaseModel):
    window: Optional[str] = "7d"


@router.post("/unit/regressions")
async def unit_regressions(req: UnitEconomicsRegressionRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.UNIT_ECONOMICS)
    if not agent:
        raise HTTPException(status_code=503, detail="UnitEconomicsAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="unit_cost_regressions", description="Detect unit cost regressions", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


