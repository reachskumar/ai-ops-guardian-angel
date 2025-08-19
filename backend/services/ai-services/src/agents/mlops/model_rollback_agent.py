from typing import Any, Dict
from ..base_agent import BaseAgent, AgentCapabilities, AgentTask
from ...config.settings import AgentType


class ModelRollbackAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_type=AgentType.MODEL_ROLLBACK,
            name="Model Rollback Agent",
            description="Canary eval and rollback with safety gating on real-time metrics",
            capabilities=AgentCapabilities(
                supported_tasks=["canary_eval", "rollback", "safety_gate"],
                required_tools=["model_evaluator", "deployment_orchestrator", "metrics"],
            ),
        )

    async def _execute_task_logic(self, task: AgentTask) -> Dict[str, Any]:
        t = task.task_type.lower()
        if "canary" in t:
            return {"canary": {"p75_latency": 120, "error_rate": 0.8, "decision": "rollback"}}
        if "rollback" in t:
            return {"rolled_back": True, "to": task.context.get("previous_version", "model:v42")}
        if "gate" in t:
            return {"allowed": False, "reason": "error budget exhausted"}
        return {"message": "Unsupported task", "task_type": task.task_type}

    async def _generate_recommendation_logic(self, context: Dict[str, Any], task_type: str) -> Dict[str, Any]:
        return {
            "title": "Enable canary with safety gates",
            "description": "Use error budgets and latency SLOs to auto-rollback on regressions",
            "reasoning": "Limits blast radius and protects SLOs",
            "confidence": 0.82,
            "impact": "critical",
            "risk_level": "medium",
        }

    async def _analyze_data_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {"p95": 210, "error_rate": 1.2}


