from __future__ import annotations

from typing import Dict, Any
from datetime import datetime

from ..base_agent import BaseAgent, AgentTask, AgentCapabilities
from ...config.settings import AgentType
from ...agents.advanced_devops.chatops_orchestrator import ChatOpsOrchestrator


class GitOpsDeploymentAgent(BaseAgent):
    """Creates GitOps PRs and coordinates promotion/abort through ChatOps."""

    def __init__(self) -> None:
        capabilities = AgentCapabilities(
            supported_tasks=["gitops_pr", "gitops_promote", "gitops_abort"],
            required_tools=["github_actions"],
            max_concurrent_tasks=5,
            average_response_time=5.0,
        )
        super().__init__(
            agent_type=AgentType.DEPLOYMENT_ORCHESTRATION,
            name="GitOps Deployment Agent",
            description="Opens GitOps PRs and controls rollout promotion/abort",
            capabilities=capabilities,
        )
        self.chatops = ChatOpsOrchestrator()

    async def _execute_task_logic(self, task: AgentTask) -> Dict[str, Any]:
        ctx = task.context or {}
        env = ctx.get("environment", "staging")
        service = ctx.get("service", "ai-services")
        if task.task_type == "gitops_pr":
            tag = ctx.get("image_tag", "latest")
            result = self.chatops.gitops_pr(environment=env, service=service, image_tag=tag)
            return {"message": f"Opened GitOps PR for {service} -> {tag} in {env}", "dispatch": result}
        if task.task_type == "gitops_promote":
            result = self.chatops.promote(environment=env, service=service)
            return {"message": f"Promoted rollout for {service} in {env}", "dispatch": result}
        if task.task_type == "gitops_abort":
            result = self.chatops.abort(environment=env, service=service)
            return {"message": f"Aborted rollout for {service} in {env}", "dispatch": result}
        return {"message": "Unsupported GitOps task", "timestamp": datetime.now().isoformat()}


