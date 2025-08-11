"""
ChatOps Orchestrator: translate DevOps intents into GitHub Actions workflow dispatches.
"""

from __future__ import annotations

from typing import Dict, Any, Optional

from ...tools.devops.github_actions_client import GitHubActionsClient
from ...tools.devops.github_app_client import GitHubAppClient
from ...utils.secrets_provider import SecretsProvider


class ChatOpsOrchestrator:
    """Maps high-level intents to workflow dispatch calls."""

    def __init__(self, repo_full_name: Optional[str] = None, token: Optional[str] = None, tenant_id: Optional[str] = None) -> None:
        self.tenant_id = tenant_id
        if tenant_id:
            # Resolve per-tenant GitHub App token and repo
            sp = SecretsProvider()
            app_id = sp.get(tenant_id, "github_app_id")
            private_key = sp.get(tenant_id, "github_app_private_key")
            installation_id = sp.get(tenant_id, "github_installation_id")
            repo = sp.get(tenant_id, "github_repo")
            if not all([app_id, private_key, installation_id, repo]):
                raise ValueError("Missing tenant GitHub integration secrets")
            gh_app = GitHubAppClient(app_id=app_id, private_key_pem=private_key)
            inst_token = gh_app.get_installation_token(installation_id)
            self.gh = GitHubActionsClient(repo_full_name=repo, token=inst_token)
        else:
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

    def promote(self, environment: str, service: str, ref: str = "main") -> Dict[str, Any]:
        inputs = {"action": "promote", "environment": environment, "service": service}
        return self.gh.dispatch_workflow("ops-dispatch.yml", ref=ref, inputs=inputs)

    def abort(self, environment: str, service: str, ref: str = "main") -> Dict[str, Any]:
        inputs = {"action": "abort", "environment": environment, "service": service}
        return self.gh.dispatch_workflow("ops-dispatch.yml", ref=ref, inputs=inputs)

    def node(self, node_name: str, subaction: str, environment: str = "staging", ref: str = "main") -> Dict[str, Any]:
        inputs = {
            "action": "node",
            "environment": environment,
            "service": "ai-services",
            "node_name": node_name,
            "subaction": subaction,  # cordon|drain|uncordon|status
        }
        return self.gh.dispatch_workflow("ops-dispatch.yml", ref=ref, inputs=inputs)

    def hpa_update(self, environment: str, service: str, min_replicas: int, max_replicas: int, target_cpu: int, ref: str = "main") -> Dict[str, Any]:
        inputs = {
            "action": "hpa_update",
            "environment": environment,
            "service": service,
            "min_replicas": str(min_replicas),
            "max_replicas": str(max_replicas),
            "target_cpu": str(target_cpu),
        }
        return self.gh.dispatch_workflow("ops-dispatch.yml", ref=ref, inputs=inputs)

    def quota_update(self, environment: str, quota_yaml_b64: str, ref: str = "main") -> Dict[str, Any]:
        inputs = {
            "action": "quota_update",
            "environment": environment,
            "service": "ai-services",
            "quota_yaml": quota_yaml_b64,
        }
        return self.gh.dispatch_workflow("ops-dispatch.yml", ref=ref, inputs=inputs)

    def apply_manifest(self, environment: str, manifest_yaml_b64: str, is_secret: bool = False, service: str = "ai-services", ref: str = "main") -> Dict[str, Any]:
        inputs = {
            "action": "secret_apply" if is_secret else "config_apply",
            "environment": environment,
            "service": service,
            "manifest_yaml": manifest_yaml_b64,
        }
        return self.gh.dispatch_workflow("ops-dispatch.yml", ref=ref, inputs=inputs)

    def preview_env(self, pr_number: int, action: str = "create", ref: str = "main") -> Dict[str, Any]:
        inputs = {"pr_number": str(pr_number), "action": action}
        return self.gh.dispatch_workflow("preview-env.yml", ref=ref, inputs=inputs)

    def hotfix_or_release(self, type_: str, version: str, ref: str = "main") -> Dict[str, Any]:
        inputs = {"type": type_, "version": version}
        return self.gh.dispatch_workflow("hotfix-release.yml", ref=ref, inputs=inputs)

    def gitops_pr(self, environment: str, service: str, image_tag: str, ref: str = "main") -> Dict[str, Any]:
        inputs = {"environment": environment, "service": service, "image_tag": image_tag}
        return self.gh.dispatch_workflow("gitops-pr.yml", ref=ref, inputs=inputs)


