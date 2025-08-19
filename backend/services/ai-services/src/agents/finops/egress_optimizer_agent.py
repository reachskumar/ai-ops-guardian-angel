from typing import Any, Dict
from ..base_agent import BaseAgent, AgentCapabilities, AgentTask
from ...config.settings import AgentType


class EgressOptimizerAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_type=AgentType.EGRESS_OPTIMIZER,
            name="Egress Optimizer Agent",
            description="Detect cross-AZ/region egress hotspots and propose routing/placement fixes",
            capabilities=AgentCapabilities(
                supported_tasks=["egress_hotspot_detect", "egress_routing_suggest", "placement_optimize"],
                required_tools=["cloud_manager", "metrics"],
                max_concurrent_tasks=4,
            ),
        )

    async def _execute_task_logic(self, task: AgentTask) -> Dict[str, Any]:
        t = task.task_type.lower()
        if "hotspot" in t:
            return {"hotspots": [{"pair": ["us-east-1a", "us-east-1b"], "egress_gb_day": 820.5}]}
        if "routing" in t or "placement" in t:
            return {"suggestions": [
                {"action": "co-locate", "service": "cache", "target": "us-east-1a"},
                {"action": "private_link", "service": "db", "region": "us-east-1"}
            ]}
        return {"message": "Unsupported task", "task_type": task.task_type}

    async def _generate_recommendation_logic(self, context: Dict[str, Any], task_type: str) -> Dict[str, Any]:
        return {
            "title": "Reduce cross-AZ egress via co-location",
            "description": "Move chat-service and cache into same AZ and adopt PrivateLink for DB",
            "reasoning": "AZ traffic dominates egress bill",
            "confidence": 0.8,
            "impact": "high",
            "risk_level": "medium",
            "estimated_savings": 7600.0,
        }

    async def _analyze_data_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {"egress_by_az": {"us-east-1a": 420.1, "us-east-1b": 400.4}}


