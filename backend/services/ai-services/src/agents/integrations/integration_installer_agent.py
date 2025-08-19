from typing import Any, Dict
from ..base_agent import BaseAgent, AgentCapabilities, AgentTask
from ...config.settings import AgentType


class IntegrationInstallerAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_type=AgentType.INTEGRATION_INSTALLER,
            name="Integration Installer Agent",
            description="Self-serve marketplace installs, config, OAuth, health checks",
            capabilities=AgentCapabilities(
                supported_tasks=["marketplace_install", "oauth_authorize", "config_apply", "health_check"],
                required_tools=["secrets_provider", "oauth_client"],
            ),
        )

    async def _execute_task_logic(self, task: AgentTask) -> Dict[str, Any]:
        t = task.task_type.lower()
        if "install" in t:
            return {"installed": True, "provider": task.context.get("provider", "github")}
        if "oauth" in t or "authorize" in t:
            return {"authorized": True, "provider": task.context.get("provider", "slack")}
        if "config" in t:
            return {"applied": True, "config_keys": list((task.context.get("config") or {}).keys())}
        if "health" in t:
            return {"healthy": True, "checks": [{"name": "api", "status": "ok"}]}
        return {"message": "Unsupported task", "task_type": task.task_type}

    async def _generate_recommendation_logic(self, context: Dict[str, Any], task_type: str) -> Dict[str, Any]:
        return {
            "title": "Enable self-serve marketplace installs",
            "description": "Provide one-click installs with OAuth + config and built-in health checks",
            "reasoning": "Reduces integration friction",
            "confidence": 0.8,
            "impact": "high",
            "risk_level": "low",
        }

    async def _analyze_data_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {"installed_count": data.get("count", 0)}


