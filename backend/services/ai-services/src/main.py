#!/usr/bin/env python3
"""
AI Ops Guardian Angel - AI Services
Production-ready AI/ML services for DevOps automation
"""

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import logging
import asyncio
from datetime import datetime

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

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="AI Ops Guardian Angel - AI Services",
    description="Production-ready AI/ML services for DevOps automation",
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

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI Ops Guardian Angel - AI Services",
        "version": "2.0.0",
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
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
    """Detailed service status"""
    return {
        "service": "ai-services",
        "version": "2.0.0",
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "features": {
            "chat": "enabled",
            "agents": "enabled",
            "iac_generation": "enabled",
            "rag_system": "enabled",
            "langgraph_workflows": "enabled",
            "hitl_remediation": "enabled",
            "plugin_sdk": "enabled",
            "cost_optimization": "enabled",
            "security_analysis": "enabled"
        },
        "capabilities": [
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
        ]
    }

if __name__ == "__main__":
    logger.info("Starting AI Ops Guardian Angel - AI Services")
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug,
        log_level="info"
    ) 