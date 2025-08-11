"""
Tenant-aware secrets provider abstraction.
Supports Vault (placeholder) and environment-based secrets for development.
"""

from __future__ import annotations

import base64
import os
from typing import Optional, Dict


class SecretsProvider:
    """Abstracts secret retrieval per tenant."""

    def __init__(self, backend: str = "env") -> None:
        self.backend = backend

    def get(self, tenant_id: str, key: str) -> Optional[str]:
        if self.backend == "env":
            # Convention: TENANT_<ID>_<KEY>
            env_key = f"TENANT_{tenant_id.upper()}_{key.upper()}"
            return os.getenv(env_key)
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


