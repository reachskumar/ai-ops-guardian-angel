"""
Agent Orchestrator - Central coordination system for all AI agents
Manages agent lifecycle, task routing, load balancing, and inter-agent communication
"""

import asyncio
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Type
import uuid
from enum import Enum
from dataclasses import dataclass
import logging

from ..agents.base_agent import BaseAgent, AgentTask, AgentRecommendation, TaskStatus, Priority
# Core Agents
from ..agents.core.cost_optimization_agent import CostOptimizationAgent
from ..agents.core.security_analysis_agent import SecurityAnalysisAgent
from ..agents.core.infrastructure_agent import InfrastructureAgent
from ..agents.core.devops_agent import DevOpsAgent

# Advanced Agents
from ..agents.advanced.code_generation_agent import CodeGenerationAgent
from ..agents.advanced.predictive_agent import PredictiveAgent
from ..agents.advanced.root_cause_agent import RootCauseAgent
from ..agents.advanced.architecture_agent import ArchitectureAgent

# MLOps Agents
from ..agents.mlops.model_training_agent import ModelTrainingAgent
from ..agents.mlops.data_pipeline_agent import DataPipelineAgent
from ..agents.mlops.model_monitoring_agent import ModelMonitoringAgent

# Security & Compliance Agents
from ..agents.security.threat_hunting_agent import ThreatHuntingAgent
from ..agents.security.compliance_automation_agent import ComplianceAutomationAgent
from ..agents.security.zero_trust_agent import ZeroTrustAgent

# Human-in-Loop Agents
from ..agents.human_loop.approval_workflow_agent import ApprovalWorkflowAgent
from ..agents.human_loop.risk_assessment_agent import RiskAssessmentAgent
from ..agents.human_loop.decision_support_agent import DecisionSupportAgent

# Git & Deployment Agents
from ..agents.git_deploy.git_integration_agent import GitIntegrationAgent
from ..agents.git_deploy.pipeline_generation_agent import PipelineGenerationAgent
from ..agents.git_deploy.deployment_orchestration_agent import DeploymentOrchestrationAgent
from ..agents.gitops.gitops_deployment_agent import GitOpsDeploymentAgent

# Analytics & Monitoring Agents
from ..agents.analytics.business_intelligence_agent import BusinessIntelligenceAgent
from ..agents.analytics.anomaly_detection_agent import AnomalyDetectionAgent
from ..agents.analytics.capacity_planning_agent import CapacityPlanningAgent

# Advanced DevOps Agents
from ..agents.advanced_devops.docker_agent import DockerAgent
from ..agents.advanced_devops.kubernetes_agent import KubernetesAgent

# Specialized DevOps Agents
from ..agents.specialized_devops.artifact_management_agent import ArtifactManagementAgent
from ..agents.specialized_devops.performance_testing_agent import PerformanceTestingAgent
from ..config.settings import AgentType, settings
from ..utils.logging import get_logger
from ..utils.metrics import system_metrics


class OrchestratorStatus(str, Enum):
    INITIALIZING = "initializing"
    RUNNING = "running"
    PAUSED = "paused"
    STOPPING = "stopping"
    STOPPED = "stopped"
    ERROR = "error"


@dataclass
class TaskAssignment:
    """Represents a task assignment to an agent"""
    task_id: str
    agent_id: str
    agent_type: AgentType
    task: AgentTask
    assigned_at: datetime
    status: TaskStatus = TaskStatus.PENDING


class AgentOrchestrator:
    """
    Central orchestrator for managing all AI agents in the platform.
    
    Responsibilities:
    - Agent lifecycle management (start, stop, restart)
    - Task routing and load balancing
    - Inter-agent communication and coordination
    - Conflict resolution when agents disagree
    - Performance monitoring and optimization
    - Agent scaling and resource management
    """
    
    def __init__(self):
        self.status = OrchestratorStatus.INITIALIZING
        self.logger = get_logger("orchestrator")
        
        # Agent registry
        self.agents: Dict[str, BaseAgent] = {}
        self.agent_types: Dict[AgentType, List[str]] = {}
        
        # Task management
        self.active_tasks: Dict[str, TaskAssignment] = {}
        self.completed_tasks: List[TaskAssignment] = []
        self.task_queue: List[AgentTask] = []
        
        # Performance tracking
        self.agent_performance: Dict[str, Dict[str, Any]] = {}
        self.load_balancer_stats = {
            'total_tasks_routed': 0,
            'successful_assignments': 0,
            'failed_assignments': 0
        }
        
        # Configuration
        self.max_concurrent_tasks_per_agent = settings.max_concurrent_agents
        self.task_timeout_seconds = settings.agent_timeout_seconds
        self.retry_attempts = settings.retry_attempts
        
        # Inter-agent communication
        self.agent_conversations: Dict[str, List[Dict[str, Any]]] = {}
        
        self.logger.info("Agent Orchestrator initialized")
    
    async def start(self) -> bool:
        """Start the orchestrator and all agents"""
        try:
            self.status = OrchestratorStatus.INITIALIZING
            self.logger.info("Starting Agent Orchestrator")
            
            # Initialize all core agents
            await self._initialize_core_agents()
            
            # Initialize advanced agents
            await self._initialize_advanced_agents()
            
            # Start all agents
            await self._start_all_agents()
            
            # Start task processing loop
            asyncio.create_task(self._task_processing_loop())
            
            # Start health monitoring
            asyncio.create_task(self._health_monitoring_loop())
            
            self.status = OrchestratorStatus.RUNNING
            self.logger.info(f"Agent Orchestrator started with {len(self.agents)} agents")
            return True
            
        except Exception as e:
            self.status = OrchestratorStatus.ERROR
            self.logger.error(f"Failed to start orchestrator: {str(e)}")
            return False
    
    async def stop(self) -> bool:
        """Stop the orchestrator and all agents"""
        try:
            self.status = OrchestratorStatus.STOPPING
            self.logger.info("Stopping Agent Orchestrator")
            
            # Cancel all active tasks
            await self._cancel_active_tasks()
            
            # Stop all agents
            await self._stop_all_agents()
            
            self.status = OrchestratorStatus.STOPPED
            self.logger.info("Agent Orchestrator stopped")
            return True
            
        except Exception as e:
            self.status = OrchestratorStatus.ERROR
            self.logger.error(f"Failed to stop orchestrator: {str(e)}")
            return False
    
    async def submit_task(self, task: AgentTask) -> str:
        """Submit a task for execution"""
        try:
            task_id = task.id
            self.logger.info(f"Submitting task {task_id}: {task.description}")
            
            # Route task to appropriate agent
            agent_id = await self._route_task(task)
            
            if agent_id:
                # Create task assignment
                assignment = TaskAssignment(
                    task_id=task_id,
                    agent_id=agent_id,
                    agent_type=self.agents[agent_id].agent_type,
                    task=task,
                    assigned_at=datetime.now(timezone.utc)
                )
                
                self.active_tasks[task_id] = assignment
                
                # Execute task asynchronously
                asyncio.create_task(self._execute_task_assignment(assignment))
                
                self.load_balancer_stats['successful_assignments'] += 1
                return task_id
            else:
                # Add to queue if no agent available
                self.task_queue.append(task)
                self.logger.warning(f"No available agent for task {task_id}, added to queue")
                return task_id
                
        except Exception as e:
            self.load_balancer_stats['failed_assignments'] += 1
            self.logger.error(f"Failed to submit task: {str(e)}")
            raise
    
    async def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """Get the status of a specific task"""
        if task_id in self.active_tasks:
            assignment = self.active_tasks[task_id]
            return {
                'task_id': task_id,
                'status': assignment.task.status.value,
                'agent_id': assignment.agent_id,
                'agent_type': assignment.agent_type.value,
                'assigned_at': assignment.assigned_at.isoformat(),
                'result': assignment.task.result,
                'error': assignment.task.error
            }
        
        # Check completed tasks
        for assignment in self.completed_tasks:
            if assignment.task_id == task_id:
                return {
                    'task_id': task_id,
                    'status': assignment.task.status.value,
                    'agent_id': assignment.agent_id,
                    'agent_type': assignment.agent_type.value,
                    'assigned_at': assignment.assigned_at.isoformat(),
                    'result': assignment.task.result,
                    'error': assignment.task.error
                }
        
        return {'task_id': task_id, 'status': 'not_found'}
    
    async def get_agent_status(self, agent_id: Optional[str] = None) -> Dict[str, Any]:
        """Get status of specific agent or all agents"""
        if agent_id:
            if agent_id in self.agents:
                return self.agents[agent_id].get_status()
            else:
                return {'error': 'Agent not found'}
        
        # Return status of all agents
        agent_statuses = {}
        for aid, agent in self.agents.items():
            agent_statuses[aid] = agent.get_status()
        
        return {
            'orchestrator_status': self.status.value,
            'total_agents': len(self.agents),
            'active_tasks': len(self.active_tasks),
            'queued_tasks': len(self.task_queue),
            'agents': agent_statuses,
            'load_balancer_stats': self.load_balancer_stats
        }
    
    async def get_recommendations(
        self, 
        context: Dict[str, Any], 
        agent_types: Optional[List[AgentType]] = None
    ) -> List[AgentRecommendation]:
        """Get recommendations from multiple agents"""
        try:
            recommendations = []
            
            # Determine which agents to consult
            target_agent_types = agent_types or list(self.agent_types.keys())
            
            # Get recommendations from each agent type
            for agent_type in target_agent_types:
                if agent_type in self.agent_types:
                    agent_ids = self.agent_types[agent_type]
                    if agent_ids:
                        # Use the first available agent of this type
                        agent_id = agent_ids[0]
                        agent = self.agents[agent_id]
                        
                        try:
                            recommendation = await agent.generate_recommendation(
                                context, 
                                task_type="general"
                            )
                            recommendations.append(recommendation)
                        except Exception as e:
                            self.logger.error(f"Failed to get recommendation from {agent_type}: {str(e)}")
            
            # Sort recommendations by confidence
            recommendations.sort(key=lambda x: x.confidence, reverse=True)
            
            return recommendations
            
        except Exception as e:
            self.logger.error(f"Failed to get recommendations: {str(e)}")
            return []
    
    async def chat_with_agents(
        self, 
        message: str, 
        agent_types: Optional[List[AgentType]] = None,
        context: Dict[str, Any] = None
    ) -> Dict[str, str]:
        """Chat with multiple agents and get their responses"""
        try:
            responses = {}
            target_agent_types = agent_types or [AgentType.COST_OPTIMIZATION, AgentType.SECURITY_ANALYSIS]
            
            for agent_type in target_agent_types:
                if agent_type in self.agent_types:
                    agent_ids = self.agent_types[agent_type]
                    if agent_ids:
                        agent_id = agent_ids[0]
                        agent = self.agents[agent_id]
                        
                        try:
                            response = await agent.chat(message, context or {})
                            responses[agent_type.value] = response
                        except Exception as e:
                            self.logger.error(f"Chat failed with {agent_type}: {str(e)}")
                            responses[agent_type.value] = f"Error: {str(e)}"
            
            return responses
            
        except Exception as e:
            self.logger.error(f"Multi-agent chat failed: {str(e)}")
            return {'error': str(e)}
    
    # Private Methods
    
    async def _initialize_core_agents(self):
        """Initialize core infrastructure agents"""
        core_agents = [
            CostOptimizationAgent(),
            SecurityAnalysisAgent(),
            InfrastructureAgent(),
            DevOpsAgent()
        ]
        
        for agent in core_agents:
            agent_id = f"{agent.agent_type.value}_{agent.id[:8]}"
            self.agents[agent_id] = agent
            
            if agent.agent_type not in self.agent_types:
                self.agent_types[agent.agent_type] = []
            self.agent_types[agent.agent_type].append(agent_id)
            
            # Register with metrics system
            system_metrics.register_agent(agent.agent_type.value)
        
        self.logger.info(f"Initialized {len(core_agents)} core agents")
    
    async def _initialize_advanced_agents(self):
        """Initialize advanced AI agents"""
        advanced_agents = [
            CodeGenerationAgent(),
            PredictiveAgent(),
            RootCauseAgent(),
            ArchitectureAgent()
        ]
        
        # Security & Compliance Agents
        security_agents = [
            ThreatHuntingAgent(),
            ComplianceAutomationAgent(),
            ZeroTrustAgent()
        ]
        
        # Human-in-Loop Agents
        human_loop_agents = [
            ApprovalWorkflowAgent(),
            RiskAssessmentAgent(),
            DecisionSupportAgent()
        ]
        
        # Git & Deployment Agents
        git_deploy_agents = [
            GitIntegrationAgent(),
            PipelineGenerationAgent(),
            DeploymentOrchestrationAgent(),
            GitOpsDeploymentAgent()
        ]
        
        # Analytics & Monitoring Agents
        analytics_agents = [
            BusinessIntelligenceAgent(),
            AnomalyDetectionAgent(),
            CapacityPlanningAgent()
        ]
        
        # MLOps Agents
        mlops_agents = [
            ModelTrainingAgent(),
            DataPipelineAgent(),
            ModelMonitoringAgent()
        ]
        
        # Advanced DevOps Agents
        advanced_devops_agents = [
            DockerAgent(),
            KubernetesAgent()
        ]
        
        # Specialized DevOps Agents
        specialized_devops_agents = [
            ArtifactManagementAgent(),
            PerformanceTestingAgent()
        ]
        
        # Combine all advanced agents
        all_advanced_agents = (advanced_agents + security_agents + human_loop_agents + 
                             git_deploy_agents + analytics_agents + mlops_agents + 
                             advanced_devops_agents + specialized_devops_agents)
        
        for agent in all_advanced_agents:
            agent_id = f"{agent.agent_type.value}_{agent.id[:8]}"
            self.agents[agent_id] = agent
            
            if agent.agent_type not in self.agent_types:
                self.agent_types[agent.agent_type] = []
            self.agent_types[agent.agent_type].append(agent_id)
            
            # Register with metrics system
            system_metrics.register_agent(agent.agent_type.value)
        
        self.logger.info(f"Initialized {len(all_advanced_agents)} advanced agents (including Security, Human-Loop, Git/Deploy, Analytics, MLOps, Advanced DevOps, and Specialized DevOps)")
    
    async def _start_all_agents(self):
        """Start all registered agents"""
        for agent_id, agent in self.agents.items():
            try:
                started = await agent.start()
                if started:
                    self.logger.info(f"Started agent {agent_id}")
                else:
                    self.logger.error(f"Failed to start agent {agent_id}")
            except Exception as e:
                self.logger.error(f"Error starting agent {agent_id}: {str(e)}")
    
    async def _stop_all_agents(self):
        """Stop all registered agents"""
        for agent_id, agent in self.agents.items():
            try:
                await agent.stop()
                self.logger.info(f"Stopped agent {agent_id}")
            except Exception as e:
                self.logger.error(f"Error stopping agent {agent_id}: {str(e)}")
    
    async def _route_task(self, task: AgentTask) -> Optional[str]:
        """Route task to the most appropriate available agent"""
        # Determine required agent type based on task type
        required_agent_type = await self._determine_agent_type_for_task(task)
        
        if required_agent_type not in self.agent_types:
            self.logger.warning(f"No agents available for type {required_agent_type}")
            return None
        
        # Find best available agent
        available_agents = []
        for agent_id in self.agent_types[required_agent_type]:
            agent = self.agents[agent_id]
            if agent.is_active and len(agent.current_tasks) < self.max_concurrent_tasks_per_agent:
                available_agents.append((agent_id, agent))
        
        if not available_agents:
            return None
        
        # Select agent with lowest current load
        best_agent_id, _ = min(available_agents, key=lambda x: len(x[1].current_tasks))
        
        self.load_balancer_stats['total_tasks_routed'] += 1
        return best_agent_id
    
    async def _determine_agent_type_for_task(self, task: AgentTask) -> AgentType:
        """Determine which agent type should handle the task"""
        task_type = task.task_type.lower()
        
        # Map task types to agent types
        if 'cost' in task_type or 'budget' in task_type or 'optimization' in task_type:
            return AgentType.COST_OPTIMIZATION
        elif 'security' in task_type or 'vulnerability' in task_type or 'compliance' in task_type:
            return AgentType.SECURITY_ANALYSIS
        elif 'infrastructure' in task_type or 'health' in task_type or 'performance' in task_type:
            return AgentType.INFRASTRUCTURE
        elif 'devops' in task_type or 'pipeline' in task_type or 'deployment' in task_type:
            return AgentType.DEVOPS
        elif 'code' in task_type or 'terraform' in task_type or 'ansible' in task_type:
            return AgentType.CODE_GENERATION
        elif 'predict' in task_type or 'forecast' in task_type or 'trend' in task_type:
            return AgentType.PREDICTIVE_ANALYTICS
        elif 'incident' in task_type or 'root_cause' in task_type or 'analysis' in task_type:
            return AgentType.ROOT_CAUSE_ANALYSIS
        elif 'architecture' in task_type or 'design' in task_type:
            return AgentType.ARCHITECTURE_DESIGN
        
        # Default to cost optimization for general tasks
        return AgentType.COST_OPTIMIZATION
    
    async def _execute_task_assignment(self, assignment: TaskAssignment):
        """Execute a task assignment"""
        try:
            agent = self.agents[assignment.agent_id]
            
            # Execute the task
            completed_task = await asyncio.wait_for(
                agent.execute_task(assignment.task),
                timeout=self.task_timeout_seconds
            )
            
            # Move to completed tasks
            assignment.task = completed_task
            if assignment.task_id in self.active_tasks:
                del self.active_tasks[assignment.task_id]
            self.completed_tasks.append(assignment)
            
            # Keep only last 1000 completed tasks
            if len(self.completed_tasks) > 1000:
                self.completed_tasks = self.completed_tasks[-1000:]
            
            self.logger.info(f"Task {assignment.task_id} completed successfully")
            
        except asyncio.TimeoutError:
            assignment.task.status = TaskStatus.TIMEOUT
            assignment.task.error = "Task execution timed out"
            self.logger.warning(f"Task {assignment.task_id} timed out")
            
        except Exception as e:
            assignment.task.status = TaskStatus.FAILED
            assignment.task.error = str(e)
            self.logger.error(f"Task {assignment.task_id} failed: {str(e)}")
    
    async def _task_processing_loop(self):
        """Background loop to process queued tasks"""
        while self.status == OrchestratorStatus.RUNNING:
            try:
                if self.task_queue:
                    task = self.task_queue.pop(0)
                    task_id = await self.submit_task(task)
                    if task_id:
                        self.logger.info(f"Processed queued task {task_id}")
                
                await asyncio.sleep(1)  # Check every second
                
            except Exception as e:
                self.logger.error(f"Error in task processing loop: {str(e)}")
                await asyncio.sleep(5)  # Wait longer on error
    
    async def _health_monitoring_loop(self):
        """Background loop to monitor agent health"""
        while self.status == OrchestratorStatus.RUNNING:
            try:
                # Check agent health
                for agent_id, agent in self.agents.items():
                    if not agent.is_active:
                        self.logger.warning(f"Agent {agent_id} is not active, attempting restart")
                        await agent.start()
                
                await asyncio.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                self.logger.error(f"Error in health monitoring loop: {str(e)}")
                await asyncio.sleep(60)  # Wait longer on error
    
    async def _cancel_active_tasks(self):
        """Cancel all active tasks"""
        for task_id, assignment in list(self.active_tasks.items()):
            assignment.task.status = TaskStatus.CANCELLED
            self.logger.info(f"Cancelled task {task_id}")


# Global orchestrator instance
orchestrator = AgentOrchestrator() 