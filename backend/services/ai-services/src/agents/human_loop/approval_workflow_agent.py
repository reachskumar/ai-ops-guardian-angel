"""
Approval Workflow Agent - AI for intelligent risk-based approval routing and workflow orchestration
Manages human-in-the-loop processes with smart escalation and decision tracking
"""

import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import json
from enum import Enum
from dataclasses import dataclass, field

from ...agents.base_agent import BaseAgent, AgentTask, AgentCapabilities, AgentRecommendation
from ...config.settings import AgentType, RiskLevel, ApprovalLevel, settings


class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    ESCALATED = "escalated"
    WITHDRAWN = "withdrawn"
    EXPIRED = "expired"


class WorkflowStage(str, Enum):
    INITIAL_REVIEW = "initial_review"
    TECHNICAL_REVIEW = "technical_review"
    SECURITY_REVIEW = "security_review"
    MANAGER_APPROVAL = "manager_approval"
    FINAL_APPROVAL = "final_approval"


@dataclass
class ApprovalRequest:
    """Represents an approval request"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    title: str = ""
    description: str = ""
    requestor: str = ""
    request_type: str = ""
    risk_level: RiskLevel = RiskLevel.MEDIUM
    estimated_impact: str = ""
    urgency: str = "normal"  # low, normal, high, critical
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=lambda: datetime.now())
    status: ApprovalStatus = ApprovalStatus.PENDING
    current_stage: WorkflowStage = WorkflowStage.INITIAL_REVIEW
    approvers: List[str] = field(default_factory=list)
    approval_history: List[Dict[str, Any]] = field(default_factory=list)


class ApprovalWorkflowAgent(BaseAgent):
    """
    Advanced AI agent for approval workflow management and orchestration.
    
    Capabilities:
    - Intelligent risk-based approval routing
    - Dynamic workflow orchestration
    - Escalation management
    - SLA monitoring and alerting
    - Approval analytics and insights
    - Automated decision recommendations
    - Integration with notification systems
    - Audit trail and compliance tracking
    """
    
    def __init__(self):
        capabilities = AgentCapabilities(
            supported_tasks=[
                "process_approval_request",
                "route_approval",
                "escalate_request",
                "monitor_sla",
                "generate_approval_insights",
                "automate_decisions",
                "manage_workflow",
                "track_compliance",
                "notify_stakeholders",
                "analyze_patterns"
            ],
            required_tools=["workflow_engine", "notification_service", "analytics_engine"],
            max_concurrent_tasks=10,
            average_response_time=30.0
        )
        
        super().__init__(
            agent_type=AgentType.APPROVAL_WORKFLOW,
            name="Approval Workflow Agent",
            description="AI-powered approval workflow management and orchestration",
            capabilities=capabilities
        )
        
        # Approval routing rules
        self.routing_rules = {
            RiskLevel.LOW: [ApprovalLevel.ENGINEER],
            RiskLevel.MEDIUM: [ApprovalLevel.SENIOR_ENGINEER, ApprovalLevel.TEAM_LEAD],
            RiskLevel.HIGH: [ApprovalLevel.TEAM_LEAD, ApprovalLevel.MANAGER],
            RiskLevel.CRITICAL: [ApprovalLevel.MANAGER, ApprovalLevel.ADMIN]
        }
        
        # SLA configurations (in hours)
        self.sla_configs = {
            'low_urgency': 72,      # 3 days
            'normal_urgency': 48,   # 2 days
            'high_urgency': 24,     # 1 day
            'critical_urgency': 4   # 4 hours
        }
        
        # Workflow templates
        self.workflow_templates = {
            'infrastructure_change': [
                WorkflowStage.INITIAL_REVIEW,
                WorkflowStage.TECHNICAL_REVIEW,
                WorkflowStage.SECURITY_REVIEW,
                WorkflowStage.MANAGER_APPROVAL
            ],
            'security_exception': [
                WorkflowStage.SECURITY_REVIEW,
                WorkflowStage.MANAGER_APPROVAL,
                WorkflowStage.FINAL_APPROVAL
            ],
            'budget_approval': [
                WorkflowStage.INITIAL_REVIEW,
                WorkflowStage.MANAGER_APPROVAL,
                WorkflowStage.FINAL_APPROVAL
            ]
        }
        
        # Active approval requests
        self.active_requests: Dict[str, ApprovalRequest] = {}
        self.completed_requests: List[ApprovalRequest] = []
        
        # Analytics data
        self.approval_metrics = {
            'total_requests': 0,
            'approved_requests': 0,
            'rejected_requests': 0,
            'average_approval_time': 0,
            'sla_breaches': 0
        }
        
        self.logger.info("Approval Workflow Agent initialized")
    
    async def _execute_task_logic(self, task: AgentTask) -> Dict[str, Any]:
        """Execute approval workflow tasks"""
        task_type = task.task_type
        context = task.context
        
        self.logger.info(f"Executing approval workflow task: {task_type}")
        
        if task_type == "process_approval_request":
            return await self._process_approval_request(context)
        elif task_type == "route_approval":
            return await self._route_approval(context)
        elif task_type == "escalate_request":
            return await self._escalate_request(context)
        elif task_type == "monitor_sla":
            return await self._monitor_sla(context)
        elif task_type == "generate_approval_insights":
            return await self._generate_approval_insights(context)
        elif task_type == "automate_decisions":
            return await self._automate_decisions(context)
        elif task_type == "manage_workflow":
            return await self._manage_workflow(context)
        elif task_type == "track_compliance":
            return await self._track_compliance(context)
        elif task_type == "notify_stakeholders":
            return await self._notify_stakeholders(context)
        elif task_type == "analyze_patterns":
            return await self._analyze_patterns(context)
        else:
            raise ValueError(f"Unsupported approval workflow task: {task_type}")
    
    async def _generate_recommendation_logic(
        self, 
        context: Dict[str, Any], 
        task_type: str
    ) -> Dict[str, Any]:
        """Generate approval workflow recommendations"""
        
        if task_type == "process_approval_request":
            processing_result = await self._process_approval_request(context)
            
            requests_processed = processing_result.get('requests_processed', 0)
            auto_approved = processing_result.get('auto_approved', 0)
            escalated = processing_result.get('escalated', 0)
            sla_at_risk = processing_result.get('sla_at_risk', 0)
            
            # Determine risk level
            if sla_at_risk > 5 or escalated > 10:
                risk_level = RiskLevel.HIGH
            elif sla_at_risk > 2 or escalated > 5:
                risk_level = RiskLevel.MEDIUM
            else:
                risk_level = RiskLevel.LOW
            
            return {
                "title": f"Approval Workflow Analysis - {requests_processed} requests processed",
                "description": f"Processed {requests_processed} approval requests with {auto_approved} auto-approved and {escalated} escalated",
                "reasoning": f"""
                Approval workflow analysis shows:
                
                **Requests Processed**: {requests_processed}
                **Auto-Approved**: {auto_approved} ({(auto_approved/max(requests_processed,1)*100):.1f}%)
                **Escalated**: {escalated} ({(escalated/max(requests_processed,1)*100):.1f}%)
                **SLA at Risk**: {sla_at_risk}
                
                **Workflow Efficiency**:
                - Average Processing Time: {processing_result.get('avg_processing_time', 0):.1f} hours
                - SLA Compliance Rate: {processing_result.get('sla_compliance_rate', 0):.1f}%
                - Escalation Rate: {(escalated/max(requests_processed,1)*100):.1f}%
                
                **Process Optimization Opportunities**:
                1. Increase automation for low-risk requests
                2. Streamline review processes for common request types
                3. Implement parallel approval workflows
                4. Enhance notification and reminder systems
                5. Provide self-service options for routine requests
                
                **Risk Mitigation**:
                - Monitor SLA compliance closely
                - Implement automated escalation triggers
                - Provide additional training for approvers
                - Establish backup approval pathways
                """,
                "confidence": 0.88,
                "impact": f"Improved approval workflow efficiency and compliance",
                "risk_level": risk_level,
                "estimated_duration": "1-3 weeks workflow optimization",
                "resources_affected": processing_result.get('involved_teams', []),
                "alternatives": [
                    "Implement workflow automation tools",
                    "Outsource routine approvals",
                    "Establish approval committees"
                ],
                "prerequisites": [
                    "Stakeholder buy-in for process changes",
                    "Training for new workflow procedures",
                    "Technology infrastructure updates"
                ],
                "rollback_plan": "Workflow changes can be reverted to manual processes within 24 hours"
            }
        
        return {
            "title": "Approval Workflow Analysis Complete",
            "description": "Approval workflow analysis completed with optimization recommendations",
            "reasoning": "Analyzed approval patterns and identified efficiency improvements",
            "confidence": 0.82,
            "impact": "Enhanced approval workflow efficiency and stakeholder satisfaction",
            "risk_level": RiskLevel.LOW
        }
    
    async def _analyze_data_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze approval workflow data for insights"""
        try:
            requests = data.get('approval_requests', [])
            approvers = data.get('approvers', [])
            time_period = data.get('time_period_days', 30)
            
            # Analyze approval patterns
            patterns = await self._analyze_approval_patterns(requests)
            
            # Calculate workflow metrics
            metrics = await self._calculate_workflow_metrics(requests, time_period)
            
            # Identify bottlenecks
            bottlenecks = await self._identify_workflow_bottlenecks(requests, approvers)
            
            # Generate optimization recommendations
            optimizations = await self._generate_workflow_optimizations(patterns, metrics, bottlenecks)
            
            return {
                'approval_patterns': patterns,
                'workflow_metrics': metrics,
                'bottlenecks': bottlenecks,
                'optimizations': optimizations,
                'efficiency_score': await self._calculate_efficiency_score(metrics),
                'analysis_timestamp': datetime.now().isoformat()
            }
        
        except Exception as e:
            self.logger.error(f"Approval workflow data analysis failed: {str(e)}")
            raise
    
    # Core Approval Workflow Methods
    
    async def _process_approval_request(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Process incoming approval requests"""
        try:
            requests_data = context.get('requests', [])
            
            self.logger.info(f"Processing {len(requests_data)} approval requests")
            
            processed_count = 0
            auto_approved_count = 0
            escalated_count = 0
            sla_at_risk_count = 0
            processing_times = []
            involved_teams = set()
            
            for request_data in requests_data:
                # Create approval request object
                request = await self._create_approval_request(request_data)
                
                # Determine routing and workflow
                routing_decision = await self._determine_routing(request)
                workflow = await self._select_workflow(request)
                
                # Process the request
                processing_result = await self._execute_approval_workflow(request, routing_decision, workflow)
                
                processed_count += 1
                processing_times.append(processing_result.get('processing_time', 0))
                involved_teams.update(processing_result.get('teams', []))
                
                if processing_result.get('auto_approved', False):
                    auto_approved_count += 1
                
                if processing_result.get('escalated', False):
                    escalated_count += 1
                
                if processing_result.get('sla_at_risk', False):
                    sla_at_risk_count += 1
            
            # Calculate average processing time
            avg_processing_time = sum(processing_times) / len(processing_times) if processing_times else 0
            
            # Calculate SLA compliance rate
            sla_compliant = processed_count - sla_at_risk_count
            sla_compliance_rate = (sla_compliant / processed_count * 100) if processed_count > 0 else 100
            
            return {
                'requests_processed': processed_count,
                'auto_approved': auto_approved_count,
                'escalated': escalated_count,
                'sla_at_risk': sla_at_risk_count,
                'avg_processing_time': avg_processing_time,
                'sla_compliance_rate': sla_compliance_rate,
                'involved_teams': list(involved_teams),
                'workflow_efficiency': await self._calculate_workflow_efficiency(processing_times),
                'recommendations': await self._generate_process_recommendations(processed_count, auto_approved_count, escalated_count)
            }
            
        except Exception as e:
            self.logger.error(f"Approval request processing failed: {str(e)}")
            raise
    
    async def _create_approval_request(self, request_data: Dict[str, Any]) -> ApprovalRequest:
        """Create an approval request object"""
        import uuid
        
        return ApprovalRequest(
            id=str(uuid.uuid4()),
            title=request_data.get('title', 'Approval Request'),
            description=request_data.get('description', ''),
            requestor=request_data.get('requestor', 'unknown'),
            request_type=request_data.get('type', 'general'),
            risk_level=RiskLevel(request_data.get('risk_level', 'medium')),
            estimated_impact=request_data.get('estimated_impact', ''),
            urgency=request_data.get('urgency', 'normal'),
            metadata=request_data.get('metadata', {})
        )
    
    async def _determine_routing(self, request: ApprovalRequest) -> Dict[str, Any]:
        """Determine approval routing based on risk and type"""
        required_approvers = self.routing_rules.get(request.risk_level, [ApprovalLevel.MANAGER])
        
        # Consider request type for specialized routing
        if request.request_type == 'security_exception':
            required_approvers = [ApprovalLevel.TEAM_LEAD, ApprovalLevel.MANAGER, ApprovalLevel.ADMIN]
        elif request.request_type == 'budget_request':
            required_approvers = [ApprovalLevel.MANAGER, ApprovalLevel.ADMIN]
        
        return {
            'required_approvers': [approver.value for approver in required_approvers],
            'parallel_approval': request.urgency in ['high', 'critical'],
            'auto_approve_eligible': request.risk_level == RiskLevel.LOW and request.request_type == 'routine',
            'escalation_path': await self._define_escalation_path(request)
        }
    
    async def _select_workflow(self, request: ApprovalRequest) -> List[WorkflowStage]:
        """Select appropriate workflow template"""
        workflow_type = request.request_type
        
        if workflow_type in self.workflow_templates:
            return self.workflow_templates[workflow_type]
        
        # Default workflow based on risk level
        if request.risk_level in [RiskLevel.CRITICAL, RiskLevel.HIGH]:
            return [
                WorkflowStage.INITIAL_REVIEW,
                WorkflowStage.TECHNICAL_REVIEW,
                WorkflowStage.SECURITY_REVIEW,
                WorkflowStage.MANAGER_APPROVAL,
                WorkflowStage.FINAL_APPROVAL
            ]
        else:
            return [
                WorkflowStage.INITIAL_REVIEW,
                WorkflowStage.MANAGER_APPROVAL
            ]
    
    # Method stubs for completeness
    async def _route_approval(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _escalate_request(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _monitor_sla(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _generate_approval_insights(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _automate_decisions(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _manage_workflow(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _track_compliance(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _notify_stakeholders(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _analyze_patterns(self, context: Dict[str, Any]) -> Dict[str, Any]: return {}
    async def _analyze_approval_patterns(self, requests) -> Dict[str, Any]: return {}
    async def _calculate_workflow_metrics(self, requests, period) -> Dict[str, Any]: return {}
    async def _identify_workflow_bottlenecks(self, requests, approvers) -> List[Dict[str, Any]]: return []
    async def _generate_workflow_optimizations(self, patterns, metrics, bottlenecks) -> List[str]: return []
    async def _calculate_efficiency_score(self, metrics) -> float: return 85.0
    async def _execute_approval_workflow(self, request, routing, workflow) -> Dict[str, Any]: return {'processing_time': 2.5, 'teams': ['engineering'], 'auto_approved': False, 'escalated': False, 'sla_at_risk': False}
    async def _calculate_workflow_efficiency(self, times) -> float: return 85.0
    async def _generate_process_recommendations(self, processed, auto, escalated) -> List[str]: return []
    async def _define_escalation_path(self, request) -> List[str]: return ['team_lead', 'manager'] 