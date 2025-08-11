"""
GitHub App client: mints installation tokens per tenant.
Expect per-tenant: GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY (PEM), GITHUB_INSTALLATION_ID, GITHUB_REPO.
Prefer storing via SecretsProvider.
"""

from __future__ import annotations

import time
import jwt
import requests
from typing import Dict, Any


class GitHubAppClient:
    def __init__(self, app_id: str, private_key_pem: str) -> None:
        self.app_id = app_id
        self.private_key_pem = private_key_pem

    def create_jwt(self) -> str:
        now = int(time.time())
        payload = {
            "iat": now - 60,
            "exp": now + (9 * 60),
            "iss": self.app_id,
        }
        return jwt.encode(payload, self.private_key_pem, algorithm="RS256")

    def get_installation_token(self, installation_id: str) -> str:
        app_jwt = self.create_jwt()
        headers = {
            "Authorization": f"Bearer {app_jwt}",
            "Accept": "application/vnd.github+json",
        }
        url = f"https://api.github.com/app/installations/{installation_id}/access_tokens"
        r = requests.post(url, headers=headers)
        if r.status_code != 201:
            raise RuntimeError(f"Failed to create installation token: {r.status_code} {r.text}")
        return r.json()["token"]


