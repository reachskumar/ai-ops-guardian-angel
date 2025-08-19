from __future__ import annotations

from typing import Any, Dict, List
from datetime import datetime

from ..base_agent import BaseAgent, AgentTask
from ...config.settings import AgentType, RiskLevel
from ...utils.logging import get_logger


class IncidentManagerAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__(
            agent_type=AgentType.INCIDENT_MANAGER,
            name="Incident Manager Agent",
            description="Correlates alerts, dedups, what-changed, RCA kickoff, ChatOps",
        )
        self.logger = get_logger("agent.incident_manager")

    async def _execute_task_logic(self, task: AgentTask) -> Dict[str, Any]:
        ctx = task.context or {}
        alerts: List[Dict[str, Any]] = ctx.get("alerts", [])
        service = ctx.get("service") or "unknown"
        # Dedup by fingerprint/message
        seen = set()
        deduped = []
        for a in alerts:
            fp = a.get("fingerprint") or a.get("message")
            if fp and fp in seen:
                continue
            if fp:
                seen.add(fp)
            deduped.append(a)

        # What changed placeholder: last deploy/config change
        what_changed = {
            "last_deploy": {"time": datetime.utcnow().isoformat(), "commit": "abc123", "by": "ci"},
            "config_changes": [
                {"file": "deployment.yaml", "line": 42, "change": "replicas 3->5"}
            ],
        }

        # RCA kickoff (stub): returns workflow id
        rca = {"workflow": "rca-root-cause-analysis", "status": "started"}

        # ChatOps update (stub)
        chatops = {"posted": True, "channel": f"#incidents-{service}"}

        return {
            "message": f"Processed {len(alerts)} alerts ({len(deduped)} after dedup). Kicked off RCA.",
            "deduped": deduped[:50],
            "what_changed": what_changed,
            "rca": rca,
            "chatops": chatops,
            "requires_approval": False,
            "risk_level": RiskLevel.MEDIUM.value,
        }

    async def _generate_recommendation_logic(self, context: Dict[str, Any], task_type: str) -> Dict[str, Any]:
        return {
            "title": "Manage incident",
            "description": "Correlate alerts, dedup, determine what changed, and start RCA",
            "reasoning": "Reduces noise and accelerates resolution",
            "confidence": 0.85,
            "impact": "High",
            "risk_level": RiskLevel.MEDIUM,
        }

    async def _analyze_data_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {"alerts": len(data.get("alerts", []))}


