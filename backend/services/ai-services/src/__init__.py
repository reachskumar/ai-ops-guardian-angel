"""
AI Ops Guardian Angel - AI Services Package
Production-ready AI/ML services for DevOps automation

This package contains:
- 28 Specialized AI Agents
- LangGraph Workflow Orchestration
- Human-in-the-Loop (HITL) Systems
- Plugin SDK and Marketplace
- RAG Knowledge Retrieval System
- Infrastructure as Code Generation
- Multi-Cloud Integration
- Security and Compliance Automation
"""

__version__ = "2.0.0"
__author__ = "AI Ops Team"
__description__ = "Production-ready AI/ML services for DevOps automation"

# Core modules
from .config.settings import settings, AgentType, AgentConfig
from .utils.logging import setup_logging

# Agent systems
from .agents.base_agent import BaseAgent, AgentTask, AgentCapabilities
from .agents.chat.devops_chat_agent import DevOpsChatAgent

# Core infrastructure agents
from .agents.core.cost_optimization_agent import CostOptimizationAgent
from .agents.core.security_analysis_agent import SecurityAnalysisAgent
from .agents.core.infrastructure_agent import InfrastructureAgent
from .agents.core.devops_agent import DevOpsAgent

# Advanced AI agents
from .agents.advanced.code_generation_agent import CodeGenerationAgent
from .agents.advanced.predictive_agent import PredictiveAgent
from .agents.advanced.root_cause_agent import RootCauseAgent
from .agents.advanced.architecture_agent import ArchitectureAgent

# Security & compliance agents
from .agents.security.threat_hunting_agent import ThreatHuntingAgent
from .agents.security.compliance_automation_agent import ComplianceAutomationAgent
from .agents.security.zero_trust_agent import ZeroTrustAgent

# Human-in-loop agents
from .agents.human_loop.approval_workflow_agent import ApprovalWorkflowAgent
from .agents.human_loop.risk_assessment_agent import RiskAssessmentAgent
from .agents.human_loop.decision_support_agent import DecisionSupportAgent

# Git & deployment agents
from .agents.git_deploy.git_integration_agent import GitIntegrationAgent
from .agents.git_deploy.pipeline_generation_agent import PipelineGenerationAgent
from .agents.git_deploy.deployment_orchestration_agent import DeploymentOrchestrationAgent

# Analytics & monitoring agents
from .agents.analytics.business_intelligence_agent import BusinessIntelligenceAgent
from .agents.analytics.anomaly_detection_agent import AnomalyDetectionAgent
from .agents.analytics.capacity_planning_agent import CapacityPlanningAgent

# MLOps agents
from .agents.mlops.model_training_agent import ModelTrainingAgent
from .agents.mlops.data_pipeline_agent import DataPipelineAgent
from .agents.mlops.model_monitoring_agent import ModelMonitoringAgent

# Advanced DevOps agents
from .agents.advanced_devops.docker_agent import DockerAgent
from .agents.advanced_devops.kubernetes_agent import KubernetesAgent

# Specialized DevOps agents
from .agents.specialized_devops.artifact_management_agent import ArtifactManagementAgent
from .agents.specialized_devops.performance_testing_agent import PerformanceTestingAgent

# Specialized workflow agents
from .agents.langgraph.langgraph_orchestrator import langgraph_orchestrator
from .agents.hitl.auto_remediation_agent import auto_remediation_agent

# Core systems
from .plugins.plugin_sdk import plugin_sdk
from .rag.vector_store import VectorStore, RAGSystem

# API routers
from .api.chat import router as chat_router
from .api.agents import router as agents_router
from .api.iac_endpoints import router as iac_router
from .api.rag_endpoints import router as rag_router
from .api.langgraph_endpoints import router as langgraph_router
from .api.hitl_endpoints import router as hitl_router
from .api.plugin_endpoints import router as plugin_router

# Export main components
__all__ = [
    # Configuration
    "settings",
    "AgentType", 
    "AgentConfig",
    "setup_logging",
    
    # Base classes
    "BaseAgent",
    "AgentTask", 
    "AgentCapabilities",
    
    # Core agents
    "CostOptimizationAgent",
    "SecurityAnalysisAgent",
    "InfrastructureAgent", 
    "DevOpsAgent",
    
    # Advanced agents
    "CodeGenerationAgent",
    "PredictiveAgent",
    "RootCauseAgent",
    "ArchitectureAgent",
    
    # Security agents
    "ThreatHuntingAgent",
    "ComplianceAutomationAgent",
    "ZeroTrustAgent",
    
    # Human-in-loop agents
    "ApprovalWorkflowAgent",
    "RiskAssessmentAgent",
    "DecisionSupportAgent",
    
    # Git & deployment agents
    "GitIntegrationAgent",
    "PipelineGenerationAgent",
    "DeploymentOrchestrationAgent",
    
    # Analytics agents
    "BusinessIntelligenceAgent",
    "AnomalyDetectionAgent",
    "CapacityPlanningAgent",
    
    # MLOps agents
    "ModelTrainingAgent",
    "DataPipelineAgent",
    "ModelMonitoringAgent",
    
    # Advanced DevOps agents
    "DockerAgent",
    "KubernetesAgent",
    
    # Specialized DevOps agents
    "ArtifactManagementAgent",
    "PerformanceTestingAgent",
    
    # Specialized workflow agents
    "langgraph_orchestrator",
    "auto_remediation_agent",
    
    # Core systems
    "plugin_sdk",
    "VectorStore",
    "RAGSystem",
    
    # API routers
    "chat_router",
    "agents_router",
    "iac_router",
    "rag_router",
    "langgraph_router",
    "hitl_router",
    "plugin_router"
]
