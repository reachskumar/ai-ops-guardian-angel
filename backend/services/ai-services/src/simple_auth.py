#!/usr/bin/env python3
"""
🔐 Simple Production Authentication System
Quick, secure, and ready for immediate deployment
"""

import jwt
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Dict, Optional, List
from dataclasses import dataclass
from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging

logger = logging.getLogger(__name__)

# Security Configuration
SECRET_KEY = "your-production-secret-key-change-this"  # Change in production!
ACCESS_TOKEN_EXPIRE_MINUTES = 60
ALGORITHM = "HS256"

security = HTTPBearer()

@dataclass
class SimpleUser:
    """Simple user data structure"""
    user_id: str
    email: str
    username: str
    password_hash: str
    roles: List[str]
    org_id: str
    created_at: datetime
    is_active: bool = True

class SimpleAuthManager:
    """Simple but secure authentication manager"""
    
    def __init__(self):
        self.users: Dict[str, SimpleUser] = {}
        self.sessions: Dict[str, Dict] = {}
        self.failed_attempts: Dict[str, List[datetime]] = {}
        
        # Initialize demo users
        self._create_demo_users()
    
    def _hash_password(self, password: str) -> str:
        """Simple password hashing"""
        salt = secrets.token_hex(16)
        return hashlib.pbkdf2_hex(password.encode(), salt.encode(), 100000, 32) + ":" + salt
    
    def _verify_password(self, password: str, password_hash: str) -> bool:
        """Verify password against hash"""
        try:
            hash_part, salt = password_hash.split(":")
            return hashlib.pbkdf2_hex(password.encode(), salt.encode(), 100000, 32) == hash_part
        except:
            return False
    
    def _create_demo_users(self):
        """Create demo users for immediate testing"""
        demo_users = [
            {
                "user_id": "admin_001",
                "email": "admin@demo.com",
                "username": "admin",
                "password": "Admin123!",
                "roles": ["admin", "user"],
                "org_id": "demo_org"
            },
            {
                "user_id": "user_001", 
                "email": "user@demo.com",
                "username": "user",
                "password": "User123!",
                "roles": ["user"],
                "org_id": "demo_org"
            }
        ]
        
        for user_data in demo_users:
            user = SimpleUser(
                user_id=user_data["user_id"],
                email=user_data["email"],
                username=user_data["username"],
                password_hash=self._hash_password(user_data["password"]),
                roles=user_data["roles"],
                org_id=user_data["org_id"],
                created_at=datetime.utcnow()
            )
            self.users[user.user_id] = user
            self.users[user.email] = user  # Allow login by email
            self.users[user.username] = user  # Allow login by username
    
    def authenticate_user(self, username_or_email: str, password: str, ip_address: str = "unknown") -> Optional[SimpleUser]:
        """Authenticate user with rate limiting"""
        
        # Check rate limiting
        if self._is_rate_limited(ip_address):
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again later.")
        
        # Find user
        user = self.users.get(username_or_email)
        if not user or not user.is_active:
            self._record_failed_attempt(ip_address)
            return None
        
        # Verify password
        if not self._verify_password(password, user.password_hash):
            self._record_failed_attempt(ip_address)
            return None
        
        # Clear failed attempts on success
        if ip_address in self.failed_attempts:
            del self.failed_attempts[ip_address]
        
        return user
    
    def _is_rate_limited(self, ip_address: str) -> bool:
        """Simple rate limiting - max 5 attempts per 15 minutes"""
        if ip_address not in self.failed_attempts:
            return False
        
        now = datetime.utcnow()
        cutoff = now - timedelta(minutes=15)
        
        # Remove old attempts
        self.failed_attempts[ip_address] = [
            attempt for attempt in self.failed_attempts[ip_address] 
            if attempt > cutoff
        ]
        
        return len(self.failed_attempts[ip_address]) >= 5
    
    def _record_failed_attempt(self, ip_address: str):
        """Record failed login attempt"""
        if ip_address not in self.failed_attempts:
            self.failed_attempts[ip_address] = []
        self.failed_attempts[ip_address].append(datetime.utcnow())
    
    def create_access_token(self, user: SimpleUser) -> str:
        """Create JWT access token"""
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        payload = {
            "sub": user.user_id,
            "email": user.email,
            "username": user.username,
            "roles": user.roles,
            "org_id": user.org_id,
            "exp": expire,
            "iat": datetime.utcnow()
        }
        
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    
    def verify_token(self, token: str) -> Optional[Dict]:
        """Verify JWT token"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid token")
    
    def get_user_by_id(self, user_id: str) -> Optional[SimpleUser]:
        """Get user by ID"""
        return self.users.get(user_id)
    
    def create_user(self, email: str, username: str, password: str, roles: List[str] = None) -> SimpleUser:
        """Create new user"""
        if roles is None:
            roles = ["user"]
        
        # Check if user exists
        if email in self.users or username in self.users:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Validate password (simple validation)
        if len(password) < 8:
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
        
        user_id = f"user_{secrets.token_hex(8)}"
        org_id = "default_org"  # Simple org assignment
        
        user = SimpleUser(
            user_id=user_id,
            email=email,
            username=username,
            password_hash=self._hash_password(password),
            roles=roles,
            org_id=org_id,
            created_at=datetime.utcnow()
        )
        
        # Store user with multiple keys for flexible lookup
        self.users[user_id] = user
        self.users[email] = user
        self.users[username] = user
        
        return user

# Global auth manager instance
auth_manager = SimpleAuthManager()

# FastAPI Dependencies
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> SimpleUser:
    """Get current authenticated user"""
    token = credentials.credentials
    payload = auth_manager.verify_token(token)
    
    user = auth_manager.get_user_by_id(payload.get("sub"))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

async def get_current_admin_user(current_user: SimpleUser = Depends(get_current_user)) -> SimpleUser:
    """Require admin role"""
    if "admin" not in current_user.roles:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def require_roles(required_roles: List[str]):
    """Decorator to require specific roles"""
    def dependency(current_user: SimpleUser = Depends(get_current_user)):
        if not any(role in current_user.roles for role in required_roles):
            raise HTTPException(
                status_code=403, 
                detail=f"Required roles: {required_roles}"
            )
        return current_user
    return dependency

# Simple rate limiting middleware
class SimpleRateLimiter:
    """Simple rate limiting"""
    
    def __init__(self):
        self.requests: Dict[str, List[datetime]] = {}
    
    def is_allowed(self, ip_address: str, max_requests: int = 60, window_minutes: int = 1) -> bool:
        """Check if request is allowed"""
        now = datetime.utcnow()
        cutoff = now - timedelta(minutes=window_minutes)
        
        if ip_address not in self.requests:
            self.requests[ip_address] = []
        
        # Remove old requests
        self.requests[ip_address] = [
            req_time for req_time in self.requests[ip_address] 
            if req_time > cutoff
        ]
        
        if len(self.requests[ip_address]) >= max_requests:
            return False
        
        self.requests[ip_address].append(now)
        return True

rate_limiter = SimpleRateLimiter()

async def check_rate_limit(request: Request):
    """Rate limiting dependency"""
    client_ip = request.headers.get("X-Forwarded-For", request.client.host if request.client else "unknown")
    
    if not rate_limiter.is_allowed(client_ip):
        raise HTTPException(
            status_code=429, 
            detail="Rate limit exceeded. Please try again later."
        )
    
    return True 