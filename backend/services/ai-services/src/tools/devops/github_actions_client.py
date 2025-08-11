"""
Lightweight GitHub Actions client to dispatch workflows from the ChatOps backend.
"""

from __future__ import annotations

import os
import json
from typing import Dict, Any, Optional

import requests


class GitHubActionsClient:
    """Minimal REST client to trigger workflow_dispatch events."""

    def __init__(
        self,
        repo_full_name: Optional[str] = None,
        token: Optional[str] = None,
        api_base_url: str = "https://api.github.com",
    ) -> None:
        self.repo_full_name = repo_full_name or os.getenv("GITHUB_REPO")
        self.token = token or os.getenv("GITHUB_TOKEN") or os.getenv("GH_TOKEN")
        self.api_base_url = api_base_url.rstrip("/")

        if not self.repo_full_name:
            raise ValueError("GitHubActionsClient requires repo_full_name or GITHUB_REPO env var")
        if not self.token:
            raise ValueError("GitHubActionsClient requires token or GITHUB_TOKEN/GH_TOKEN env var")

        self.session = requests.Session()
        self.session.headers.update(
            {
                "Accept": "application/vnd.github+json",
                "Authorization": f"Bearer {self.token}",
                "X-GitHub-Api-Version": "2022-11-28",
            }
        )

    def dispatch_workflow(
        self,
        workflow_file: str,
        ref: str,
        inputs: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Trigger a workflow_dispatch on a given workflow file.

        Args:
            workflow_file: Path under .github/workflows/, e.g. "ops-dispatch.yml"
            ref: Branch or tag to run the workflow on
            inputs: Dict of workflow inputs
        """
        url = f"{self.api_base_url}/repos/{self.repo_full_name}/actions/workflows/{workflow_file}/dispatches"
        payload = {"ref": ref}
        if inputs:
            payload["inputs"] = inputs

        response = self.session.post(url, data=json.dumps(payload))
        if response.status_code not in (201, 204):
            raise RuntimeError(
                f"Failed to dispatch workflow {workflow_file}: {response.status_code} {response.text}"
            )
        return {"status": "dispatched", "workflow": workflow_file, "ref": ref, "inputs": inputs or {}}


