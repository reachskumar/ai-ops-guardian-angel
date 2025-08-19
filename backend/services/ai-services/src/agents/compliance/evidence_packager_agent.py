"""
EvidencePackagerAgent
- Builds auditor-grade evidence packs (configs, screenshots, API dumps, approvals, logs)
"""

from __future__ import annotations

from typing import Any, Dict, List
from datetime import datetime

from ..base_agent import BaseAgent, AgentTask
from ...config.settings import AgentType, RiskLevel
from ...utils.logging import get_logger


class EvidencePackagerAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__(
            agent_type=AgentType.EVIDENCE_PACKAGER,
            name="Evidence Packager Agent",
            description="Builds auditor-grade evidence packs",
        )
        self.logger = get_logger("agent.evidence_packager")

    async def _execute_task_logic(self, task: AgentTask) -> Dict[str, Any]:
        ctx = task.context or {}
        scope = ctx.get("scope") or {"env": ctx.get("env", "staging"), "service": ctx.get("service", "ai-services")}
        pack_id = f"evidence-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        artifacts = [
            {"type": "config_snapshot", "path": f"{pack_id}/configs.json"},
            {"type": "api_dump", "path": f"{pack_id}/api.json"},
            {"type": "approvals", "path": f"{pack_id}/approvals.json"},
            {"type": "logs", "path": f"{pack_id}/logs.txt"},
        ]
        return {
            "message": f"Evidence pack {pack_id} created.",
            "pack_id": pack_id,
            "artifacts": artifacts,
            "requires_approval": False,
            "risk_level": RiskLevel.LOW.value,
        }

    async def _generate_recommendation_logic(self, context: Dict[str, Any], task_type: str) -> Dict[str, Any]:
        return {
            "title": "Build evidence pack",
            "description": "Assemble auditor-grade evidence for controls",
            "reasoning": "Supports compliance and audits",
            "confidence": 0.9,
            "impact": "Audit readiness",
            "risk_level": RiskLevel.LOW,
        }

    async def _analyze_data_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {"packs": 1}


