"""
Security & Compliance API Endpoints
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


router = APIRouter(prefix="/sec", tags=["security_compliance"])


class CosignSignRequest(BaseModel):
    image: str


@router.post("/supply/sign")
async def cosign_sign(req: CosignSignRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.SUPPLY_CHAIN_SECURITY)
    if not agent:
        raise HTTPException(status_code=503, detail="SupplyChainSecurityAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="cosign_sign", description="Cosign sign image", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class CosignVerifyRequest(BaseModel):
    image: str


@router.post("/supply/verify")
async def cosign_verify(req: CosignVerifyRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.SUPPLY_CHAIN_SECURITY)
    if not agent:
        raise HTTPException(status_code=503, detail="SupplyChainSecurityAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="cosign_verify", description="Cosign verify image", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


@router.post("/supply/provenance")
async def slsa_provenance():
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.SUPPLY_CHAIN_SECURITY)
    if not agent:
        raise HTTPException(status_code=503, detail="SupplyChainSecurityAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="slsa_provenance", description="Generate provenance")
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class SBOMGenerateRequest(BaseModel):
    image: Optional[str] = None


@router.post("/sbom/generate")
async def sbom_generate(req: SBOMGenerateRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.SBOM_MANAGEMENT)
    if not agent:
        raise HTTPException(status_code=503, detail="SBOMManagementAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="sbom_generate", description="Generate SBOM", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


@router.post("/sbom/scan/correlate")
async def sbom_scan_correlate():
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.SBOM_MANAGEMENT)
    if not agent:
        raise HTTPException(status_code=503, detail="SBOMManagementAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="scan_correlate", description="Correlate scan findings")
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class DataClassifyRequest(BaseModel):
    source: Optional[str] = None


@router.post("/data/pii_detect")
async def data_pii_detect(req: DataClassifyRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.DATA_CLASSIFICATION)
    if not agent:
        raise HTTPException(status_code=503, detail="DataClassificationAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="pii_detect", description="Detect PII", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


@router.post("/data/secret_detect")
async def data_secret_detect(req: DataClassifyRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.DATA_CLASSIFICATION)
    if not agent:
        raise HTTPException(status_code=503, detail="DataClassificationAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="secret_detect", description="Detect secrets", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class ResidencyEnforceRequest(BaseModel):
    scope: Optional[str] = "eu-only"


@router.post("/data/residency_enforce")
async def data_residency_enforce(req: ResidencyEnforceRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.DATA_CLASSIFICATION)
    if not agent:
        raise HTTPException(status_code=503, detail="DataClassificationAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="residency_enforce", description="Enforce data residency", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class OPABundleRequest(BaseModel):
    target: Optional[str] = "opa-server"


@router.post("/opa/bundle")
async def opa_bundle(req: OPABundleRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.OPA_ENFORCER)
    if not agent:
        raise HTTPException(status_code=503, detail="OPAEnforcerAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="opa_bundle", description="Bundle policies", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


@router.post("/opa/simulate")
async def opa_simulate():
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.OPA_ENFORCER)
    if not agent:
        raise HTTPException(status_code=503, detail="OPAEnforcerAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="opa_simulate", description="Simulate policy impacts")
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class AllowlistEnforceRequest(BaseModel):
    scope: Optional[str] = "prod"


@router.post("/opa/allowlist_enforce")
async def allowlist_enforce(req: AllowlistEnforceRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.OPA_ENFORCER)
    if not agent:
        raise HTTPException(status_code=503, detail="OPAEnforcerAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="allowlist_enforce", description="Enforce allow-lists", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class AuditorSessionStartRequest(BaseModel):
    pass


@router.post("/auditor/session/start")
async def auditor_session_start(_: AuditorSessionStartRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.AUDITOR_MODE)
    if not agent:
        raise HTTPException(status_code=503, detail="AuditorModeAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="session_start", description="Start auditor session")
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


class AuditorSessionEndRequest(BaseModel):
    session_id: str


@router.post("/auditor/session/end")
async def auditor_session_end(req: AuditorSessionEndRequest):
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.AUDITOR_MODE)
    if not agent:
        raise HTTPException(status_code=503, detail="AuditorModeAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="session_end", description="End auditor session", context=req.__dict__)
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


@router.post("/auditor/trail/export")
async def auditor_trail_export():
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    agent = await orchestrator.get_agent(AgentType.AUDITOR_MODE)
    if not agent:
        raise HTTPException(status_code=503, detail="AuditorModeAgent unavailable")
    from ..agents.base_agent import AgentTask
    task = AgentTask(task_type="trail_export", description="Export audit trail")
    result = await agent.execute_task(task)
    return {"success": result.status.value == "completed", "result": result.result}


