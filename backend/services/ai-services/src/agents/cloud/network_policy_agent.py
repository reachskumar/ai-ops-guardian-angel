from __future__ import annotations

from typing import Any, Dict, List

from ..base_agent import BaseAgent, AgentTask
from ...config.settings import AgentType, RiskLevel
from ...utils.logging import get_logger
from ...cmdb.store import CMDBStore
from ...cmdb.models import ResourceSearch, ResourceType


class NetworkPolicyAgent(BaseAgent):
    def __init__(self, cmdb: CMDBStore | None = None) -> None:
        super().__init__(
            agent_type=AgentType.NETWORK_POLICY,
            name="Network Policy Agent",
            description="Analyzes SG/NSG/Firewall rules for guardrails",
        )
        self.logger = get_logger("agent.network_policy")
        self.cmdb = cmdb

    async def _execute_task_logic(self, task: AgentTask) -> Dict[str, Any]:
        ctx = task.context or {}
        tenant_id = ctx.get("tenant_id")
        if not tenant_id:
            return {"message": "tenant_id required", "error": True}

        findings: List[Dict[str, Any]] = []
        try:
            if not self.cmdb:
                return {"message": "CMDB not configured", "error": True}

            for rtype in [ResourceType.SECURITY_GROUP, ResourceType.NSG, ResourceType.FIREWALL]:
                resources = await self.cmdb.search_resources(ResourceSearch(tenant_id=tenant_id, resource_type=rtype), limit=1000)
                for res in resources:
                    rules = res.cloud_attributes.get("rules", [])
                    for rule in rules:
                        cidr = rule.get("cidr") or rule.get("cidr_ip") or rule.get("source")
                        from_port = rule.get("from_port") or rule.get("port")
                        to_port = rule.get("to_port") or rule.get("port")
                        protocol = rule.get("protocol") or rule.get("ip_protocol")
                        if cidr in ("0.0.0.0/0", "::/0") and (from_port in (22, 3389) or to_port in (22, 3389)):
                            findings.append({
                                "resource": res.id,
                                "type": rtype.value,
                                "issue": "Open SSH/RDP to world",
                                "rule": rule,
                                "severity": "high",
                                "recommendation": "Restrict to corporate IP or VPN",
                            })

            return {
                "message": f"Network policy audit complete. {len(findings)} risky rules found.",
                "findings": findings,
                "requires_approval": False,
                "risk_level": RiskLevel.MEDIUM.value,
            }
        except Exception as e:
            return {"message": f"Network policy analysis failed: {str(e)}", "error": True}

    async def _generate_recommendation_logic(self, context: Dict[str, Any], task_type: str) -> Dict[str, Any]:
        return {
            "title": "Harden network policies",
            "description": "Detects open ports and suggests least-privilege rules",
            "reasoning": "Reduce exposure and meet compliance",
            "confidence": 0.85,
            "impact": "Improved security posture",
            "risk_level": RiskLevel.MEDIUM,
        }

    async def _analyze_data_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {"open_rules": 0}


