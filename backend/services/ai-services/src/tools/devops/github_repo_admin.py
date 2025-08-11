from __future__ import annotations

import json
import requests


class GitHubRepoAdmin:
    """Admin operations for a GitHub repo using an installation token."""

    def __init__(self, repo_full_name: str, token: str) -> None:
        self.repo = repo_full_name
        self.session = requests.Session()
        self.session.headers.update(
            {
                "Accept": "application/vnd.github+json",
                "Authorization": f"Bearer {token}",
                "X-GitHub-Api-Version": "2022-11-28",
            }
        )

    def protect_branch(
        self,
        branch: str = "main",
        required_checks: list[str] | None = None,
        require_reviews: bool = True,
        required_approving_review_count: int = 1,
        enforce_admins: bool = True,
    ) -> None:
        url = f"https://api.github.com/repos/{self.repo}/branches/{branch}/protection"
        payload: dict = {
            "required_status_checks": {
                "strict": True,
                "contexts": required_checks or [],
            },
            "enforce_admins": enforce_admins,
            "required_pull_request_reviews": (
                {
                    "required_approving_review_count": required_approving_review_count,
                    "require_code_owner_reviews": False,
                }
                if require_reviews
                else None
            ),
            "restrictions": None,
        }
        # Remove None fields per GitHub API expectations
        payload = {k: v for k, v in payload.items() if v is not None}
        resp = self.session.put(url, data=json.dumps(payload))
        resp.raise_for_status()


