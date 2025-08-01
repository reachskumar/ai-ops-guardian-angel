"""
Shared configuration settings for all backend services
"""

import os
from typing import Optional, Dict, Any
from pydantic import BaseSettings, Field
from enum import Enum


class Environment(str, Enum):
    """Environment types"""
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"


class AgentType(str, Enum):
    """AI Agent types"""
    COST_OPTIMIZATION = "cost_optimization"
    SECURITY_ANALYSIS = "security_analysis"
    INFRASTRUCTURE = "infrastructure"
    DEVOPS = "devops"
    COMPLIANCE = "compliance"
    MONITORING = "monitoring"
    DEPLOYMENT = "deployment"
    TROUBLESHOOTING = "troubleshooting"


class RiskLevel(str, Enum):
    """Risk levels for operations"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Settings(BaseSettings):
    """Global application settings"""
    
    # Environment
    ENVIRONMENT: Environment = Field(default=Environment.DEVELOPMENT, env="ENVIRONMENT")
    DEBUG: bool = Field(default=True, env="DEBUG")
    
    # Service Configuration
    SERVICE_NAME: str = Field(default="inframind-service", env="SERVICE_NAME")
    SERVICE_VERSION: str = Field(default="2.0.0", env="SERVICE_VERSION")
    
    # API Configuration
    API_PREFIX: str = Field(default="/api", env="API_PREFIX")
    CORS_ORIGINS: list = Field(default=["http://localhost:3000"], env="CORS_ORIGINS")
    
    # Database Configuration - MongoDB Atlas
    MONGODB_URI: str = Field(
        default="mongodb://localhost:27017/ai_ops_platform",
        env="MONGODB_URI"
    )
    REDIS_URL: str = Field(default="redis://localhost:6379", env="REDIS_URL")
    
    # AI/ML Configuration
    OPENAI_API_KEY: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    ANTHROPIC_API_KEY: Optional[str] = Field(default=None, env="ANTHROPIC_API_KEY")
    AI_MODEL_NAME: str = Field(default="gpt-4", env="AI_MODEL_NAME")
    AI_MAX_TOKENS: int = Field(default=4000, env="AI_MAX_TOKENS")
    AI_TEMPERATURE: float = Field(default=0.7, env="AI_TEMPERATURE")
    
    # Security Configuration
    JWT_SECRET: str = Field(default="your-secret-key-change-in-production", env="JWT_SECRET")
    JWT_ALGORITHM: str = Field(default="HS256", env="JWT_ALGORITHM")
    JWT_EXPIRATION: int = Field(default=3600, env="JWT_EXPIRATION")
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = Field(default=1000, env="RATE_LIMIT_REQUESTS")
    RATE_LIMIT_WINDOW: int = Field(default=900, env="RATE_LIMIT_WINDOW")  # 15 minutes
    
    # Monitoring Configuration
    ENABLE_METRICS: bool = Field(default=True, env="ENABLE_METRICS")
    METRICS_PORT: int = Field(default=9090, env="METRICS_PORT")
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    
    # Cloud Provider Configuration
    AWS_ACCESS_KEY_ID: Optional[str] = Field(default=None, env="AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: Optional[str] = Field(default=None, env="AWS_SECRET_ACCESS_KEY")
    AWS_REGION: str = Field(default="us-east-1", env="AWS_REGION")
    
    AZURE_CLIENT_ID: Optional[str] = Field(default=None, env="AZURE_CLIENT_ID")
    AZURE_CLIENT_SECRET: Optional[str] = Field(default=None, env="AZURE_CLIENT_SECRET")
    AZURE_TENANT_ID: Optional[str] = Field(default=None, env="AZURE_TENANT_ID")
    
    GCP_PROJECT_ID: Optional[str] = Field(default=None, env="GCP_PROJECT_ID")
    GCP_SERVICE_ACCOUNT_KEY: Optional[str] = Field(default=None, env="GCP_SERVICE_ACCOUNT_KEY")
    
    # Feature Flags
    ENABLE_AI_FEATURES: bool = Field(default=True, env="ENABLE_AI_FEATURES")
    ENABLE_SECURITY_SCANNING: bool = Field(default=True, env="ENABLE_SECURITY_SCANNING")
    ENABLE_COST_OPTIMIZATION: bool = Field(default=True, env="ENABLE_COST_OPTIMIZATION")
    ENABLE_AUTOMATED_DEPLOYMENTS: bool = Field(default=False, env="ENABLE_AUTOMATED_DEPLOYMENTS")
    
    # Performance Configuration
    MAX_CONCURRENT_REQUESTS: int = Field(default=100, env="MAX_CONCURRENT_REQUESTS")
    REQUEST_TIMEOUT: int = Field(default=30, env="REQUEST_TIMEOUT")
    CACHE_TTL: int = Field(default=300, env="CACHE_TTL")  # 5 minutes
    
    # Human-in-the-Loop Configuration
    ENABLE_HUMAN_APPROVAL: bool = Field(default=True, env="ENABLE_HUMAN_APPROVAL")
    APPROVAL_THRESHOLD: RiskLevel = Field(default=RiskLevel.HIGH, env="APPROVAL_THRESHOLD")
    AUTO_APPROVE_LOW_RISK: bool = Field(default=True, env="AUTO_APPROVE_LOW_RISK")
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()


def get_service_config(service_name: str) -> Dict[str, Any]:
    """Get service-specific configuration"""
    base_config = {
        "service_name": service_name,
        "version": settings.SERVICE_VERSION,
        "environment": settings.ENVIRONMENT,
        "debug": settings.DEBUG,
        "mongodb_uri": settings.MONGODB_URI,
        "redis_url": settings.REDIS_URL,
        "cors_origins": settings.CORS_ORIGINS,
        "rate_limit_requests": settings.RATE_LIMIT_REQUESTS,
        "rate_limit_window": settings.RATE_LIMIT_WINDOW,
        "log_level": settings.LOG_LEVEL,
    }
    
    # Add service-specific configurations
    if service_name == "ai-services":
        base_config.update({
            "openai_api_key": settings.OPENAI_API_KEY,
            "anthropic_api_key": settings.ANTHROPIC_API_KEY,
            "ai_model_name": settings.AI_MODEL_NAME,
            "ai_max_tokens": settings.AI_MAX_TOKENS,
            "ai_temperature": settings.AI_TEMPERATURE,
            "enable_ai_features": settings.ENABLE_AI_FEATURES,
        })
    
    elif service_name == "cloud-integrations":
        base_config.update({
            "aws_access_key_id": settings.AWS_ACCESS_KEY_ID,
            "aws_secret_access_key": settings.AWS_SECRET_ACCESS_KEY,
            "aws_region": settings.AWS_REGION,
            "azure_client_id": settings.AZURE_CLIENT_ID,
            "azure_client_secret": settings.AZURE_CLIENT_SECRET,
            "azure_tenant_id": settings.AZURE_TENANT_ID,
            "gcp_project_id": settings.GCP_PROJECT_ID,
            "gcp_service_account_key": settings.GCP_SERVICE_ACCOUNT_KEY,
        })
    
    elif service_name == "security-services":
        base_config.update({
            "enable_security_scanning": settings.ENABLE_SECURITY_SCANNING,
            "jwt_secret": settings.JWT_SECRET,
            "jwt_algorithm": settings.JWT_ALGORITHM,
            "jwt_expiration": settings.JWT_EXPIRATION,
        })
    
    return base_config


def validate_environment() -> bool:
    """Validate that all required environment variables are set"""
    required_vars = []
    
    if settings.ENVIRONMENT == Environment.PRODUCTION:
        required_vars.extend([
            "JWT_SECRET",
            "MONGODB_URI",
            "REDIS_URL",
        ])
    
    if settings.ENABLE_AI_FEATURES:
        required_vars.extend([
            "OPENAI_API_KEY",
        ])
    
    missing_vars = [var for var in required_vars if not getattr(settings, var, None)]
    
    if missing_vars:
        print(f"❌ Missing required environment variables: {missing_vars}")
        return False
    
    return True 