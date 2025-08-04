"""
LangGraph API Endpoints
Production-grade API endpoints for AI assistant workflows
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import logging
import asyncio
from datetime import datetime

from ..agents.langgraph.langgraph_orchestrator import langgraph_orchestrator, WorkflowType

router = APIRouter(prefix="/langgraph", tags=["LangGraph Workflows"])

logger = logging.getLogger(__name__)


class WorkflowRequest(BaseModel):
    """Request model for workflow execution"""
    workflow_type: str = Field(..., description="Type of workflow to execute")
    user_message: str = Field(..., description="User message/query")
    context: Dict[str, Any] = Field(default_factory=dict, description="Additional context")
    auto_approve: bool = Field(default=False, description="Auto-approve actions")


class WorkflowResponse(BaseModel):
    """Response model for workflow execution"""
    success: bool
    workflow_type: str
    results: Dict[str, Any]
    tools_used: List[str]
    messages: List[str]
    execution_time: float
    timestamp: datetime


class WorkflowStatusResponse(BaseModel):
    """Response model for workflow status"""
    workflow_type: str
    available: bool
    description: str
    tools_available: List[str]
    status: str


class WorkflowListResponse(BaseModel):
    """Response model for available workflows"""
    workflows: List[WorkflowStatusResponse]
    total_workflows: int


@router.post("/execute", response_model=WorkflowResponse)
async def execute_workflow(request: WorkflowRequest) -> WorkflowResponse:
    """
    Execute a LangGraph workflow
    
    - **workflow_type**: Type of workflow (root_cause_analysis, remediation, iac_generation, etc.)
    - **user_message**: User's query or message
    - **context**: Additional context data
    - **auto_approve**: Whether to auto-approve actions
    """
    try:
        start_time = datetime.now()
        
        # Validate workflow type
        try:
            workflow_type = WorkflowType(request.workflow_type)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid workflow type. Available types: {[wt.value for wt in WorkflowType]}"
            )
        
        # Add auto_approve to context
        context = request.context.copy()
        context["auto_approve"] = request.auto_approve
        
        # Execute workflow
        result = await langgraph_orchestrator.execute_workflow(
            workflow_type=workflow_type,
            initial_context=context,
            user_message=request.user_message
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        execution_time = (datetime.now() - start_time).total_seconds()
        
        return WorkflowResponse(
            success=result["success"],
            workflow_type=result["workflow_type"],
            results=result["results"],
            tools_used=result["tools_used"],
            messages=result["messages"],
            execution_time=execution_time,
            timestamp=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"Workflow execution failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Workflow execution failed: {str(e)}")


@router.get("/workflows", response_model=WorkflowListResponse)
async def list_workflows() -> WorkflowListResponse:
    """
    Get list of available workflows
    """
    try:
        workflows = []
        
        for workflow_type in WorkflowType:
            status = await langgraph_orchestrator.get_workflow_status(workflow_type)
            workflows.append(WorkflowStatusResponse(**status))
        
        return WorkflowListResponse(
            workflows=workflows,
            total_workflows=len(workflows)
        )
        
    except Exception as e:
        logger.error(f"Failed to list workflows: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list workflows: {str(e)}")


@router.get("/workflows/{workflow_type}", response_model=WorkflowStatusResponse)
async def get_workflow_status(workflow_type: str) -> WorkflowStatusResponse:
    """
    Get status of a specific workflow
    
    - **workflow_type**: Type of workflow to check
    """
    try:
        try:
            wt = WorkflowType(workflow_type)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid workflow type: {workflow_type}"
            )
        
        status = await langgraph_orchestrator.get_workflow_status(wt)
        return WorkflowStatusResponse(**status)
        
    except Exception as e:
        logger.error(f"Failed to get workflow status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get workflow status: {str(e)}")


@router.post("/rca", response_model=WorkflowResponse)
async def execute_root_cause_analysis(request: WorkflowRequest) -> WorkflowResponse:
    """
    Execute Root Cause Analysis workflow
    
    - **user_message**: Description of the incident
    - **context**: Incident data, logs, metrics
    """
    try:
        start_time = datetime.now()
        
        # Set workflow type
        request.workflow_type = "root_cause_analysis"
        
        # Execute workflow
        result = await langgraph_orchestrator.execute_workflow(
            workflow_type=WorkflowType.ROOT_CAUSE_ANALYSIS,
            initial_context=request.context,
            user_message=request.user_message
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        execution_time = (datetime.now() - start_time).total_seconds()
        
        return WorkflowResponse(
            success=result["success"],
            workflow_type=result["workflow_type"],
            results=result["results"],
            tools_used=result["tools_used"],
            messages=result["messages"],
            execution_time=execution_time,
            timestamp=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"RCA workflow execution failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"RCA workflow execution failed: {str(e)}")


@router.post("/remediation", response_model=WorkflowResponse)
async def execute_remediation(request: WorkflowRequest) -> WorkflowResponse:
    """
    Execute Remediation workflow
    
    - **user_message**: Description of the issue to remediate
    - **context**: Issue details, severity, affected systems
    """
    try:
        start_time = datetime.now()
        
        # Set workflow type
        request.workflow_type = "remediation"
        
        # Execute workflow
        result = await langgraph_orchestrator.execute_workflow(
            workflow_type=WorkflowType.REMEDIATION,
            initial_context=request.context,
            user_message=request.user_message
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        execution_time = (datetime.now() - start_time).total_seconds()
        
        return WorkflowResponse(
            success=result["success"],
            workflow_type=result["workflow_type"],
            results=result["results"],
            tools_used=result["tools_used"],
            messages=result["messages"],
            execution_time=execution_time,
            timestamp=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"Remediation workflow execution failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Remediation workflow execution failed: {str(e)}")


@router.post("/iac-generation", response_model=WorkflowResponse)
async def execute_iac_generation(request: WorkflowRequest) -> WorkflowResponse:
    """
    Execute IaC Generation workflow
    
    - **user_message**: Infrastructure requirements
    - **context**: Provider preferences, cost constraints
    """
    try:
        start_time = datetime.now()
        
        # Set workflow type
        request.workflow_type = "iac_generation"
        
        # Execute workflow
        result = await langgraph_orchestrator.execute_workflow(
            workflow_type=WorkflowType.IAC_GENERATION,
            initial_context=request.context,
            user_message=request.user_message
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        execution_time = (datetime.now() - start_time).total_seconds()
        
        return WorkflowResponse(
            success=result["success"],
            workflow_type=result["workflow_type"],
            results=result["results"],
            tools_used=result["tools_used"],
            messages=result["messages"],
            execution_time=execution_time,
            timestamp=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"IaC generation workflow execution failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"IaC generation workflow execution failed: {str(e)}")


@router.post("/incident-response", response_model=WorkflowResponse)
async def execute_incident_response(request: WorkflowRequest) -> WorkflowResponse:
    """
    Execute Incident Response workflow
    
    - **user_message**: Incident description
    - **context**: Incident severity, affected services
    """
    try:
        start_time = datetime.now()
        
        # Set workflow type
        request.workflow_type = "incident_response"
        
        # Execute workflow
        result = await langgraph_orchestrator.execute_workflow(
            workflow_type=WorkflowType.INCIDENT_RESPONSE,
            initial_context=request.context,
            user_message=request.user_message
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        execution_time = (datetime.now() - start_time).total_seconds()
        
        return WorkflowResponse(
            success=result["success"],
            workflow_type=result["workflow_type"],
            results=result["results"],
            tools_used=result["tools_used"],
            messages=result["messages"],
            execution_time=execution_time,
            timestamp=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"Incident response workflow execution failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Incident response workflow execution failed: {str(e)}")


@router.post("/cost-optimization", response_model=WorkflowResponse)
async def execute_cost_optimization(request: WorkflowRequest) -> WorkflowResponse:
    """
    Execute Cost Optimization workflow
    
    - **user_message**: Cost optimization requirements
    - **context**: Current infrastructure, budget constraints
    """
    try:
        start_time = datetime.now()
        
        # Set workflow type
        request.workflow_type = "cost_optimization"
        
        # Execute workflow
        result = await langgraph_orchestrator.execute_workflow(
            workflow_type=WorkflowType.COST_OPTIMIZATION,
            initial_context=request.context,
            user_message=request.user_message
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        execution_time = (datetime.now() - start_time).total_seconds()
        
        return WorkflowResponse(
            success=result["success"],
            workflow_type=result["workflow_type"],
            results=result["results"],
            tools_used=result["tools_used"],
            messages=result["messages"],
            execution_time=execution_time,
            timestamp=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"Cost optimization workflow execution failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Cost optimization workflow execution failed: {str(e)}")


@router.post("/security-audit", response_model=WorkflowResponse)
async def execute_security_audit(request: WorkflowRequest) -> WorkflowResponse:
    """
    Execute Security Audit workflow
    
    - **user_message**: Security audit requirements
    - **context**: Compliance requirements, audit scope
    """
    try:
        start_time = datetime.now()
        
        # Set workflow type
        request.workflow_type = "security_audit"
        
        # Execute workflow
        result = await langgraph_orchestrator.execute_workflow(
            workflow_type=WorkflowType.SECURITY_AUDIT,
            initial_context=request.context,
            user_message=request.user_message
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        execution_time = (datetime.now() - start_time).total_seconds()
        
        return WorkflowResponse(
            success=result["success"],
            workflow_type=result["workflow_type"],
            results=result["results"],
            tools_used=result["tools_used"],
            messages=result["messages"],
            execution_time=execution_time,
            timestamp=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"Security audit workflow execution failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Security audit workflow execution failed: {str(e)}")


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Health check for LangGraph orchestrator
    """
    try:
        # Check if LangGraph is available
        langgraph_available = hasattr(langgraph_orchestrator, 'workflows')
        
        # Get workflow count
        workflow_count = len(WorkflowType) if langgraph_available else 0
        
        return {
            "status": "healthy" if langgraph_available else "unhealthy",
            "langgraph_available": langgraph_available,
            "workflow_count": workflow_count,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        } 