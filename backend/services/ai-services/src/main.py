#!/usr/bin/env python3
"""
AI Ops Guardian Angel - Main FastAPI Application
Entry point for the AI-powered infrastructure management platform
"""

import asyncio
import random
import logging
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Dict, Any, List, Optional

# Setup logging
logger = logging.getLogger(__name__)

# Import cloud provider service
from cloud_provider_service import cloud_provider_service

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import uvicorn

# Import the simplified chat agent that works without complex imports
from simple_chat_agent import SimpleChatAgent

# Import the authentication system
from auth import (
    setup_auth_middleware, get_auth_manager, get_current_user, 
    require_permissions, require_roles, require_super_admin, 
    auth_router, AuthUser
)

# Import the multi-tenant system
from multi_tenant_manager import MultiTenantManager, PlanType, UserRole
from tenant_middleware import setup_tenant_middleware, require_quota, TenantAwareResponse
from tenant_middleware import ResourceQuota

# Import the customer success platform
from customer_success_platform import CustomerSuccessPlatform, FeatureFlag, create_usage_event

# Initialize customer success platform
print("📊 Initializing Customer Success & Analytics Platform...")
customer_success = CustomerSuccessPlatform()
print("✅ Customer success platform ready")

# Initialize FastAPI app with enterprise security
app = FastAPI(
    title="AI Ops Guardian Angel",
    description="🔐 Enterprise AI-Powered Infrastructure Management Platform with Comprehensive Security",
    version="2.0.0"
)

# Setup security middleware (order matters - last added = first executed)
app = setup_auth_middleware(app)

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include authentication routes
app.include_router(auth_router)

# Initialize the Simplified Chat Agent
print("🤖 Initializing Simplified DevOps Chat Agent...")
chat_agent = SimpleChatAgent()
print("✅ DevOps Chat Agent initialized successfully")

# Initialize multi-tenant manager
print("🏢 Initializing Multi-Tenant SaaS System...")
tenant_manager = MultiTenantManager()
print("✅ Multi-tenant system ready")

# Initialize cloud connections storage
print("☁️ Initializing Cloud Connections Storage...")
cloud_connections = {}  # In-memory storage for demo
print("✅ Cloud connections storage ready")

# Setup tenant middleware
tenant_middleware = setup_tenant_middleware(app, tenant_manager)

# Add tenant-aware endpoints
@app.get("/tenants/summary")
async def get_tenant_summary(request: Request):
    """Get platform tenant summary (Super Admin only)"""
    tenant_info = getattr(request.state, "tenant_info", {})
    
    # Check if super admin
    user_permissions = tenant_info.get("permissions", [])
    if "manage_platform" not in user_permissions:
        raise HTTPException(status_code=403, detail="Super admin access required")
    
    summary = tenant_manager.get_tenant_summary()
    return TenantAwareResponse.create_response(summary, tenant_info)

@app.post("/tenants/organizations")
async def create_organization(request: Request, org_data: dict):
    """Create a new organization"""
    tenant_info = getattr(request.state, "tenant_info", {})
    
    try:
        org_id = tenant_manager.create_organization(
            name=org_data["name"],
            domain=org_data["domain"], 
            owner_email=org_data["owner_email"],
            plan_type=PlanType(org_data.get("plan_type", "starter"))
        )
        
        return TenantAwareResponse.create_response({
            "org_id": org_id,
            "message": "Organization created successfully"
        }, tenant_info)
        
    except Exception as e:
        return TenantAwareResponse.create_error_response(str(e), 400, tenant_info)

@app.get("/tenants/organizations/{org_id}/analytics")
async def get_organization_analytics(org_id: str, request: Request):
    """Get organization analytics"""
    tenant_info = getattr(request.state, "tenant_info", {})
    
    # Check permissions
    user_permissions = tenant_info.get("permissions", [])
    user_org_id = tenant_info.get("org_id")
    
    # Users can only access their own org analytics unless they're super admin
    if org_id != user_org_id and "manage_platform" not in user_permissions:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if "view_org_analytics" not in user_permissions and "manage_platform" not in user_permissions:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    analytics = tenant_manager.get_organization_analytics(org_id)
    return TenantAwareResponse.create_response(analytics, tenant_info)

@app.post("/tenants/teams")
async def create_team(request: Request, team_data: dict):
    """Create a new team"""
    tenant_info = getattr(request.state, "tenant_info", {})
    user_org_id = tenant_info.get("org_id")
    user_permissions = tenant_info.get("permissions", [])
    
    if "manage_teams" not in user_permissions:
        raise HTTPException(status_code=403, detail="Team management permission required")
    
    try:
        team_id = tenant_manager.create_team(
            org_id=user_org_id,
            name=team_data["name"],
            description=team_data.get("description", ""),
            lead_id=team_data["lead_id"]
        )
        
        return TenantAwareResponse.create_response({
            "team_id": team_id,
            "message": "Team created successfully"
        }, tenant_info)
        
    except Exception as e:
        return TenantAwareResponse.create_error_response(str(e), 400, tenant_info)

@app.get("/tenants/auth/token/{user_id}")
async def generate_access_token(user_id: str, request: Request):
    """Generate access token for user (testing/admin only)"""
    tenant_info = getattr(request.state, "tenant_info", {})
    
    try:
        token = tenant_middleware.generate_access_token(user_id)
        return TenantAwareResponse.create_response({
            "access_token": token,
            "token_type": "bearer",
            "expires_in": 86400  # 24 hours
        }, tenant_info)
        
    except Exception as e:
        return TenantAwareResponse.create_error_response(str(e), 400, tenant_info)

# Pydantic models for chat endpoints
class ChatRequest(BaseModel):
    message: str = Field(..., description="User message")
    user_id: str = Field(..., description="User identifier")
    session_id: Optional[str] = Field(None, description="Session identifier")

class ChatResponse(BaseModel):
    message: str = Field(..., description="AI response")
    intent: Optional[str] = Field(None, description="Detected intent")
    confidence: Optional[float] = Field(None, description="Confidence score")
    requires_approval: bool = Field(False, description="Whether approval is required")
    actions: List[Dict[str, Any]] = Field(default_factory=list, description="Actions to be taken")
    suggestions: List[str] = Field(default_factory=list, description="Follow-up suggestions")
    session_id: Optional[str] = Field(None, description="Session identifier")
    timestamp: str = Field(..., description="Response timestamp")

class ConversationHistoryRequest(BaseModel):
    user_id: str = Field(..., description="User identifier")
    limit: int = Field(10, description="Number of messages to retrieve")

@app.get("/")
async def root():
    """Welcome endpoint"""
    return {
        "message": "🧠 InfraMind - AI-Powered Infrastructure Management Platform",
        "version": "2.0.0",
        "status": "operational",
        "description": "20+ AI Agents for Infrastructure Optimization",
        "docs": "/docs",
        "chat_endpoint": "/chat",
        "capabilities": [
            "Cost optimization and analysis",
            "Security scanning and threat detection",
            "Infrastructure monitoring and health",
            "DevOps automation and deployment",
            "Compliance auditing and reporting",
            "Natural language chat interface"
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "inframind",
        "chat_agent": "available"
    }

@app.get("/debug/cloud-connections")
async def debug_cloud_connections(current_user: AuthUser = Depends(get_current_user)):
    """Debug endpoint to check cloud connections"""
    org_id = current_user.org_id
    connections = cloud_connections.get(org_id, [])
    
    return {
        "org_id": org_id,
        "total_connections": len(connections),
        "connections": connections,
        "cloud_provider_connections": list(cloud_provider_service.connections.keys())
    }

@app.post("/chat")
async def chat_endpoint(request: ChatRequest, http_request: Request, current_user: AuthUser = Depends(get_current_user)):
    """
    🔐 Secure chat endpoint with authentication, multi-tenant support and quota management
    """
    try:
        # Extract tenant information from authenticated user
        org_id = current_user.org_id
        user_id = current_user.user_id
        
        # Check agent execution quota
        if not tenant_manager.check_quota(org_id, ResourceQuota.AGENTS_PER_MONTH):
            raise HTTPException(
                status_code=429,
                detail="Monthly agent execution quota exceeded. Please upgrade your plan."
            )
        
        if chat_agent is None:
            return {
                "message": "⚠️ AI Chat Agent is temporarily unavailable. Basic services are running.",
                "intent": "system_notification",
                "confidence": 0.0,
                "requires_approval": False,
                "actions": [],
                "suggestions": [
                    "Check /agents/status for available agents",
                    "View /docs for API documentation", 
                    "Visit /health for system status"
                ],
                "session_id": request.session_id,
                "timestamp": datetime.utcnow().isoformat(),
                "tenant_context": {
                    "org_id": org_id,
                    "user_id": user_id,
                    "quota_remaining": tenant_manager.organizations[org_id].quotas.get(
                        ResourceQuota.AGENTS_PER_MONTH, 0
                    ) - tenant_manager.organizations[org_id].usage_stats.get(
                        ResourceQuota.AGENTS_PER_MONTH, 0
                    ) if org_id in tenant_manager.organizations else 0
                }
            }
        
        # Process message with tenant context
        response = await chat_agent.process_message(
            message=request.message,
            user_id=user_id,
            session_id=request.session_id
        )
        
        # Consume quota for agent usage
        tenant_manager.consume_quota(org_id, ResourceQuota.AGENTS_PER_MONTH)
        
        # Track usage event for customer success analytics
        try:
            usage_event = create_usage_event(
                org_id=org_id,
                user_id=user_id,
                event_type="agent_execution",
                agent_type=response.get("intent", "unknown"),
                success=response.get("real_execution", True),
                error_message="" if response.get("real_execution", True) else "Simulated response",
                tokens=len(request.message.split()) + len(response.get("message", "").split()),  # Rough token estimate
                cost=0.001,  # Rough cost estimate
                duration_ms=1000,  # Default duration
                confidence=response.get("confidence", 0),
                requires_approval=response.get("requires_approval", False)
            )
            customer_success.track_usage_event(usage_event)
        except Exception as e:
            print(f"Warning: Could not track usage event: {e}")
        
        # Add tenant context to response
        response["tenant_context"] = {
            "org_id": org_id,
            "user_id": user_id,
            "quota_consumed": 1,
            "quota_remaining": tenant_manager.organizations[org_id].quotas.get(
                ResourceQuota.AGENTS_PER_MONTH, 0
            ) - tenant_manager.organizations[org_id].usage_stats.get(
                ResourceQuota.AGENTS_PER_MONTH, 0
            ) if org_id in tenant_manager.organizations else 0
        }
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chat/history")
async def get_conversation_history(user_id: str, limit: int = 10):
    """
    Get conversation history for a user
    """
    try:
        history = await chat_agent.get_conversation_history(user_id, limit)
        return {
            "history": history,
            "total_messages": len(history)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving conversation history: {str(e)}"
        )

@app.delete("/chat/history")
async def clear_conversation_history(user_id: str):
    """
    Clear conversation history for a user
    """
    try:
        success = await chat_agent.clear_conversation_history(user_id)
        return {
            "success": success,
            "message": "Conversation history cleared successfully" if success else "Failed to clear conversation history"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error clearing conversation history: {str(e)}"
        )

@app.get("/chat/capabilities")
async def get_chat_capabilities():
    """
    Get available chat capabilities and supported intents
    """
    return {
        "capabilities": [
            {
                "intent": "cost_analysis",
                "description": "Analyze cloud costs and find optimization opportunities",
                "examples": [
                    "Show me my AWS costs",
                    "Analyze cloud spending",
                    "Find cost savings opportunities"
                ]
            },
            {
                "intent": "security_scan",
                "description": "Scan for security vulnerabilities and threats",
                "examples": [
                    "Run a security scan",
                    "Check for vulnerabilities",
                    "Scan for threats"
                ]
            },
            {
                "intent": "deployment",
                "description": "Deploy applications and manage releases",
                "examples": [
                    "Deploy to staging",
                    "Release to production",
                    "Run deployment pipeline"
                ]
            },
            {
                "intent": "infrastructure",
                "description": "Monitor and manage infrastructure",
                "examples": [
                    "Check infrastructure health",
                    "Scale up resources",
                    "Monitor system performance"
                ]
            },
            {
                "intent": "monitoring",
                "description": "Monitor applications and systems",
                "examples": [
                    "Show me system metrics",
                    "Check application performance",
                    "Monitor logs"
                ]
            },
            {
                "intent": "compliance",
                "description": "Check compliance and run audits",
                "examples": [
                    "Run compliance check",
                    "Generate audit report",
                    "Check SOC2 compliance"
                ]
            },
            {
                "intent": "troubleshooting",
                "description": "Debug issues and problems",
                "examples": [
                    "Troubleshoot deployment issue",
                    "Debug performance problem",
                    "Fix error in logs"
                ]
            },
            {
                "intent": "reporting",
                "description": "Generate reports and analytics",
                "examples": [
                    "Generate cost report",
                    "Show security dashboard",
                    "Create performance summary"
                ]
            }
        ],
        "general_queries": "You can also ask general DevOps questions and get helpful answers",
        "approval_workflow": "High-risk actions automatically trigger approval workflows",
        "context_preservation": "The chat maintains context across multiple messages"
    }

@app.get("/agents/status")
async def get_agents_status():
    """
    Get status of all AI agents
    """
    return {
        "total_agents": 28,
        "chat_agent": {
            "status": "active",
            "capabilities": [
                "Natural language intent detection",
                "Multi-agent routing and coordination", 
                "Cost analysis and optimization",
                "Security scanning and monitoring",
                "Infrastructure management",
                "DevOps automation assistance"
            ],
            "description": chat_agent.description
        },
        "agent_categories": {
            "core_infrastructure": [
                "Cost Optimization Agent",
                "Security Analysis Agent", 
                "Infrastructure Intelligence Agent",
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
                "Artifact Management Agent",
                "Performance Testing Agent"
            ]
        },
        "agent_count_by_category": {
            "core_infrastructure": 4,
            "advanced_ai": 4,
            "security_compliance": 3,
            "human_in_loop": 3,
            "git_deployment": 3,
            "analytics_monitoring": 3,
            "mlops": 3,
            "advanced_devops": 2,
            "specialized_devops": 2,
            "chat_interface": 1
        }
    }

# Add new endpoints after the existing chat endpoints

@app.get("/workflows/available")
async def get_available_workflows(current_user: AuthUser = Depends(get_current_user)):
    """🔐 Get all available workflow templates (authenticated)"""
    try:
        if chat_agent is None:
            return {"error": "Chat agent not available"}
        
        workflows = chat_agent.get_available_workflows()
        return workflows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/workflows/start")
async def start_workflow(request: dict, http_request: Request, current_user: AuthUser = Depends(get_current_user)):
    """🔐 Start a new workflow with authentication and tenant quota management"""
    try:
        # Extract tenant information from authenticated user
        org_id = current_user.org_id
        user_id = current_user.user_id
        
        # Check workflow quota
        if not tenant_manager.check_quota(org_id, ResourceQuota.WORKFLOWS_PER_MONTH):
            raise HTTPException(
                status_code=429,
                detail="Monthly workflow quota exceeded. Please upgrade your plan."
            )
        
        # Check concurrent workflow quota
        if not tenant_manager.check_quota(org_id, ResourceQuota.CONCURRENT_WORKFLOWS):
            raise HTTPException(
                status_code=429,
                detail="Maximum concurrent workflows reached. Please wait for others to complete."
            )
        
        if chat_agent is None:
            return {"error": "Chat agent not available"}
        
        workflow_type = request.get("workflow_type")
        message = request.get("message", "")
        
        if not workflow_type:
            raise HTTPException(status_code=400, detail="workflow_type is required")
        
        # Import WorkflowType
        from workflow_orchestrator import WorkflowType
        
        # Convert string to WorkflowType enum
        try:
            workflow_enum = WorkflowType(workflow_type)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid workflow_type: {workflow_type}")
        
        result = await chat_agent.workflow_orchestrator.start_workflow(
            workflow_enum, user_id, message
        )
        
        # Consume quotas
        tenant_manager.consume_quota(org_id, ResourceQuota.WORKFLOWS_PER_MONTH)
        tenant_manager.consume_quota(org_id, ResourceQuota.CONCURRENT_WORKFLOWS)
        
        # Add tenant context
        result["tenant_context"] = {
            "org_id": org_id,
            "user_id": user_id,
            "workflow_quota_remaining": tenant_manager.organizations[org_id].quotas.get(
                ResourceQuota.WORKFLOWS_PER_MONTH, 0
            ) - tenant_manager.organizations[org_id].usage_stats.get(
                ResourceQuota.WORKFLOWS_PER_MONTH, 0
            ) if org_id in tenant_manager.organizations else 0
        }
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/workflows/{workflow_id}/status")
async def get_workflow_status(workflow_id: str):
    """Get workflow status"""
    try:
        if chat_agent is None:
            return {"error": "Chat agent not available"}
        
        status = chat_agent.get_workflow_status(workflow_id)
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/workflows/{workflow_id}/continue")
async def continue_workflow(workflow_id: str, request: dict = None):
    """Continue a paused workflow"""
    try:
        if chat_agent is None:
            return {"error": "Chat agent not available"}
        
        message = request.get("message", "") if request else ""
        result = await chat_agent.continue_workflow(workflow_id, message)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/workflows/{workflow_id}/pause")
async def pause_workflow(workflow_id: str):
    """Pause a running workflow"""
    try:
        if chat_agent is None:
            return {"error": "Chat agent not available"}
        
        result = chat_agent.workflow_orchestrator.pause_workflow(workflow_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sessions/{user_id}/insights")
async def get_user_insights(user_id: str, http_request: Request):
    """Get user behavior insights and analytics (tenant-aware)"""
    try:
        # Get tenant info
        tenant_info = getattr(http_request.state, "tenant_info", {})
        requesting_user_id = tenant_info.get("user_id")
        org_id = tenant_info.get("org_id")
        user_permissions = tenant_info.get("permissions", [])
        
        # Check if user can access insights for the requested user
        can_access = (
            user_id == requesting_user_id or  # Own insights
            "view_org_analytics" in user_permissions or  # Org analytics permission
            "manage_teams" in user_permissions  # Team management permission
        )
        
        if not can_access:
            raise HTTPException(status_code=403, detail="Access denied to user insights")
        
        if chat_agent is None:
            return {"error": "Chat agent not available"}
        
        insights = chat_agent.get_user_insights(user_id)
        
        # Add organization context
        if org_id in tenant_manager.organizations:
            org = tenant_manager.organizations[org_id]
            insights["organization_context"] = {
                "org_name": org.name,
                "plan_type": org.plan_type.value,
                "quota_utilization": {
                    "agents_used": org.usage_stats.get(ResourceQuota.AGENTS_PER_MONTH, 0),
                    "agents_limit": org.quotas.get(ResourceQuota.AGENTS_PER_MONTH, 0),
                    "workflows_used": org.usage_stats.get(ResourceQuota.WORKFLOWS_PER_MONTH, 0),
                    "workflows_limit": org.quotas.get(ResourceQuota.WORKFLOWS_PER_MONTH, 0)
                }
            }
        
        return TenantAwareResponse.create_response(insights, tenant_info)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sessions/{user_id}/history")
async def get_session_history(user_id: str, session_id: str = None, limit: int = 10, http_request: Request = None):
    """Get conversation history for user session (tenant-aware)"""
    try:
        # Get tenant info
        tenant_info = getattr(http_request.state, "tenant_info", {})
        requesting_user_id = tenant_info.get("user_id")
        user_permissions = tenant_info.get("permissions", [])
        
        # Check access permissions
        can_access = (
            user_id == requesting_user_id or  # Own history
            "view_org_analytics" in user_permissions or  # Org analytics permission
            "manage_teams" in user_permissions  # Team management permission
        )
        
        if not can_access:
            raise HTTPException(status_code=403, detail="Access denied to user history")
        
        if chat_agent is None:
            return {"error": "Chat agent not available"}
        
        history = await chat_agent.get_conversation_history(user_id, session_id, limit)
        
        return TenantAwareResponse.create_response({
            "history": history, 
            "user_id": user_id, 
            "session_id": session_id
        }, tenant_info)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/sessions/{user_id}/history")
async def clear_session_history(user_id: str, session_id: str = None, http_request: Request = None):
    """Clear conversation history for user session (tenant-aware)"""
    try:
        # Get tenant info
        tenant_info = getattr(http_request.state, "tenant_info", {})
        requesting_user_id = tenant_info.get("user_id")
        user_permissions = tenant_info.get("permissions", [])
        
        # Check permissions - stricter for deletion
        can_delete = (
            user_id == requesting_user_id or  # Own history
            "manage_org" in user_permissions or  # Org management permission
            "manage_teams" in user_permissions  # Team management permission
        )
        
        if not can_delete:
            raise HTTPException(status_code=403, detail="Access denied to clear user history")
        
        if chat_agent is None:
            return {"error": "Chat agent not available"}
        
        cleared = await chat_agent.clear_conversation_history(user_id, session_id)
        
        return TenantAwareResponse.create_response({
            "cleared": cleared, 
            "user_id": user_id, 
            "session_id": session_id,
            "message": "History cleared successfully" if cleared else "No history to clear"
        }, tenant_info)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add customer success endpoints
@app.get("/customer-success/onboarding/{org_id}")
async def get_onboarding_status(org_id: str, request: Request):
    """Get onboarding status and next steps for organization"""
    tenant_info = getattr(request.state, "tenant_info", {})
    
    status = customer_success.get_onboarding_status(org_id)
    return TenantAwareResponse.create_response(status, tenant_info)

@app.post("/customer-success/onboarding/{org_id}/initialize")
async def initialize_customer_onboarding(org_id: str, request: Request, init_data: dict):
    """Initialize customer onboarding and feature flags"""
    tenant_info = getattr(request.state, "tenant_info", {})
    
    plan_type = init_data.get("plan_type", "starter")
    result = customer_success.initialize_customer(org_id, plan_type)
    
    return TenantAwareResponse.create_response(result, tenant_info)

@app.get("/customer-success/features/{org_id}")
async def get_feature_flags(org_id: str, request: Request):
    """Get current feature flags for organization"""
    tenant_info = getattr(request.state, "tenant_info", {})
    
    features = customer_success.get_feature_flags(org_id)
    return TenantAwareResponse.create_response({
        "org_id": org_id,
        "features": features,
        "total_features": len(features),
        "enabled_features": sum(1 for enabled in features.values() if enabled)
    }, tenant_info)

@app.post("/customer-success/features/{org_id}/{feature}")
async def toggle_feature_flag(org_id: str, feature: str, request: Request, toggle_data: dict):
    """Enable/disable a feature flag for organization"""
    tenant_info = getattr(request.state, "tenant_info", {})
    
    try:
        feature_enum = FeatureFlag(feature)
        enabled = toggle_data.get("enabled", True)
        
        result = customer_success.update_feature_flag(org_id, feature_enum, enabled)
        return TenantAwareResponse.create_response(result, tenant_info)
        
    except ValueError:
        return TenantAwareResponse.create_error_response(
            f"Invalid feature flag: {feature}", 400, tenant_info
        )

@app.post("/customer-success/features/rollout")
async def rollout_feature(request: Request, rollout_data: dict):
    """Gradually roll out a feature to percentage of customers"""
    tenant_info = getattr(request.state, "tenant_info", {})
    
    # Require admin permissions
    if "manage_platform" not in tenant_info.get("permissions", []):
        raise HTTPException(status_code=403, detail="Platform admin access required")
    
    try:
        feature = FeatureFlag(rollout_data["feature"])
        percentage = rollout_data.get("percentage", 10)
        target_plan = rollout_data.get("target_plan")
        
        result = customer_success.rollout_feature_gradually(feature, percentage, target_plan)
        return TenantAwareResponse.create_response(result, tenant_info)
        
    except ValueError as e:
        return TenantAwareResponse.create_error_response(str(e), 400, tenant_info)

@app.get("/customer-success/analytics/{org_id}")
async def get_usage_analytics(org_id: str, days: int = 30, request: Request = None):
    """Get comprehensive usage analytics for organization"""
    tenant_info = getattr(request.state, "tenant_info", {})
    
    # Check permissions
    user_org_id = tenant_info.get("org_id")
    user_permissions = tenant_info.get("permissions", [])
    
    if org_id != user_org_id and "manage_platform" not in user_permissions:
        raise HTTPException(status_code=403, detail="Access denied")
    
    analytics = customer_success.get_usage_analytics(org_id, days)
    return TenantAwareResponse.create_response(analytics, tenant_info)

@app.get("/customer-success/insights/{org_id}")
async def get_customer_insights(org_id: str, request: Request):
    """Get customer health insights and recommendations"""
    tenant_info = getattr(request.state, "tenant_info", {})
    
    # Check permissions
    user_org_id = tenant_info.get("org_id")
    user_permissions = tenant_info.get("permissions", [])
    
    if org_id != user_org_id and "manage_platform" not in user_permissions:
        raise HTTPException(status_code=403, detail="Access denied")
    
    insights = customer_success.get_customer_insights(org_id)
    return TenantAwareResponse.create_response(insights, tenant_info)

@app.get("/customer-success/platform/insights")
async def get_platform_insights(request: Request):
    """Get platform-wide customer success insights (Admin only)"""
    tenant_info = getattr(request.state, "tenant_info", {})
    
    # Require platform admin permissions
    if "manage_platform" not in tenant_info.get("permissions", []):
        raise HTTPException(status_code=403, detail="Platform admin access required")
    
    insights = customer_success.get_platform_insights()
    return TenantAwareResponse.create_response(insights, tenant_info)

@app.post("/customer-success/track-usage")
async def track_usage_event(request: Request, usage_data: dict):
    """Track a usage event for analytics (Internal API)"""
    tenant_info = getattr(request.state, "tenant_info", {})
    
    try:
        event = create_usage_event(
            org_id=usage_data["org_id"],
            user_id=usage_data["user_id"],
            event_type=usage_data["event_type"],
            agent_type=usage_data.get("agent_type", ""),
            success=usage_data.get("success", True),
            error_message=usage_data.get("error_message", ""),
            tokens=usage_data.get("tokens", 0),
            cost=usage_data.get("cost", 0.0),
            **usage_data.get("metadata", {})
        )
        
        customer_success.track_usage_event(event)
        
        return TenantAwareResponse.create_response({
            "tracked": True,
            "event_type": event.event_type,
            "timestamp": event.timestamp.isoformat()
        }, tenant_info)
        
    except KeyError as e:
        return TenantAwareResponse.create_error_response(
            f"Missing required field: {e}", 400, tenant_info
        )

# Cloud Provider Management Routes
@app.post("/cloud/providers/connect")
async def connect_cloud_provider(
    request: dict,
    current_user: AuthUser = Depends(get_current_user)
):
    """Connect a cloud provider for the current user's organization"""
    try:
        provider = request.get("provider")
        credentials = request.get("credentials")
        account_name = request.get("account_name", f"{provider}_account")
        
        if not provider or not credentials:
            raise HTTPException(status_code=400, detail="Provider and credentials are required")
        
        # Use real cloud provider service
        if provider == "aws":
            access_key = credentials.get("access_key_id")
            secret_key = credentials.get("secret_access_key")
            region = credentials.get("region", "us-east-1")
            
            if not access_key or not secret_key:
                raise HTTPException(status_code=400, detail="AWS access_key_id and secret_access_key are required")
            
            result = cloud_provider_service.connect_aws_provider(access_key, secret_key, region, account_name)
            
        elif provider == "azure":
            subscription_id = credentials.get("subscription_id")
            client_id = credentials.get("client_id")
            client_secret = credentials.get("client_secret")
            tenant_id = credentials.get("tenant_id")
            
            if not all([subscription_id, client_id, client_secret, tenant_id]):
                raise HTTPException(status_code=400, detail="Azure subscription_id, client_id, client_secret, and tenant_id are required")
            
            result = cloud_provider_service.connect_azure_provider(subscription_id, client_id, client_secret, tenant_id, account_name)
            
        elif provider == "gcp":
            service_account_key = credentials.get("service_account_key")
            
            if not service_account_key:
                raise HTTPException(status_code=400, detail="GCP service_account_key is required")
            
            result = cloud_provider_service.connect_gcp_provider(service_account_key, account_name)
            
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")
        
        if not result["success"]:
            logger.error(f"Cloud provider connection failed: {result['error']}")
            raise HTTPException(status_code=400, detail=result["error"])
        
        # Store connection info for organization
        connection_info = {
            "connection_id": result["connection_id"],
            "provider": provider,
            "account_name": account_name,
            "status": "connected",
            "connected_at": datetime.utcnow().isoformat(),
            "org_id": current_user.org_id,
            "user_id": current_user.user_id,
            "account_id": result.get("account_id") or result.get("subscription_id") or result.get("project_id"),
            "regions": cloud_provider_service.connections[result["connection_id"]]["regions"],
            "services": cloud_provider_service.connections[result["connection_id"]]["services"]
        }
        
        # Store in cloud connections storage
        if current_user.org_id not in cloud_connections:
            cloud_connections[current_user.org_id] = []
        cloud_connections[current_user.org_id].append(connection_info)
        logger.info(f"Stored connection {connection_info['connection_id']} for org {current_user.org_id}")
        logger.info(f"Total connections for org {current_user.org_id}: {len(cloud_connections[current_user.org_id])}")
        
        return {
            "success": True,
            "message": result["message"],
            "connection": connection_info
        }
    except Exception as e:
        logger.error(f"Cloud provider connection failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cloud/providers")
async def get_cloud_providers(current_user: AuthUser = Depends(get_current_user)):
    """Get connected cloud providers for the current user's organization"""
    try:
        org_id = current_user.org_id
        
        # Get connections from cloud connections storage
        connections = cloud_connections.get(org_id, [])
        logger.info(f"Found {len(connections)} connections for org {org_id}")
        
        # Group by provider
        providers = {}
        for connection in connections:
            provider = connection["provider"]
            if provider not in providers:
                providers[provider] = {
                    "provider": provider,
                    "name": get_provider_name(provider),
                    "status": "connected",
                    "accounts": []
                }
            providers[provider]["accounts"].append({
                "id": connection["connection_id"],
                "name": connection["account_name"],
                "status": connection["status"],
                "connected_at": connection["connected_at"]
            })
        
        logger.info(f"Returning {len(providers)} providers: {list(providers.keys())}")
        return {
            "success": True,
            "providers": list(providers.values())
        }
    except Exception as e:
        logger.error(f"Failed to get cloud providers: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cloud/resources/{provider}")
async def get_cloud_resources(
    provider: str,
    current_user: AuthUser = Depends(get_current_user)
):
    """Get cloud resources for a specific provider"""
    try:
        org_id = current_user.org_id
        
        # Get connections for this provider
        connections = cloud_connections.get(org_id, [])
        provider_connections = [c for c in connections if c["provider"] == provider]
        
        resources = []
        
        # Get real resources from cloud provider service
        for connection in provider_connections:
            connection_id = connection["connection_id"]
            
            if provider == "aws":
                resources.extend(cloud_provider_service.get_aws_resources(connection_id))
            elif provider == "azure":
                resources.extend(cloud_provider_service.get_azure_resources(connection_id))
            elif provider == "gcp":
                resources.extend(cloud_provider_service.get_gcp_resources(connection_id))
        
        # If no real connections, generate mock resources for demo
        if not resources:
            resources = generate_mock_resources(provider, 1)
        
        return {
            "success": True,
            "provider": provider,
            "resources": resources,
            "total_count": len(resources)
        }
    except Exception as e:
        logger.error(f"Failed to get cloud resources: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cloud/providers/test")
async def test_cloud_connection(
    request: dict,
    current_user: AuthUser = Depends(get_current_user)
):
    """Test cloud provider credentials"""
    try:
        provider = request.get("provider")
        credentials = request.get("credentials")
        
        if not provider or not credentials:
            raise HTTPException(status_code=400, detail="Provider and credentials are required")
        
        # Use real cloud provider service for validation
        if provider == "aws":
            access_key = credentials.get("access_key_id")
            secret_key = credentials.get("secret_access_key")
            region = credentials.get("region", "us-east-1")
            
            if not access_key or not secret_key:
                raise HTTPException(status_code=400, detail="AWS access_key_id and secret_access_key are required")
            
            validation_result = cloud_provider_service.validate_aws_credentials(access_key, secret_key, region)
            
        elif provider == "azure":
            subscription_id = credentials.get("subscription_id")
            client_id = credentials.get("client_id")
            client_secret = credentials.get("client_secret")
            tenant_id = credentials.get("tenant_id")
            
            if not all([subscription_id, client_id, client_secret, tenant_id]):
                raise HTTPException(status_code=400, detail="Azure subscription_id, client_id, client_secret, and tenant_id are required")
            
            validation_result = cloud_provider_service.validate_azure_credentials(subscription_id, client_id, client_secret, tenant_id)
            
        elif provider == "gcp":
            service_account_key = credentials.get("service_account_key")
            
            if not service_account_key:
                raise HTTPException(status_code=400, detail="GCP service_account_key is required")
            
            validation_result = cloud_provider_service.validate_gcp_credentials(service_account_key)
            
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")
        
        return {
            "success": True,
            "valid": validation_result.get("valid", False),
            "details": validation_result
        }
    except Exception as e:
        logger.error(f"Cloud connection test failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Helper functions
def get_provider_regions(provider: str) -> list:
    """Get available regions for a cloud provider"""
    regions = {
        "aws": ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"],
        "azure": ["eastus", "westus2", "westeurope", "southeastasia"],
        "gcp": ["us-central1", "europe-west1", "asia-southeast1"],
        "oci": ["us-ashburn-1", "us-phoenix-1", "eu-frankfurt-1"]
    }
    return regions.get(provider, [])

def get_provider_services(provider: str) -> list:
    """Get available services for a cloud provider"""
    services = {
        "aws": ["EC2", "S3", "RDS", "Lambda", "ECS", "EKS"],
        "azure": ["Virtual Machines", "Blob Storage", "SQL Database", "Functions", "AKS"],
        "gcp": ["Compute Engine", "Cloud Storage", "Cloud SQL", "Cloud Functions", "GKE"],
        "oci": ["Compute", "Object Storage", "Database", "Functions", "OKE"]
    }
    return services.get(provider, [])

def get_provider_name(provider: str) -> str:
    """Get display name for a cloud provider"""
    names = {
        "aws": "Amazon Web Services",
        "azure": "Microsoft Azure", 
        "gcp": "Google Cloud Platform",
        "oci": "Oracle Cloud Infrastructure"
    }
    return names.get(provider, provider.upper())

def generate_mock_resources(provider: str, account_count: int) -> list:
    """Generate mock cloud resources"""
    resources = []
    resource_types = {
        "aws": ["EC2 Instance", "S3 Bucket", "RDS Database", "Lambda Function"],
        "azure": ["Virtual Machine", "Storage Account", "SQL Database", "Function App"],
        "gcp": ["Compute Instance", "Cloud Storage", "Cloud SQL", "Cloud Function"],
        "oci": ["Compute Instance", "Object Storage", "Database", "Function"]
    }
    
    types = resource_types.get(provider, ["Resource"])
    
    for i in range(account_count * 3):  # 3 resources per account
        resource_type = types[i % len(types)]
        resources.append({
            "id": f"{provider}-{resource_type.lower().replace(' ', '-')}-{i}",
            "name": f"{resource_type} {i+1}",
            "type": resource_type,
            "provider": provider,
            "region": get_provider_regions(provider)[i % len(get_provider_regions(provider))],
            "status": "running" if i % 3 != 0 else "stopped",
            "cost": round(random.uniform(10, 500), 2),
            "tags": {
                "Environment": "production" if i % 2 == 0 else "development",
                "Project": f"project-{i % 5 + 1}"
            }
        })
    
    return resources

def validate_cloud_credentials(provider: str, credentials: dict) -> dict:
    """Validate cloud provider credentials"""
    # Mock validation - in real implementation, use cloud SDKs
    required_fields = {
        "aws": ["access_key_id", "secret_access_key"],
        "azure": ["subscription_id", "client_id", "client_secret", "tenant_id"],
        "gcp": ["service_account_key"],
        "oci": ["tenancy_ocid", "user_ocid", "fingerprint", "private_key"]
    }
    
    required = required_fields.get(provider, [])
    missing = [field for field in required if field not in credentials]
    
    if missing:
        return {
            "valid": False,
            "message": f"Missing required credentials: {', '.join(missing)}"
        }
    
    return {
        "valid": True,
        "message": f"Credentials validated successfully for {provider}",
        "details": {
            "provider": provider,
            "account_info": f"demo-{provider}-account"
        }
    }

if __name__ == "__main__":
    print("🚀 Starting AI Ops Guardian Angel")
    print("🛡️ 28 AI Agents Ready for Infrastructure Optimization")
    print("💬 DevOps Chat Agent Available at /chat")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    ) 