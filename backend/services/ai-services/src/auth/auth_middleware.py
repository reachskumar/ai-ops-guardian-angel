"""
🔐 Authentication & Authorization Middleware
FastAPI middleware for secure API access with JWT, RBAC, and comprehensive security
"""

from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import time
from typing import Dict, List, Optional, Set, Callable
from datetime import datetime, timedelta
import re
import hashlib
from functools import wraps
import logging

from .authentication_manager import AuthenticationManager, AuthUser, SecurityConfig

logger = logging.getLogger(__name__)

# Global instances
auth_manager = AuthenticationManager()
security = HTTPBearer()

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware to prevent abuse"""
    
    def __init__(self, app, requests_per_minute: int = SecurityConfig.RATE_LIMIT_REQUESTS_PER_MINUTE):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.clients: Dict[str, List[float]] = {}
        
    async def dispatch(self, request: Request, call_next):
        client_ip = self._get_client_ip(request)
        
        # Check rate limit
        if self._is_rate_limited(client_ip):
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Rate limit exceeded",
                    "message": f"Maximum {self.requests_per_minute} requests per minute allowed",
                    "retry_after": 60
                }
            )
        
        # Record request
        self._record_request(client_ip)
        
        response = await call_next(request)
        return response
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP address"""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"
    
    def _is_rate_limited(self, client_ip: str) -> bool:
        """Check if client has exceeded rate limit"""
        now = time.time()
        minute_ago = now - 60
        
        if client_ip not in self.clients:
            return False
        
        # Remove old requests
        self.clients[client_ip] = [req_time for req_time in self.clients[client_ip] if req_time > minute_ago]
        
        return len(self.clients[client_ip]) >= self.requests_per_minute
    
    def _record_request(self, client_ip: str):
        """Record request timestamp"""
        now = time.time()
        if client_ip not in self.clients:
            self.clients[client_ip] = []
        self.clients[client_ip].append(now)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        return response

class AuthenticationMiddleware(BaseHTTPMiddleware):
    """Authentication middleware for protected routes"""
    
    def __init__(self, app):
        super().__init__(app)
        self.public_paths = {
            "/health",
            "/docs",
            "/redoc",
            "/openapi.json",
            "/auth/login",
            "/auth/register",
            "/auth/oauth/google",
            "/auth/oauth/microsoft",
            "/auth/oauth/github",
            "/auth/forgot-password",
            "/auth/reset-password"
        }
    
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        
        # Skip authentication for public paths
        if path in self.public_paths or path.startswith("/auth/oauth/callback"):
            return await call_next(request)
        
        # Extract and verify token
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=401,
                content={"error": "Missing or invalid authorization header"}
            )
        
        token = auth_header.replace("Bearer ", "")
        is_valid, payload, error = auth_manager.verify_token(token)
        
        if not is_valid:
            return JSONResponse(
                status_code=401,
                content={"error": f"Authentication failed: {error}"}
            )
        
        # Add user info to request state
        request.state.user_id = payload["user_id"]
        request.state.org_id = payload["org_id"]
        request.state.roles = payload["roles"]
        request.state.permissions = payload["permissions"]
        request.state.session_id = payload["session_id"]
        
        # Update session activity
        auth_manager.update_session_activity(payload["session_id"])
        
        response = await call_next(request)
        return response

# =============================================================================
# AUTHENTICATION DEPENDENCIES
# =============================================================================

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> AuthUser:
    """Get current authenticated user"""
    token = credentials.credentials
    is_valid, payload, error = auth_manager.verify_token(token)
    
    if not is_valid:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {error}")
    
    # Create AuthUser from token payload
    user = AuthUser(
        user_id=payload["user_id"],
        email=payload["email"],
        username=payload.get("username", ""),
        org_id=payload["org_id"],
        team_id=payload.get("team_id"),
        roles=payload["roles"],
        permissions=payload["permissions"],
        auth_provider=payload.get("auth_provider", "local"),
        mfa_enabled=payload.get("mfa_enabled", False),
        last_login=datetime.utcnow(),
        session_id=payload["session_id"],
        is_super_admin=payload.get("is_super_admin", False)
    )
    
    return user

async def get_current_active_user(current_user: AuthUser = Depends(get_current_user)) -> AuthUser:
    """Get current active user (additional checks can be added here)"""
    return current_user

def require_permissions(required_permissions: List[str]):
    """Decorator to require specific permissions"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract user from kwargs or request
            current_user = None
            for arg in args:
                if isinstance(arg, AuthUser):
                    current_user = arg
                    break
            
            if not current_user:
                for value in kwargs.values():
                    if isinstance(value, AuthUser):
                        current_user = value
                        break
            
            if not current_user:
                raise HTTPException(status_code=401, detail="Authentication required")
            
            # Check permissions
            missing_permissions = [perm for perm in required_permissions if perm not in current_user.permissions]
            if missing_permissions:
                raise HTTPException(
                    status_code=403, 
                    detail=f"Insufficient permissions. Required: {missing_permissions}"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def require_roles(required_roles: List[str]):
    """Decorator to require specific roles"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract user from kwargs or request
            current_user = None
            for arg in args:
                if isinstance(arg, AuthUser):
                    current_user = arg
                    break
            
            if not current_user:
                for value in kwargs.values():
                    if isinstance(value, AuthUser):
                        current_user = value
                        break
            
            if not current_user:
                raise HTTPException(status_code=401, detail="Authentication required")
            
            # Check roles
            if not any(role in current_user.roles for role in required_roles):
                raise HTTPException(
                    status_code=403, 
                    detail=f"Insufficient permissions. Required roles: {required_roles}"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def require_super_admin(func):
    """Decorator to require super admin access"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        # Extract user from kwargs or request
        current_user = None
        for arg in args:
            if isinstance(arg, AuthUser):
                current_user = arg
                break
        
        if not current_user:
            for value in kwargs.values():
                if isinstance(value, AuthUser):
                    current_user = value
                    break
        
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        if not current_user.is_super_admin:
            raise HTTPException(status_code=403, detail="Super admin access required")
        
        return await func(*args, **kwargs)
    return wrapper

def require_same_org(func):
    """Decorator to ensure user can only access their own organization's data"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        # Extract user and org_id from kwargs
        current_user = None
        target_org_id = None
        
        for arg in args:
            if isinstance(arg, AuthUser):
                current_user = arg
                break
        
        if not current_user:
            for value in kwargs.values():
                if isinstance(value, AuthUser):
                    current_user = value
                    break
        
        # Look for org_id in kwargs
        target_org_id = kwargs.get("org_id")
        
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        # Super admins can access any org
        if current_user.is_super_admin:
            return await func(*args, **kwargs)
        
        # Check organization access
        if target_org_id and target_org_id != current_user.org_id:
            raise HTTPException(status_code=403, detail="Access denied to organization data")
        
        return await func(*args, **kwargs)
    return wrapper

# =============================================================================
# SECURITY UTILITIES
# =============================================================================

class IPWhitelist:
    """IP address whitelisting for admin endpoints"""
    
    def __init__(self, allowed_ips: Set[str] = None):
        self.allowed_ips = allowed_ips or set()
    
    def is_allowed(self, ip_address: str) -> bool:
        """Check if IP address is whitelisted"""
        if not self.allowed_ips:
            return True  # No whitelist means all IPs allowed
        return ip_address in self.allowed_ips
    
    def add_ip(self, ip_address: str):
        """Add IP to whitelist"""
        self.allowed_ips.add(ip_address)
    
    def remove_ip(self, ip_address: str):
        """Remove IP from whitelist"""
        self.allowed_ips.discard(ip_address)

class AuditLogger:
    """Security audit logging"""
    
    @staticmethod
    def log_authentication(user_id: str, success: bool, ip_address: str, user_agent: str, details: str = ""):
        """Log authentication events"""
        logger.info(f"AUTH: user={user_id}, success={success}, ip={ip_address}, ua={user_agent}, details={details}")
    
    @staticmethod
    def log_authorization(user_id: str, action: str, resource: str, granted: bool, reason: str = ""):
        """Log authorization events"""
        logger.info(f"AUTHZ: user={user_id}, action={action}, resource={resource}, granted={granted}, reason={reason}")
    
    @staticmethod
    def log_security_event(event_type: str, user_id: str, ip_address: str, details: str):
        """Log security events"""
        logger.warning(f"SECURITY: type={event_type}, user={user_id}, ip={ip_address}, details={details}")

def detect_suspicious_activity(request: Request, user: AuthUser) -> bool:
    """Detect suspicious authentication/access patterns"""
    client_ip = request.headers.get("X-Forwarded-For", request.client.host if request.client else "unknown")
    user_agent = request.headers.get("User-Agent", "unknown")
    
    # Check for suspicious patterns
    suspicious_indicators = [
        # Multiple rapid requests from same IP
        # Unusual user agent strings
        # Access from new geographic locations
        # Unusual access patterns
    ]
    
    # Simple example: Check for too many requests
    recent_requests = getattr(user, 'recent_requests', [])
    now = time.time()
    recent_requests = [req for req in recent_requests if now - req < 300]  # Last 5 minutes
    
    if len(recent_requests) > 100:  # More than 100 requests in 5 minutes
        AuditLogger.log_security_event("HIGH_REQUEST_VOLUME", user.user_id, client_ip, f"requests={len(recent_requests)}")
        return True
    
    return False

def require_mfa_for_sensitive_operations(func):
    """Decorator to require MFA verification for sensitive operations"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        # Extract user from kwargs
        current_user = None
        for arg in args:
            if isinstance(arg, AuthUser):
                current_user = arg
                break
        
        if not current_user:
            for value in kwargs.values():
                if isinstance(value, AuthUser):
                    current_user = value
                    break
        
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        # Check if MFA is required for this user
        if current_user.is_super_admin or "admin" in current_user.roles:
            # For sensitive operations, require MFA to be enabled
            if not current_user.mfa_enabled:
                raise HTTPException(
                    status_code=403, 
                    detail="Multi-factor authentication required for this operation"
                )
        
        return await func(*args, **kwargs)
    return wrapper

# =============================================================================
# FASTAPI INTEGRATION HELPERS
# =============================================================================

def setup_auth_middleware(app):
    """Setup all authentication middleware for FastAPI app"""
    # Add middleware in reverse order (last added = first executed)
    app.add_middleware(AuthenticationMiddleware)
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(RateLimitMiddleware)
    
    return app

def get_auth_manager() -> AuthenticationManager:
    """Get global authentication manager instance"""
    return auth_manager 