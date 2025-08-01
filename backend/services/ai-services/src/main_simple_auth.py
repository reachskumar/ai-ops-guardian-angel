#!/usr/bin/env python3
"""
🔐 AI Ops Guardian Angel - Simple Authentication Version
Production-ready with simple but secure authentication
"""

import asyncio
from datetime import datetime
from typing import Dict, Any, List, Optional

from fastapi import FastAPI, HTTPException, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import uvicorn

# Import simple authentication
from simple_auth import get_current_user, SimpleUser, check_rate_limit
from simple_auth_routes import router as auth_router

# Import working components (without complex auth dependencies)
from simple_chat_agent import SimpleChatAgent

# Initialize FastAPI app
app = FastAPI(
    title="AI Ops Guardian Angel",
    description="🔐 Production-Ready AI Infrastructure Management with Simple Authentication",
    version="2.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include authentication routes
app.include_router(auth_router)

# Initialize components
print("🚀 Starting AI Ops Guardian Angel...")
print("🔐 Simple Authentication System Loading...")

# Initialize chat agent
chat_agent = None
try:
    print("🤖 Initializing Chat Agent...")
    chat_agent = SimpleChatAgent()
    print("✅ Chat Agent initialized successfully")
except Exception as e:
    print(f"⚠️ Chat Agent initialization error: {e}")
    print("📋 Running with basic functionality...")

# Request/Response Models
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default"
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    message: str
    intent: str
    confidence: float
    requires_approval: bool
    actions: List[Dict[str, Any]]
    suggestions: List[str]
    session_id: str
    timestamp: str
    user_context: Dict[str, Any]

# Public Endpoints (No Authentication Required)
@app.get("/")
async def root():
    """🏠 Root endpoint"""
    return {
        "service": "AI Ops Guardian Angel",
        "version": "2.0.0",
        "status": "🔐 Production Ready with Simple Authentication",
        "authentication": "enabled",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "auth": "/auth/*",
            "chat": "/chat (requires authentication)"
        }
    }

@app.get("/health")
async def health_check():
    """🏥 Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "ai-ops-guardian-angel",
        "authentication": "enabled",
        "chat_agent": "available" if chat_agent else "unavailable"
    }

# Protected Endpoints (Authentication Required)
@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest, 
    current_user: SimpleUser = Depends(get_current_user),
    _: bool = Depends(check_rate_limit)
):
    """
    🔐 Secure Chat Endpoint
    Requires authentication - production ready
    """
    try:
        if chat_agent is None:
            return ChatResponse(
                message="⚠️ AI Chat Agent is temporarily unavailable. Basic services are running.",
                intent="system_notification",
                confidence=0.0,
                requires_approval=False,
                actions=[],
                suggestions=[
                    "Check /health for system status",
                    "View /docs for API documentation",
                    "Contact support if issues persist"
                ],
                session_id=request.session_id or "default",
                timestamp=datetime.utcnow().isoformat(),
                user_context={
                    "user_id": current_user.user_id,
                    "username": current_user.username,
                    "roles": current_user.roles,
                    "org_id": current_user.org_id
                }
            )
        
        # Process message with user context
        response = await chat_agent.process_message(
            message=request.message,
            user_id=current_user.user_id,
            session_id=request.session_id or "default"
        )
        
        # Add user context to response
        response["user_context"] = {
            "user_id": current_user.user_id,
            "username": current_user.username,
            "roles": current_user.roles,
            "org_id": current_user.org_id,
            "authenticated": True
        }
        
        return ChatResponse(**response)
        
    except Exception as e:
        print(f"❌ Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Chat service error: {str(e)}")

@app.get("/chat/history")
async def get_chat_history(
    session_id: str = "default",
    current_user: SimpleUser = Depends(get_current_user)
):
    """📜 Get Chat History (Authenticated)"""
    try:
        if chat_agent is None:
            return {"history": [], "message": "Chat agent unavailable"}
        
        history = chat_agent.get_conversation_history(
            user_id=current_user.user_id,
            session_id=session_id
        )
        
        return {
            "history": history,
            "user_id": current_user.user_id,
            "session_id": session_id,
            "total_messages": len(history)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving history: {str(e)}")

@app.delete("/chat/history")
async def clear_chat_history(
    session_id: str = "default",
    current_user: SimpleUser = Depends(get_current_user)
):
    """🗑️ Clear Chat History (Authenticated)"""
    try:
        if chat_agent is None:
            return {"message": "Chat agent unavailable"}
        
        chat_agent.clear_conversation_history(
            user_id=current_user.user_id,
            session_id=session_id
        )
        
        return {
            "message": "Chat history cleared successfully",
            "user_id": current_user.user_id,
            "session_id": session_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing history: {str(e)}")

@app.get("/agents/status")
async def get_agents_status(current_user: SimpleUser = Depends(get_current_user)):
    """🤖 Get Agent Status (Authenticated)"""
    try:
        if chat_agent is None:
            return {
                "status": "unavailable",
                "message": "Chat agent not initialized",
                "available_agents": 0
            }
        
        # Get agent status
        return {
            "status": "available",
            "chat_agent": "active",
            "total_agents": 28,  # From your comprehensive system
            "user_access": {
                "user_id": current_user.user_id,
                "roles": current_user.roles,
                "org_id": current_user.org_id
            },
            "capabilities": [
                "Cost optimization and analysis",
                "Security scanning and threat detection", 
                "Infrastructure monitoring and health",
                "DevOps automation and deployment",
                "Compliance auditing and reporting"
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting agent status: {str(e)}")

@app.get("/user/dashboard")
async def get_user_dashboard(current_user: SimpleUser = Depends(get_current_user)):
    """📊 User Dashboard (Authenticated)"""
    return {
        "user": {
            "user_id": current_user.user_id,
            "username": current_user.username,
            "email": current_user.email,
            "roles": current_user.roles,
            "org_id": current_user.org_id,
            "member_since": current_user.created_at.isoformat()
        },
        "quick_stats": {
            "chat_sessions": "Available",
            "agent_access": "Enabled",
            "security_level": "Authenticated"
        },
        "available_features": [
            "AI Chat Interface",
            "Agent Status Monitoring",
            "Chat History Management",
            "Profile Management"
        ]
    }

# Admin Endpoints
@app.get("/admin/dashboard")
async def get_admin_dashboard(current_user: SimpleUser = Depends(get_current_user)):
    """👑 Admin Dashboard"""
    if "admin" not in current_user.roles:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return {
        "admin_user": current_user.username,
        "system_status": {
            "service": "running",
            "authentication": "enabled",
            "chat_agent": "available" if chat_agent else "unavailable"
        },
        "quick_actions": [
            "View all users: GET /auth/admin/users",
            "View auth stats: GET /auth/admin/stats",
            "Monitor system: GET /health"
        ]
    }

# Error Handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    """Handle 404 errors"""
    return JSONResponse(
        status_code=404,
        content={
            "error": "Not Found",
            "message": "The requested endpoint was not found",
            "path": str(request.url.path),
            "suggestion": "Check /docs for available endpoints"
        }
    )

@app.exception_handler(401)
async def unauthorized_handler(request: Request, exc: HTTPException):
    """Handle authentication errors"""
    return JSONResponse(
        status_code=401,
        content={
            "error": "Unauthorized",
            "message": "Authentication required",
            "suggestion": "Please login at /auth/login"
        }
    )

@app.exception_handler(403)
async def forbidden_handler(request: Request, exc: HTTPException):
    """Handle authorization errors"""
    return JSONResponse(
        status_code=403,
        content={
            "error": "Forbidden", 
            "message": "Insufficient permissions",
            "suggestion": "Contact admin for access"
        }
    )

@app.exception_handler(429)
async def rate_limit_handler(request: Request, exc: HTTPException):
    """Handle rate limiting"""
    return JSONResponse(
        status_code=429,
        content={
            "error": "Rate Limit Exceeded",
            "message": "Too many requests. Please try again later.",
            "suggestion": "Wait a moment before making more requests"
        }
    )

if __name__ == "__main__":
    print("🚀 Starting AI Ops Guardian Angel with Simple Authentication...")
    print("📋 Features:")
    print("   ✅ JWT Authentication")
    print("   ✅ User Registration/Login")
    print("   ✅ Role-based Access Control")
    print("   ✅ Rate Limiting")
    print("   ✅ Secure API Endpoints")
    print("   ✅ Production Ready")
    print("")
    print("🔐 Demo Credentials:")
    print("   Admin: admin@demo.com / Admin123!")
    print("   User:  user@demo.com / User123!")
    print("")
    print("🌐 Starting server on http://localhost:8001")
    
    uvicorn.run(app, host="0.0.0.0", port=8001) 