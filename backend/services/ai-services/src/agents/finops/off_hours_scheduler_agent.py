"""
OffHoursSchedulerAgent
- Schedules start/stop/scale by env/service to reduce idle spend
"""

from __future__ import annotations

from typing import Any, Dict, List

from ..base_agent import BaseAgent, AgentTask
from ...config.settings import AgentType, RiskLevel
from ...utils.logging import get_logger


class OffHoursSchedulerAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__(
            agent_type=AgentType.OFF_HOURS_SCHEDULER,
            name="Off-Hours Scheduler Agent",
            description="Schedules start/stop/scale to cut idle spend",
        )
        self.logger = get_logger("agent.off_hours")

    async def _execute_task_logic(self, task: AgentTask) -> Dict[str, Any]:
        ctx = task.context or {}
        environment = (ctx.get("env") or ctx.get("entities", {}).get("environment") or "dev").lower()
        service = ctx.get("service") or ctx.get("entities", {}).get("service") or "ai-services"
        schedule = ctx.get("schedule") or "Mon-Fri 19:00 stop, 07:00 start"
        provider = (ctx.get("provider") or ctx.get("entities", {}).get("cloud_provider") or "aws").lower()

        return {
            "message": f"Scheduled off-hours for {service} in {environment}: {schedule}",
            "actions": [{"type": "schedule", "service": service, "environment": environment, "expr": schedule, "provider": provider}],
            "requires_approval": False,
            "risk_level": RiskLevel.LOW.value,
        }

    async def _generate_recommendation_logic(self, context: Dict[str, Any], task_type: str) -> Dict[str, Any]:
        return {
            "title": "Off-hours schedule",
            "description": "Stop non-prod resources after hours",
            "reasoning": "Reduce idle spend with minimal risk",
            "confidence": 0.9,
            "impact": "Monthly savings",
            "risk_level": RiskLevel.LOW,
        }

    async def _analyze_data_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {"candidate_resources": 0}


