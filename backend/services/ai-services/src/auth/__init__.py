"""
🔐 Authentication Package
Secure authentication and authorization for AI Ops Guardian Angel
"""

from .authentication_manager import AuthenticationManager, AuthUser, AuthProvider, SecurityConfig
from .auth_middleware import (
    setup_auth_middleware, get_auth_manager, get_current_user, 
    require_permissions, require_roles, require_super_admin, require_same_org
)
from .auth_routes import router as auth_router

__all__ = [
    "AuthenticationManager",
    "AuthUser", 
    "AuthProvider",
    "SecurityConfig",
    "setup_auth_middleware",
    "get_auth_manager",
    "get_current_user",
    "require_permissions",
    "require_roles", 
    "require_super_admin",
    "require_same_org",
    "auth_router"
] 