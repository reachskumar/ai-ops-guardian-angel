"""
AI Agents Package
Contains all specialized AI agents for DevOps operations
"""

from .base_agent import BaseAgent, AgentTask, AgentCapabilities, AgentRecommendation
from .chat.devops_chat_agent import DevOpsChatAgent

# Core Agents
from .core.devops_agent import DevOpsAgent
from .core.infrastructure_agent import InfrastructureAgent
from .core.security_analysis_agent import SecurityAnalysisAgent
from .core.cost_optimization_agent import CostOptimizationAgent

# Advanced Agents
from .advanced.predictive_agent import PredictiveAgent
from .advanced.code_generation_agent import CodeGenerationAgent
from .advanced.architecture_agent import ArchitectureAgent
from .advanced.root_cause_agent import RootCauseAgent

# Security Agents
from .security.compliance_automation_agent import ComplianceAutomationAgent
from .security.threat_hunting_agent import ThreatHuntingAgent
from .security.zero_trust_agent import ZeroTrustAgent

# Human Loop Agents
from .human_loop.approval_workflow_agent import ApprovalWorkflowAgent
from .human_loop.decision_support_agent import DecisionSupportAgent
from .human_loop.risk_assessment_agent import RiskAssessmentAgent

# Git & Deployment Agents
from .git_deploy.git_integration_agent import GitIntegrationAgent
from .git_deploy.deployment_orchestration_agent import DeploymentOrchestrationAgent
from .git_deploy.pipeline_generation_agent import PipelineGenerationAgent

# Analytics Agents
from .analytics.anomaly_detection_agent import AnomalyDetectionAgent
from .analytics.business_intelligence_agent import BusinessIntelligenceAgent
from .analytics.capacity_planning_agent import CapacityPlanningAgent

# MLOps Agents
from .mlops.model_training_agent import ModelTrainingAgent
from .mlops.data_pipeline_agent import DataPipelineAgent
from .mlops.model_monitoring_agent import ModelMonitoringAgent

# Advanced DevOps Agents
from .advanced_devops.docker_agent import DockerAgent
from .advanced_devops.kubernetes_agent import KubernetesAgent

# Specialized DevOps Agents
from .specialized_devops.artifact_management_agent import ArtifactManagementAgent
from .specialized_devops.performance_testing_agent import PerformanceTestingAgent

__all__ = [
    # Base Classes
    "BaseAgent",
    "AgentTask", 
    "AgentCapabilities",
    "AgentRecommendation",
    
    # Chat Agent
    "DevOpsChatAgent",
    
    # Core Agents
    "DevOpsAgent",
    "InfrastructureAgent", 
    "SecurityAnalysisAgent",
    "CostOptimizationAgent",
    
    # Advanced Agents
    "PredictiveAgent",
    "CodeGenerationAgent",
    "ArchitectureAgent",
    "RootCauseAgent",
    
    # Security Agents
    "ComplianceAutomationAgent",
    "ThreatHuntingAgent",
    "ZeroTrustAgent",
    
    # Human Loop Agents
    "ApprovalWorkflowAgent",
    "DecisionSupportAgent",
    "RiskAssessmentAgent",
    
    # Git & Deployment Agents
    "GitIntegrationAgent",
    "DeploymentOrchestrationAgent",
    "PipelineGenerationAgent",
    
    # Analytics Agents
    "AnomalyDetectionAgent",
    "BusinessIntelligenceAgent",
    "CapacityPlanningAgent",
    
    # MLOps Agents
    "ModelTrainingAgent",
    "DataPipelineAgent",
    "ModelMonitoringAgent",
    
    # Advanced DevOps Agents
    "DockerAgent",
    "KubernetesAgent",
    
    # Specialized DevOps Agents
    "ArtifactManagementAgent",
    "PerformanceTestingAgent"
]
