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
    SUPPLY_CHAIN_SECURITY = "supply_chain_security"
    SBOM_MANAGEMENT = "sbom_management"
    DATA_CLASSIFICATION = "data_classification"
    OPA_ENFORCER = "opa_enforcer"
    AUDITOR_MODE = "auditor_mode"

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
    FEATURE_STORE_OPS = "feature_store_ops"
    MODEL_ROLLBACK = "model_rollback"
    DATA_DRIFT = "data_drift"

    # Advanced DevOps Agents
    DOCKER = "docker"
    KUBERNETES = "kubernetes"

    # Specialized DevOps Agents
    ARTIFACT_MANAGEMENT = "artifact_management"
    PERFORMANCE_TESTING = "performance_testing"

    # Specialized Workflow Agents
    LANGGRAPH_ORCHESTRATOR = "langgraph_orchestrator"
    AUTO_REMEDIATION = "auto_remediation"

    # Governance & FinOps & Safety Agents (new)
    TAG_ENFORCEMENT = "tag_enforcement"
    DRIFT_RECONCILIATION = "drift_reconciliation"
    IAC_IMPORT = "iac_import"
    COMMITMENTS_ADVISOR = "commitments_advisor"
    OFF_HOURS_SCHEDULER = "off_hours_scheduler"
    COST_ANOMALY = "cost_anomaly"
    DATA_LIFECYCLE = "data_lifecycle"
    EGRESS_OPTIMIZER = "egress_optimizer"
    UNIT_ECONOMICS = "unit_economics"
    EVIDENCE_PACKAGER = "evidence_packager"
    BREAK_GLASS = "break_glass"
    SECRETS_ROTATION = "secrets_rotation"
    KMS_KEY_ROTATION = "kms_key_rotation"
    CHANGE_IMPACT_SIMULATOR = "change_impact_simulator"

    # Cloud & Infra Agents (new)
    NETWORK_POLICY = "network_policy"
    BACKUP_DR = "backup_dr"
    SAFE_CUTOVER = "safe_cutover"
    BULK_CLEANUP = "bulk_cleanup"
    MULTI_REGION_ORCHESTRATOR = "multi_region_orchestrator"

    # SRE & Observability Agents (new)
    INCIDENT_MANAGER = "incident_manager"
    SLO_MANAGER = "slo_manager"
    CHANGE_CORRELATION = "change_correlation"
    RUNBOOK_GENERATOR = "runbook_generator"
    # Integrations & RAG Agents (new)
    INTEGRATION_INSTALLER = "integration_installer"
    WEBHOOK_NORMALIZER = "webhook_normalizer"
    KNOWLEDGE_INGESTION = "knowledge_ingestion"
    FRESHNESS_GUARDIAN = "freshness_guardian"


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
        AgentType.SUPPLY_CHAIN_SECURITY: {
            "name": "Supply Chain Security Agent",
            "description": "Cosign signing/verification, SLSA provenance, pinned digests",
            "capabilities": ["Cosign sign", "Cosign verify", "SLSA provenance", "Digest pinning"],
            "tools": ["cosign", "slsa", "registry_client"],
            "priority": "critical",
            "timeout": 300
        },
        AgentType.SBOM_MANAGEMENT: {
            "name": "SBOM Management Agent",
            "description": "Generate SBOMs, correlate scans, track license/compliance drift",
            "capabilities": ["SBOM generation", "Scan correlation", "License drift"],
            "tools": ["syft", "grype", "license_checker"],
            "priority": "high",
            "timeout": 600
        },
        AgentType.DATA_CLASSIFICATION: {
            "name": "Data Classification Agent",
            "description": "PII/secret detection in configs/logs; residency policy enforcement",
            "capabilities": ["PII detection", "Secrets detection", "Residency enforcement"],
            "tools": ["dlp_scanner", "secrets_scanner", "policy_engine"],
            "priority": "high",
            "timeout": 300
        },
        AgentType.OPA_ENFORCER: {
            "name": "OPA Enforcer Agent",
            "description": "Bundle/publish OPA policies, simulate impacts, enforce allow-lists",
            "capabilities": ["Bundle publish", "Policy simulation", "Allow-list enforcement"],
            "tools": ["opa_client", "policy_bundler"],
            "priority": "high",
            "timeout": 300
        },
        AgentType.AUDITOR_MODE: {
            "name": "Auditor Mode Agent",
            "description": "Read-only, time-boxed access flows with exportable trails",
            "capabilities": ["Read-only sessions", "Time-boxed access", "Audit export"],
            "tools": ["identity_provider", "audit_trail"],
            "priority": "medium",
            "timeout": 600
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
        AgentType.FEATURE_STORE_OPS: {
            "name": "Feature Store Ops Agent",
            "description": "Dataset/feature lineage, drift monitoring, ACLs",
            "capabilities": ["Lineage", "Feature drift", "ACL management"],
            "tools": ["feature_store", "metrics", "identity_provider"],
            "priority": "high",
            "timeout": 300
        },
        AgentType.MODEL_ROLLBACK: {
            "name": "Model Rollback Agent",
            "description": "Canary eval and rollback with safety gating on real-time metrics",
            "capabilities": ["Canary evaluation", "Rollback", "Safety gating"],
            "tools": ["model_evaluator", "deployment_orchestrator", "metrics"],
            "priority": "critical",
            "timeout": 600
        },
        AgentType.DATA_DRIFT: {
            "name": "Data Drift Agent",
            "description": "Detect distribution drift and trigger retraining workflows",
            "capabilities": ["Distribution drift", "Retraining triggers"],
            "tools": ["drift_detector", "pipeline_manager"],
            "priority": "high",
            "timeout": 300
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
        ,
        # New Governance & FinOps & Safety Agents
        AgentType.TAG_ENFORCEMENT: {
            "name": "Tag Enforcement Agent",
            "description": "Enforces canonical tags, auto-retags non-prod, manages waivers",
            "capabilities": [
                "Tag audit",
                "Auto-retag (non-prod)",
                "Waiver management",
                "OPA policy integration"
            ],
            "tools": ["opa_client", "cloud_manager", "cmdb"],
            "priority": "high",
            "timeout": 300
        },
        AgentType.DRIFT_RECONCILIATION: {
            "name": "Drift Reconciliation Agent",
            "description": "Detects and reconciles drift between live and IaC",
            "capabilities": ["Drift detection", "PR creation in prod", "Auto-apply in low risk"],
            "tools": ["gitops", "kubernetes_manager", "cloud_manager"],
            "priority": "high",
            "timeout": 600
        },
        AgentType.IAC_IMPORT: {
            "name": "IaC Import Agent",
            "description": "Imports infrastructure from live using Terraformer/Pulumi and baselines",
            "capabilities": ["Terraformer", "Pulumi import", "Baseline creation"],
            "tools": ["iac_generator", "git_repo"],
            "priority": "medium",
            "timeout": 900
        },
        AgentType.COMMITMENTS_ADVISOR: {
            "name": "Commitments Advisor Agent",
            "description": "Rightsizing and RI/SP recommendations and execution windows",
            "capabilities": ["Rightsizing", "Savings plans", "RI planning", "Execution scheduling"],
            "tools": ["cost_analyzer", "rightsizing_tool"],
            "priority": "high",
            "timeout": 300
        },
        AgentType.OFF_HOURS_SCHEDULER: {
            "name": "Off-Hours Scheduler Agent",
            "description": "Schedules start/stop/scale by env/service to cut idle spend",
            "capabilities": ["Schedules", "Cloud actions", "Approval-aware"],
            "tools": ["cloud_manager", "chatops_orchestrator"],
            "priority": "medium",
            "timeout": 120
        },
        AgentType.COST_ANOMALY: {
            "name": "Cost Anomaly Agent",
            "description": "Real-time cost anomaly detection with explainers and Slack alerts",
            "capabilities": ["Real-time anomaly detection", "Explainable alerts", "ChatOps notifications"],
            "tools": ["cost_analyzer", "chatops_orchestrator"],
            "priority": "critical",
            "timeout": 120
        },
        AgentType.DATA_LIFECYCLE: {
            "name": "Data Lifecycle Agent",
            "description": "Tiering & retention policies (e.g., S3→Glacier) and large-object cleanup",
            "capabilities": ["Tiering plans", "Retention policies", "Large-object cleanup"],
            "tools": ["cloud_manager", "cmdb"],
            "priority": "high",
            "timeout": 900
        },
        AgentType.EGRESS_OPTIMIZER: {
            "name": "Egress Optimizer Agent",
            "description": "Detects cross-AZ/region egress hotspots; routing and placement suggestions",
            "capabilities": ["Hotspot detection", "Routing suggestions", "Placement optimization"],
            "tools": ["cloud_manager", "metrics"],
            "priority": "high",
            "timeout": 300
        },
        AgentType.UNIT_ECONOMICS: {
            "name": "Unit Economics Agent",
            "description": "Maps costs to services/tenants/SLO targets and spots regressions",
            "capabilities": ["Cost mapping", "SLO linkage", "Regression detection"],
            "tools": ["cost_analyzer", "metrics"],
            "priority": "high",
            "timeout": 300
        },
        AgentType.EVIDENCE_PACKAGER: {
            "name": "Evidence Packager Agent",
            "description": "Builds auditor-grade evidence packs",
            "capabilities": ["Config capture", "Screenshots", "API dumps", "Approvals", "Logs"],
            "tools": ["evidence_vault", "cloud_manager", "gitops"],
            "priority": "medium",
            "timeout": 600
        },
        AgentType.BREAK_GLASS: {
            "name": "Break-Glass Agent",
            "description": "Time-boxed elevated access with approver quorum and full audit",
            "capabilities": ["Quorum approvals", "STS tokens", "Auto-revoke"],
            "tools": ["secrets_provider", "opa_client"],
            "priority": "critical",
            "timeout": 180
        },
        AgentType.SECRETS_ROTATION: {
            "name": "Secrets Rotation Agent",
            "description": "Rotates keys/tokens across cloud and integrations with Vault/Secrets Manager",
            "capabilities": ["Key rotation", "Credential updates", "Propagation"],
            "tools": ["secrets_provider", "github_repo_secrets"],
            "priority": "high",
            "timeout": 600
        },
        AgentType.KMS_KEY_ROTATION: {
            "name": "KMS Key Rotation Agent",
            "description": "Plans KMS/CMK rotations with blast-radius checks and staged cutovers",
            "capabilities": ["Key creation", "Alias switch", "Staged cutover"],
            "tools": ["cloud_manager", "safe_cutover"],
            "priority": "high",
            "timeout": 600
        },
        AgentType.CHANGE_IMPACT_SIMULATOR: {
            "name": "Change Impact Simulator Agent",
            "description": "Simulates impact of infra changes on cost and SLO risk",
            "capabilities": ["Cost delta", "SLO risk scoring", "Blast radius"],
            "tools": ["cost_analyzer", "performance_analyzer"],
            "priority": "high",
            "timeout": 300
        }
        ,
        # Cloud & Infra Agents
        AgentType.NETWORK_POLICY: {
            "name": "Network Policy Agent",
            "description": "Analyzes SG/NSG/Firewall for open ports and least privilege",
            "capabilities": ["Guardrails", "Open port detection", "Least privilege advice"],
            "tools": ["cloud_manager", "cmdb"],
            "priority": "high",
            "timeout": 300
        },
        AgentType.BACKUP_DR: {
            "name": "Backup & DR Agent",
            "description": "Backups, retention policies, DR drills and restore validation",
            "capabilities": ["Backups", "Retention", "DR drills", "Restore validation"],
            "tools": ["cloud_manager", "cmdb"],
            "priority": "high",
            "timeout": 900
        },
        AgentType.SAFE_CUTOVER: {
            "name": "Safe Cutover Agent",
            "description": "Blue/green and weighted cutovers with health gates",
            "capabilities": ["Blue/green", "DNS TTL", "Health gates", "Rollback"],
            "tools": ["safe_cutover", "cmdb"],
            "priority": "critical",
            "timeout": 1800
        },
        AgentType.BULK_CLEANUP: {
            "name": "Bulk Cleanup Agent",
            "description": "Safe garbage collection of idle/orphaned assets",
            "capabilities": ["Candidate scan", "Savings estimate", "Batch cleanup"],
            "tools": ["bulk_cleanup", "cmdb"],
            "priority": "high",
            "timeout": 1200
        },
        AgentType.MULTI_REGION_ORCHESTRATOR: {
            "name": "Multi-Region Orchestrator Agent",
            "description": "Coordinated rollouts/rollbacks across regions with canaries",
            "capabilities": ["Canary", "Regional sequencing", "Rollback"],
            "tools": ["cloud_manager", "chatops_orchestrator"],
            "priority": "high",
            "timeout": 1800
        },
        # SRE & Observability Agents
        AgentType.INCIDENT_MANAGER: {
            "name": "Incident Manager Agent",
            "description": "Correlates alerts, deduplicates, finds changes, kicks off RCA, ChatOps updates",
            "capabilities": ["Alert correlation", "Dedup", "What changed", "RCA kickoff", "ChatOps"],
            "tools": ["chatops_orchestrator", "langgraph_orchestrator"],
            "priority": "critical",
            "timeout": 600
        },
        AgentType.SLO_MANAGER: {
            "name": "SLO Manager Agent",
            "description": "Define SLOs, track burn rate, gate auto-remediation by budgets",
            "capabilities": ["SLO definition", "Burn rate", "Error budgets", "Gating"],
            "tools": ["metrics", "hitl"],
            "priority": "high",
            "timeout": 600
        },
        AgentType.CHANGE_CORRELATION: {
            "name": "Change Correlation Agent",
            "description": "Map incidents to deploys/config changes and suggest rollbacks",
            "capabilities": ["Deploy correlation", "Config diff", "Rollback suggestions"],
            "tools": ["chatops_orchestrator"],
            "priority": "high",
            "timeout": 600
        },
        AgentType.RUNBOOK_GENERATOR: {
            "name": "Runbook Generator Agent",
            "description": "Generate and maintain runnable, tenant-aware runbooks",
            "capabilities": ["Runbook generation", "Tenant-aware", "History integration"],
            "tools": ["rag", "cmdb"],
            "priority": "medium",
            "timeout": 300
        }
        ,
        # Integrations & RAG Agents
        AgentType.INTEGRATION_INSTALLER: {
            "name": "Integration Installer Agent",
            "description": "Self-serve marketplace installs, configuration, OAuth, and health checks",
            "capabilities": ["Marketplace install", "OAuth", "Config apply", "Health checks"],
            "tools": ["secrets_provider", "oauth_client"],
            "priority": "high",
            "timeout": 600
        },
        AgentType.WEBHOOK_NORMALIZER: {
            "name": "Webhook Normalizer Agent",
            "description": "Unify events from Prometheus, Datadog, Jira, GitHub, etc.",
            "capabilities": ["Event normalization", "Schema mapping", "Routing"],
            "tools": ["event_router", "schema_registry"],
            "priority": "medium",
            "timeout": 120
        },
        AgentType.KNOWLEDGE_INGESTION: {
            "name": "Knowledge Ingestion Agent",
            "description": "Pull runbooks/Confluence/Git/Tickets; chunk+embed with lineage/freshness",
            "capabilities": ["Source pulling", "Chunking", "Embedding", "Lineage"],
            "tools": ["rag", "qdrant", "git_client"],
            "priority": "high",
            "timeout": 1800
        },
        AgentType.FRESHNESS_GUARDIAN: {
            "name": "Freshness Guardian Agent",
            "description": "Detect stale knowledge and prioritize re-ingestion",
            "capabilities": ["Freshness scoring", "Recrawl scheduling"],
            "tools": ["rag", "scheduler"],
            "priority": "medium",
            "timeout": 600
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