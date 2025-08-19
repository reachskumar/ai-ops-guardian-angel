"""
CommitmentsAdvisorAgent
- Rightsizing and RI/SP recommendations and optional execution windows
"""

from __future__ import annotations

from typing import Any, Dict, List

from ..base_agent import BaseAgent, AgentTask
from ...config.settings import AgentType, RiskLevel
from ...tools.cost.cost_analyzer import CostAnalyzer
from ...utils.logging import get_logger


class CommitmentsAdvisorAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__(
            agent_type=AgentType.COMMITMENTS_ADVISOR,
            name="Commitments Advisor Agent",
            description="Provides RI/SP and rightsizing recommendations",
        )
        self.logger = get_logger("agent.commitments_advisor")
        self.cost = CostAnalyzer()

    async def _execute_task_logic(self, task: AgentTask) -> Dict[str, Any]:
        ctx = task.context or {}
        provider = (ctx.get("provider") or ctx.get("entities", {}).get("cloud_provider") or "aws").lower()
        days = int(ctx.get("lookback_days", 30))
        auto_schedule = bool(ctx.get("auto_schedule", False))

        analysis = await self.cost.get_cost_breakdown(provider, days)

        recommendations = [
            {"type": "rightsizing", "savings": 320.0, "resources": 8},
            {"type": "savings_plan", "term": "1y", "coverage": "60%", "savings": 540.0},
        ]
        actions = []
        if auto_schedule:
            actions.append({
                "type": "schedule_commitments",
                "window": "Sun 01:00-03:00 UTC",
                "note": "Execute with approval",
            })

        return {
            "message": f"Cost analysis ready. Found {len(recommendations)} opportunities.",
            "analysis": analysis,
            "recommendations": recommendations,
            "actions": actions,
            "requires_approval": True,
            "risk_level": RiskLevel.MEDIUM.value,
        }

    async def _generate_recommendation_logic(self, context: Dict[str, Any], task_type: str) -> Dict[str, Any]:
        return {
            "title": "Optimize commitments",
            "description": "Apply rightsizing and RI/SP to cut spend",
            "reasoning": "Reduce waste and lock in discounts",
            "confidence": 0.85,
            "impact": "Monthly savings",
            "risk_level": RiskLevel.MEDIUM,
        }

    async def _analyze_data_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {"savings": 0}


