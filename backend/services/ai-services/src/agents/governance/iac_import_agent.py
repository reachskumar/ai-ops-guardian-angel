"""
IaCImportAgent
- Imports live infrastructure into IaC (Terraformer/Pulumi)
- Creates baselines and marks source of truth
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from ..base_agent import BaseAgent, AgentTask
from ...config.settings import AgentType, RiskLevel
from ...utils.logging import get_logger


class IaCImportAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__(
            agent_type=AgentType.IAC_IMPORT,
            name="IaC Import Agent",
            description="Imports live infra into IaC baselines",
        )
        self.logger = get_logger("agent.iac_import")

    async def _execute_task_logic(self, task: AgentTask) -> Dict[str, Any]:
        ctx = task.context or {}
        provider = (ctx.get("provider") or ctx.get("entities", {}).get("cloud_provider") or "aws").lower()
        repo = ctx.get("repo") or "infra/repo"
        path = ctx.get("path") or "environments/staging"

        # Placeholder: simulate terraformer / pulumi import
        imported_files = [
            f"{path}/main.tf",
            f"{path}/variables.tf",
            f"{path}/outputs.tf",
        ]
        actions = [{"type": "commit", "repo": repo, "files": imported_files, "message": "Import baseline from live"}]
        return {
            "message": f"Imported live {provider} resources into {repo}:{path}.",
            "files": imported_files,
            "actions": actions,
            "requires_approval": False,
            "risk_level": RiskLevel.LOW.value,
        }

    async def _generate_recommendation_logic(self, context: Dict[str, Any], task_type: str) -> Dict[str, Any]:
        return {
            "title": "Import from live",
            "description": "Create IaC baselines from existing resources",
            "reasoning": "Establishes source-of-truth and enables drift detection",
            "confidence": 0.8,
            "impact": "Improved governance",
            "risk_level": RiskLevel.LOW,
        }

    async def _analyze_data_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {"import_stats": {"files": 3}}


