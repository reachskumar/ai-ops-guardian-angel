from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uvicorn
import json
from datetime import datetime

app = FastAPI(title="AI Services", version="2.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class ChatRequest(BaseModel):
    message: str
    agent_type: Optional[str] = "general"
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    agent_type: str
    timestamp: str
    confidence: float

# Mock AI responses
MOCK_RESPONSES = {
    "cost_optimization": {
        "response": "I can help you optimize your cloud costs! Based on your current usage, I recommend: 1) Right-sizing EC2 instances, 2) Using Reserved Instances for predictable workloads, 3) Implementing auto-scaling policies. Would you like me to analyze your specific resources?",
        "confidence": 0.95
    },
    "security": {
        "response": "I've detected several security concerns in your infrastructure: 1) Unencrypted S3 buckets, 2) Missing IAM policies, 3) Open security groups. I recommend immediate action on these items. Would you like me to provide specific remediation steps?",
        "confidence": 0.92
    },
    "infrastructure": {
        "response": "Your infrastructure analysis shows: 1) 15 EC2 instances running, 2) 3 RDS databases, 3) 8 S3 buckets. I can help you optimize resource allocation and improve performance. What specific area would you like to focus on?",
        "confidence": 0.88
    },
    "general": {
        "response": "Hello! I'm your AI assistant for cloud operations. I can help with cost optimization, security analysis, infrastructure management, and more. How can I assist you today?",
        "confidence": 0.85
    }
}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ai-services",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0"
    }

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        agent_type = request.agent_type or "general"
        
        # Get mock response based on agent type
        if agent_type in MOCK_RESPONSES:
            mock_data = MOCK_RESPONSES[agent_type]
        else:
            mock_data = MOCK_RESPONSES["general"]
        
        response = ChatResponse(
            response=mock_data["response"],
            agent_type=agent_type,
            timestamp=datetime.now().isoformat(),
            confidence=mock_data["confidence"]
        )
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/agents")
async def get_agents():
    return {
        "agents": [
            {
                "id": "cost_optimization",
                "name": "Cost Optimization Agent",
                "description": "Helps optimize cloud costs and identify savings opportunities",
                "status": "active"
            },
            {
                "id": "security",
                "name": "Security Analysis Agent", 
                "description": "Analyzes security posture and identifies vulnerabilities",
                "status": "active"
            },
            {
                "id": "infrastructure",
                "name": "Infrastructure Agent",
                "description": "Manages and optimizes infrastructure resources",
                "status": "active"
            },
            {
                "id": "general",
                "name": "General Assistant",
                "description": "General AI assistant for cloud operations",
                "status": "active"
            }
        ]
    }

@app.get("/")
async def root():
    return {
        "message": "AI Services API",
        "version": "2.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "chat": "/chat",
            "agents": "/agents"
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001) 