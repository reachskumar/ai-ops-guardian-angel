#!/usr/bin/env python3
"""
🔐 Simple Authentication Routes
Production-ready auth endpoints for immediate deployment
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

from simple_auth import auth_manager, get_current_user, get_current_admin_user, check_rate_limit, SimpleUser

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Request/Response Models
class LoginRequest(BaseModel):
    username_or_email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict
    expires_in: int

class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str
    confirm_password: str

class RegisterResponse(BaseModel):
    message: str
    user_id: str

class UserProfile(BaseModel):
    user_id: str
    email: str
    username: str
    roles: list
    org_id: str
    created_at: str

# Authentication Endpoints
@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, http_request: Request, _: bool = Depends(check_rate_limit)):
    """🔑 User Login - Production Ready"""
    
    # Get client IP for rate limiting
    client_ip = http_request.headers.get("X-Forwarded-For", 
                                        http_request.client.host if http_request.client else "unknown")
    
    # Authenticate user
    user = auth_manager.authenticate_user(
        username_or_email=request.username_or_email,
        password=request.password,
        ip_address=client_ip
    )
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create access token
    access_token = auth_manager.create_access_token(user)
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user={
            "user_id": user.user_id,
            "email": user.email,
            "username": user.username,
            "roles": user.roles,
            "org_id": user.org_id
        },
        expires_in=3600  # 1 hour
    )

@router.post("/register", response_model=RegisterResponse)
async def register(request: RegisterRequest, _: bool = Depends(check_rate_limit)):
    """📝 User Registration - Production Ready"""
    
    # Validate password confirmation
    if request.password != request.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    # Create user
    try:
        user = auth_manager.create_user(
            email=request.email,
            username=request.username,
            password=request.password
        )
        
        return RegisterResponse(
            message="User created successfully",
            user_id=user.user_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.get("/profile", response_model=UserProfile)
async def get_profile(current_user: SimpleUser = Depends(get_current_user)):
    """👤 Get User Profile - Authenticated"""
    
    return UserProfile(
        user_id=current_user.user_id,
        email=current_user.email,
        username=current_user.username,
        roles=current_user.roles,
        org_id=current_user.org_id,
        created_at=current_user.created_at.isoformat()
    )

@router.post("/logout")
async def logout(current_user: SimpleUser = Depends(get_current_user)):
    """🚪 User Logout"""
    
    # In a more complex system, you'd invalidate the token here
    # For simplicity, we'll just return success
    return {"message": "Successfully logged out"}

@router.get("/verify")
async def verify_token(current_user: SimpleUser = Depends(get_current_user)):
    """✅ Verify Token Validity"""
    
    return {
        "valid": True,
        "user_id": current_user.user_id,
        "roles": current_user.roles
    }

# Admin Endpoints
@router.get("/admin/users")
async def list_users(current_user: SimpleUser = Depends(get_current_admin_user)):
    """👥 List All Users (Admin Only)"""
    
    # Get unique users (since we store by multiple keys)
    unique_users = {}
    for user in auth_manager.users.values():
        if isinstance(user, SimpleUser):
            unique_users[user.user_id] = {
                "user_id": user.user_id,
                "email": user.email,
                "username": user.username,
                "roles": user.roles,
                "org_id": user.org_id,
                "created_at": user.created_at.isoformat(),
                "is_active": user.is_active
            }
    
    return {
        "users": list(unique_users.values()),
        "total": len(unique_users)
    }

@router.get("/admin/stats")
async def get_auth_stats(current_user: SimpleUser = Depends(get_current_admin_user)):
    """📊 Authentication Statistics (Admin Only)"""
    
    # Count unique users
    unique_users = set()
    for user in auth_manager.users.values():
        if isinstance(user, SimpleUser):
            unique_users.add(user.user_id)
    
    return {
        "total_users": len(unique_users),
        "active_sessions": len(auth_manager.sessions),
        "failed_attempts_tracked": len(auth_manager.failed_attempts),
        "timestamp": datetime.utcnow().isoformat()
    } 