from typing import Any, Dict
from ..base_agent import BaseAgent, AgentCapabilities, AgentTask
from ...config.settings import AgentType


class SBOMManagementAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_type=AgentType.SBOM_MANAGEMENT,
            name="SBOM Management Agent",
            description="Generate SBOMs, correlate scans, track license/compliance drift",
            capabilities=AgentCapabilities(
                supported_tasks=["sbom_generate", "scan_correlate", "license_drift_track"],
                required_tools=["syft", "grype", "license_checker"],
            ),
        )

    async def _execute_task_logic(self, task: AgentTask) -> Dict[str, Any]:
        t = task.task_type.lower()
        if "sbom" in t or "generate" in t:
            return {"sbom": {"format": "cyclonedx", "components": 142}}
        if "scan" in t or "correlate" in t:
            return {"findings": [{"component": "openssl", "cve": "CVE-2023-XXXX"}]}
        if "license" in t or "drift" in t:
            return {"license_drift": [{"component": "libfoo", "from": "MIT", "to": "GPL-3.0"}]}
        return {"message": "Unsupported task", "task_type": task.task_type}

    async def _generate_recommendation_logic(self, context: Dict[str, Any], task_type: str) -> Dict[str, Any]:
        return {
            "title": "Automate SBOM generation and scan correlation",
            "description": "Produce SBOMs on each build, correlate scans, and alert on license drift",
            "reasoning": "Sustained compliance and faster triage",
            "confidence": 0.82,
            "impact": "high",
            "risk_level": "low",
        }

    async def _analyze_data_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {"components": len(data.get("components", []))}


