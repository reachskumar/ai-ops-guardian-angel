#!/usr/bin/env python3
"""
Multi-Tenant Middleware System
Handles tenant isolation, authentication, and resource management
"""

import jwt
import time
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, Callable
from functools import wraps
from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from multi_tenant_manager import MultiTenantManager, ResourceQuota

security = HTTPBearer()

class TenantMiddleware:
    """Middleware for multi-tenant request processing"""
    
    def __init__(self, tenant_manager: MultiTenantManager):
        self.tenant_manager = tenant_manager
        self.jwt_secret = "your-secret-key-here"  # Should be from environment
        self.rate_limiters = {}  # In production, use Redis
        
    def extract_tenant_info(self, request: Request) -> Dict[str, Any]:
        """Extract tenant information from request"""
        
        # Try to get from Authorization header
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            try:
                payload = jwt.decode(token, self.jwt_secret, algorithms=["HS256"])
                return {
                    "user_id": payload.get("user_id"),
                    "org_id": payload.get("org_id"),
                    "team_ids": payload.get("team_ids", []),
                    "permissions": payload.get("permissions", [])
                }
            except jwt.InvalidTokenError:
                pass
        
        # Fallback: Extract from headers or query params
        org_id = request.headers.get("x-org-id") or request.query_params.get("org_id")
        user_id = request.headers.get("x-user-id") or request.query_params.get("user_id")
        
        if user_id:
            context = self.tenant_manager.get_user_context(user_id)
            if "error" not in context:
                return {
                    "user_id": user_id,
                    "org_id": context["organization"]["org_id"],
                    "team_ids": [team["team_id"] for team in context["teams"]],
                    "permissions": context["user"]["permissions"]
                }
        
        return {"user_id": "demo_user", "org_id": "demo_org", "team_ids": [], "permissions": []}
    
    def generate_access_token(self, user_id: str, expires_hours: int = 24) -> str:
        """Generate JWT access token"""
        
        context = self.tenant_manager.get_user_context(user_id)
        if "error" in context:
            raise ValueError("User not found")
        
        payload = {
            "user_id": user_id,
            "org_id": context["organization"]["org_id"],
            "team_ids": [team["team_id"] for team in context["teams"]],
            "permissions": context["user"]["permissions"],
            "exp": datetime.utcnow() + timedelta(hours=expires_hours),
            "iat": datetime.utcnow()
        }
        
        return jwt.encode(payload, self.jwt_secret, algorithm="HS256")
    
    def check_rate_limit(self, org_id: str, resource: ResourceQuota, 
                        window_minutes: int = 60) -> bool:
        """Check rate limiting for organization"""
        
        now = time.time()
        window_start = now - (window_minutes * 60)
        
        # Initialize rate limiter for org if not exists
        if org_id not in self.rate_limiters:
            self.rate_limiters[org_id] = {}
        
        if resource not in self.rate_limiters[org_id]:
            self.rate_limiters[org_id][resource] = []
        
        # Clean old entries
        self.rate_limiters[org_id][resource] = [
            timestamp for timestamp in self.rate_limiters[org_id][resource]
            if timestamp > window_start
        ]
        
        # Check quota
        org = self.tenant_manager.organizations.get(org_id)
        if not org:
            return False
        
        rate_limit = org.quotas.get(resource, 0)
        current_usage = len(self.rate_limiters[org_id][resource])
        
        if current_usage >= rate_limit:
            return False
        
        # Record usage
        self.rate_limiters[org_id][resource].append(now)
        return True
    
    def validate_permissions(self, user_permissions: list, required_permissions: list) -> bool:
        """Validate if user has required permissions"""
        return any(perm in user_permissions for perm in required_permissions)

def require_auth(tenant_middleware: TenantMiddleware):
    """Dependency for requiring authentication"""
    
    def auth_dependency(request: Request):
        tenant_info = tenant_middleware.extract_tenant_info(request)
        
        if not tenant_info.get("user_id"):
            raise HTTPException(status_code=401, detail="Authentication required")
        
        return tenant_info
    
    return auth_dependency

def require_permissions(*required_perms: str):
    """Decorator for requiring specific permissions"""
    
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract tenant info from request
            request = kwargs.get("request")
            if not request:
                # Try to find request in args
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break
            
            if not request:
                raise HTTPException(status_code=500, detail="Request context not found")
            
            # This would be injected by dependency
            tenant_info = getattr(request.state, "tenant_info", {})
            user_permissions = tenant_info.get("permissions", [])
            
            if not any(perm in user_permissions for perm in required_perms):
                raise HTTPException(
                    status_code=403, 
                    detail=f"Insufficient permissions. Required: {required_perms}"
                )
            
            return await func(*args, **kwargs)
        
        return wrapper
    
    return decorator

def require_quota(resource: ResourceQuota, amount: int = 1):
    """Decorator for requiring quota availability"""
    
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            request = kwargs.get("request")
            if not request:
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break
            
            tenant_info = getattr(request.state, "tenant_info", {})
            org_id = tenant_info.get("org_id")
            
            if not org_id:
                raise HTTPException(status_code=400, detail="Organization context required")
            
            # Check quota (this would use the tenant_middleware instance)
            tenant_middleware = getattr(request.app.state, "tenant_middleware", None)
            if tenant_middleware:
                if not tenant_middleware.tenant_manager.check_quota(org_id, resource, amount):
                    raise HTTPException(
                        status_code=429, 
                        detail=f"Quota exceeded for {resource}. Upgrade your plan."
                    )
                
                # Consume quota
                tenant_middleware.tenant_manager.consume_quota(org_id, resource, amount)
            
            return await func(*args, **kwargs)
        
        return wrapper
    
    return decorator

class TenantAwareResponse:
    """Helper for creating tenant-aware responses"""
    
    @staticmethod
    def create_response(data: Any, tenant_info: Dict[str, Any]) -> Dict[str, Any]:
        """Create response with tenant context"""
        
        return {
            "data": data,
            "tenant_context": {
                "org_id": tenant_info.get("org_id"),
                "user_id": tenant_info.get("user_id"),
                "timestamp": datetime.utcnow().isoformat()
            },
            "metadata": {
                "request_id": f"req_{int(time.time())}",
                "api_version": "2.0.0"
            }
        }
    
    @staticmethod
    def create_error_response(error: str, code: int, tenant_info: Dict[str, Any]) -> Dict[str, Any]:
        """Create error response with tenant context"""
        
        return {
            "error": {
                "message": error,
                "code": code,
                "timestamp": datetime.utcnow().isoformat()
            },
            "tenant_context": {
                "org_id": tenant_info.get("org_id"),
                "user_id": tenant_info.get("user_id")
            }
        }

class DatabaseTenantIsolation:
    """Database isolation utilities for multi-tenancy"""
    
    @staticmethod
    def get_tenant_prefix(org_id: str) -> str:
        """Get database table/collection prefix for tenant"""
        return f"org_{org_id}_"
    
    @staticmethod
    def create_tenant_filter(org_id: str) -> Dict[str, Any]:
        """Create database filter for tenant isolation"""
        return {"org_id": org_id}
    
    @staticmethod
    def add_tenant_context(data: Dict[str, Any], org_id: str, user_id: str) -> Dict[str, Any]:
        """Add tenant context to data before storage"""
        
        data["org_id"] = org_id
        data["created_by"] = user_id
        data["created_at"] = datetime.utcnow().isoformat()
        
        return data

def setup_tenant_middleware(app, tenant_manager: MultiTenantManager):
    """Setup tenant middleware for FastAPI app"""
    
    tenant_middleware = TenantMiddleware(tenant_manager)
    app.state.tenant_middleware = tenant_middleware
    
    @app.middleware("http")
    async def tenant_isolation_middleware(request: Request, call_next):
        """Middleware for tenant isolation"""
        
        # Extract tenant info
        tenant_info = tenant_middleware.extract_tenant_info(request)
        request.state.tenant_info = tenant_info
        
        # Check rate limiting for API calls
        org_id = tenant_info.get("org_id")
        if org_id and not tenant_middleware.check_rate_limit(org_id, ResourceQuota.API_CALLS_PER_HOUR):
            raise HTTPException(
                status_code=429,
                detail="API rate limit exceeded. Please upgrade your plan or try again later."
            )
        
        # Process request
        response = await call_next(request)
        
        # Add tenant headers to response
        if org_id:
            response.headers["x-tenant-org"] = org_id
            response.headers["x-tenant-user"] = tenant_info.get("user_id", "")
        
        return response
    
    return tenant_middleware 