"""
Shared security middleware for all backend services
"""

import time
import logging
from typing import Callable, Dict, Any
from fastapi import Request, Response, HTTPException, status
from fastapi.middleware.base import BaseHTTPMiddleware
from starlette.middleware.base import RequestResponseEndpoint
import jwt
from datetime import datetime, timedelta

from ..config.settings import settings


logger = logging.getLogger(__name__)


class SecurityMiddleware(BaseHTTPMiddleware):
    """Security middleware for request validation and rate limiting"""
    
    def __init__(self, app, rate_limit_requests: int = None, rate_limit_window: int = None):
        super().__init__(app)
        self.rate_limit_requests = rate_limit_requests or settings.RATE_LIMIT_REQUESTS
        self.rate_limit_window = rate_limit_window or settings.RATE_LIMIT_WINDOW
        self.request_counts: Dict[str, list] = {}
    
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        """Process request through security middleware"""
        
        # Get client IP
        client_ip = self._get_client_ip(request)
        
        # Rate limiting
        if not self._check_rate_limit(client_ip):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded"
            )
        
        # Request logging
        start_time = time.time()
        logger.info(f"Request: {request.method} {request.url.path} from {client_ip}")
        
        # Process request
        response = await call_next(request)
        
        # Response logging
        process_time = time.time() - start_time
        logger.info(f"Response: {response.status_code} in {process_time:.3f}s")
        
        # Add security headers
        response.headers["X-Process-Time"] = str(process_time)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        return response
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request"""
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        return request.client.host if request.client else "unknown"
    
    def _check_rate_limit(self, client_ip: str) -> bool:
        """Check if client has exceeded rate limit"""
        now = time.time()
        
        # Clean old requests
        if client_ip in self.request_counts:
            self.request_counts[client_ip] = [
                req_time for req_time in self.request_counts[client_ip]
                if now - req_time < self.rate_limit_window
            ]
        else:
            self.request_counts[client_ip] = []
        
        # Check if limit exceeded
        if len(self.request_counts[client_ip]) >= self.rate_limit_requests:
            return False
        
        # Add current request
        self.request_counts[client_ip].append(now)
        return True


class JWTMiddleware(BaseHTTPMiddleware):
    """JWT authentication middleware"""
    
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        """Process request through JWT middleware"""
        
        # Skip authentication for health checks and public endpoints
        if self._is_public_endpoint(request.url.path):
            return await call_next(request)
        
        # Extract token from header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing or invalid authorization header"
            )
        
        token = auth_header.split(" ")[1]
        
        try:
            # Verify token
            payload = jwt.decode(
                token,
                settings.JWT_SECRET,
                algorithms=[settings.JWT_ALGORITHM]
            )
            
            # Add user info to request state
            request.state.user = payload
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.InvalidTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        return await call_next(request)
    
    def _is_public_endpoint(self, path: str) -> bool:
        """Check if endpoint is public (no auth required)"""
        public_paths = [
            "/health",
            "/docs",
            "/openapi.json",
            "/metrics",
            "/api/auth/login",
            "/api/auth/register"
        ]
        return any(path.startswith(public_path) for public_path in public_paths)


class RequestValidationMiddleware(BaseHTTPMiddleware):
    """Request validation and sanitization middleware"""
    
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        """Process request through validation middleware"""
        
        # Validate request size
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Request too large"
            )
        
        # Validate content type for POST/PUT requests
        if request.method in ["POST", "PUT", "PATCH"]:
            content_type = request.headers.get("content-type", "")
            if not content_type.startswith("application/json"):
                raise HTTPException(
                    status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                    detail="Unsupported media type"
                )
        
        return await call_next(request)


def create_security_middleware(app, enable_jwt: bool = True, enable_rate_limit: bool = True):
    """Create and configure security middleware"""
    
    if enable_rate_limit:
        app.add_middleware(SecurityMiddleware)
    
    if enable_jwt:
        app.add_middleware(JWTMiddleware)
    
    app.add_middleware(RequestValidationMiddleware)
    
    return app


def generate_jwt_token(user_id: str, user_roles: list = None, expires_delta: timedelta = None) -> str:
    """Generate JWT token for user"""
    
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.JWT_EXPIRATION)
    
    expire = datetime.utcnow() + expires_delta
    
    payload = {
        "sub": user_id,
        "roles": user_roles or [],
        "exp": expire,
        "iat": datetime.utcnow()
    }
    
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def verify_jwt_token(token: str) -> Dict[str, Any]:
    """Verify and decode JWT token"""
    
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        ) 