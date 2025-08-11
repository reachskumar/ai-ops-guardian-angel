"""
CloudOps API endpoints
 - GET /api/v1/cloud/{tenant_id}/inventory
 - POST /api/v1/cloud/{tenant_id}/ops/{action}
Lightweight readbacks using CloudOpsAgent for inventory, and returning suggested artifact names for ops runs.
"""

from __future__ import annotations

from typing import Dict, Any, Optional

try:
    from fastapi import APIRouter, HTTPException, Query
    from pydantic import BaseModel
    FASTAPI_AVAILABLE = True
except ImportError:
    FASTAPI_AVAILABLE = False
    class APIRouter:
        def __init__(self, *args, **kwargs):
            pass
    class BaseModel: ...
    class HTTPException(Exception):
        def __init__(self, status_code: int, detail: str):
            self.status_code = status_code
            self.detail = detail

from ..orchestrator.agent_orchestrator import AgentOrchestrator
from ..agents.base_agent import AgentTask

router = APIRouter(prefix="/cloud", tags=["cloudops"]) if FASTAPI_AVAILABLE else None


class OpsRequest(BaseModel):
    provider: str
    region: str
    params: Optional[Dict[str, Any]] = None


if FASTAPI_AVAILABLE:
    @router.get("/{tenant_id}/inventory")
    async def get_inventory(tenant_id: str, provider: str = Query(...), region: str = Query("us-east-1")):
        try:
            orch = AgentOrchestrator()
            await orch.start()
            task = AgentTask(
                task_type="cloud_inventory",
                description=f"inventory {provider} {region}",
                context={"provider": provider, "region": region},
            )
            await orch.submit_task(task)
            # For brevity, directly route to CloudOpsAgent if running
            # In current orchestrator mapping, INFRASTRUCTURE will handle cloud_inventory
            return {"status": "submitted", "provider": provider, "region": region}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @router.post("/{tenant_id}/ops/{action}")
    async def run_op(tenant_id: str, action: str, body: OpsRequest):
        # Return artifact hint names for the last run by convention
        try:
            return {
                "status": "accepted",
                "action": action,
                "provider": body.provider,
                "region": body.region,
                "artifact": "cloud-ops-output",
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


