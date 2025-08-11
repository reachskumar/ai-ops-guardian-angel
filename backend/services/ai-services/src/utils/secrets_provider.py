"""
Tenant-aware secrets provider abstraction.
Supports Vault (placeholder) and environment-based secrets for development.
"""

from __future__ import annotations

import base64
import os
from typing import Optional, Dict

try:
    import hvac  # Vault client
    VAULT_AVAILABLE = True
except Exception:
    VAULT_AVAILABLE = False


class SecretsProvider:
    """Abstracts secret retrieval per tenant."""

    def __init__(self, backend: str = "env", vault_addr: Optional[str] = None, vault_token: Optional[str] = None) -> None:
        self.backend = backend
        self.vault_addr = vault_addr or os.getenv("VAULT_ADDR")
        self.vault_token = vault_token or os.getenv("VAULT_TOKEN")
        self._vault_client = None
        if self.backend == "vault" and VAULT_AVAILABLE:
            self._vault_client = hvac.Client(url=self.vault_addr, token=self.vault_token)

    def get(self, tenant_id: str, key: str) -> Optional[str]:
        if self.backend == "env":
            # Convention: TENANT_<ID>_<KEY>
            env_key = f"TENANT_{tenant_id.upper()}_{key.upper()}"
            return os.getenv(env_key)
        if self.backend == "vault" and self._vault_client:
            path = f"secret/data/tenants/{tenant_id}/{key}"
            try:
                resp = self._vault_client.secrets.kv.v2.read_secret_version(path=path)
                return resp["data"]["data"].get("value")
            except Exception:
                return None
        # Placeholder for Vault/Secrets Manager
        # Implement actual backends as needed
        return None

    def get_b64(self, tenant_id: str, key: str) -> Optional[bytes]:
        v = self.get(tenant_id, key)
        if v is None:
            return None
        try:
            return base64.b64decode(v)
        except Exception:
            return v.encode()


