from typing import Any, Dict
from ..base_agent import BaseAgent, AgentCapabilities, AgentTask
from ...config.settings import AgentType


class WebhookNormalizerAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_type=AgentType.WEBHOOK_NORMALIZER,
            name="Webhook Normalizer Agent",
            description="Unify events from Prometheus, Datadog, Jira, GitHub, etc.",
            capabilities=AgentCapabilities(
                supported_tasks=["normalize_event"],
                required_tools=["event_router", "schema_registry"],
            ),
        )

    async def _execute_task_logic(self, task: AgentTask) -> Dict[str, Any]:
        payload = task.context.get("event", {})
        provider = task.context.get("provider", "unknown")
        return {
            "provider": provider,
            "normalized": {
                "type": payload.get("type") or payload.get("action") or "generic_event",
                "source": provider,
                "severity": payload.get("severity") or payload.get("level") or "info",
                "summary": payload.get("title") or payload.get("message") or str(payload)[:120],
            }
        }

    async def _generate_recommendation_logic(self, context: Dict[str, Any], task_type: str) -> Dict[str, Any]:
        return {
            "title": "Normalize inbound webhooks",
            "description": "Use a standard schema across observability and ticketing tools",
            "reasoning": "Simplifies routing and correlation",
            "confidence": 0.78,
            "impact": "medium",
            "risk_level": "low",
        }

    async def _analyze_data_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {"unique_providers": len(set(data.get("providers", [])))}


