"""
ChatOps Orchestrator: translate DevOps intents into GitHub Actions workflow dispatches.
"""

from __future__ import annotations

from typing import Dict, Any, Optional

from ...tools.devops.github_actions_client import GitHubActionsClient


class ChatOpsOrchestrator:
    """Maps high-level intents to workflow dispatch calls."""

    def __init__(self, repo_full_name: Optional[str] = None, token: Optional[str] = None) -> None:
        self.gh = GitHubActionsClient(repo_full_name=repo_full_name, token=token)

    def deploy(
        self,
        environment: str,
        service: str,
        strategy: str = "rolling",
        ref: str = "main",
    ) -> Dict[str, Any]:
        inputs = {
            "action": "deploy",
            "environment": environment,
            "service": service,
            "strategy": strategy,
        }
        return self.gh.dispatch_workflow("ops-dispatch.yml", ref=ref, inputs=inputs)

    def scale(self, environment: str, service: str, replicas: int, ref: str = "main") -> Dict[str, Any]:
        inputs = {
            "action": "scale",
            "environment": environment,
            "service": service,
            "replicas": str(replicas),
        }
        return self.gh.dispatch_workflow("ops-dispatch.yml", ref=ref, inputs=inputs)

    def restart(self, environment: str, service: str, ref: str = "main") -> Dict[str, Any]:
        inputs = {
            "action": "restart",
            "environment": environment,
            "service": service,
        }
        return self.gh.dispatch_workflow("ops-dispatch.yml", ref=ref, inputs=inputs)

    def rollout(self, environment: str, service: str, subaction: str, ref: str = "main") -> Dict[str, Any]:
        inputs = {
            "action": "rollout",
            "environment": environment,
            "service": service,
            "subaction": subaction,  # status|pause|resume|undo
        }
        return self.gh.dispatch_workflow("ops-dispatch.yml", ref=ref, inputs=inputs)

    def logs(self, environment: str, service: str, tail: str = "200", ref: str = "main") -> Dict[str, Any]:
        inputs = {
            "action": "logs",
            "environment": environment,
            "service": service,
            "tail": tail,
        }
        return self.gh.dispatch_workflow("ops-dispatch.yml", ref=ref, inputs=inputs)


