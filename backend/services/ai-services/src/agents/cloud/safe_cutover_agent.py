from __future__ import annotations

from typing import Any, Dict, List

from ..base_agent import BaseAgent, AgentTask
from ...config.settings import AgentType, RiskLevel
from ...utils.logging import get_logger
from ...tools.cloud.safe_cutover import SafeCutoverEngine, CutoverStrategy, CutoverPlan
from ...cmdb.store import CMDBStore


class SafeCutoverAgent(BaseAgent):
    def __init__(self, cmdb: CMDBStore | None = None) -> None:
        super().__init__(
            agent_type=AgentType.SAFE_CUTOVER,
            name="Safe Cutover Agent",
            description="Blue/green and weighted cutovers with health gates",
        )
        self.logger = get_logger("agent.safe_cutover")
        self.cmdb = cmdb

    async def _execute_task_logic(self, task: AgentTask) -> Dict[str, Any]:
        ctx = task.context or {}
        tenant_id = ctx.get("tenant_id") or "default"
        name = ctx.get("name", "cutover")
        strategy = CutoverStrategy(ctx.get("strategy", CutoverStrategy.BLUE_GREEN))
        target_env = ctx.get("target_env", "prod")
        source_env = ctx.get("source_env", "blue")
        steps: List[Dict[str, Any]] = ctx.get("steps", [])

        if not self.cmdb:
            return {"message": "CMDB not configured", "error": True}

        engine = SafeCutoverEngine(self.cmdb)
        plan: CutoverPlan = await engine.create_cutover_plan(
            tenant_id=tenant_id,
            name=name,
            description=f"{strategy.value} cutover",
            strategy=strategy,
            target_env=target_env,
            source_env=source_env,
            steps=steps,
        )
        started = await engine.execute_cutover(plan)
        return {
            "message": ("Cutover completed" if started else "Cutover failed"),
            "plan": plan.dict(),
            "requires_approval": False,
            "risk_level": RiskLevel.HIGH.value,
        }

    async def _generate_recommendation_logic(self, context: Dict[str, Any], task_type: str) -> Dict[str, Any]:
        return {
            "title": "Perform safe cutover",
            "description": "Blue/green with health checks and rollback",
            "reasoning": "Minimize downtime and risk",
            "confidence": 0.85,
            "impact": "High",
            "risk_level": RiskLevel.HIGH,
        }

    async def _analyze_data_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {"cutovers": 0}


