"""
HITL (Human-in-the-Loop) API Endpoints
Production-grade API endpoints for auto-remediation with approval workflows
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime

from ..agents.hitl.auto_remediation_agent import (
    auto_remediation_agent,
    RemediationSeverity,
    RemediationStatus,
    ApprovalLevel
)

router = APIRouter(prefix="/hitl", tags=["Human-in-the-Loop"])

logger = logging.getLogger(__name__)


class RemediationActionRequest(BaseModel):
    """Request model for creating remediation actions"""
    name: str = Field(..., description="Name of the remediation action")
    description: str = Field(..., description="Description of the remediation")
    severity: RemediationSeverity = Field(..., description="Severity level")
    affected_systems: List[str] = Field(..., description="List of affected systems")
    estimated_duration: int = Field(..., description="Estimated duration in minutes")
    risk_level: str = Field(..., description="Risk level assessment")
    rollback_plan: str = Field(..., description="Rollback plan")
    requester_id: str = Field(..., description="ID of the requester")
    requester_name: str = Field(..., description="Name of the requester")
    auto_approve: bool = Field(default=False, description="Whether to auto-approve")


class ApprovalRequest(BaseModel):
    """Request model for approval actions"""
    approval_request_id: str = Field(..., description="ID of the approval request")
    approver_id: str = Field(..., description="ID of the approver")
    approver_name: str = Field(..., description="Name of the approver")
    approval_reason: str = Field(default="", description="Reason for approval")


class RejectionRequest(BaseModel):
    """Request model for rejection actions"""
    approval_request_id: str = Field(..., description="ID of the approval request")
    approver_id: str = Field(..., description="ID of the approver")
    approver_name: str = Field(..., description="Name of the approver")
    rejection_reason: str = Field(..., description="Reason for rejection")


class RemediationActionResponse(BaseModel):
    """Response model for remediation actions"""
    success: bool
    action_id: Optional[str] = None
    approval_required: Optional[bool] = None
    approval_request_id: Optional[str] = None
    execution_id: Optional[str] = None
    status: Optional[str] = None
    message: str


class ApprovalResponse(BaseModel):
    """Response model for approval actions"""
    success: bool
    approval_request_id: str
    execution_id: Optional[str] = None
    status: str
    message: str


class PendingApprovalResponse(BaseModel):
    """Response model for pending approvals"""
    approval_request_id: str
    action_id: str
    action_name: str
    severity: str
    requester_name: str
    approval_level: str
    created_at: str
    expires_at: Optional[str] = None
    description: str
    affected_systems: List[str]


class RemediationStatusResponse(BaseModel):
    """Response model for remediation status"""
    success: bool
    action: Optional[Dict[str, Any]] = None
    approval: Optional[Dict[str, Any]] = None
    execution: Optional[Dict[str, Any]] = None


class AgentStatusResponse(BaseModel):
    """Response model for agent status"""
    status: str
    total_actions: int
    pending_approvals: int
    active_executions: int
    completed_executions: int
    failed_executions: int
    success_rate: float
    timestamp: str


@router.post("/remediation/create", response_model=RemediationActionResponse)
async def create_remediation_action(request: RemediationActionRequest) -> RemediationActionResponse:
    """
    Create a new remediation action
    
    - **name**: Name of the remediation action
    - **description**: Description of the remediation
    - **severity**: Severity level (low, medium, high, critical)
    - **affected_systems**: List of affected systems
    - **estimated_duration**: Estimated duration in minutes
    - **risk_level**: Risk level assessment
    - **rollback_plan**: Rollback plan
    - **requester_id**: ID of the requester
    - **requester_name**: Name of the requester
    - **auto_approve**: Whether to auto-approve
    """
    try:
        result = await auto_remediation_agent.create_remediation_action(
            name=request.name,
            description=request.description,
            severity=request.severity,
            affected_systems=request.affected_systems,
            estimated_duration=request.estimated_duration,
            risk_level=request.risk_level,
            rollback_plan=request.rollback_plan,
            requester_id=request.requester_id,
            requester_name=request.requester_name,
            auto_approve=request.auto_approve
        )
        
        return RemediationActionResponse(
            success=result["success"],
            action_id=result.get("action_id"),
            approval_required=result.get("approval_required"),
            approval_request_id=result.get("approval_request_id"),
            execution_id=result.get("execution_id"),
            status=result.get("status"),
            message=result.get("message", "")
        )
        
    except Exception as e:
        logger.error(f"Failed to create remediation action: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create remediation action: {str(e)}")


@router.post("/remediation/approve", response_model=ApprovalResponse)
async def approve_remediation(request: ApprovalRequest) -> ApprovalResponse:
    """
    Approve a remediation action
    
    - **approval_request_id**: ID of the approval request
    - **approver_id**: ID of the approver
    - **approver_name**: Name of the approver
    - **approval_reason**: Reason for approval
    """
    try:
        result = await auto_remediation_agent.approve_remediation(
            approval_request_id=request.approval_request_id,
            approver_id=request.approver_id,
            approver_name=request.approver_name,
            approval_reason=request.approval_reason
        )
        
        return ApprovalResponse(
            success=result["success"],
            approval_request_id=request.approval_request_id,
            execution_id=result.get("execution_id"),
            status=result.get("status", ""),
            message=result.get("message", "")
        )
        
    except Exception as e:
        logger.error(f"Failed to approve remediation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to approve remediation: {str(e)}")


@router.post("/remediation/reject", response_model=ApprovalResponse)
async def reject_remediation(request: RejectionRequest) -> ApprovalResponse:
    """
    Reject a remediation action
    
    - **approval_request_id**: ID of the approval request
    - **approver_id**: ID of the approver
    - **approver_name**: Name of the approver
    - **rejection_reason**: Reason for rejection
    """
    try:
        result = await auto_remediation_agent.reject_remediation(
            approval_request_id=request.approval_request_id,
            approver_id=request.approver_id,
            approver_name=request.approver_name,
            rejection_reason=request.rejection_reason
        )
        
        return ApprovalResponse(
            success=result["success"],
            approval_request_id=request.approval_request_id,
            status=result.get("status", ""),
            message=result.get("message", "")
        )
        
    except Exception as e:
        logger.error(f"Failed to reject remediation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to reject remediation: {str(e)}")


@router.get("/remediation/pending-approvals", response_model=List[PendingApprovalResponse])
async def get_pending_approvals(approver_id: Optional[str] = None) -> List[PendingApprovalResponse]:
    """
    Get pending approval requests
    
    - **approver_id**: Optional approver ID to filter by
    """
    try:
        pending = await auto_remediation_agent.get_pending_approvals(approver_id=approver_id)
        
        return [
            PendingApprovalResponse(
                approval_request_id=item["approval_request_id"],
                action_id=item["action_id"],
                action_name=item["action_name"],
                severity=item["severity"],
                requester_name=item["requester_name"],
                approval_level=item["approval_level"],
                created_at=item["created_at"],
                expires_at=item["expires_at"],
                description=item["description"],
                affected_systems=item["affected_systems"]
            )
            for item in pending
        ]
        
    except Exception as e:
        logger.error(f"Failed to get pending approvals: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get pending approvals: {str(e)}")


@router.get("/remediation/status/{action_id}", response_model=RemediationStatusResponse)
async def get_remediation_status(action_id: str) -> RemediationStatusResponse:
    """
    Get status of a remediation action
    
    - **action_id**: ID of the remediation action
    """
    try:
        result = await auto_remediation_agent.get_remediation_status(action_id)
        
        return RemediationStatusResponse(
            success=result["success"],
            action=result.get("action"),
            approval=result.get("approval"),
            execution=result.get("execution")
        )
        
    except Exception as e:
        logger.error(f"Failed to get remediation status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get remediation status: {str(e)}")


@router.get("/remediation/history", response_model=List[Dict[str, Any]])
async def get_remediation_history(
    limit: int = 50,
    status_filter: Optional[RemediationStatus] = None
) -> List[Dict[str, Any]]:
    """
    Get remediation history
    
    - **limit**: Maximum number of records to return
    - **status_filter**: Optional status filter
    """
    try:
        history = await auto_remediation_agent.get_remediation_history(
            limit=limit,
            status_filter=status_filter
        )
        
        return history
        
    except Exception as e:
        logger.error(f"Failed to get remediation history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get remediation history: {str(e)}")


@router.get("/agent/status", response_model=AgentStatusResponse)
async def get_agent_status() -> AgentStatusResponse:
    """
    Get auto-remediation agent status and statistics
    """
    try:
        status = await auto_remediation_agent.get_agent_status()
        
        return AgentStatusResponse(
            status=status["status"],
            total_actions=status["total_actions"],
            pending_approvals=status["pending_approvals"],
            active_executions=status["active_executions"],
            completed_executions=status["completed_executions"],
            failed_executions=status["failed_executions"],
            success_rate=status["success_rate"],
            timestamp=status["timestamp"]
        )
        
    except Exception as e:
        logger.error(f"Failed to get agent status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get agent status: {str(e)}")


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Health check for HITL system
    """
    try:
        status = await auto_remediation_agent.get_agent_status()
        
        return {
            "status": "healthy",
            "agent_status": status["status"],
            "pending_approvals": status["pending_approvals"],
            "active_executions": status["active_executions"],
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        } 