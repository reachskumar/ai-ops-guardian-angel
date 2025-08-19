from __future__ import annotations

from typing import Any, Dict, List, Optional

from ..base_agent import BaseAgent, AgentTask
from ...config.settings import AgentType, RiskLevel
from ...utils.logging import get_logger
from ...tools.cloud.bulk_cleanup import BulkCleanupEngine, CleanupPolicy, CleanupResourceType
from ...cmdb.store import CMDBStore
from ...cmdb.models import CloudProvider


class BulkCleanupAgent(BaseAgent):
    def __init__(self, cmdb: CMDBStore | None = None) -> None:
        super().__init__(
            agent_type=AgentType.BULK_CLEANUP,
            name="Bulk Cleanup Agent",
            description="Garbage collection of idle/orphaned resources",
        )
        self.logger = get_logger("agent.bulk_cleanup")
        self.cmdb = cmdb

    async def _execute_task_logic(self, task: AgentTask) -> Dict[str, Any]:
        ctx = task.context or {}
        tenant_id = ctx.get("tenant_id") or "default"
        provider = CloudProvider((ctx.get("provider") or "aws").lower())
        policy_id: Optional[str] = ctx.get("policy_id")
        dry_run = bool(ctx.get("dry_run", True))

        if not self.cmdb:
            return {"message": "CMDB not configured", "error": True}

        engine = BulkCleanupEngine(self.cmdb)
        candidates = await engine.scan_for_cleanup_candidates(tenant_id=tenant_id, policy_id=policy_id, cloud_provider=provider)
        savings = await engine.estimate_cleanup_savings(candidates)
        actions: List[Dict[str, Any]] = []
        msg = f"Found {len(candidates)} cleanup candidates. Estimated monthly savings ${savings['monthly_cost_savings']:.2f}."

        if ctx.get("execute", False):
            job = await engine.execute_cleanup_job(tenant_id=tenant_id, policy_id=(policy_id or engine.cleanup_policies[0].id), candidates=candidates, dry_run=dry_run)
            actions.append({"type": "cleanup_job", "job_id": job.id, "status": job.status})
            msg += f" Cleanup job {job.id} {job.status}."

        return {
            "message": msg,
            "candidates": [c.dict() for c in candidates[:50]],
            "savings": savings,
            "actions": actions,
            "requires_approval": not dry_run,
            "risk_level": RiskLevel.MEDIUM.value,
        }

    async def _generate_recommendation_logic(self, context: Dict[str, Any], task_type: str) -> Dict[str, Any]:
        return {
            "title": "Cleanup idle/orphaned resources",
            "description": "Identify and safely remove unused assets",
            "reasoning": "Reduce waste and costs",
            "confidence": 0.9,
            "impact": "Savings",
            "risk_level": RiskLevel.MEDIUM,
        }

    async def _analyze_data_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {"candidates": 0}


