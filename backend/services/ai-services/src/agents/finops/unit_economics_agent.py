from typing import Any, Dict
from ..base_agent import BaseAgent, AgentCapabilities, AgentTask
from ...config.settings import AgentType


class UnitEconomicsAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_type=AgentType.UNIT_ECONOMICS,
            name="Unit Economics Agent",
            description="Map costs to services/tenants/SLO targets and detect regressions",
            capabilities=AgentCapabilities(
                supported_tasks=["unit_cost_map", "unit_cost_regressions"],
                required_tools=["cost_analyzer", "metrics"],
                max_concurrent_tasks=4,
            ),
        )

    async def _execute_task_logic(self, task: AgentTask) -> Dict[str, Any]:
        t = task.task_type.lower()
        if "map" in t:
            return {"unit_costs": {"checkout": 0.0042, "search": 0.0013}, "basis": "per request"}
        if "regression" in t:
            return {"regressions": [{"service": "checkout", "delta_pct": 18.7, "since": "7d"}]}
        return {"message": "Unsupported task", "task_type": task.task_type}

    async def _generate_recommendation_logic(self, context: Dict[str, Any], task_type: str) -> Dict[str, Any]:
        return {
            "title": "Adopt unit economics KPIs",
            "description": "Track $/request per service and gate deploys on regressions",
            "reasoning": "Unit metrics align costs with value",
            "confidence": 0.77,
            "impact": "high",
            "risk_level": "low",
            "estimated_savings": 3100.0,
        }

    async def _analyze_data_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {"unit_cost": 0.0029, "trend_7d_pct": 3.1}


