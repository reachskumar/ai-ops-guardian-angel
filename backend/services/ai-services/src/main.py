#!/usr/bin/env python3
"""
InfraMind - AI Services
Production-ready AI/ML services for DevOps automation
"""

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import logging
import asyncio
from datetime import datetime
from typing import Dict, Any, List

from config.settings import settings
from utils.logging import setup_logging

# Import API routers
from api.chat import router as chat_router
from api.agents import router as agents_router
from api.iac_endpoints import router as iac_router
from api.rag_endpoints import router as rag_router
from api.langgraph_endpoints import router as langgraph_router
from api.hitl_endpoints import router as hitl_router
from api.plugin_endpoints import router as plugin_router
from api.integration_endpoints import router as integration_router

# Import core systems for status checks
from agents.langgraph.langgraph_orchestrator import langgraph_orchestrator
from agents.hitl.auto_remediation_agent import auto_remediation_agent
from plugins.plugin_sdk import plugin_sdk
from rag.vector_store import VectorStore, RAGSystem

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="InfraMind - AI Services",
    description="Production-ready AI/ML services for DevOps automation with 28 specialized agents",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Configure appropriately for production
)

# Include routers
app.include_router(chat_router, prefix="/api/v1")
app.include_router(agents_router, prefix="/api/v1")
app.include_router(iac_router, prefix="/api/v1")
app.include_router(rag_router, prefix="/api/v1")
app.include_router(langgraph_router, prefix="/api/v1")
app.include_router(hitl_router, prefix="/api/v1")
app.include_router(plugin_router, prefix="/api/v1")
app.include_router(integration_router, prefix="/api/v1")


async def get_system_status() -> Dict[str, Any]:
    """Get comprehensive system status"""
    
    # Initialize status
    status = {
        "service": "ai-services",
        "version": "2.0.0",
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "environment": settings.environment.value,
        "modules": {}
    }
    
    # Check LangGraph system
    try:
        langgraph_status = await langgraph_orchestrator.get_workflow_status("root_cause_analysis")
        status["modules"]["langgraph"] = {
            "status": "healthy",
            "workflows_available": 6,
            "workflow_types": [
                "root_cause_analysis",
                "remediation", 
                "iac_generation",
                "incident_response",
                "cost_optimization",
                "security_audit"
            ]
        }
    except Exception as e:
        status["modules"]["langgraph"] = {
            "status": "error",
            "error": str(e)
        }
    
    # Check HITL system
    try:
        hitl_status = await auto_remediation_agent.get_agent_status()
        status["modules"]["hitl"] = {
            "status": "healthy",
            "total_actions": hitl_status["total_actions"],
            "pending_approvals": hitl_status["pending_approvals"],
            "active_executions": hitl_status["active_executions"]
        }
    except Exception as e:
        status["modules"]["hitl"] = {
            "status": "error",
            "error": str(e)
        }
    
    # Check Plugin SDK
    try:
        plugin_status = await plugin_sdk.get_sdk_status()
        status["modules"]["plugin_sdk"] = {
            "status": "healthy",
            "total_plugins": plugin_status["total_plugins"],
            "active_plugins": plugin_status["active_plugins"],
            "marketplace_plugins": plugin_status["marketplace_plugins"]
        }
    except Exception as e:
        status["modules"]["plugin_sdk"] = {
            "status": "error",
            "error": str(e)
        }
    
    # Check RAG system
    try:
        # Initialize RAG system for status check
        rag_system = RAGSystem()
        status["modules"]["rag"] = {
            "status": "healthy",
            "enabled": settings.rag_enabled,
            "vector_size": settings.qdrant_vector_size,
            "collection_name": settings.qdrant_collection_name
        }
    except Exception as e:
        status["modules"]["rag"] = {
            "status": "error",
            "error": str(e)
        }
    
    # Check IaC system
    status["modules"]["iac"] = {
        "status": "healthy",
        "enabled": settings.iac_enabled,
        "providers": settings.iac_providers,
        "validation_enabled": settings.iac_validation_enabled,
        "cost_estimation_enabled": settings.iac_cost_estimation_enabled
    }
    
    return status


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "InfraMind - AI Services",
        "version": "2.0.0",
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "description": "Production-ready AI/ML services for DevOps automation with 28 specialized agents"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ai-services",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "chat": "/api/v1/chat",
            "agents": "/api/v1/agents",
            "iac": "/api/v1/iac",
            "rag": "/api/v1/rag",
            "langgraph": "/api/v1/langgraph",
            "hitl": "/api/v1/hitl",
            "plugins": "/api/v1/plugins",
            "docs": "/docs"
        }
    }


@app.get("/api/v1/status")
async def service_status():
    """Detailed service status with all modules"""
    return await get_system_status()


@app.get("/api/v1/agents/status")
async def agents_status():
    """Get status of all AI agents"""
    
    agent_status = {
        "total_agents": 28,
        "agent_categories": {
            "core_infrastructure": 4,
            "advanced_ai": 4,
            "security_compliance": 3,
            "human_in_loop": 3,
            "git_deployment": 3,
            "analytics_monitoring": 3,
            "mlops": 3,
            "advanced_devops": 2,
            "specialized_devops": 2,
            "chat_interface": 1,
            "specialized_workflows": 2
        },
        "agents": {
            "core_infrastructure": [
                "Cost Optimization Agent",
                "Security Analysis Agent", 
                "Infrastructure Agent",
                "DevOps Automation Agent"
            ],
            "advanced_ai": [
                "Code Generation Agent",
                "Predictive Analytics Agent",
                "Root Cause Analysis Agent",
                "Architecture Design Agent"
            ],
            "security_compliance": [
                "Threat Hunting Agent",
                "Compliance Automation Agent",
                "Zero-Trust Security Agent"
            ],
            "human_in_loop": [
                "Approval Workflow Agent",
                "Risk Assessment Agent",
                "Decision Support Agent"
            ],
            "git_deployment": [
                "Git Integration Agent",
                "Pipeline Generation Agent",
                "Deployment Orchestration Agent"
            ],
            "analytics_monitoring": [
                "Business Intelligence Agent",
                "Anomaly Detection Agent",
                "Capacity Planning Agent"
            ],
            "mlops": [
                "Model Training Agent",
                "Data Pipeline Agent",
                "Model Monitoring Agent"
            ],
            "advanced_devops": [
                "Docker Agent",
                "Kubernetes Agent"
            ],
            "specialized_devops": [
                "Performance Testing Agent",
                "Artifact Management Agent"
            ],
            "chat_interface": [
                "DevOps Chat Agent"
            ],
            "specialized_workflows": [
                "LangGraph Orchestrator",
                "Auto-Remediation Agent"
            ]
        }
    }
    
    return agent_status


@app.get("/api/v1/capabilities")
async def system_capabilities():
    """Get all system capabilities"""
    
    capabilities = {
        "ai_capabilities": [
            "Natural language infrastructure queries",
            "AI-powered cost optimization",
            "Security analysis and compliance",
            "Infrastructure as Code generation",
            "RAG knowledge retrieval system",
            "LangGraph workflow orchestration",
            "Human-in-the-Loop remediation",
            "Plugin SDK and marketplace",
            "Multi-cloud resource management",
            "Real-time monitoring and alerting"
        ],
        "workflow_capabilities": [
            "Root Cause Analysis workflows",
            "Automated remediation workflows",
            "IaC generation workflows",
            "Incident response workflows",
            "Cost optimization workflows",
            "Security audit workflows"
        ],
        "integration_capabilities": [
            "AWS integration",
            "Azure integration", 
            "GCP integration",
            "GitHub/GitLab integration",
            "CI/CD platform integration",
            "Monitoring tool integration"
        ],
        "security_capabilities": [
            "JWT authentication",
            "Role-based access control",
            "Data encryption",
            "Audit logging",
            "Compliance frameworks",
            "Zero-trust security"
        ],
        "plugin_capabilities": [
            "Extensible plugin system",
            "Plugin marketplace",
            "Plugin installation/management",
            "Plugin execution",
            "Plugin configuration"
        ]
    }
    
    return capabilities


@app.get("/api/v1/features")
async def system_features():
    """Get all system features"""
    
    features = {
        "chat": "enabled",
        "agents": "enabled",
        "iac_generation": "enabled",
        "rag_system": "enabled",
        "langgraph_workflows": "enabled",
        "hitl_remediation": "enabled",
        "plugin_sdk": "enabled",
        "cost_optimization": "enabled",
        "security_analysis": "enabled",
        "multi_cloud_support": "enabled",
        "real_time_monitoring": "enabled",
        "predictive_analytics": "enabled",
        "compliance_automation": "enabled",
        "mlops_pipeline": "enabled",
        "container_orchestration": "enabled",
        "git_integration": "enabled",
        "deployment_automation": "enabled"
    }
    
    return features


if __name__ == "__main__":
    logger.info("Starting InfraMind - AI Services")
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug,
        log_level="info"
    ) 