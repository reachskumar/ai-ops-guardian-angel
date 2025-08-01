#!/usr/bin/env python3
"""
Multi-Agent Workflow Orchestrator
Enables complex automation chains with multiple AI agents
"""

import asyncio
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from enum import Enum

class WorkflowType(str, Enum):
    COST_OPTIMIZATION_PIPELINE = "cost_optimization_pipeline"
    SECURITY_HARDENING_PIPELINE = "security_hardening_pipeline"
    DEPLOYMENT_PIPELINE = "deployment_pipeline"
    INCIDENT_RESPONSE_PIPELINE = "incident_response_pipeline"
    COMPLIANCE_AUDIT_PIPELINE = "compliance_audit_pipeline"
    ML_MODEL_LIFECYCLE = "ml_model_lifecycle"

class WorkflowStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    REQUIRES_APPROVAL = "requires_approval"

class WorkflowOrchestrator:
    """Orchestrates complex multi-agent workflows"""
    
    def __init__(self, simple_orchestrator):
        self.orchestrator = simple_orchestrator
        self.active_workflows = {}
        self.workflow_templates = self._initialize_workflow_templates()
        
    def _initialize_workflow_templates(self) -> Dict[str, Any]:
        """Initialize predefined workflow templates"""
        return {
            WorkflowType.COST_OPTIMIZATION_PIPELINE: {
                "name": "Complete Cost Optimization Pipeline",
                "description": "Analyze costs → Identify optimizations → Security check → Deploy changes",
                "steps": [
                    {"agent": "cost_analysis", "name": "Cost Analysis", "required": True},
                    {"agent": "security_scan", "name": "Security Validation", "required": True},
                    {"agent": "vulnerability_assessment", "name": "Change Impact Assessment", "required": False},
                    {"agent": "deployment", "name": "Deploy Optimizations", "required": True, "approval_required": True}
                ],
                "estimated_duration": "15-25 minutes",
                "risk_level": "medium"
            },
            
            WorkflowType.SECURITY_HARDENING_PIPELINE: {
                "name": "Complete Security Hardening Pipeline", 
                "description": "Vulnerability scan → Compliance audit → Penetration test → Apply fixes",
                "steps": [
                    {"agent": "vulnerability_assessment", "name": "Vulnerability Assessment", "required": True},
                    {"agent": "compliance_audit", "name": "Compliance Check", "required": True},
                    {"agent": "penetration_testing", "name": "Penetration Testing", "required": False, "approval_required": True},
                    {"agent": "deployment", "name": "Apply Security Fixes", "required": True, "approval_required": True}
                ],
                "estimated_duration": "45-90 minutes",
                "risk_level": "high"
            },
            
            WorkflowType.ML_MODEL_LIFECYCLE: {
                "name": "ML Model Lifecycle Management",
                "description": "Train model → Monitor performance → Deploy → Continuous monitoring",
                "steps": [
                    {"agent": "model_training", "name": "Model Training", "required": True},
                    {"agent": "model_monitoring", "name": "Performance Validation", "required": True},
                    {"agent": "security_scan", "name": "Model Security Check", "required": True},
                    {"agent": "deployment", "name": "Deploy Model", "required": True, "approval_required": True},
                    {"agent": "model_monitoring", "name": "Continuous Monitoring", "required": True}
                ],
                "estimated_duration": "2-4 hours",
                "risk_level": "medium"
            },
            
            WorkflowType.INCIDENT_RESPONSE_PIPELINE: {
                "name": "Automated Incident Response",
                "description": "Detect anomalies → Assess impact → Security check → Auto-remediate",
                "steps": [
                    {"agent": "anomaly_detection", "name": "Anomaly Detection", "required": True},
                    {"agent": "infrastructure", "name": "Impact Assessment", "required": True},
                    {"agent": "security_scan", "name": "Security Analysis", "required": True},
                    {"agent": "approval_workflow", "name": "Escalation Decision", "required": True},
                    {"agent": "deployment", "name": "Auto-Remediation", "required": False, "approval_required": True}
                ],
                "estimated_duration": "5-15 minutes",
                "risk_level": "high"
            }
        }
    
    async def start_workflow(self, workflow_type: WorkflowType, user_id: str, 
                           initial_message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Start a multi-agent workflow"""
        
        workflow_id = f"workflow_{workflow_type}_{user_id}_{int(datetime.now().timestamp())}"
        template = self.workflow_templates[workflow_type]
        
        workflow = {
            "id": workflow_id,
            "type": workflow_type,
            "user_id": user_id,
            "status": WorkflowStatus.RUNNING,
            "template": template,
            "current_step": 0,
            "results": [],
            "context": context or {},
            "started_at": datetime.now().isoformat(),
            "initial_message": initial_message,
            "estimated_completion": None
        }
        
        self.active_workflows[workflow_id] = workflow
        
        # Start executing the workflow
        result = await self._execute_workflow_step(workflow_id, initial_message)
        
        return {
            "workflow_id": workflow_id,
            "status": workflow["status"],
            "current_step": workflow["current_step"],
            "total_steps": len(template["steps"]),
            "template": template,
            "current_result": result,
            "estimated_duration": template["estimated_duration"],
            "message": f"🔄 Started {template['name']} workflow. Executing step 1/{len(template['steps'])}: {template['steps'][0]['name']}"
        }
    
    async def _execute_workflow_step(self, workflow_id: str, message: str) -> Dict[str, Any]:
        """Execute the current step of a workflow"""
        
        workflow = self.active_workflows[workflow_id]
        current_step_idx = workflow["current_step"]
        steps = workflow["template"]["steps"]
        
        if current_step_idx >= len(steps):
            workflow["status"] = WorkflowStatus.COMPLETED
            return {"message": "🎉 Workflow completed successfully!", "workflow_complete": True}
        
        current_step = steps[current_step_idx]
        agent_type = current_step["agent"]
        step_name = current_step["name"]
        
        print(f"🔄 Executing workflow step {current_step_idx + 1}: {step_name} ({agent_type})")
        
        # Check if step requires approval
        if current_step.get("approval_required", False):
            workflow["status"] = WorkflowStatus.REQUIRES_APPROVAL
            return {
                "message": f"⚠️ Step '{step_name}' requires approval before proceeding.",
                "requires_approval": True,
                "step": current_step,
                "workflow_id": workflow_id,
                "actions": [
                    {"type": "approve", "title": "Approve and continue", "endpoint": f"/workflow/{workflow_id}/approve"},
                    {"type": "pause", "title": "Pause workflow", "endpoint": f"/workflow/{workflow_id}/pause"},
                    {"type": "cancel", "title": "Cancel workflow", "endpoint": f"/workflow/{workflow_id}/cancel"}
                ]
            }
        
        # Execute the agent
        try:
            # Create context-aware message for the agent
            context_message = self._create_context_message(workflow, message, current_step)
            
            agent_result = await self.orchestrator.execute_agent_task(
                agent_type, context_message, workflow["user_id"]
            )
            
            # Store the result
            step_result = {
                "step_index": current_step_idx,
                "step_name": step_name,
                "agent": agent_type,
                "result": agent_result,
                "executed_at": datetime.now().isoformat(),
                "status": "completed"
            }
            
            workflow["results"].append(step_result)
            workflow["current_step"] += 1
            
            # Enhanced result with workflow context
            enhanced_result = agent_result.copy()
            enhanced_result.update({
                "workflow_context": {
                    "workflow_id": workflow_id,
                    "step": f"{current_step_idx + 1}/{len(steps)}",
                    "step_name": step_name,
                    "next_step": steps[current_step_idx + 1]["name"] if current_step_idx + 1 < len(steps) else "Complete",
                    "workflow_progress": f"{((current_step_idx + 1) / len(steps)) * 100:.0f}%"
                },
                "workflow_actions": [
                    {"type": "continue", "title": "Continue to next step", "endpoint": f"/workflow/{workflow_id}/continue"},
                    {"type": "pause", "title": "Pause workflow", "endpoint": f"/workflow/{workflow_id}/pause"},
                    {"type": "status", "title": "View workflow status", "endpoint": f"/workflow/{workflow_id}/status"}
                ]
            })
            
            return enhanced_result
            
        except Exception as e:
            workflow["status"] = WorkflowStatus.FAILED
            return {
                "message": f"❌ Workflow step '{step_name}' failed: {str(e)}",
                "error": str(e),
                "step": current_step,
                "workflow_failed": True
            }
    
    def _create_context_message(self, workflow: Dict[str, Any], original_message: str, 
                               current_step: Dict[str, Any]) -> str:
        """Create a context-aware message for the agent based on workflow history"""
        
        context_parts = [original_message]
        
        # Add context from previous steps
        if workflow["results"]:
            context_parts.append("\n--- Workflow Context ---")
            for result in workflow["results"][-2:]:  # Last 2 steps for context
                step_name = result["step_name"]
                agent = result["agent"]
                context_parts.append(f"Previous step: {step_name} ({agent}) completed successfully")
        
        # Add current step context
        context_parts.append(f"\n--- Current Step ---")
        context_parts.append(f"Executing: {current_step['name']} as part of {workflow['template']['name']}")
        
        return "\n".join(context_parts)
    
    async def continue_workflow(self, workflow_id: str, message: str = None) -> Dict[str, Any]:
        """Continue a paused or waiting workflow"""
        
        if workflow_id not in self.active_workflows:
            return {"error": "Workflow not found", "workflow_id": workflow_id}
        
        workflow = self.active_workflows[workflow_id]
        
        if workflow["status"] not in [WorkflowStatus.PAUSED, WorkflowStatus.REQUIRES_APPROVAL]:
            return {"error": f"Cannot continue workflow in status: {workflow['status']}", "workflow_id": workflow_id}
        
        workflow["status"] = WorkflowStatus.RUNNING
        return await self._execute_workflow_step(workflow_id, message or workflow["initial_message"])
    
    def get_workflow_status(self, workflow_id: str) -> Dict[str, Any]:
        """Get detailed status of a workflow"""
        
        if workflow_id not in self.active_workflows:
            return {"error": "Workflow not found", "workflow_id": workflow_id}
        
        workflow = self.active_workflows[workflow_id]
        template = workflow["template"]
        
        progress_percentage = (workflow["current_step"] / len(template["steps"])) * 100
        
        return {
            "workflow_id": workflow_id,
            "status": workflow["status"],
            "progress": f"{workflow['current_step']}/{len(template['steps'])} ({progress_percentage:.0f}%)",
            "template": template,
            "results": workflow["results"],
            "started_at": workflow["started_at"],
            "current_step": template["steps"][workflow["current_step"]] if workflow["current_step"] < len(template["steps"]) else None,
            "estimated_time_remaining": self._estimate_remaining_time(workflow)
        }
    
    def _estimate_remaining_time(self, workflow: Dict[str, Any]) -> str:
        """Estimate remaining time for workflow completion"""
        remaining_steps = len(workflow["template"]["steps"]) - workflow["current_step"]
        if remaining_steps <= 0:
            return "Complete"
        
        # Simple estimation based on step types
        estimated_minutes = remaining_steps * 3  # 3 minutes per step average
        return f"{estimated_minutes}-{estimated_minutes * 2} minutes"
    
    def pause_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """Pause a running workflow"""
        
        if workflow_id not in self.active_workflows:
            return {"error": "Workflow not found", "workflow_id": workflow_id}
        
        workflow = self.active_workflows[workflow_id]
        workflow["status"] = WorkflowStatus.PAUSED
        
        return {
            "message": f"⏸️ Workflow '{workflow['template']['name']}' paused successfully",
            "workflow_id": workflow_id,
            "status": WorkflowStatus.PAUSED
        }
    
    def get_available_workflows(self) -> Dict[str, Any]:
        """Get all available workflow templates"""
        
        return {
            "available_workflows": [
                {
                    "type": wf_type,
                    "name": template["name"],
                    "description": template["description"],
                    "steps": len(template["steps"]),
                    "estimated_duration": template["estimated_duration"],
                    "risk_level": template["risk_level"]
                }
                for wf_type, template in self.workflow_templates.items()
            ],
            "active_workflows": len(self.active_workflows),
            "workflow_examples": [
                "Start cost optimization pipeline",
                "Begin security hardening workflow",
                "Initialize ML model lifecycle",
                "Start incident response automation"
            ]
        }
    
    def detect_workflow_intent(self, message: str) -> Optional[WorkflowType]:
        """Detect if a message should trigger a workflow"""
        
        message_lower = message.lower()
        
        workflow_keywords = {
            WorkflowType.COST_OPTIMIZATION_PIPELINE: [
                "optimize costs", "cost optimization", "reduce spending", "save money",
                "cost pipeline", "optimize infrastructure costs"
            ],
            WorkflowType.SECURITY_HARDENING_PIPELINE: [
                "harden security", "security pipeline", "secure infrastructure", 
                "security hardening", "comprehensive security"
            ],
            WorkflowType.ML_MODEL_LIFECYCLE: [
                "ml pipeline", "model lifecycle", "train and deploy", "ml workflow",
                "machine learning pipeline", "model deployment pipeline"
            ],
            WorkflowType.INCIDENT_RESPONSE_PIPELINE: [
                "incident response", "auto remediate", "emergency response",
                "incident pipeline", "automated response"
            ],
            WorkflowType.COMPLIANCE_AUDIT_PIPELINE: [
                "compliance audit", "full compliance", "audit pipeline",
                "compliance workflow", "regulatory compliance"
            ]
        }
        
        for workflow_type, keywords in workflow_keywords.items():
            if any(keyword in message_lower for keyword in keywords):
                return workflow_type
        
        return None 