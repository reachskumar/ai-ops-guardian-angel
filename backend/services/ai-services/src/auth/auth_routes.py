"""
🔐 Authentication Routes
FastAPI routes for login, registration, MFA, OAuth, and account management
"""

from fastapi import APIRouter, HTTPException, Depends, Request, Response
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
from datetime import datetime
import secrets
import qrcode
import io
import base64

from .authentication_manager import AuthenticationManager, AuthUser, AuthProvider, MFAMethod
from .auth_middleware import (
    get_current_user, get_current_active_user, require_permissions, 
    require_roles, require_super_admin, get_auth_manager
)

router = APIRouter(prefix="/auth", tags=["Authentication"])
auth_manager = get_auth_manager()

# =============================================================================
# PYDANTIC MODELS
# =============================================================================

class LoginRequest(BaseModel):
    username_or_email: str
    password: str
    mfa_code: Optional[str] = None
    remember_me: bool = False

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int
    user: Dict[str, Any]
    requires_mfa: bool = False

class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str
    confirm_password: str
    full_name: Optional[str] = None
    organization_name: Optional[str] = None
    invite_code: Optional[str] = None

class RegisterResponse(BaseModel):
    user_id: str
    message: str
    requires_email_verification: bool = True

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class MFASetupResponse(BaseModel):
    secret: str
    qr_code: str
    backup_codes: List[str]
    setup_url: str

class MFAVerifyRequest(BaseModel):
    code: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    confirm_password: str

class OAuthCallbackRequest(BaseModel):
    code: str
    state: str
    provider: str

# =============================================================================
# AUTHENTICATION ENDPOINTS
# =============================================================================

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, http_request: Request):
    """
    🔑 User Login with comprehensive security
    
    Features:
    - Username/email login
    - Multi-factor authentication
    - Rate limiting protection
    - Session management
    - Audit logging
    """
    try:
        # Extract client information
        client_ip = http_request.headers.get("X-Forwarded-For", 
                                           http_request.client.host if http_request.client else "unknown")
        user_agent = http_request.headers.get("User-Agent", "unknown")
        
        # Authenticate user
        is_authenticated, auth_user, error_message = auth_manager.authenticate_user(
            username_or_email=request.username_or_email,
            password=request.password,
            ip_address=client_ip,
            user_agent=user_agent,
            mfa_code=request.mfa_code
        )
        
        if not is_authenticated:
            # Handle MFA requirement
            if error_message == "MFA code required":
                return LoginResponse(
                    access_token="",
                    refresh_token="",
                    token_type="bearer",
                    expires_in=0,
                    user={},
                    requires_mfa=True
                )
            
            raise HTTPException(status_code=401, detail=error_message)
        
        # Generate tokens
        tokens = auth_manager.generate_tokens(auth_user)
        
        # Prepare user info for response
        user_info = {
            "user_id": auth_user.user_id,
            "email": auth_user.email,
            "username": auth_user.username,
            "org_id": auth_user.org_id,
            "roles": auth_user.roles,
            "permissions": auth_user.permissions,
            "mfa_enabled": auth_user.mfa_enabled,
            "last_login": auth_user.last_login.isoformat()
        }
        
        return LoginResponse(
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            token_type=tokens["token_type"],
            expires_in=tokens["expires_in"],
            user=user_info,
            requires_mfa=False
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@router.post("/refresh", response_model=Dict[str, Any])
async def refresh_token(request: RefreshTokenRequest):
    """
    🔄 Refresh Access Token
    
    Exchange refresh token for new access token
    """
    try:
        is_valid, tokens, error = auth_manager.refresh_access_token(request.refresh_token)
        
        if not is_valid:
            raise HTTPException(status_code=401, detail=error)
        
        return tokens
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Token refresh failed: {str(e)}")

@router.post("/logout")
async def logout(current_user: AuthUser = Depends(get_current_user), 
                credentials: HTTPAuthorizationCredentials = Depends()):
    """
    🚪 User Logout
    
    Invalidate session and tokens
    """
    try:
        token = credentials.credentials
        auth_manager.logout_user(current_user.session_id, token)
        
        return {"message": "Successfully logged out"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Logout failed: {str(e)}")

@router.post("/logout-all")
async def logout_all_sessions(current_user: AuthUser = Depends(get_current_user)):
    """
    🚪 Logout All Sessions
    
    Revoke all user sessions across all devices
    """
    try:
        revoked_count = auth_manager.revoke_all_user_sessions(current_user.user_id)
        
        return {
            "message": f"Successfully logged out from {revoked_count} sessions",
            "revoked_sessions": revoked_count
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Logout all failed: {str(e)}")

# =============================================================================
# REGISTRATION & ACCOUNT MANAGEMENT
# =============================================================================

@router.post("/register", response_model=RegisterResponse)
async def register(request: RegisterRequest, http_request: Request):
    """
    📝 User Registration
    
    Create new user account with security validation
    """
    try:
        # Validate password confirmation
        if request.password != request.confirm_password:
            raise HTTPException(status_code=400, detail="Passwords do not match")
        
        # Validate password policy
        is_valid_password, password_errors = auth_manager.validate_password_policy(request.password)
        if not is_valid_password:
            raise HTTPException(status_code=400, detail=f"Password policy violation: {', '.join(password_errors)}")
        
        # Check if user already exists
        existing_user = auth_manager._find_user_by_credentials(request.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="User with this email already exists")
        
        existing_user = auth_manager._find_user_by_credentials(request.username)
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already taken")
        
        # Create new user
        user_id = f"user_{secrets.token_hex(8)}"
        org_id = f"org_{secrets.token_hex(8)}"  # Create new organization for user
        
        new_user = {
            "user_id": user_id,
            "email": request.email,
            "username": request.username,
            "password_hash": auth_manager._hash_password(request.password),
            "org_id": org_id,
            "team_id": None,
            "roles": ["user"],
            "permissions": ["use_agents", "view_own_analytics"],
            "auth_provider": AuthProvider.LOCAL,
            "mfa_enabled": False,
            "created_at": datetime.utcnow(),
            "is_active": True,
            "is_super_admin": False,
            "email_verified": False,
            "full_name": request.full_name
        }
        
        auth_manager.users[user_id] = new_user
        
        return RegisterResponse(
            user_id=user_id,
            message="Account created successfully. Please verify your email address.",
            requires_email_verification=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/change-password")
async def change_password(request: ChangePasswordRequest, current_user: AuthUser = Depends(get_current_user)):
    """
    🔒 Change Password
    
    Update user password with security validation
    """
    try:
        user_data = auth_manager.users.get(current_user.user_id)
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Verify current password
        if not auth_manager._verify_password(request.current_password, user_data["password_hash"]):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        
        # Validate new password confirmation
        if request.new_password != request.confirm_password:
            raise HTTPException(status_code=400, detail="New passwords do not match")
        
        # Validate new password policy
        is_valid_password, password_errors = auth_manager.validate_password_policy(request.new_password)
        if not is_valid_password:
            raise HTTPException(status_code=400, detail=f"Password policy violation: {', '.join(password_errors)}")
        
        # Update password
        user_data["password_hash"] = auth_manager._hash_password(request.new_password)
        user_data["password_changed_at"] = datetime.utcnow()
        
        # Revoke all other sessions for security
        auth_manager.revoke_all_user_sessions(current_user.user_id)
        
        return {"message": "Password changed successfully. Please log in again."}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Password change failed: {str(e)}")

# =============================================================================
# MULTI-FACTOR AUTHENTICATION
# =============================================================================

@router.post("/mfa/setup", response_model=MFASetupResponse)
async def setup_mfa(current_user: AuthUser = Depends(get_current_user)):
    """
    🛡️ Setup Multi-Factor Authentication
    
    Generate TOTP secret and backup codes
    """
    try:
        is_success, mfa_data, error = auth_manager.setup_mfa_totp(current_user.user_id)
        
        if not is_success:
            raise HTTPException(status_code=400, detail=error)
        
        # Generate QR code for easy setup
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(mfa_data["qr_code_url"])
        qr.make(fit=True)
        
        qr_image = qr.make_image(fill_color="black", back_color="white")
        qr_buffer = io.BytesIO()
        qr_image.save(qr_buffer, format='PNG')
        qr_base64 = base64.b64encode(qr_buffer.getvalue()).decode()
        
        return MFASetupResponse(
            secret=mfa_data["secret"],
            qr_code=f"data:image/png;base64,{qr_base64}",
            backup_codes=mfa_data["backup_codes"],
            setup_url=mfa_data["qr_code_url"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MFA setup failed: {str(e)}")

@router.post("/mfa/verify")
async def verify_mfa_setup(request: MFAVerifyRequest, current_user: AuthUser = Depends(get_current_user)):
    """
    ✅ Verify MFA Setup
    
    Confirm TOTP setup with verification code
    """
    try:
        is_valid, error = auth_manager.verify_mfa_setup(current_user.user_id, request.code)
        
        if not is_valid:
            raise HTTPException(status_code=400, detail=error)
        
        return {
            "message": "Multi-factor authentication enabled successfully",
            "mfa_enabled": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MFA verification failed: {str(e)}")

@router.post("/mfa/disable")
async def disable_mfa(request: ChangePasswordRequest, current_user: AuthUser = Depends(get_current_user)):
    """
    🔓 Disable Multi-Factor Authentication
    
    Disable MFA after password confirmation
    """
    try:
        user_data = auth_manager.users.get(current_user.user_id)
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Verify password for security
        if not auth_manager._verify_password(request.current_password, user_data["password_hash"]):
            raise HTTPException(status_code=400, detail="Password verification required")
        
        # Disable MFA
        user_data["mfa_enabled"] = False
        user_data["mfa_secret"] = None
        user_data["mfa_backup_codes"] = []
        
        return {"message": "Multi-factor authentication disabled"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MFA disable failed: {str(e)}")

# =============================================================================
# OAUTH2 INTEGRATION
# =============================================================================

@router.get("/oauth/{provider}")
async def oauth_login(provider: str, redirect_uri: str, request: Request):
    """
    🔗 OAuth2 Login Initiation
    
    Redirect to OAuth provider for authentication
    """
    try:
        # Validate provider
        try:
            auth_provider = AuthProvider(provider.lower())
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Unsupported OAuth provider: {provider}")
        
        # Generate state for CSRF protection
        state = secrets.token_urlsafe(32)
        
        # Store state in session (in production, use Redis or database)
        # request.session["oauth_state"] = state
        
        # Get authorization URL
        auth_url = auth_manager.get_oauth_auth_url(auth_provider, redirect_uri, state)
        
        return {
            "authorization_url": auth_url,
            "state": state,
            "provider": provider
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OAuth initiation failed: {str(e)}")

@router.post("/oauth/callback")
async def oauth_callback(request: OAuthCallbackRequest, http_request: Request):
    """
    🔄 OAuth2 Callback Handler
    
    Handle OAuth provider callback and authenticate user
    """
    try:
        # Validate state (CSRF protection)
        # stored_state = http_request.session.get("oauth_state")
        # if not stored_state or stored_state != request.state:
        #     raise HTTPException(status_code=400, detail="Invalid OAuth state")
        
        # Validate provider
        try:
            auth_provider = AuthProvider(request.provider.lower())
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Unsupported OAuth provider: {request.provider}")
        
        # Extract client information
        client_ip = http_request.headers.get("X-Forwarded-For", 
                                           http_request.client.host if http_request.client else "unknown")
        user_agent = http_request.headers.get("User-Agent", "unknown")
        
        # Handle OAuth callback
        is_authenticated, auth_user, error_message = await auth_manager.handle_oauth_callback(
            provider=auth_provider,
            code=request.code,
            ip_address=client_ip,
            user_agent=user_agent
        )
        
        if not is_authenticated:
            raise HTTPException(status_code=401, detail=error_message)
        
        # Generate tokens
        tokens = auth_manager.generate_tokens(auth_user)
        
        # Prepare user info
        user_info = {
            "user_id": auth_user.user_id,
            "email": auth_user.email,
            "username": auth_user.username,
            "org_id": auth_user.org_id,
            "roles": auth_user.roles,
            "permissions": auth_user.permissions,
            "auth_provider": auth_user.auth_provider.value
        }
        
        return {
            "access_token": tokens["access_token"],
            "refresh_token": tokens["refresh_token"],
            "token_type": tokens["token_type"],
            "expires_in": tokens["expires_in"],
            "user": user_info
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OAuth callback failed: {str(e)}")

# =============================================================================
# PASSWORD RECOVERY
# =============================================================================

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """
    📧 Forgot Password
    
    Send password reset email
    """
    try:
        # Find user by email
        user_data = auth_manager._find_user_by_credentials(request.email)
        if not user_data:
            # Don't reveal if email exists (security best practice)
            return {"message": "If the email exists, a reset link has been sent"}
        
        # Generate reset token
        reset_token = secrets.token_urlsafe(32)
        
        # Store reset token (in production, use database with expiration)
        # In this demo, we'll just log it
        print(f"Password reset token for {request.email}: {reset_token}")
        
        # In production, send email with reset link
        # send_password_reset_email(request.email, reset_token)
        
        return {"message": "If the email exists, a reset link has been sent"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Password reset failed: {str(e)}")

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """
    🔄 Reset Password
    
    Reset password using reset token
    """
    try:
        # In production, validate reset token from database
        # For demo, we'll accept any token that looks valid
        if len(request.token) < 20:
            raise HTTPException(status_code=400, detail="Invalid reset token")
        
        # Validate new password confirmation
        if request.new_password != request.confirm_password:
            raise HTTPException(status_code=400, detail="Passwords do not match")
        
        # Validate password policy
        is_valid_password, password_errors = auth_manager.validate_password_policy(request.new_password)
        if not is_valid_password:
            raise HTTPException(status_code=400, detail=f"Password policy violation: {', '.join(password_errors)}")
        
        # In production, find user by reset token and update password
        # For demo, we'll return success
        
        return {"message": "Password reset successfully. Please log in with your new password."}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Password reset failed: {str(e)}")

# =============================================================================
# USER PROFILE & SECURITY
# =============================================================================

@router.get("/profile")
async def get_profile(current_user: AuthUser = Depends(get_current_user)):
    """
    👤 Get User Profile
    
    Retrieve current user profile information
    """
    try:
        user_data = auth_manager.users.get(current_user.user_id)
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get security summary
        security_summary = auth_manager.get_security_summary(current_user.user_id)
        
        # Get active sessions
        active_sessions = auth_manager.get_user_sessions(current_user.user_id)
        
        profile = {
            "user_id": current_user.user_id,
            "email": current_user.email,
            "username": current_user.username,
            "full_name": user_data.get("full_name"),
            "org_id": current_user.org_id,
            "team_id": current_user.team_id,
            "roles": current_user.roles,
            "permissions": current_user.permissions,
            "auth_provider": current_user.auth_provider.value,
            "mfa_enabled": current_user.mfa_enabled,
            "created_at": user_data["created_at"].isoformat(),
            "last_login": current_user.last_login.isoformat(),
            "security_summary": security_summary,
            "active_sessions": len(active_sessions)
        }
        
        return profile
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Profile retrieval failed: {str(e)}")

@router.get("/sessions")
async def get_sessions(current_user: AuthUser = Depends(get_current_user)):
    """
    📱 Get Active Sessions
    
    List all active user sessions
    """
    try:
        sessions = auth_manager.get_user_sessions(current_user.user_id)
        
        session_list = []
        for session in sessions:
            session_list.append({
                "session_id": session.session_id,
                "ip_address": session.ip_address,
                "user_agent": session.user_agent,
                "created_at": session.created_at.isoformat(),
                "last_activity": session.last_activity.isoformat(),
                "is_current": session.session_id == current_user.session_id
            })
        
        return {
            "sessions": session_list,
            "total_sessions": len(session_list)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Session retrieval failed: {str(e)}")

@router.delete("/sessions/{session_id}")
async def revoke_session(session_id: str, current_user: AuthUser = Depends(get_current_user)):
    """
    🚫 Revoke Session
    
    Revoke a specific user session
    """
    try:
        # Verify session belongs to current user
        user_sessions = auth_manager.get_user_sessions(current_user.user_id)
        target_session = next((s for s in user_sessions if s.session_id == session_id), None)
        
        if not target_session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Revoke session
        success = auth_manager.revoke_session(session_id)
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to revoke session")
        
        return {"message": "Session revoked successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Session revocation failed: {str(e)}")

# =============================================================================
# ADMIN ENDPOINTS
# =============================================================================

@router.get("/admin/security-summary")
@require_super_admin
async def get_security_summary(current_user: AuthUser = Depends(get_current_user)):
    """
    🛡️ Security Summary (Admin Only)
    
    Get platform-wide security metrics
    """
    try:
        summary = auth_manager.get_security_summary()
        return summary
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Security summary failed: {str(e)}")

@router.get("/admin/users")
@require_permissions(["manage_users"])
async def list_users(current_user: AuthUser = Depends(get_current_user)):
    """
    👥 List Users (Admin Only)
    
    Get list of all users
    """
    try:
        users = []
        for user_data in auth_manager.users.values():
            users.append({
                "user_id": user_data["user_id"],
                "email": user_data["email"],
                "username": user_data["username"],
                "org_id": user_data["org_id"],
                "roles": user_data["roles"],
                "mfa_enabled": user_data.get("mfa_enabled", False),
                "created_at": user_data["created_at"].isoformat(),
                "is_active": user_data.get("is_active", True)
            })
        
        return {
            "users": users,
            "total_users": len(users)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"User listing failed: {str(e)}") 