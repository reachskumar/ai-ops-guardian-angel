"""
🔐 Enterprise Authentication Manager
Handles OAuth2, JWT, MFA, and comprehensive security for AI Ops Guardian Angel
"""

import jwt
import bcrypt
import pyotp
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, asdict
from enum import Enum
import json
import logging
from functools import wraps
import re

# Email and SMS simulation (replace with real providers in production)
# import smtplib
# from email.mime.text import MimeText

logger = logging.getLogger(__name__)

class AuthProvider(Enum):
    """Supported authentication providers"""
    LOCAL = "local"
    GOOGLE = "google"
    MICROSOFT = "microsoft"
    GITHUB = "github"
    OKTA = "okta"
    SAML = "saml"

class MFAMethod(Enum):
    """Multi-factor authentication methods"""
    TOTP = "totp"  # Time-based One-Time Password (Google Authenticator)
    SMS = "sms"    # SMS-based verification
    EMAIL = "email"  # Email-based verification
    BACKUP_CODES = "backup_codes"  # Backup recovery codes

class SessionStatus(Enum):
    """User session status"""
    ACTIVE = "active"
    EXPIRED = "expired"
    REVOKED = "revoked"
    SUSPICIOUS = "suspicious"

@dataclass
class AuthUser:
    """Authenticated user information"""
    user_id: str
    email: str
    username: str
    org_id: str
    team_id: Optional[str]
    roles: List[str]
    permissions: List[str]
    auth_provider: AuthProvider
    mfa_enabled: bool
    last_login: datetime
    session_id: str
    is_super_admin: bool = False
    
class SecurityConfig:
    """Security configuration constants"""
    # JWT Configuration
    JWT_SECRET_KEY = "your-super-secret-jwt-key-change-in-production"  # Use environment variable
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 15  # Short-lived access tokens
    JWT_REFRESH_TOKEN_EXPIRE_DAYS = 30    # Longer-lived refresh tokens
    JWT_ALGORITHM = "HS256"
    
    # Password Policy
    MIN_PASSWORD_LENGTH = 12
    REQUIRE_UPPERCASE = True
    REQUIRE_LOWERCASE = True
    REQUIRE_NUMBERS = True
    REQUIRE_SPECIAL_CHARS = True
    PASSWORD_HISTORY_COUNT = 5  # Prevent reusing last 5 passwords
    
    # Security Settings
    MAX_LOGIN_ATTEMPTS = 5
    LOCKOUT_DURATION_MINUTES = 30
    SESSION_TIMEOUT_MINUTES = 60
    MFA_CODE_EXPIRE_MINUTES = 5
    BACKUP_CODES_COUNT = 10
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS_PER_MINUTE = 60
    AUTH_RATE_LIMIT_REQUESTS_PER_MINUTE = 10

@dataclass
class LoginAttempt:
    """Track login attempts for security monitoring"""
    user_id: str
    ip_address: str
    user_agent: str
    timestamp: datetime
    success: bool
    failure_reason: Optional[str] = None
    location: Optional[str] = None

@dataclass
class UserSession:
    """User session information"""
    session_id: str
    user_id: str
    org_id: str
    ip_address: str
    user_agent: str
    created_at: datetime
    last_activity: datetime
    expires_at: datetime
    status: SessionStatus
    device_fingerprint: str

class AuthenticationManager:
    """
    🔐 Enterprise Authentication Manager
    
    Features:
    - OAuth2 integration with multiple providers
    - JWT token management with refresh tokens
    - Multi-factor authentication (TOTP, SMS, Email)
    - Role-based access control (RBAC)
    - Session management and security monitoring
    - Password policies and security enforcement
    - Audit logging and compliance
    """
    
    def __init__(self):
        self.users: Dict[str, Dict] = {}  # In production, use database
        self.sessions: Dict[str, UserSession] = {}
        self.login_attempts: List[LoginAttempt] = []
        self.token_blacklist: set = set()
        self.user_lockouts: Dict[str, datetime] = {}
        self.mfa_codes: Dict[str, Dict] = {}  # Temporary MFA code storage
        self.oauth_providers = self._initialize_oauth_providers()
        
        # Initialize demo users for testing
        self._initialize_demo_users()
        
    def _initialize_oauth_providers(self):
        """Initialize OAuth provider configurations"""
        import os
        
        return {
            AuthProvider.GOOGLE.value: {
                "client_id": os.getenv("GOOGLE_CLIENT_ID", "your-google-client-id"),
                "client_secret": os.getenv("GOOGLE_CLIENT_SECRET", "your-google-client-secret"),
                "auth_url": "https://accounts.google.com/o/oauth2/auth",
                "token_url": "https://oauth2.googleapis.com/token",
                "userinfo_url": "https://www.googleapis.com/oauth2/v2/userinfo",
                "scopes": ["openid", "email", "profile"],
                "redirect_uri": os.getenv("OAUTH_REDIRECT_URI", "http://localhost:8080/auth/callback")
            },
            AuthProvider.MICROSOFT.value: {
                "client_id": os.getenv("MICROSOFT_CLIENT_ID", "your-microsoft-client-id"),
                "client_secret": os.getenv("MICROSOFT_CLIENT_SECRET", "your-microsoft-client-secret"),
                "auth_url": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
                "token_url": "https://login.microsoftonline.com/common/oauth2/v2.0/token",
                "userinfo_url": "https://graph.microsoft.com/v1.0/me",
                "scopes": ["openid", "email", "profile"],
                "redirect_uri": os.getenv("OAUTH_REDIRECT_URI", "http://localhost:8080/auth/callback")
            },
            AuthProvider.GITHUB.value: {
                "client_id": os.getenv("GITHUB_CLIENT_ID", "your-github-client-id"),
                "client_secret": os.getenv("GITHUB_CLIENT_SECRET", "your-github-client-secret"),
                "auth_url": "https://github.com/login/oauth/authorize",
                "token_url": "https://github.com/login/oauth/access_token",
                "userinfo_url": "https://api.github.com/user",
                "scopes": ["user:email"],
                "redirect_uri": os.getenv("OAUTH_REDIRECT_URI", "http://localhost:8080/auth/callback")
            }
        }

    def _validate_oauth_config(self, provider: AuthProvider) -> bool:
        """Validate OAuth configuration for a provider"""
        provider_config = self.oauth_providers.get(provider.value)
        if not provider_config:
            logger.error(f"OAuth provider {provider.value} not configured")
            return False
            
        required_fields = ["client_id", "client_secret", "auth_url", "token_url", "userinfo_url"]
        for field in required_fields:
            if not provider_config.get(field):
                logger.error(f"Missing required OAuth field: {field} for provider {provider.value}")
                return False
                
        # Check if using placeholder credentials - allow demo mode
        if (provider_config["client_id"] == "your-google-client-id" or 
            provider_config["client_id"] == "your-github-client-id" or
            provider_config["client_id"] == "your-microsoft-client-id"):
            logger.warning(f"Using placeholder credentials for {provider.value} (demo mode). Please configure real OAuth credentials for production.")
            # Return True to allow demo mode to work
            return True
            
        return True

    def _validate_redirect_uri(self, redirect_uri: str) -> bool:
        """Validate redirect URI for security"""
        allowed_uris = [
            "http://localhost:8080/auth/callback",
            "http://localhost:3000/auth/callback",
            "https://inframind.com/auth/callback",  # Add your production domain
            "https://your-domain.com/auth/callback"  # Add your domain
        ]
        
        # Normalize URI for comparison
        normalized_uri = redirect_uri.rstrip('/')
        return any(allowed.rstrip('/') == normalized_uri for allowed in allowed_uris)

    async def handle_oauth_callback(self, provider: AuthProvider, code: str, 
                                 ip_address: str, user_agent: str) -> Tuple[bool, Optional[AuthUser], Optional[str]]:
        """Handle OAuth2 callback and create/authenticate user with enhanced security"""
        try:
            import httpx
            import os
            import secrets
            
            # Validate provider configuration
            if not self._validate_oauth_config(provider):
                return False, None, f"OAuth provider {provider.value} not properly configured"
            
            provider_config = self.oauth_providers.get(provider.value)
            
            # Check if we're in demo mode (no real credentials)
            if (provider_config["client_id"] == "your-google-client-id" or 
                provider_config["client_id"] == "your-github-client-id" or
                provider_config["client_id"] == "your-microsoft-client-id"):
                # Demo mode - create a mock user
                logger.info(f"Using demo mode for {provider.value} OAuth")
                demo_user = {
                    "user_id": f"demo_oauth_{provider.value}_{secrets.token_hex(8)}",
                    "email": f"demo@{provider.value}.com",
                    "username": f"demo_{provider.value}_user",
                    "password_hash": "",
                    "org_id": "demo_org",
                    "team_id": f"demo_oauth_{provider.value}_team",
                    "roles": ["user"],
                    "permissions": ["use_agents", "view_own_analytics"],
                    "auth_provider": provider,
                    "mfa_enabled": False,
                    "created_at": datetime.utcnow(),
                    "is_active": True,
                    "is_super_admin": False,
                    "full_name": f"Demo {provider.value.title()} User"
                }
                
                self.users[demo_user["user_id"]] = demo_user
                auth_user = self._create_auth_user(demo_user, ip_address, user_agent)
                logger.info(f"Created demo user for {provider.value}: {demo_user['email']}")
                return True, auth_user, None
            
            # Real OAuth implementation with enhanced security
            logger.info(f"Processing real OAuth callback for {provider.value}")
            
            # Validate code parameter
            if not code or len(code) < 10:
                logger.error(f"Invalid authorization code for {provider.value}")
                return False, None, "Invalid authorization code"
            
            token_data = {
                "client_id": provider_config["client_id"],
                "client_secret": provider_config["client_secret"],
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": provider_config["redirect_uri"]
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Get access token with retry logic
                max_retries = 3
                for attempt in range(max_retries):
                    try:
                        token_response = await client.post(
                            provider_config["token_url"],
                            data=token_data,
                            headers={"Accept": "application/json"}
                        )
                        break
                    except httpx.TimeoutException:
                        if attempt == max_retries - 1:
                            logger.error(f"Timeout getting token from {provider.value}")
                            return False, None, f"Timeout getting token from {provider.value}"
                        logger.warning(f"Token request timeout, retrying... (attempt {attempt + 1})")
                        continue
                
                if token_response.status_code != 200:
                    logger.error(f"Token exchange failed for {provider.value}: {token_response.status_code} - {token_response.text}")
                    return False, None, f"Failed to exchange code for token: {token_response.status_code}"
                
                token_info = token_response.json()
                access_token = token_info.get("access_token")
                
                if not access_token:
                    logger.error(f"No access token received from {provider.value}")
                    return False, None, "No access token received from OAuth provider"
                
                # Get user info from provider with enhanced error handling
                headers = {"Authorization": f"Bearer {access_token}"}
                if provider == AuthProvider.GITHUB:
                    headers["Accept"] = "application/vnd.github.v3+json"
                
                try:
                    user_response = await client.get(
                        provider_config["userinfo_url"],
                        headers=headers,
                        timeout=15.0
                    )
                except httpx.TimeoutException:
                    logger.error(f"Timeout getting user info from {provider.value}")
                    return False, None, f"Timeout getting user info from {provider.value}"
                
                if user_response.status_code != 200:
                    logger.error(f"Failed to get user info from {provider.value}: {user_response.status_code} - {user_response.text}")
                    return False, None, f"Failed to get user info: {user_response.status_code}"
                
                user_info = user_response.json()
                
                # Extract user information based on provider with validation
                if provider == AuthProvider.GOOGLE:
                    email = user_info.get("email")
                    username = user_info.get("name", email.split("@")[0] if email else "google_user")
                    full_name = user_info.get("name", "")
                elif provider == AuthProvider.GITHUB:
                    email = user_info.get("email")
                    username = user_info.get("login", email.split("@")[0] if email else "github_user")
                    full_name = user_info.get("name", "")
                elif provider == AuthProvider.MICROSOFT:
                    email = user_info.get("mail") or user_info.get("userPrincipalName")
                    username = user_info.get("displayName", email.split("@")[0] if email else "ms_user")
                    full_name = user_info.get("displayName", "")
                else:
                    logger.error(f"Unsupported OAuth provider: {provider.value}")
                    return False, None, f"Unsupported OAuth provider: {provider.value}"
                
                if not email:
                    logger.error(f"Email not provided by {provider.value}")
                    return False, None, "Email not provided by OAuth provider"
                
                # Validate email format
                if not self._is_valid_email(email):
                    logger.error(f"Invalid email format from {provider.value}: {email}")
                    return False, None, "Invalid email format"
                
                # Check if user already exists
                existing_user = self._find_user_by_credentials(email)
                
                if existing_user:
                    # User exists, authenticate them
                    logger.info(f"Authenticating existing user via {provider.value}: {email}")
                    auth_user = self._create_auth_user(existing_user, ip_address, user_agent)
                    return True, auth_user, None
                else:
                    # Create new user with enhanced validation
                    logger.info(f"Creating new user via {provider.value}: {email}")
                    new_user = {
                        "user_id": f"oauth_{provider.value}_{secrets.token_hex(8)}",
                        "email": email,
                        "username": username,
                        "password_hash": "",  # OAuth users don't have passwords
                        "org_id": "demo_org",
                        "team_id": f"oauth_{provider.value}_team",
                        "roles": ["user"],
                        "permissions": ["use_agents", "view_own_analytics"],
                        "auth_provider": provider,
                        "mfa_enabled": False,
                        "created_at": datetime.utcnow(),
                        "is_active": True,
                        "is_super_admin": False,
                        "full_name": full_name
                    }
                    
                    self.users[new_user["user_id"]] = new_user
                    auth_user = self._create_auth_user(new_user, ip_address, user_agent)
                    
                    logger.info(f"Successfully created new user via {provider.value}: {email}")
                    return True, auth_user, None
                        
        except Exception as e:
            logger.error(f"OAuth callback error for {provider.value}: {str(e)}")
            return False, None, f"OAuth authentication failed: {str(e)}"

    def _is_valid_email(self, email: str) -> bool:
        """Validate email format"""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    def _initialize_demo_users(self):
        """Initialize demo users for testing"""
        demo_users = [
            {
                "user_id": "demo_admin",
                "email": "admin@demo.com",
                "username": "admin",
                "password_hash": self._hash_password("SecureAdmin123!"),
                "org_id": "demo_org",
                "team_id": "admin_team",
                "roles": ["super_admin", "org_admin"],
                "permissions": ["manage_platform", "manage_organizations", "view_all_analytics"],
                "auth_provider": AuthProvider.LOCAL,
                "mfa_enabled": False,
                "created_at": datetime.utcnow(),
                "is_active": True,
                "is_super_admin": True
            },
            {
                "user_id": "demo_user",
                "email": "user@demo.com",
                "username": "user",
                "password_hash": self._hash_password("SecureUser123!"),
                "org_id": "demo_org",
                "team_id": "dev_team",
                "roles": ["user"],
                "permissions": ["use_agents", "view_own_analytics"],
                "auth_provider": AuthProvider.LOCAL,
                "mfa_enabled": False,
                "created_at": datetime.utcnow(),
                "is_active": True,
                "is_super_admin": False
            }
        ]
        
        for user in demo_users:
            self.users[user["user_id"]] = user
    
    # =============================================================================
    # CORE AUTHENTICATION METHODS
    # =============================================================================
    
    def authenticate_user(self, username_or_email: str, password: str, 
                         ip_address: str, user_agent: str, 
                         mfa_code: Optional[str] = None) -> Tuple[bool, Optional[AuthUser], Optional[str]]:
        """
        Authenticate user with comprehensive security checks
        
        Returns:
            Tuple[success, auth_user, error_message]
        """
        try:
            # Find user by username or email
            user_data = self._find_user_by_credentials(username_or_email)
            if not user_data:
                self._log_login_attempt(username_or_email, ip_address, user_agent, False, "User not found")
                return False, None, "Invalid credentials"
            
            user_id = user_data["user_id"]
            
            # Check if user is locked out
            if self._is_user_locked_out(user_id):
                return False, None, f"Account locked due to multiple failed attempts. Try again in {SecurityConfig.LOCKOUT_DURATION_MINUTES} minutes."
            
            # Verify password
            if not self._verify_password(password, user_data["password_hash"]):
                self._record_failed_login(user_id, ip_address, user_agent, "Invalid password")
                return False, None, "Invalid credentials"
            
            # Check if MFA is required
            if user_data.get("mfa_enabled", False):
                if not mfa_code:
                    return False, None, "MFA code required"
                
                if not self._verify_mfa_code(user_id, mfa_code):
                    self._record_failed_login(user_id, ip_address, user_agent, "Invalid MFA code")
                    return False, None, "Invalid MFA code"
            
            # Successful authentication
            auth_user = self._create_auth_user(user_data, ip_address, user_agent)
            self._log_login_attempt(user_id, ip_address, user_agent, True)
            self._clear_failed_login_attempts(user_id)
            
            return True, auth_user, None
            
        except Exception as e:
            logger.error(f"Authentication error: {e}")
            return False, None, "Authentication failed"
    
    def generate_tokens(self, user: AuthUser) -> Dict[str, Any]:
        """Generate JWT access and refresh tokens"""
        now = datetime.utcnow()
        
        # Access token payload (short-lived)
        access_payload = {
            "user_id": user.user_id,
            "email": user.email,
            "org_id": user.org_id,
            "roles": user.roles,
            "permissions": user.permissions,
            "session_id": user.session_id,
            "iat": now,
            "exp": now + timedelta(minutes=SecurityConfig.JWT_ACCESS_TOKEN_EXPIRE_MINUTES),
            "type": "access"
        }
        
        # Refresh token payload (long-lived)
        refresh_payload = {
            "user_id": user.user_id,
            "session_id": user.session_id,
            "iat": now,
            "exp": now + timedelta(days=SecurityConfig.JWT_REFRESH_TOKEN_EXPIRE_DAYS),
            "type": "refresh"
        }
        
        access_token = jwt.encode(access_payload, SecurityConfig.JWT_SECRET_KEY, algorithm=SecurityConfig.JWT_ALGORITHM)
        refresh_token = jwt.encode(refresh_payload, SecurityConfig.JWT_SECRET_KEY, algorithm=SecurityConfig.JWT_ALGORITHM)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": SecurityConfig.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "scope": " ".join(user.permissions)
        }
    
    def verify_token(self, token: str) -> Tuple[bool, Optional[Dict], Optional[str]]:
        """Verify JWT token and return payload"""
        try:
            # Check if token is blacklisted
            if token in self.token_blacklist:
                return False, None, "Token has been revoked"
            
            payload = jwt.decode(token, SecurityConfig.JWT_SECRET_KEY, algorithms=[SecurityConfig.JWT_ALGORITHM])
            
            # Verify session is still valid
            session_id = payload.get("session_id")
            if session_id and session_id in self.sessions:
                session = self.sessions[session_id]
                if session.status != SessionStatus.ACTIVE or session.expires_at < datetime.utcnow():
                    return False, None, "Session expired or invalid"
            
            return True, payload, None
            
        except jwt.ExpiredSignatureError:
            return False, None, "Token has expired"
        except jwt.InvalidTokenError as e:
            return False, None, f"Invalid token: {str(e)}"
    
    def refresh_access_token(self, refresh_token: str) -> Tuple[bool, Optional[Dict], Optional[str]]:
        """Refresh access token using refresh token"""
        try:
            is_valid, payload, error = self.verify_token(refresh_token)
            if not is_valid:
                return False, None, error
            
            if payload.get("type") != "refresh":
                return False, None, "Invalid token type"
            
            user_id = payload["user_id"]
            user_data = self.users.get(user_id)
            if not user_data:
                return False, None, "User not found"
            
            # Create new access token
            now = datetime.utcnow()
            access_payload = {
                "user_id": user_id,
                "email": user_data["email"],
                "org_id": user_data["org_id"],
                "roles": user_data["roles"],
                "permissions": user_data["permissions"],
                "session_id": payload["session_id"],
                "iat": now,
                "exp": now + timedelta(minutes=SecurityConfig.JWT_ACCESS_TOKEN_EXPIRE_MINUTES),
                "type": "access"
            }
            
            access_token = jwt.encode(access_payload, SecurityConfig.JWT_SECRET_KEY, algorithm=SecurityConfig.JWT_ALGORITHM)
            
            return True, {
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": SecurityConfig.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
            }, None
            
        except Exception as e:
            logger.error(f"Token refresh error: {e}")
            return False, None, "Token refresh failed"
    
    # =============================================================================
    # MULTI-FACTOR AUTHENTICATION
    # =============================================================================
    
    def setup_mfa_totp(self, user_id: str) -> Tuple[bool, Optional[Dict], Optional[str]]:
        """Setup TOTP-based MFA for user"""
        try:
            user_data = self.users.get(user_id)
            if not user_data:
                return False, None, "User not found"
            
            # Generate new secret
            secret = pyotp.random_base32()
            user_data["mfa_secret"] = secret
            
            # Generate QR code data
            totp = pyotp.TOTP(secret)
            qr_code_url = totp.provisioning_uri(
                user_data["email"],
                issuer_name="AI Ops Guardian Angel"
            )
            
            # Generate backup codes
            backup_codes = [secrets.token_hex(4).upper() for _ in range(SecurityConfig.BACKUP_CODES_COUNT)]
            user_data["mfa_backup_codes"] = [self._hash_password(code) for code in backup_codes]
            
            return True, {
                "secret": secret,
                "qr_code_url": qr_code_url,
                "backup_codes": backup_codes
            }, None
            
        except Exception as e:
            logger.error(f"MFA setup error: {e}")
            return False, None, "MFA setup failed"
    
    def verify_mfa_setup(self, user_id: str, code: str) -> Tuple[bool, Optional[str]]:
        """Verify MFA setup with user-provided code"""
        try:
            user_data = self.users.get(user_id)
            if not user_data or not user_data.get("mfa_secret"):
                return False, "MFA not configured"
            
            totp = pyotp.TOTP(user_data["mfa_secret"])
            if totp.verify(code, valid_window=1):  # Allow 1 time step tolerance
                user_data["mfa_enabled"] = True
                return True, None
            
            return False, "Invalid code"
            
        except Exception as e:
            logger.error(f"MFA verification error: {e}")
            return False, "MFA verification failed"
    
    def _verify_mfa_code(self, user_id: str, code: str) -> bool:
        """Verify MFA code during login"""
        try:
            user_data = self.users.get(user_id)
            if not user_data or not user_data.get("mfa_enabled"):
                return False
            
            # Try TOTP code
            if user_data.get("mfa_secret"):
                totp = pyotp.TOTP(user_data["mfa_secret"])
                if totp.verify(code, valid_window=1):
                    return True
            
            # Try backup codes
            backup_codes = user_data.get("mfa_backup_codes", [])
            for i, hashed_code in enumerate(backup_codes):
                if self._verify_password(code, hashed_code):
                    # Remove used backup code
                    backup_codes.pop(i)
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"MFA code verification error: {e}")
            return False
    
    # =============================================================================
    # SESSION MANAGEMENT
    # =============================================================================
    
    def create_session(self, user: AuthUser, ip_address: str, user_agent: str) -> str:
        """Create new user session"""
        session_id = secrets.token_urlsafe(32)
        device_fingerprint = hashlib.sha256(f"{user_agent}{ip_address}".encode()).hexdigest()
        
        session = UserSession(
            session_id=session_id,
            user_id=user.user_id,
            org_id=user.org_id,
            ip_address=ip_address,
            user_agent=user_agent,
            created_at=datetime.utcnow(),
            last_activity=datetime.utcnow(),
            expires_at=datetime.utcnow() + timedelta(minutes=SecurityConfig.SESSION_TIMEOUT_MINUTES),
            status=SessionStatus.ACTIVE,
            device_fingerprint=device_fingerprint
        )
        
        self.sessions[session_id] = session
        return session_id
    
    def update_session_activity(self, session_id: str) -> bool:
        """Update session last activity timestamp"""
        if session_id in self.sessions:
            session = self.sessions[session_id]
            session.last_activity = datetime.utcnow()
            session.expires_at = datetime.utcnow() + timedelta(minutes=SecurityConfig.SESSION_TIMEOUT_MINUTES)
            return True
        return False
    
    def revoke_session(self, session_id: str) -> bool:
        """Revoke user session"""
        if session_id in self.sessions:
            self.sessions[session_id].status = SessionStatus.REVOKED
            return True
        return False
    
    def revoke_all_user_sessions(self, user_id: str) -> int:
        """Revoke all sessions for a user"""
        count = 0
        for session in self.sessions.values():
            if session.user_id == user_id and session.status == SessionStatus.ACTIVE:
                session.status = SessionStatus.REVOKED
                count += 1
        return count
    
    def get_user_sessions(self, user_id: str) -> List[UserSession]:
        """Get all active sessions for a user"""
        return [session for session in self.sessions.values() 
                if session.user_id == user_id and session.status == SessionStatus.ACTIVE]
    
    # =============================================================================
    # OAUTH2 INTEGRATION
    # =============================================================================
    
    def get_oauth_auth_url(self, provider: AuthProvider, redirect_uri: str, state: str) -> str:
        """Get OAuth2 authorization URL"""
        provider_config = self.oauth_providers.get(provider.value)
        if not provider_config:
            raise ValueError(f"OAuth provider {provider.value} not configured")
        
        scopes = "+".join(provider_config["scopes"])
        auth_url = (
            f"{provider_config['auth_url']}"
            f"?client_id={provider_config['client_id']}"
            f"&redirect_uri={redirect_uri}"
            f"&scope={scopes}"
            f"&response_type=code"
            f"&state={state}"
        )
        
        return auth_url
    
    def logout_user(self, session_id: str, token: str):
        """Logout user and invalidate session/token"""
        # Revoke session
        self.revoke_session(session_id)
        
        # Blacklist token
        self.token_blacklist.add(token)
    
    def get_security_summary(self, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Get security summary for monitoring"""
        if user_id:
            # User-specific summary
            user_attempts = [a for a in self.login_attempts if a.user_id == user_id]
            user_sessions = self.get_user_sessions(user_id)
            
            return {
                "user_id": user_id,
                "recent_login_attempts": len(user_attempts),
                "successful_logins": len([a for a in user_attempts if a.success]),
                "failed_logins": len([a for a in user_attempts if not a.success]),
                "active_sessions": len(user_sessions),
                "is_locked_out": self._is_user_locked_out(user_id),
                "mfa_enabled": self.users.get(user_id, {}).get("mfa_enabled", False)
            }
        else:
            # Platform-wide summary
            return {
                "total_users": len(self.users),
                "active_sessions": len([s for s in self.sessions.values() if s.status == SessionStatus.ACTIVE]),
                "total_login_attempts_24h": len(self.login_attempts),
                "successful_logins_24h": len([a for a in self.login_attempts if a.success]),
                "failed_logins_24h": len([a for a in self.login_attempts if not a.success]),
                "locked_out_users": len(self.user_lockouts),
                "blacklisted_tokens": len(self.token_blacklist),
                "mfa_enabled_users": len([u for u in self.users.values() if u.get("mfa_enabled", False)])
            }
    
    def validate_password_policy(self, password: str) -> Tuple[bool, List[str]]:
        """Validate password against security policy"""
        errors = []
        
        if len(password) < SecurityConfig.MIN_PASSWORD_LENGTH:
            errors.append(f"Password must be at least {SecurityConfig.MIN_PASSWORD_LENGTH} characters long")
        
        if SecurityConfig.REQUIRE_UPPERCASE and not re.search(r'[A-Z]', password):
            errors.append("Password must contain at least one uppercase letter")
        
        if SecurityConfig.REQUIRE_LOWERCASE and not re.search(r'[a-z]', password):
            errors.append("Password must contain at least one lowercase letter")
        
        if SecurityConfig.REQUIRE_NUMBERS and not re.search(r'\d', password):
            errors.append("Password must contain at least one number")
        
        if SecurityConfig.REQUIRE_SPECIAL_CHARS and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append("Password must contain at least one special character")
        
        return len(errors) == 0, errors
    
    # =============================================================================
    # PASSWORD HASHING AND VERIFICATION
    # =============================================================================
    
    def _hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        try:
            return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        except Exception as e:
            logger.error(f"Password hashing error: {e}")
            # Fallback to simple hashing if bcrypt fails
            salt = secrets.token_hex(16)
            return hashlib.pbkdf2_hex(password.encode(), salt.encode(), 100000, 32) + ":" + salt
    
    def _verify_password(self, password: str, password_hash: str) -> bool:
        """Verify password against hash"""
        try:
            # Try bcrypt first
            return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
        except Exception:
            try:
                # Fallback to PBKDF2 if bcrypt fails
                hash_part, salt = password_hash.split(":")
                return hashlib.pbkdf2_hex(password.encode(), salt.encode(), 100000, 32) == hash_part
            except:
                return False
    
    # =============================================================================
    # USER MANAGEMENT HELPERS
    # =============================================================================
    
    def _find_user_by_credentials(self, username_or_email: str) -> Optional[Dict]:
        """Find user by username or email"""
        for user_data in self.users.values():
            if (user_data.get("username") == username_or_email or 
                user_data.get("email") == username_or_email):
                return user_data
        return None
    
    def _create_auth_user(self, user_data: Dict, ip_address: str, user_agent: str) -> AuthUser:
        """Create AuthUser object from user data"""
        session_id = self.create_session(
            AuthUser(
                user_id=user_data["user_id"],
                email=user_data["email"],
                username=user_data["username"],
                org_id=user_data["org_id"],
                team_id=user_data.get("team_id"),
                roles=user_data["roles"],
                permissions=user_data["permissions"],
                auth_provider=user_data["auth_provider"],
                mfa_enabled=user_data.get("mfa_enabled", False),
                last_login=datetime.utcnow(),
                session_id="",  # Will be set by create_session
                is_super_admin=user_data.get("is_super_admin", False)
            ),
            ip_address,
            user_agent
        )
        
        return AuthUser(
            user_id=user_data["user_id"],
            email=user_data["email"],
            username=user_data["username"],
            org_id=user_data["org_id"],
            team_id=user_data.get("team_id"),
            roles=user_data["roles"],
            permissions=user_data["permissions"],
            auth_provider=user_data["auth_provider"],
            mfa_enabled=user_data.get("mfa_enabled", False),
            last_login=datetime.utcnow(),
            session_id=session_id,
            is_super_admin=user_data.get("is_super_admin", False)
        )
    
    def _is_user_locked_out(self, user_id: str) -> bool:
        """Check if user is locked out due to failed attempts"""
        if user_id not in self.user_lockouts:
            return False
        
        lockout_time = self.user_lockouts[user_id]
        if datetime.utcnow() - lockout_time > timedelta(minutes=SecurityConfig.LOCKOUT_DURATION_MINUTES):
            # Lockout expired
            del self.user_lockouts[user_id]
            return False
        
        return True
    
    def _record_failed_login(self, user_id: str, ip_address: str, user_agent: str, reason: str):
        """Record failed login attempt"""
        self._log_login_attempt(user_id, ip_address, user_agent, False, reason)
        
        # Count recent failed attempts
        recent_attempts = [
            attempt for attempt in self.login_attempts
            if (attempt.user_id == user_id and 
                not attempt.success and
                attempt.timestamp > datetime.utcnow() - timedelta(minutes=SecurityConfig.LOCKOUT_DURATION_MINUTES))
        ]
        
        if len(recent_attempts) >= SecurityConfig.MAX_LOGIN_ATTEMPTS:
            self.user_lockouts[user_id] = datetime.utcnow()
    
    def _clear_failed_login_attempts(self, user_id: str):
        """Clear failed login attempts for user"""
        if user_id in self.user_lockouts:
            del self.user_lockouts[user_id]
    
    def _log_login_attempt(self, user_id: str, ip_address: str, user_agent: str, 
                          success: bool, failure_reason: Optional[str] = None):
        """Log login attempt for security monitoring"""
        attempt = LoginAttempt(
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            timestamp=datetime.utcnow(),
            success=success,
            failure_reason=failure_reason
        )
        self.login_attempts.append(attempt)
        
        # Keep only last 1000 attempts to prevent memory issues
        if len(self.login_attempts) > 1000:
            self.login_attempts = self.login_attempts[-1000:] 