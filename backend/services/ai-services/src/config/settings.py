"""
AI Ops Guardian Angel - Configuration Settings
Centralized configuration for all AI agents and services
"""

import os
from typing import List, Dict, Any, Optional
from pydantic_settings import BaseSettings
from pydantic import Field
from enum import Enum


class Environment(str, Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"


class AgentType(str, Enum):
    # Core Infrastructure Agents
    COST_OPTIMIZATION = "cost_optimization"
    SECURITY_ANALYSIS = "security_analysis"
    INFRASTRUCTURE = "infrastructure"
    DEVOPS = "devops"

    # Advanced AI Agents
    CODE_GENERATION = "code_generation"
    PREDICTIVE_ANALYTICS = "predictive_analytics"
    ROOT_CAUSE_ANALYSIS = "root_cause_analysis"
    ARCHITECTURE_DESIGN = "architecture_design"

    # Security & Compliance Agents
    THREAT_HUNTING = "threat_hunting"
    COMPLIANCE_AUTOMATION = "compliance_automation"
    ZERO_TRUST_SECURITY = "zero_trust_security"

    # Human-in-Loop Agents
    APPROVAL_WORKFLOW = "approval_workflow"
    RISK_ASSESSMENT = "risk_assessment"
    DECISION_SUPPORT = "decision_support"

    # Git & Deployment Agents
    GIT_INTEGRATION = "git_integration"
    PIPELINE_GENERATION = "pipeline_generation"
    DEPLOYMENT_ORCHESTRATION = "deployment_orchestration"

    # Analytics & Monitoring Agents
    BUSINESS_INTELLIGENCE = "business_intelligence"
    ANOMALY_DETECTION = "anomaly_detection"
    CAPACITY_PLANNING = "capacity_planning"

    # MLOps Agents
    MODEL_TRAINING = "model_training"
    DATA_PIPELINE = "data_pipeline"
    MODEL_MONITORING = "model_monitoring"

    # Advanced DevOps Agents
    DOCKER = "docker"
    KUBERNETES = "kubernetes"

    # Specialized DevOps Agents
    ARTIFACT_MANAGEMENT = "artifact_management"
    PERFORMANCE_TESTING = "performance_testing"


class Settings(BaseSettings):
    """Main configuration settings"""

    # Application Settings
    app_name: str = "AI Ops Guardian Angel"
    app_version: str = "2.0.0"
    environment: Environment = Environment.DEVELOPMENT
    debug: bool = True

    # API Settings
    api_host: str = "0.0.0.0"
    api_port: int = 8001
    api_prefix: str = "/api/v1"

    # AI Model Settings
    openai_api_key: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    anthropic_api_key: Optional[str] = Field(default=None, env="ANTHROPIC_API_KEY")
    default_model: str = "gpt-4"
    max_tokens: int = 4096
    temperature: float = 0.1

        # Database Settings - MongoDB Atlas Configuration
    mongodb_uri: str = Field(
        default="mongodb://localhost:27017/ai_ops_platform",
        env="MONGODB_URI"
    )
    mongodb_database: str = "ai_ops_platform"
    redis_uri: str = Field(default="redis://localhost:6379", env="REDIS_URI")
    redis_db: int = 0

    # Cloud Provider Settings
    aws_access_key_id: Optional[str] = Field(default=None, env="AWS_ACCESS_KEY_ID")
    aws_secret_access_key: Optional[str] = Field(default=None, env="AWS_SECRET_ACCESS_KEY")
    aws_region: str = Field(default="us-east-1", env="AWS_REGION")

    azure_client_id: Optional[str] = Field(default=None, env="AZURE_CLIENT_ID")
    azure_client_secret: Optional[str] = Field(default=None, env="AZURE_CLIENT_SECRET")
    azure_tenant_id: Optional[str] = Field(default=None, env="AZURE_TENANT_ID")

    gcp_project_id: Optional[str] = Field(default=None, env="GCP_PROJECT_ID")
    gcp_service_account_key: Optional[str] = Field(default=None, env="GCP_SERVICE_ACCOUNT_KEY")

    # Security Settings
    secret_key: str = Field(default="dev-secret-key", env="SECRET_KEY")
    jwt_secret: Optional[str] = Field(default=None, env="JWT_SECRET")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Frontend Settings
    frontend_url: Optional[str] = Field(default="http://localhost:3000", env="FRONTEND_URL")
    node_env: Optional[str] = Field(default="development", env="NODE_ENV")

    # Agent Configuration
    max_concurrent_agents: int = 10
    agent_timeout_seconds: int = 300
    retry_attempts: int = 3

    # Monitoring Settings
    enable_metrics: bool = True
    metrics_port: int = 8002
    log_level: str = "INFO"

    # Agent Specific Settings
    cost_optimization_threshold: float = 0.15  # 15% minimum savings
    security_scan_interval: int = 3600  # 1 hour in seconds
    predictive_window_days: int = 30
    anomaly_detection_sensitivity: float = 0.8

    class Config:
        env_file = ".env"
        case_sensitive = False


class AgentConfig:
    """Configuration for individual agents"""

    AGENT_CONFIGS = {
        AgentType.COST_OPTIMIZATION: {
            "name": "Cost Optimization Agent",
            "description": "Analyzes and optimizes cloud costs using ML",
            "capabilities": [
                "Real-time cost analysis",
                "Predictive cost forecasting",
                "Rightsizing recommendations",
                "Reserved instance optimization"
            ],
            "tools": ["cost_analyzer", "forecast_model", "rightsizing_tool"],
            "priority": "high",
            "timeout": 300
        },

        AgentType.SECURITY_ANALYSIS: {
            "name": "Security Analysis Agent",
            "description": "Comprehensive security assessment and monitoring",
            "capabilities": [
                "Vulnerability scanning",
                "Compliance monitoring",
                "Threat detection",
                "Risk assessment"
            ],
            "tools": ["vulnerability_scanner", "compliance_checker", "threat_detector"],
            "priority": "critical",
            "timeout": 600
        },

        AgentType.INFRASTRUCTURE: {
            "name": "Infrastructure Intelligence Agent",
            "description": "Monitors and optimizes infrastructure health",
            "capabilities": [
                "Health monitoring",
                "Predictive maintenance",
                "Performance optimization",
                "Auto-scaling recommendations"
            ],
            "tools": ["health_monitor", "performance_analyzer", "capacity_planner"],
            "priority": "high",
            "timeout": 180
        },

        AgentType.DEVOPS: {
            "name": "DevOps Automation Agent",
            "description": "Automates DevOps workflows and deployments",
            "capabilities": [
                "CI/CD optimization",
                "Deployment automation",
                "Infrastructure as Code",
                "Workflow orchestration"
            ],
            "tools": ["pipeline_optimizer", "deployment_manager", "iac_generator"],
            "priority": "high",
            "timeout": 240
        },

        # Advanced Agents
        AgentType.CODE_GENERATION: {
            "name": "Code Generation Agent",
            "description": "Generates and reviews infrastructure code",
            "capabilities": [
                "Terraform generation",
                "Ansible playbooks",
                "Kubernetes manifests",
                "Code review automation"
            ],
            "tools": ["code_generator", "template_engine", "code_reviewer"],
            "priority": "medium",
            "timeout": 180
        },

        AgentType.PREDICTIVE_ANALYTICS: {
            "name": "Predictive Analytics Agent",
            "description": "Predicts failures and capacity needs",
            "capabilities": [
                "Failure prediction",
                "Capacity forecasting",
                "Trend analysis",
                "Pattern recognition"
            ],
            "tools": ["ml_predictor", "time_series_analyzer", "pattern_detector"],
            "priority": "medium",
            "timeout": 300
        },

        # Add all other agents...
        AgentType.ROOT_CAUSE_ANALYSIS: {
            "name": "Root Cause Analysis Agent",
            "description": "Analyzes incidents and finds root causes",
            "capabilities": ["Incident analysis", "Correlation detection", "Fix suggestions"],
            "tools": ["incident_analyzer", "correlation_engine", "solution_finder"],
            "priority": "high",
            "timeout": 200
        }

        # ... (continuing with all 20+ agents)
    }

    @classmethod
    def get_agent_config(cls, agent_type: AgentType) -> Dict[str, Any]:
        """Get configuration for a specific agent type"""
        return cls.AGENT_CONFIGS.get(agent_type, {})

    @classmethod
    def get_all_agent_types(cls) -> List[AgentType]:
        """Get all available agent types"""
        return list(cls.AGENT_CONFIGS.keys())


# Global settings instance
settings = Settings()


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ApprovalLevel(str, Enum):
    ENGINEER = "engineer"
    SENIOR_ENGINEER = "senior_engineer"
    TEAM_LEAD = "team_lead"
    MANAGER = "manager"
    ADMIN = "admin"


class CloudProvider(str, Enum):
    AWS = "aws"
    AZURE = "azure"
    GCP = "gcp"
    MULTI_CLOUD = "multi_cloud"


class ComplianceFramework(str, Enum):
    SOC2 = "soc2"
    HIPAA = "hipaa"
    PCI_DSS = "pci_dss"
    GDPR = "gdpr"
    ISO27001 = "iso27001" 