"""
Multi-Agent Workflow Orchestrator - Intelligent Agent Chaining and Orchestration
Handles complex requests that require multiple specialized agents working together
"""

import asyncio
import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage


class WorkflowComplexity(str, Enum):
    """Complexity levels for workflows"""
    SIMPLE = "simple"          # Single agent
    MODERATE = "moderate"      # 2-3 agents
    COMPLEX = "complex"        # 4-6 agents
    ENTERPRISE = "enterprise"  # 7+ agents with dependencies


class WorkflowStatus(str, Enum):
    """Workflow execution status"""
    PLANNED = "planned"
    EXECUTING = "executing" 
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"


@dataclass
class AgentStep:
    """Individual step in a multi-agent workflow"""
    agent_name: str
    agent_type: str
    task_description: str
    inputs: Dict[str, Any] = field(default_factory=dict)
    outputs: Dict[str, Any] = field(default_factory=dict)
    dependencies: List[str] = field(default_factory=list)  # Previous step names
    status: str = "pending"
    execution_time: Optional[float] = None
    error_message: Optional[str] = None


@dataclass 
class MultiAgentWorkflow:
    """Complete workflow definition with multiple agent steps"""
    workflow_id: str
    user_request: str
    complexity: WorkflowComplexity
    steps: List[AgentStep] = field(default_factory=list)
    status: WorkflowStatus = WorkflowStatus.PLANNED
    context: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    estimated_duration: Optional[int] = None  # seconds
    actual_duration: Optional[int] = None
    user_id: str = ""
    session_id: str = ""


class MultiAgentWorkflowOrchestrator:
    """
    Intelligent orchestrator for multi-agent workflows
    
    Features:
    - Workflow planning based on user intent
    - Dependency resolution and execution ordering  
    - Parallel and sequential execution
    - Error handling and recovery
    - Progress tracking and user feedback
    - Context passing between agents
    """
    
    def __init__(self, openai_client=None):
        self.openai_client = openai_client
        self.active_workflows: Dict[str, MultiAgentWorkflow] = {}
        
        # Workflow templates for common scenarios
        self.workflow_templates = {
            "production_environment": self._get_production_env_template(),
            "security_audit": self._get_security_audit_template(),
            "cost_optimization": self._get_cost_optimization_template(),
            "disaster_recovery": self._get_disaster_recovery_template(),
            "ml_pipeline": self._get_ml_pipeline_template(),
            "migration_assessment": self._get_migration_template()
        }
        
        # Agent capabilities mapping
        self.agent_capabilities = {
            "ec2_provisioning": ["instance_creation", "multi_region", "bulk_provisioning"],
            "security_scanning": ["vulnerability_assessment", "compliance_check", "threat_detection"], 
            "cost_analysis": ["cost_breakdown", "optimization_recommendations", "forecasting"],
            "network_management": ["vpc_setup", "security_groups", "load_balancers"],
            "database_management": ["rds_setup", "backup_configuration", "performance_tuning"],
            "monitoring": ["alerting_setup", "dashboard_creation", "log_analysis"],
            "compliance_automation": ["policy_enforcement", "audit_reporting", "remediation"]
        }

    async def analyze_and_orchestrate(self, user_request: str, user_id: str, session_id: str) -> Dict[str, Any]:
        """
        Main orchestration method - analyzes request and determines if multi-agent workflow is needed
        """
        try:
            # Analyze complexity and determine if multi-agent workflow is needed
            workflow_analysis = await self._analyze_workflow_complexity(user_request)
            
            if workflow_analysis["requires_multi_agent"]:
                # Create and execute multi-agent workflow
                workflow = await self._create_workflow(user_request, workflow_analysis, user_id, session_id)
                execution_result = await self._execute_workflow(workflow)
                return {
                    "workflow_execution": True,
                    "workflow_id": workflow.workflow_id,
                    "result": execution_result,
                    "complexity": workflow.complexity,
                    "steps_completed": len([s for s in workflow.steps if s.status == "completed"])
                }
            else:
                # Single agent can handle this
                return {
                    "workflow_execution": False,
                    "single_agent": workflow_analysis["recommended_agent"],
                    "reason": "Single agent sufficient for this request"
                }
                
        except Exception as e:
            return {
                "workflow_execution": False,
                "error": f"Workflow orchestration error: {str(e)}"
            }

    async def _analyze_workflow_complexity(self, user_request: str) -> Dict[str, Any]:
        """Use AI to analyze if request requires multi-agent workflow"""
        try:
            if not self.openai_client:
                return self._fallback_complexity_analysis(user_request)
            
            prompt = f"""
Analyze this DevOps/Infrastructure request to determine if it requires multiple specialized agents or can be handled by a single agent.

User Request: "{user_request}"

Consider these factors:
1. Number of different services/systems involved
2. Dependencies between tasks  
3. Complexity of coordination required
4. Security and compliance requirements
5. Cross-functional requirements

Available agent types: ec2_provisioning, security_scanning, cost_analysis, network_management, database_management, monitoring, compliance_automation, load_balancer, auto_scaling, s3_management

Return JSON:
{{
    "requires_multi_agent": true/false,
    "complexity": "simple|moderate|complex|enterprise", 
    "estimated_agents": number,
    "recommended_agent": "single_agent_name_if_simple",
    "workflow_type": "production_environment|security_audit|cost_optimization|disaster_recovery|ml_pipeline|migration_assessment|custom",
    "reasoning": "explanation",
    "suggested_steps": ["step1", "step2", ...]
}}

Examples:
- "List my EC2 instances" → single agent (ec2_listing)
- "Set up production environment with monitoring and security" → multi-agent workflow
- "Optimize costs across all services" → multi-agent workflow  
- "Create secure database with backup" → multi-agent workflow
- "Show current costs" → single agent (cost_analysis)
"""
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert DevOps workflow analyzer. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,
                temperature=0.1
            )
            
            result = json.loads(response.choices[0].message.content.strip())
            return result
            
        except Exception as e:
            print(f"Error in workflow complexity analysis: {e}")
            return self._fallback_complexity_analysis(user_request)

    def _fallback_complexity_analysis(self, user_request: str) -> Dict[str, Any]:
        """Fallback analysis using keyword patterns"""
        request_lower = user_request.lower()
        
        # Multi-agent indicators
        multi_agent_keywords = [
            "production environment", "full stack", "end-to-end", "secure setup",
            "with monitoring", "with backup", "with security", "complete setup",
            "optimize everything", "audit all", "migrate all", "setup disaster recovery"
        ]
        
        # Single agent indicators  
        single_agent_keywords = [
            "list", "show", "display", "get", "check status", "view",
            "start instance", "stop instance", "create bucket", "delete"
        ]
        
        if any(keyword in request_lower for keyword in multi_agent_keywords):
            return {
                "requires_multi_agent": True,
                "complexity": "moderate",
                "estimated_agents": 3,
                "workflow_type": "custom",
                "reasoning": "Keywords indicate multi-service setup",
                "suggested_steps": ["infrastructure", "security", "monitoring"]
            }
        elif any(keyword in request_lower for keyword in single_agent_keywords):
            return {
                "requires_multi_agent": False,
                "complexity": "simple", 
                "recommended_agent": "ec2_listing",
                "reasoning": "Simple query/action that single agent can handle"
            }
        else:
            # Default to single agent for ambiguous cases
            return {
                "requires_multi_agent": False,
                "complexity": "simple",
                "recommended_agent": "general_query",
                "reasoning": "Ambiguous request, defaulting to single agent"
            }

    async def _create_workflow(self, user_request: str, analysis: Dict[str, Any], user_id: str, session_id: str) -> MultiAgentWorkflow:
        """Create workflow based on analysis"""
        import uuid
        
        workflow_id = f"workflow_{uuid.uuid4().hex[:8]}"
        workflow_type = analysis.get("workflow_type", "custom")
        
        # Use template if available, otherwise create custom workflow
        if workflow_type in self.workflow_templates:
            steps = self.workflow_templates[workflow_type].copy()
        else:
            steps = await self._generate_custom_workflow_steps(user_request, analysis)
        
        workflow = MultiAgentWorkflow(
            workflow_id=workflow_id,
            user_request=user_request,
            complexity=WorkflowComplexity(analysis.get("complexity", "moderate")),
            steps=steps,
            estimated_duration=len(steps) * 30,  # 30 seconds per step estimate
            user_id=user_id,
            session_id=session_id
        )
        
        self.active_workflows[workflow_id] = workflow
        return workflow

    async def _execute_workflow(self, workflow: MultiAgentWorkflow) -> Dict[str, Any]:
        """Execute multi-agent workflow with dependency resolution"""
        try:
            workflow.status = WorkflowStatus.EXECUTING
            start_time = datetime.now(timezone.utc)
            
            results = []
            step_outputs = {}  # Store outputs for dependency resolution
            
            # Execute steps in dependency order
            for step in workflow.steps:
                try:
                    # Wait for dependencies to complete
                    if step.dependencies:
                        missing_deps = [dep for dep in step.dependencies if dep not in step_outputs]
                        if missing_deps:
                            step.status = "failed"
                            step.error_message = f"Missing dependencies: {missing_deps}"
                            continue
                        
                        # Merge dependency outputs into step inputs
                        for dep in step.dependencies:
                            step.inputs.update(step_outputs[dep])
                    
                    # Execute the step
                    step_start = datetime.now(timezone.utc)
                    step_result = await self._execute_workflow_step(step, workflow.context)
                    step_end = datetime.now(timezone.utc)
                    
                    step.execution_time = (step_end - step_start).total_seconds()
                    step.outputs = step_result.get("outputs", {})
                    step.status = "completed" if step_result.get("success") else "failed"
                    
                    if step.status == "failed":
                        step.error_message = step_result.get("error", "Unknown error")
                    
                    # Store outputs for dependent steps
                    step_outputs[step.agent_name] = step.outputs
                    
                    results.append({
                        "step": step.agent_name,
                        "status": step.status,
                        "result": step_result.get("response", ""),
                        "execution_time": step.execution_time
                    })
                    
                except Exception as e:
                    step.status = "failed"
                    step.error_message = str(e)
                    results.append({
                        "step": step.agent_name,
                        "status": "failed",
                        "error": str(e)
                    })
            
            # Calculate final status and duration
            end_time = datetime.now(timezone.utc)
            workflow.actual_duration = (end_time - start_time).total_seconds()
            
            failed_steps = [s for s in workflow.steps if s.status == "failed"]
            if failed_steps:
                workflow.status = WorkflowStatus.FAILED
            else:
                workflow.status = WorkflowStatus.COMPLETED
            
            return {
                "workflow_id": workflow.workflow_id,
                "status": workflow.status,
                "duration": workflow.actual_duration,
                "steps": results,
                "summary": self._generate_workflow_summary(workflow)
            }
            
        except Exception as e:
            workflow.status = WorkflowStatus.FAILED
            return {
                "workflow_id": workflow.workflow_id,
                "status": "failed",
                "error": str(e)
            }

    async def _execute_workflow_step(self, step: AgentStep, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute individual workflow step by calling appropriate agent"""
        try:
            # This would integrate with your existing agent system
            # For now, simulate agent execution
            
            agent_response = f"✅ {step.agent_type.replace('_', ' ').title()} completed: {step.task_description}"
            
            return {
                "success": True,
                "response": agent_response,
                "outputs": {
                    "status": "completed",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "agent": step.agent_name
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "outputs": {}
            }

    def _generate_workflow_summary(self, workflow: MultiAgentWorkflow) -> str:
        """Generate human-readable summary of workflow execution"""
        completed_steps = len([s for s in workflow.steps if s.status == "completed"])
        total_steps = len(workflow.steps)
        
        if workflow.status == WorkflowStatus.COMPLETED:
            return f"🎉 **Workflow Completed Successfully**\n\n✅ All {total_steps} steps completed in {workflow.actual_duration:.1f} seconds\n\n**Steps executed:**\n" + \
                   "\n".join([f"• {step.agent_type.replace('_', ' ').title()}: {step.task_description}" for step in workflow.steps])
        else:
            failed_steps = [s for s in workflow.steps if s.status == "failed"]
            return f"⚠️ **Workflow Partially Completed**\n\n✅ {completed_steps}/{total_steps} steps completed\n❌ {len(failed_steps)} steps failed\n\n**Failed steps:**\n" + \
                   "\n".join([f"• {step.agent_type}: {step.error_message}" for step in failed_steps])

    # Workflow Templates
    def _get_production_env_template(self) -> List[AgentStep]:
        """Template for setting up production environment"""
        return [
            AgentStep("infra_setup", "ec2_provisioning", "Provision production EC2 instances"),
            AgentStep("network_config", "network_management", "Configure VPC and security groups", dependencies=["infra_setup"]),
            AgentStep("database_setup", "database_management", "Set up production database", dependencies=["network_config"]),
            AgentStep("load_balancer", "load_balancer", "Configure application load balancer", dependencies=["infra_setup"]),
            AgentStep("monitoring", "monitoring", "Set up monitoring and alerting", dependencies=["infra_setup", "database_setup"]),
            AgentStep("security_scan", "security_scanning", "Perform security assessment", dependencies=["network_config", "database_setup"])
        ]
        
    def _get_security_audit_template(self) -> List[AgentStep]:
        """Template for comprehensive security audit"""
        return [
            AgentStep("infrastructure_scan", "security_scanning", "Scan infrastructure for vulnerabilities"),
            AgentStep("container_scan", "container_scanning", "Scan containers for security issues"),
            AgentStep("secrets_detection", "secrets_detection", "Detect exposed secrets and credentials"),
            AgentStep("compliance_check", "compliance_automation", "Check compliance with security standards", dependencies=["infrastructure_scan", "container_scan"]),
            AgentStep("remediation_plan", "security_scanning", "Generate remediation recommendations", dependencies=["compliance_check", "secrets_detection"])
        ]
        
    def _get_cost_optimization_template(self) -> List[AgentStep]:
        """Template for comprehensive cost optimization"""
        return [
            AgentStep("cost_analysis", "cost_analysis", "Analyze current costs across all services"),
            AgentStep("rightsizing", "cost_analysis", "Identify rightsizing opportunities", dependencies=["cost_analysis"]),
            AgentStep("unused_resources", "cost_analysis", "Find unused resources", dependencies=["cost_analysis"]),
            AgentStep("reserved_instances", "cost_analysis", "Analyze reserved instance opportunities", dependencies=["rightsizing"]),
            AgentStep("implementation_plan", "cost_analysis", "Create cost optimization implementation plan", dependencies=["unused_resources", "reserved_instances"])
        ]
        
    def _get_disaster_recovery_template(self) -> List[AgentStep]:
        """Template for disaster recovery setup"""
        return [
            AgentStep("backup_assessment", "database_management", "Assess current backup configurations"),
            AgentStep("multi_region_setup", "ec2_provisioning", "Set up multi-region infrastructure"),
            AgentStep("data_replication", "database_management", "Configure cross-region data replication", dependencies=["multi_region_setup"]),
            AgentStep("failover_testing", "monitoring", "Set up automated failover testing", dependencies=["data_replication"]),
            AgentStep("recovery_procedures", "compliance_automation", "Document recovery procedures", dependencies=["failover_testing"])
        ]
        
    def _get_ml_pipeline_template(self) -> List[AgentStep]:
        """Template for ML pipeline setup"""
        return [
            AgentStep("data_infrastructure", "ec2_provisioning", "Set up data processing infrastructure"),
            AgentStep("storage_setup", "s3_management", "Configure data storage and versioning"),
            AgentStep("model_training", "ec2_provisioning", "Set up model training environment", dependencies=["data_infrastructure"]),
            AgentStep("monitoring_ml", "monitoring", "Set up ML model monitoring", dependencies=["model_training"]),
            AgentStep("deployment_pipeline", "ec2_provisioning", "Configure model deployment pipeline", dependencies=["storage_setup", "monitoring_ml"])
        ]
        
    def _get_migration_template(self) -> List[AgentStep]:
        """Template for cloud migration assessment"""
        return [
            AgentStep("current_assessment", "cost_analysis", "Assess current infrastructure costs"),
            AgentStep("target_planning", "ec2_provisioning", "Plan target cloud architecture"),
            AgentStep("security_requirements", "security_scanning", "Assess security requirements for migration"),
            AgentStep("migration_strategy", "ec2_provisioning", "Develop migration strategy", dependencies=["current_assessment", "target_planning"]),
            AgentStep("compliance_mapping", "compliance_automation", "Map compliance requirements", dependencies=["security_requirements", "migration_strategy"])
        ]

    async def _generate_custom_workflow_steps(self, user_request: str, analysis: Dict[str, Any]) -> List[AgentStep]:
        """Generate custom workflow steps for non-template requests"""
        suggested_steps = analysis.get("suggested_steps", ["infrastructure", "security"])
        
        steps = []
        for i, step_name in enumerate(suggested_steps):
            agent_type = self._map_step_to_agent(step_name)
            steps.append(AgentStep(
                agent_name=f"step_{i+1}_{step_name}",
                agent_type=agent_type,
                task_description=f"Execute {step_name.replace('_', ' ')} configuration",
                dependencies=[f"step_{j+1}_{suggested_steps[j]}" for j in range(i) if j < i]
            ))
        
        return steps

    def _map_step_to_agent(self, step_name: str) -> str:
        """Map workflow step names to agent types"""
        mapping = {
            "infrastructure": "ec2_provisioning",
            "security": "security_scanning", 
            "monitoring": "monitoring",
            "database": "database_management",
            "network": "network_management",
            "cost": "cost_analysis",
            "compliance": "compliance_automation",
            "storage": "s3_management"
        }
        return mapping.get(step_name, "ec2_provisioning")