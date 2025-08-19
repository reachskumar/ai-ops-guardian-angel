"""
TagEnforcementAgent
- Audits resources for required canonical tags
- Auto-retags in non-production environments when safe
- Manages waivers (placeholder)
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime, timezone

from ..base_agent import BaseAgent, AgentTask
from ...config.settings import AgentType, RiskLevel
from ...utils.logging import get_logger
from ...utils.secrets_provider import SecretsProvider


REQUIRED_TAG_KEYS = [
    "app",
    "service",
    "env",
    "owner",
    "cost_center",
    "data_class",
    "tier",
    "tenant",
    "lifecycle",
    "compliance",
]


class TagEnforcementAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__(
            agent_type=AgentType.TAG_ENFORCEMENT,
            name="Tag Enforcement Agent",
            description="Enforces canonical tags and auto-retags non-prod resources",
        )
        self.logger = get_logger("agent.tag_enforcement")
        self.secrets = SecretsProvider()

    async def _execute_task_logic(self, task: AgentTask) -> Dict[str, Any]:
        context = task.context or {}
        tenant_id: Optional[str] = context.get("tenant_id")
        provider: str = (context.get("entities", {}).get("cloud_provider") or context.get("provider") or "aws").lower()
        environment: str = (context.get("entities", {}).get("environment") or context.get("env") or "staging").lower()
        auto_fix: bool = bool(context.get("auto_fix", environment != "production"))

        try:
            findings: List[Dict[str, Any]] = []
            actions: List[Dict[str, Any]] = []

            if provider == "aws":
                # Retrieve tenant-scoped credentials
                if not tenant_id:
                    raise ValueError("tenant_id is required for tag enforcement")
                access_key = self.secrets.get(tenant_id, "aws_access_key_id")
                secret_key = self.secrets.get(tenant_id, "aws_secret_access_key")
                region = self.secrets.get(tenant_id, "aws_region") or "us-east-1"
                if not access_key or not secret_key:
                    raise ValueError("Missing AWS credentials for tenant")

                # Lazy import to avoid global dependency
                from ...tools.cloud.aws_manager import boto3  # type: ignore

                ec2 = boto3.client(
                    "ec2",
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_key,
                    region_name=region,
                )

                # Audit EC2 instances for tags
                resp = ec2.describe_instances()
                for r in resp.get("Reservations", []):
                    for inst in r.get("Instances", []):
                        instance_id = inst["InstanceId"]
                        tags = {t["Key"]: t["Value"] for t in inst.get("Tags", [])}
                        missing = [k for k in REQUIRED_TAG_KEYS if k not in tags]
                        if missing:
                            findings.append({
                                "resource_type": "ec2_instance",
                                "id": instance_id,
                                "missing_keys": missing,
                                "current": tags,
                            })
                            if auto_fix:
                                # Safe auto-retag: only set env and tenant if missing
                                new_tags = []
                                for k in missing:
                                    if k in ("env", "tenant"):
                                        new_tags.append({"Key": k, "Value": (environment if k == "env" else tenant_id)})
                                if new_tags:
                                    ec2.create_tags(Resources=[instance_id], Tags=new_tags)
                                    actions.append({
                                        "type": "retag",
                                        "resource": instance_id,
                                        "added": new_tags,
                                    })

                message = (
                    f"Tag audit complete: {len(findings)} resources missing required tags. "
                    + ("Auto-fixed some tags in non-prod." if auto_fix else "No changes applied.")
                )

                return {
                    "message": message,
                    "findings": findings,
                    "actions": actions,
                    "requires_approval": False,
                    "risk_level": RiskLevel.LOW.value,
                }

            # Extend for Azure/GCP similarly (placeholder)
            return {
                "message": f"Provider {provider} not yet implemented for tag enforcement.",
                "findings": [],
                "actions": [],
                "requires_approval": False,
            }

        except Exception as e:
            return {"message": f"Tag enforcement failed: {str(e)}", "error": True}

    async def _generate_recommendation_logic(self, context: Dict[str, Any], task_type: str) -> Dict[str, Any]:
        return {
            "title": "Enforce canonical tags",
            "description": "Audit and automatically apply missing canonical tags (safe in non-prod)",
            "reasoning": "Tags drive ownership, cost allocation, and compliance",
            "confidence": 0.9,
            "impact": "Improved governance and cost attribution",
            "risk_level": RiskLevel.LOW,
        }

    async def _analyze_data_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {"missing_by_key": {}}


