"""
Production-Grade Auto-Remediation Agent with HITL
Human-in-the-Loop approval workflows for automated remediation
"""

import asyncio
import json
import logging
from typing import Dict, Any, List, Optional, Union
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum
import uuid

from ...config.settings import settings


class RemediationStatus(str, Enum):
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXECUTING = "executing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class RemediationSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ApprovalLevel(str, Enum):
    AUTOMATIC = "automatic"
    TEAM_LEAD = "team_lead"
    MANAGER = "manager"
    DIRECTOR = "director"
    EXECUTIVE = "executive"


@dataclass
class RemediationAction:
    """Represents a remediation action"""
    id: str
    name: str
    description: str
    severity: RemediationSeverity
    affected_systems: List[str]
    estimated_duration: int  # minutes
    risk_level: str
    rollback_plan: str
    approval_required: bool = True
    auto_approve: bool = False
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)


@dataclass
class ApprovalRequest:
    """Represents an approval request"""
    id: str
    remediation_action_id: str
    requester_id: str
    requester_name: str
    approver_id: Optional[str] = None
    approver_name: Optional[str] = None
    approval_level: ApprovalLevel = ApprovalLevel.TEAM_LEAD
    status: RemediationStatus = RemediationStatus.PENDING_APPROVAL
    request_reason: str = ""
    approval_reason: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.now)
    approved_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None


@dataclass
class RemediationExecution:
    """Represents a remediation execution"""
    id: str
    action_id: str
    approval_id: str
    executor_id: str
    executor_name: str
    status: RemediationStatus
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    execution_logs: List[str] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    rollback_performed: bool = False
    created_at: datetime = field(default_factory=datetime.now)


class AutoRemediationAgent:
    """Production-grade auto-remediation agent with HITL capabilities"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # In-memory storage (replace with database in production)
        self.remediation_actions: Dict[str, RemediationAction] = {}
        self.approval_requests: Dict[str, ApprovalRequest] = {}
        self.executions: Dict[str, RemediationExecution] = {}
        
        # Configuration
        self.auto_approve_low_severity = True
        self.auto_approve_medium_severity = False
        self.auto_approve_high_severity = False
        self.auto_approve_critical_severity = False
        
        # Approval timeouts
        self.approval_timeouts = {
            ApprovalLevel.TEAM_LEAD: timedelta(hours=2),
            ApprovalLevel.MANAGER: timedelta(hours=4),
            ApprovalLevel.DIRECTOR: timedelta(hours=8),
            ApprovalLevel.EXECUTIVE: timedelta(hours=24)
        }
        
        self.logger.info("Auto-Remediation Agent initialized successfully")
    
    async def create_remediation_action(
        self,
        name: str,
        description: str,
        severity: RemediationSeverity,
        affected_systems: List[str],
        estimated_duration: int,
        risk_level: str,
        rollback_plan: str,
        requester_id: str,
        requester_name: str,
        auto_approve: bool = False
    ) -> Dict[str, Any]:
        """Create a new remediation action"""
        
        try:
            action_id = str(uuid.uuid4())
            
            action = RemediationAction(
                id=action_id,
                name=name,
                description=description,
                severity=severity,
                affected_systems=affected_systems,
                estimated_duration=estimated_duration,
                risk_level=risk_level,
                rollback_plan=rollback_plan,
                auto_approve=auto_approve
            )
            
            self.remediation_actions[action_id] = action
            
            # Create approval request if needed
            approval_required = not auto_approve and self._requires_approval(severity)
            
            if approval_required:
                approval_request = await self._create_approval_request(
                    action_id=action_id,
                    requester_id=requester_id,
                    requester_name=requester_name,
                    severity=severity
                )
                
                return {
                    "success": True,
                    "action_id": action_id,
                    "approval_required": True,
                    "approval_request_id": approval_request.id,
                    "status": RemediationStatus.PENDING_APPROVAL.value,
                    "message": "Remediation action created. Approval required."
                }
            else:
                # Auto-approve and execute
                execution = await self._execute_remediation_action(
                    action_id=action_id,
                    executor_id=requester_id,
                    executor_name=requester_name
                )
                
                return {
                    "success": True,
                    "action_id": action_id,
                    "approval_required": False,
                    "execution_id": execution.id,
                    "status": RemediationStatus.EXECUTING.value,
                    "message": "Remediation action auto-approved and executing."
                }
                
        except Exception as e:
            self.logger.error(f"Failed to create remediation action: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _create_approval_request(
        self,
        action_id: str,
        requester_id: str,
        requester_name: str,
        severity: RemediationSeverity
    ) -> ApprovalRequest:
        """Create an approval request"""
        
        approval_id = str(uuid.uuid4())
        
        # Determine approval level based on severity
        approval_level = self._get_approval_level(severity)
        
        # Set expiration time
        expires_at = datetime.now() + self.approval_timeouts[approval_level]
        
        approval_request = ApprovalRequest(
            id=approval_id,
            remediation_action_id=action_id,
            requester_id=requester_id,
            requester_name=requester_name,
            approval_level=approval_level,
            expires_at=expires_at
        )
        
        self.approval_requests[approval_id] = approval_request
        
        # Send notifications (implement notification system)
        await self._send_approval_notifications(approval_request)
        
        return approval_request
    
    def _get_approval_level(self, severity: RemediationSeverity) -> ApprovalLevel:
        """Get approval level based on severity"""
        
        if severity == RemediationSeverity.LOW:
            return ApprovalLevel.TEAM_LEAD
        elif severity == RemediationSeverity.MEDIUM:
            return ApprovalLevel.MANAGER
        elif severity == RemediationSeverity.HIGH:
            return ApprovalLevel.DIRECTOR
        elif severity == RemediationSeverity.CRITICAL:
            return ApprovalLevel.EXECUTIVE
        else:
            return ApprovalLevel.MANAGER
    
    def _requires_approval(self, severity: RemediationSeverity) -> bool:
        """Check if approval is required based on severity"""
        
        if severity == RemediationSeverity.LOW:
            return not self.auto_approve_low_severity
        elif severity == RemediationSeverity.MEDIUM:
            return not self.auto_approve_medium_severity
        elif severity == RemediationSeverity.HIGH:
            return not self.auto_approve_high_severity
        elif severity == RemediationSeverity.CRITICAL:
            return not self.auto_approve_critical_severity
        else:
            return True
    
    async def approve_remediation(
        self,
        approval_request_id: str,
        approver_id: str,
        approver_name: str,
        approval_reason: str = ""
    ) -> Dict[str, Any]:
        """Approve a remediation action"""
        
        try:
            if approval_request_id not in self.approval_requests:
                return {"success": False, "error": "Approval request not found"}
            
            approval_request = self.approval_requests[approval_request_id]
            
            # Check if already processed
            if approval_request.status != RemediationStatus.PENDING_APPROVAL:
                return {"success": False, "error": "Approval request already processed"}
            
            # Check if expired
            if approval_request.expires_at and datetime.now() > approval_request.expires_at:
                approval_request.status = RemediationStatus.CANCELLED
                return {"success": False, "error": "Approval request expired"}
            
            # Approve
            approval_request.status = RemediationStatus.APPROVED
            approval_request.approver_id = approver_id
            approval_request.approver_name = approver_name
            approval_request.approval_reason = approval_reason
            approval_request.approved_at = datetime.now()
            
            # Execute remediation
            execution = await self._execute_remediation_action(
                action_id=approval_request.remediation_action_id,
                executor_id=approver_id,
                executor_name=approver_name,
                approval_id=approval_request_id
            )
            
            return {
                "success": True,
                "approval_request_id": approval_request_id,
                "execution_id": execution.id,
                "status": RemediationStatus.EXECUTING.value,
                "message": "Remediation approved and executing."
            }
            
        except Exception as e:
            self.logger.error(f"Failed to approve remediation: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def reject_remediation(
        self,
        approval_request_id: str,
        approver_id: str,
        approver_name: str,
        rejection_reason: str
    ) -> Dict[str, Any]:
        """Reject a remediation action"""
        
        try:
            if approval_request_id not in self.approval_requests:
                return {"success": False, "error": "Approval request not found"}
            
            approval_request = self.approval_requests[approval_request_id]
            
            # Check if already processed
            if approval_request.status != RemediationStatus.PENDING_APPROVAL:
                return {"success": False, "error": "Approval request already processed"}
            
            # Reject
            approval_request.status = RemediationStatus.REJECTED
            approval_request.approver_id = approver_id
            approval_request.approver_name = approver_name
            approval_request.approval_reason = f"REJECTED: {rejection_reason}"
            approval_request.approved_at = datetime.now()
            
            return {
                "success": True,
                "approval_request_id": approval_request_id,
                "status": RemediationStatus.REJECTED.value,
                "message": "Remediation rejected."
            }
            
        except Exception as e:
            self.logger.error(f"Failed to reject remediation: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _execute_remediation_action(
        self,
        action_id: str,
        executor_id: str,
        executor_name: str,
        approval_id: Optional[str] = None
    ) -> RemediationExecution:
        """Execute a remediation action"""
        
        execution_id = str(uuid.uuid4())
        
        execution = RemediationExecution(
            id=execution_id,
            action_id=action_id,
            approval_id=approval_id or "",
            executor_id=executor_id,
            executor_name=executor_name,
            status=RemediationStatus.EXECUTING,
            start_time=datetime.now()
        )
        
        self.executions[execution_id] = execution
        
        # Start execution in background
        asyncio.create_task(self._execute_remediation_background(execution))
        
        return execution
    
    async def _execute_remediation_background(self, execution: RemediationExecution):
        """Execute remediation in background"""
        
        try:
            action = self.remediation_actions.get(execution.action_id)
            if not action:
                execution.status = RemediationStatus.FAILED
                execution.errors.append("Remediation action not found")
                return
            
            # Simulate remediation execution
            execution.execution_logs.append(f"Starting remediation: {action.name}")
            execution.execution_logs.append(f"Affected systems: {', '.join(action.affected_systems)}")
            execution.execution_logs.append(f"Estimated duration: {action.estimated_duration} minutes")
            
            # Simulate execution steps
            steps = [
                "Validating prerequisites",
                "Taking system snapshots",
                "Applying remediation",
                "Verifying changes",
                "Running health checks"
            ]
            
            for i, step in enumerate(steps):
                await asyncio.sleep(1)  # Simulate work
                execution.execution_logs.append(f"Step {i+1}: {step}")
                
                # Simulate potential failure
                if action.severity == RemediationSeverity.CRITICAL and i == 2:
                    execution.status = RemediationStatus.FAILED
                    execution.errors.append("Critical error during remediation")
                    execution.end_time = datetime.now()
                    return
            
            # Success
            execution.status = RemediationStatus.COMPLETED
            execution.end_time = datetime.now()
            execution.execution_logs.append("Remediation completed successfully")
            
            # Send completion notifications
            await self._send_completion_notifications(execution)
            
        except Exception as e:
            execution.status = RemediationStatus.FAILED
            execution.errors.append(f"Execution failed: {str(e)}")
            execution.end_time = datetime.now()
            self.logger.error(f"Remediation execution failed: {str(e)}")
    
    async def get_pending_approvals(self, approver_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get pending approval requests"""
        
        pending = []
        
        for approval_request in self.approval_requests.values():
            if approval_request.status == RemediationStatus.PENDING_APPROVAL:
                # Check if expired
                if approval_request.expires_at and datetime.now() > approval_request.expires_at:
                    approval_request.status = RemediationStatus.CANCELLED
                    continue
                
                # Filter by approver if specified
                if approver_id and approval_request.approver_id != approver_id:
                    continue
                
                action = self.remediation_actions.get(approval_request.remediation_action_id)
                
                pending.append({
                    "approval_request_id": approval_request.id,
                    "action_id": approval_request.remediation_action_id,
                    "action_name": action.name if action else "Unknown",
                    "severity": action.severity.value if action else "unknown",
                    "requester_name": approval_request.requester_name,
                    "approval_level": approval_request.approval_level.value,
                    "created_at": approval_request.created_at.isoformat(),
                    "expires_at": approval_request.expires_at.isoformat() if approval_request.expires_at else None,
                    "description": action.description if action else "",
                    "affected_systems": action.affected_systems if action else []
                })
        
        return pending
    
    async def get_remediation_status(self, action_id: str) -> Dict[str, Any]:
        """Get status of a remediation action"""
        
        action = self.remediation_actions.get(action_id)
        if not action:
            return {"success": False, "error": "Remediation action not found"}
        
        # Find approval request
        approval_request = None
        for req in self.approval_requests.values():
            if req.remediation_action_id == action_id:
                approval_request = req
                break
        
        # Find execution
        execution = None
        for exec_item in self.executions.values():
            if exec_item.action_id == action_id:
                execution = exec_item
                break
        
        return {
            "success": True,
            "action": {
                "id": action.id,
                "name": action.name,
                "description": action.description,
                "severity": action.severity.value,
                "affected_systems": action.affected_systems,
                "estimated_duration": action.estimated_duration,
                "risk_level": action.risk_level,
                "created_at": action.created_at.isoformat()
            },
            "approval": {
                "id": approval_request.id if approval_request else None,
                "status": approval_request.status.value if approval_request else None,
                "requester_name": approval_request.requester_name if approval_request else None,
                "approver_name": approval_request.approver_name if approval_request else None,
                "approval_level": approval_request.approval_level.value if approval_request else None,
                "created_at": approval_request.created_at.isoformat() if approval_request else None,
                "approved_at": approval_request.approved_at.isoformat() if approval_request and approval_request.approved_at else None,
                "expires_at": approval_request.expires_at.isoformat() if approval_request and approval_request.expires_at else None
            },
            "execution": {
                "id": execution.id if execution else None,
                "status": execution.status.value if execution else None,
                "executor_name": execution.executor_name if execution else None,
                "start_time": execution.start_time.isoformat() if execution and execution.start_time else None,
                "end_time": execution.end_time.isoformat() if execution and execution.end_time else None,
                "execution_logs": execution.execution_logs if execution else [],
                "errors": execution.errors if execution else []
            }
        }
    
    async def get_remediation_history(
        self,
        limit: int = 50,
        status_filter: Optional[RemediationStatus] = None
    ) -> List[Dict[str, Any]]:
        """Get remediation history"""
        
        history = []
        
        for action in self.remediation_actions.values():
            # Apply status filter
            if status_filter:
                # Find execution status
                execution = None
                for exec_item in self.executions.values():
                    if exec_item.action_id == action.id:
                        execution = exec_item
                        break
                
                if not execution or execution.status != status_filter:
                    continue
            
            # Find approval request
            approval_request = None
            for req in self.approval_requests.values():
                if req.remediation_action_id == action.id:
                    approval_request = req
                    break
            
            # Find execution
            execution = None
            for exec_item in self.executions.values():
                if exec_item.action_id == action.id:
                    execution = exec_item
                    break
            
            history.append({
                "action_id": action.id,
                "name": action.name,
                "severity": action.severity.value,
                "status": execution.status.value if execution else "unknown",
                "created_at": action.created_at.isoformat(),
                "requester_name": approval_request.requester_name if approval_request else "Unknown",
                "approver_name": approval_request.approver_name if approval_request else None,
                "execution_time": (execution.end_time - execution.start_time).total_seconds() if execution and execution.start_time and execution.end_time else None
            })
        
        # Sort by creation date (newest first)
        history.sort(key=lambda x: x["created_at"], reverse=True)
        
        return history[:limit]
    
    async def _send_approval_notifications(self, approval_request: ApprovalRequest):
        """Send approval notifications"""
        # Implement notification system (email, Slack, etc.)
        self.logger.info(f"Approval notification sent for request {approval_request.id}")
    
    async def _send_completion_notifications(self, execution: RemediationExecution):
        """Send completion notifications"""
        # Implement notification system
        self.logger.info(f"Completion notification sent for execution {execution.id}")
    
    async def get_agent_status(self) -> Dict[str, Any]:
        """Get agent status and statistics"""
        
        total_actions = len(self.remediation_actions)
        pending_approvals = len([req for req in self.approval_requests.values() 
                               if req.status == RemediationStatus.PENDING_APPROVAL])
        active_executions = len([exec_item for exec_item in self.executions.values() 
                               if exec_item.status == RemediationStatus.EXECUTING])
        completed_executions = len([exec_item for exec_item in self.executions.values() 
                                  if exec_item.status == RemediationStatus.COMPLETED])
        failed_executions = len([exec_item for exec_item in self.executions.values() 
                               if exec_item.status == RemediationStatus.FAILED])
        
        return {
            "status": "healthy",
            "total_actions": total_actions,
            "pending_approvals": pending_approvals,
            "active_executions": active_executions,
            "completed_executions": completed_executions,
            "failed_executions": failed_executions,
            "success_rate": completed_executions / (completed_executions + failed_executions) if (completed_executions + failed_executions) > 0 else 0,
            "timestamp": datetime.now().isoformat()
        }


# Global auto-remediation agent instance
auto_remediation_agent = AutoRemediationAgent() 