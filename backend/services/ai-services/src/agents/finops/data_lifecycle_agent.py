from typing import Any, Dict
from ..base_agent import BaseAgent, AgentCapabilities, AgentTask
from ...config.settings import AgentType


class DataLifecycleAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_type=AgentType.DATA_LIFECYCLE,
            name="Data Lifecycle Agent",
            description="Tiering & retention policies and large-object cleanup",
            capabilities=AgentCapabilities(
                supported_tasks=["tiering_plan", "retention_policy", "large_object_cleanup"],
                required_tools=["cloud_manager", "cmdb"],
                max_concurrent_tasks=3,
            ),
        )

    async def _execute_task_logic(self, task: AgentTask) -> Dict[str, Any]:
        t = task.task_type.lower()
        ctx = task.context or {}
        if "tier" in t:
            return {"recommendations": [{"bucket": ctx.get("bucket", "logs"), "move_to": "glacier", "after_days": 30}]}
        if "retention" in t:
            return {"policies": [{"dataset": ctx.get("dataset", "audit"), "retain_days": 365}]}
        if "cleanup" in t:
            return {"candidates": [{"path": "/var/data/old.tar", "size_gb": 120}]}
        return {"message": "Unsupported task", "task_type": task.task_type}

    async def _generate_recommendation_logic(self, context: Dict[str, Any], task_type: str) -> Dict[str, Any]:
        return {
            "title": "Apply lifecycle policies to cold data",
            "description": "Tier S3 objects older than 30 days to Glacier with delete after 365 days",
            "reasoning": "Cold data drives storage costs without value",
            "confidence": 0.78,
            "impact": "high",
            "risk_level": "low",
            "estimated_savings": 5400.0,
        }

    async def _analyze_data_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {"cold_data_pct": 0.63, "large_objects": 42}


