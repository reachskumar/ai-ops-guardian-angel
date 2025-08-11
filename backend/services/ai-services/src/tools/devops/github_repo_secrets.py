from __future__ import annotations

import base64
import json
from typing import Dict

import requests
from nacl import encoding, public


class GitHubRepoSecrets:
    """Manage GitHub Actions repo secrets via REST API using an installation token."""

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

    def _get_public_key(self) -> Dict[str, str]:
        resp = self.session.get(f"https://api.github.com/repos/{self.repo}/actions/secrets/public-key")
        resp.raise_for_status()
        return resp.json()

    @staticmethod
    def _encrypt(public_key_b64: str, secret_value: str) -> str:
        public_key = public.PublicKey(public_key_b64, encoding.Base64Encoder())
        sealed_box = public.SealedBox(public_key)
        encrypted = sealed_box.encrypt(secret_value.encode("utf-8"))
        return base64.b64encode(encrypted).decode("utf-8")

    def set_secret(self, name: str, value: str) -> None:
        key_data = self._get_public_key()
        encrypted_value = self._encrypt(key_data["key"], value)
        payload = {"encrypted_value": encrypted_value, "key_id": key_data["key_id"]}
        resp = self.session.put(
            f"https://api.github.com/repos/{self.repo}/actions/secrets/{name}",
            data=json.dumps(payload),
        )
        resp.raise_for_status()


