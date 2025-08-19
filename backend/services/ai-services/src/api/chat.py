"""
Chat API endpoints for AI Services
"""

try:
    from fastapi import APIRouter, HTTPException
    from pydantic import BaseModel
    FASTAPI_AVAILABLE = True
except ImportError:
    FASTAPI_AVAILABLE = False
    
    # Mock classes when FastAPI is not available
    class APIRouter:
        def __init__(self, *args, **kwargs):
            pass
        
        def post(self, *args, **kwargs):
            def decorator(func):
                return func
            return decorator
    
    class BaseModel:
        pass
    
    class HTTPException(Exception):
        def __init__(self, status_code, detail):
            self.status_code = status_code
            self.detail = detail

from typing import Dict, Any, Optional, List
import json

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    tenant_id: Optional[str] = None
    params: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    timestamp: str
    context: Optional[str] = None
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    # Extended fields from agent orchestration
    intent: Optional[str] = None
    confidence: Optional[float] = None
    requires_approval: Optional[bool] = None
    actions: Optional[List[Dict[str, Any]]] = None
    suggestions: Optional[List[str]] = None
    agent_type: Optional[str] = None

class ChatDecisionRequest(BaseModel):
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    tenant_id: Optional[str] = None
    reason: Optional[str] = None

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Main chat endpoint for AI conversations"""
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    
    # Route to DevOps Chat Agent so natural language commands can trigger ChatOps
    try:
        from ..agents.chat.devops_chat_agent import DevOpsChatAgent
        agent = DevOpsChatAgent()
        user_id = request.user_id or "anonymous"
        # Pass tenant_id via context for downstream dispatch
        result = await agent.process_message(
            request.message,
            user_id=user_id,
            session_id=request.session_id,
            tenant_id=request.tenant_id,
        )
        return ChatResponse(
            response=result.get('message', ''),
            timestamp=result.get('timestamp', ''),
            context=request.context,
            user_id=user_id,
            session_id=request.session_id,
            intent=result.get('intent'),
            confidence=result.get('confidence'),
            requires_approval=result.get('requires_approval'),
            actions=result.get('actions'),
            suggestions=result.get('suggestions'),
            agent_type=result.get('agent_type'),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

@router.get("/health")
async def chat_health():
    """Health check for chat service"""
    return {"status": "healthy", "service": "chat"}

@router.post("/approve", response_model=ChatResponse)
async def chat_approve_endpoint(request: ChatDecisionRequest):
    """Approve the last pending plan/action in the current chat session."""
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    try:
        from ..agents.chat.devops_chat_agent import DevOpsChatAgent
        agent = DevOpsChatAgent()
        user_id = request.user_id or "anonymous"
        result = await agent.process_message(
            "approve",
            user_id=user_id,
            session_id=request.session_id,
            tenant_id=request.tenant_id,
        )
        return ChatResponse(
            response=result.get('message', ''),
            timestamp=result.get('timestamp', ''),
            context=None,
            user_id=user_id,
            session_id=request.session_id,
            intent=result.get('intent'),
            confidence=result.get('confidence'),
            requires_approval=result.get('requires_approval'),
            actions=result.get('actions'),
            suggestions=result.get('suggestions'),
            agent_type=result.get('agent_type'),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Approval failed: {str(e)}")

@router.post("/cancel", response_model=ChatResponse)
async def chat_cancel_endpoint(request: ChatDecisionRequest):
    """Cancel the last pending plan/action in the current chat session."""
    if not FASTAPI_AVAILABLE:
        return {"error": "FastAPI not available"}
    try:
        from ..agents.chat.devops_chat_agent import DevOpsChatAgent
        agent = DevOpsChatAgent()
        user_id = request.user_id or "anonymous"
        result = await agent.process_message(
            "cancel",
            user_id=user_id,
            session_id=request.session_id,
            tenant_id=request.tenant_id,
        )
        return ChatResponse(
            response=result.get('message', ''),
            timestamp=result.get('timestamp', ''),
            context=None,
            user_id=user_id,
            session_id=request.session_id,
            intent=result.get('intent'),
            confidence=result.get('confidence'),
            requires_approval=result.get('requires_approval'),
            actions=result.get('actions'),
            suggestions=result.get('suggestions'),
            agent_type=result.get('agent_type'),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cancel failed: {str(e)}")