from __future__ import annotations

from typing import Any, Dict, List
from datetime import datetime

from ..base_agent import BaseAgent, AgentTask
from ...config.settings import AgentType, RiskLevel
from ...utils.logging import get_logger


class BackupAndDRAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__(
            agent_type=AgentType.BACKUP_DR,
            name="Backup & DR Agent",
            description="Backups, retention, DR drills, and restore validation",
        )
        self.logger = get_logger("agent.backup_dr")

    async def _execute_task_logic(self, task: AgentTask) -> Dict[str, Any]:
        ctx = task.context or {}
        action = ctx.get("action", "plan")
        environment = (ctx.get("env") or ctx.get("entities", {}).get("environment") or "staging").lower()
        plan = {
            "snapshots": ctx.get("snapshots", "daily"),
            "retention_days": int(ctx.get("retention_days", 30)),
            "drill_schedule": ctx.get("drill_schedule", "monthly"),
            "last_restore_validation": None,
        }
        actions: List[Dict[str, Any]] = []
        if action == "plan":
            msg = f"Generated backup & DR plan for {environment}."
        elif action == "drill":
            actions.append({"type": "dr_drill", "env": environment, "status": "scheduled"})
            msg = f"Scheduled DR drill for {environment}."
        elif action == "validate_restore":
            actions.append({"type": "restore_validation", "env": environment, "status": "running"})
            plan["last_restore_validation"] = datetime.utcnow().isoformat()
            msg = f"Restore validation triggered for {environment}."
        else:
            msg = "Unknown backup/DR action"
        return {
            "message": msg,
            "plan": plan,
            "actions": actions,
            "requires_approval": False,
            "risk_level": RiskLevel.LOW.value,
        }

    async def _generate_recommendation_logic(self, context: Dict[str, Any], task_type: str) -> Dict[str, Any]:
        return {
            "title": "Establish backup & DR",
            "description": "Define retention and validate restores",
            "reasoning": "Ensure recoverability",
            "confidence": 0.9,
            "impact": "Resilience",
            "risk_level": RiskLevel.LOW,
        }

    async def _analyze_data_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {"recoverability": "unknown"}


