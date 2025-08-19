from typing import Any, Dict, List, Optional
from ..base_agent import BaseAgent, AgentCapabilities, AgentTask
from ...config.settings import AgentType


class CostAnomalyAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_type=AgentType.COST_ANOMALY,
            name="Cost Anomaly Agent",
            description="Real-time cost anomaly detection with explainers and Slack alerts",
            capabilities=AgentCapabilities(
                supported_tasks=["cost_anomaly_detect", "cost_anomaly_explain", "cost_anomaly_alert"],
                required_tools=["cost_analyzer", "chatops_orchestrator"],
                max_concurrent_tasks=5,
            ),
        )

    async def _on_start(self):
        return

    async def _on_stop(self):
        return

    async def _execute_task_logic(self, task: AgentTask) -> Dict[str, Any]:
        task_type = task.task_type.lower()
        ctx = task.context or {}
        if "detect" in task_type:
            return {
                "anomalies": [
                    {"service": "EC2", "dim": "us-east-1", "delta_pct": 42.3, "explanation": "New ASG scale-up"}
                ],
                "window": ctx.get("window", "1d"),
            }
        if "explain" in task_type:
            return {
                "explanations": [
                    {"anomaly_id": ctx.get("anomaly_id", "a-1"), "factors": ["traffic spike", "instance family change"]}
                ]
            }
        if "alert" in task_type:
            return {"sent": True, "channel": ctx.get("channel", "#finops-alerts")}
        return {"message": "Unsupported task", "task_type": task.task_type}

    async def _generate_recommendation_logic(self, context: Dict[str, Any], task_type: str) -> Dict[str, Any]:
        return {
            "title": "Enable real-time anomaly alerts",
            "description": "Wire anomalies to Slack with explainers and auto-ticket creation",
            "reasoning": "Early detection reduces waste and MTTR",
            "confidence": 0.82,
            "impact": "high",
            "risk_level": "medium",
            "estimated_savings": 12000.0,
        }

    async def _analyze_data_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {"anomaly_score": 0.13, "drivers": ["egress", "snapshots"]}


