from typing import Any, Dict
from ..base_agent import BaseAgent, AgentCapabilities, AgentTask
from ...config.settings import AgentType


class DataClassificationAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_type=AgentType.DATA_CLASSIFICATION,
            name="Data Classification Agent",
            description="PII/secret detection in configs/logs; residency policy enforcement",
            capabilities=AgentCapabilities(
                supported_tasks=["pii_detect", "secret_detect", "residency_enforce"],
                required_tools=["dlp_scanner", "secrets_scanner", "policy_engine"],
            ),
        )

    async def _execute_task_logic(self, task: AgentTask) -> Dict[str, Any]:
        t = task.task_type.lower()
        if "pii" in t:
            return {"pii": [{"type": "email", "value": "redacted@example.com", "file": "logs/app.log"}]}
        if "secret" in t:
            return {"secrets": [{"type": "aws_key", "file": "config.yml"}]}
        if "residency" in t or "enforce" in t:
            return {"policy": "eu-only", "violations": ["s3://bucket-us/obj"]}
        return {"message": "Unsupported task", "task_type": task.task_type}

    async def _generate_recommendation_logic(self, context: Dict[str, Any], task_type: str) -> Dict[str, Any]:
        return {
            "title": "Enable continuous data classification",
            "description": "Scan configs/logs for PII and secrets; enforce residency at write-paths",
            "reasoning": "Reduces leakage and compliance risk",
            "confidence": 0.83,
            "impact": "high",
            "risk_level": "medium",
        }

    async def _analyze_data_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {"pii_score": 0.11, "secret_score": 0.02}


