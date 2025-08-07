"""
InfraMind - Configuration Settings
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

    # Specialized Workflow Agents
    LANGGRAPH_ORCHESTRATOR = "langgraph_orchestrator"
    AUTO_REMEDIATION = "auto_remediation"


class Settings(BaseSettings):
    """Main configuration settings"""

    # Application Settings
    app_name: str = "InfraMind"
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

    # Vector Database Settings - Qdrant
    qdrant_url: str = Field(default="http://localhost:6333", env="QDRANT_URL")
    qdrant_api_key: Optional[str] = Field(default=None, env="QDRANT_API_KEY")
    qdrant_collection_name: str = Field(default="ai_ops_knowledge", env="QDRANT_COLLECTION_NAME")
    qdrant_vector_size: int = Field(default=384, env="QDRANT_VECTOR_SIZE")

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

    # LangGraph Settings
    langgraph_enabled: bool = True
    langgraph_workflow_timeout: int = 600
    langgraph_max_concurrent_workflows: int = 5

    # HITL Settings
    hitl_enabled: bool = True
    hitl_auto_approve_low: bool = True
    hitl_auto_approve_medium: bool = False
    hitl_auto_approve_high: bool = False
    hitl_auto_approve_critical: bool = False

    # Plugin SDK Settings
    plugin_sdk_enabled: bool = True
    plugin_marketplace_enabled: bool = True
    plugin_auto_update: bool = False
    plugin_scan_interval: int = 3600

    # RAG Settings
    rag_enabled: bool = True
    rag_chunk_size: int = 1000
    rag_chunk_overlap: int = 200
    rag_max_results: int = 10
    rag_similarity_threshold: float = 0.7

    # IaC Settings
    iac_enabled: bool = True
    iac_providers: List[str] = ["terraform", "pulumi", "cloudformation", "bicep"]
    iac_validation_enabled: bool = True
    iac_cost_estimation_enabled: bool = True

    # CORS Settings
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080"
    ]

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

        AgentType.ROOT_CAUSE_ANALYSIS: {
            "name": "Root Cause Analysis Agent",
            "description": "Analyzes incidents and finds root causes",
            "capabilities": ["Incident analysis", "Correlation detection", "Fix suggestions"],
            "tools": ["incident_analyzer", "correlation_engine", "solution_finder"],
            "priority": "high",
            "timeout": 200
        },

        AgentType.ARCHITECTURE_DESIGN: {
            "name": "Architecture Design Agent",
            "description": "Designs and reviews system architectures",
            "capabilities": ["Architecture design", "Best practices", "Review automation"],
            "tools": ["architect_designer", "best_practices_checker", "review_automator"],
            "priority": "medium",
            "timeout": 240
        },

        # Security Agents
        AgentType.THREAT_HUNTING: {
            "name": "Threat Hunting Agent",
            "description": "Proactively hunts for security threats",
            "capabilities": ["APT detection", "Behavioral analysis", "Threat intelligence"],
            "tools": ["threat_hunter", "behavior_analyzer", "intel_collector"],
            "priority": "critical",
            "timeout": 300
        },

        AgentType.COMPLIANCE_AUTOMATION: {
            "name": "Compliance Automation Agent",
            "description": "Automates compliance checks and reporting",
            "capabilities": ["SOC2 compliance", "HIPAA compliance", "PCI-DSS compliance"],
            "tools": ["compliance_checker", "audit_automator", "report_generator"],
            "priority": "high",
            "timeout": 400
        },

        AgentType.ZERO_TRUST_SECURITY: {
            "name": "Zero-Trust Security Agent",
            "description": "Implements zero-trust security policies",
            "capabilities": ["Policy enforcement", "Access control", "Security monitoring"],
            "tools": ["policy_enforcer", "access_controller", "security_monitor"],
            "priority": "critical",
            "timeout": 180
        },

        # Human-in-Loop Agents
        AgentType.APPROVAL_WORKFLOW: {
            "name": "Approval Workflow Agent",
            "description": "Manages approval workflows and routing",
            "capabilities": ["Risk-based routing", "Approval management", "Notification system"],
            "tools": ["workflow_manager", "approval_router", "notifier"],
            "priority": "high",
            "timeout": 120
        },

        AgentType.RISK_ASSESSMENT: {
            "name": "Risk Assessment Agent",
            "description": "Assesses risks and provides recommendations",
            "capabilities": ["Risk scoring", "Risk modeling", "Recommendation engine"],
            "tools": ["risk_scorer", "risk_modeler", "recommendation_engine"],
            "priority": "high",
            "timeout": 180
        },

        AgentType.DECISION_SUPPORT: {
            "name": "Decision Support Agent",
            "description": "Provides decision support and analysis",
            "capabilities": ["Multi-criteria analysis", "Decision frameworks", "Impact analysis"],
            "tools": ["criteria_analyzer", "framework_engine", "impact_analyzer"],
            "priority": "medium",
            "timeout": 150
        },

        # Git & Deployment Agents
        AgentType.GIT_INTEGRATION: {
            "name": "Git Integration Agent",
            "description": "Manages Git workflows and repositories",
            "capabilities": ["Git automation", "Repository management", "Workflow optimization"],
            "tools": ["git_automator", "repo_manager", "workflow_optimizer"],
            "priority": "medium",
            "timeout": 120
        },

        AgentType.PIPELINE_GENERATION: {
            "name": "Pipeline Generation Agent",
            "description": "Generates CI/CD pipelines automatically",
            "capabilities": ["Pipeline creation", "Workflow automation", "Best practices"],
            "tools": ["pipeline_generator", "workflow_automator", "best_practices_checker"],
            "priority": "high",
            "timeout": 180
        },

        AgentType.DEPLOYMENT_ORCHESTRATION: {
            "name": "Deployment Orchestration Agent",
            "description": "Orchestrates multi-environment deployments",
            "capabilities": ["Multi-env deployment", "Rollback management", "Deployment automation"],
            "tools": ["deployment_orchestrator", "rollback_manager", "deployment_automator"],
            "priority": "high",
            "timeout": 300
        },

        # Analytics & Monitoring Agents
        AgentType.BUSINESS_INTELLIGENCE: {
            "name": "Business Intelligence Agent",
            "description": "Provides business intelligence and analytics",
            "capabilities": ["ROI tracking", "Impact analysis", "Business metrics"],
            "tools": ["roi_tracker", "impact_analyzer", "metrics_collector"],
            "priority": "medium",
            "timeout": 200
        },

        AgentType.ANOMALY_DETECTION: {
            "name": "Anomaly Detection Agent",
            "description": "Detects anomalies in system behavior",
            "capabilities": ["Real-time detection", "Pattern recognition", "Alert generation"],
            "tools": ["anomaly_detector", "pattern_recognizer", "alert_generator"],
            "priority": "high",
            "timeout": 60
        },

        AgentType.CAPACITY_PLANNING: {
            "name": "Capacity Planning Agent",
            "description": "Plans capacity and resource allocation",
            "capabilities": ["Growth forecasting", "Resource planning", "Capacity modeling"],
            "tools": ["growth_forecaster", "resource_planner", "capacity_modeler"],
            "priority": "medium",
            "timeout": 240
        },

        # MLOps Agents
        AgentType.MODEL_TRAINING: {
            "name": "Model Training Agent",
            "description": "Trains and optimizes ML models",
            "capabilities": ["Model training", "Hyperparameter optimization", "Model validation"],
            "tools": ["model_trainer", "hyperparameter_optimizer", "model_validator"],
            "priority": "medium",
            "timeout": 600
        },

        AgentType.DATA_PIPELINE: {
            "name": "Data Pipeline Agent",
            "description": "Manages data processing pipelines",
            "capabilities": ["ETL workflows", "Data processing", "Pipeline management"],
            "tools": ["etl_engine", "data_processor", "pipeline_manager"],
            "priority": "medium",
            "timeout": 300
        },

        AgentType.MODEL_MONITORING: {
            "name": "Model Monitoring Agent",
            "description": "Monitors ML model performance",
            "capabilities": ["Performance monitoring", "Drift detection", "Model evaluation"],
            "tools": ["performance_monitor", "drift_detector", "model_evaluator"],
            "priority": "high",
            "timeout": 120
        },

        # Advanced DevOps Agents
        AgentType.DOCKER: {
            "name": "Docker Agent",
            "description": "Manages Docker containers and images",
            "capabilities": ["Container management", "Image optimization", "Docker automation"],
            "tools": ["container_manager", "image_optimizer", "docker_automator"],
            "priority": "medium",
            "timeout": 180
        },

        AgentType.KUBERNETES: {
            "name": "Kubernetes Agent",
            "description": "Manages Kubernetes clusters and deployments",
            "capabilities": ["Cluster management", "Deployment automation", "Scaling optimization"],
            "tools": ["cluster_manager", "deployment_automator", "scaling_optimizer"],
            "priority": "high",
            "timeout": 240
        },

        # Specialized DevOps Agents
        AgentType.ARTIFACT_MANAGEMENT: {
            "name": "Artifact Management Agent",
            "description": "Manages artifacts and versioning",
            "capabilities": ["Artifact storage", "Version management", "Distribution automation"],
            "tools": ["artifact_storer", "version_manager", "distribution_automator"],
            "priority": "medium",
            "timeout": 120
        },

        AgentType.PERFORMANCE_TESTING: {
            "name": "Performance Testing Agent",
            "description": "Conducts performance testing and optimization",
            "capabilities": ["Load testing", "Performance optimization", "Benchmarking"],
            "tools": ["load_tester", "performance_optimizer", "benchmarker"],
            "priority": "medium",
            "timeout": 300
        },

        # Specialized Workflow Agents
        AgentType.LANGGRAPH_ORCHESTRATOR: {
            "name": "LangGraph Orchestrator",
            "description": "Advanced workflow orchestration with LangGraph",
            "capabilities": ["Workflow orchestration", "RCA workflows", "Remediation workflows"],
            "tools": ["workflow_orchestrator", "rca_workflow", "remediation_workflow"],
            "priority": "high",
            "timeout": 600
        },

        AgentType.AUTO_REMEDIATION: {
            "name": "Auto-Remediation Agent",
            "description": "Human-in-the-Loop automated remediation",
            "capabilities": ["Approval workflows", "Automated remediation", "Rollback management"],
            "tools": ["approval_manager", "remediation_automator", "rollback_manager"],
            "priority": "critical",
            "timeout": 300
        }
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