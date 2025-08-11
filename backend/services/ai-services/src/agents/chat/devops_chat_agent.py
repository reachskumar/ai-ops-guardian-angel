"""
DevOps Chat Agent - Unified conversational interface for all AI agents
Provides natural language access to all platform capabilities through intelligent routing
"""

import asyncio
import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

from langchain_openai import ChatOpenAI
from langchain.memory import ConversationSummaryBufferMemory
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

from ..base_agent import BaseAgent, AgentTask, AgentCapabilities, AgentRecommendation
from ...config.settings import AgentType, RiskLevel, settings
from ...orchestrator.agent_orchestrator import AgentOrchestrator
from ...agents.advanced_devops.chatops_orchestrator import ChatOpsOrchestrator


class IntentType(str, Enum):
    """Types of user intents - expanded to cover all 28 agents"""
    # Core Infrastructure Intents
    COST_ANALYSIS = "cost_analysis"
    SECURITY_SCAN = "security_scan"
    DEPLOYMENT = "deployment"
    INFRASTRUCTURE = "infrastructure"
    
    # Advanced AI Intents
    CODE_GENERATION = "code_generation"
    PREDICTIVE_ANALYTICS = "predictive_analytics"
    TROUBLESHOOTING = "troubleshooting"
    ARCHITECTURE_DESIGN = "architecture_design"
    
    # Security & Compliance Intents
    THREAT_HUNTING = "threat_hunting"
    COMPLIANCE = "compliance"
    ZERO_TRUST = "zero_trust"
    
    # Human-in-Loop Intents
    APPROVAL_REQUEST = "approval_request"
    RISK_ASSESSMENT = "risk_assessment"
    DECISION_SUPPORT = "decision_support"
    
    # Git & Deployment Intents
    GIT_INTEGRATION = "git_integration"
    PIPELINE_GENERATION = "pipeline_generation"
    DEPLOYMENT_ORCHESTRATION = "deployment_orchestration"
    
    # Analytics & Monitoring Intents
    REPORTING = "reporting"
    MONITORING = "monitoring"
    CAPACITY_PLANNING = "capacity_planning"
    
    # MLOps Intents
    MODEL_TRAINING = "model_training"
    DATA_PIPELINE = "data_pipeline"
    MODEL_MONITORING = "model_monitoring"
    
    # Advanced DevOps Intents
    DOCKER_MANAGEMENT = "docker_management"
    KUBERNETES_MANAGEMENT = "kubernetes_management"
    
    # Specialized DevOps Intents
    ARTIFACT_MANAGEMENT = "artifact_management"
    PERFORMANCE_TESTING = "performance_testing"
    
    # General
    GENERAL_QUERY = "general_query"


@dataclass
class ParsedIntent:
    """Parsed user intent with context"""
    intent_type: IntentType
    confidence: float
    entities: Dict[str, Any]
    context: Dict[str, Any]
    requires_approval: bool = False
    risk_level: RiskLevel = RiskLevel.LOW


class DevOpsChatAgent(BaseAgent):
    """
    Unified DevOps Chat Agent - The conversational interface to all AI agents.
    
    Capabilities:
    - Natural language understanding and intent parsing
    - Intelligent routing to specialized agents
    - Multi-turn conversation management
    - Human-in-the-loop approval handling
    - Context preservation across conversations
    - Proactive suggestions and recommendations
    """

    def __init__(self):
        capabilities = AgentCapabilities(
            supported_tasks=[
                "natural_language_processing",
                "intent_parsing",
                "agent_routing",
                "conversation_management",
                "approval_handling",
                "context_preservation",
                "proactive_suggestions"
            ],
            required_tools=["llm_parser", "agent_router", "conversation_manager"],
            max_concurrent_tasks=10,
            average_response_time=15.0
        )

        super().__init__(
            agent_type=AgentType.DEVOPS,  # Using DevOps as base type
            name="DevOps Chat Agent",
            description="Unified conversational interface for all AI agents",
            capabilities=capabilities
        )

        # Initialize the orchestrator for agent coordination
        self.orchestrator = AgentOrchestrator()
        self.chatops = ChatOpsOrchestrator()
        
        # Conversation memory for context preservation
        self.conversation_memory = ConversationSummaryBufferMemory(
            llm=self.llm,
            max_token_limit=4000,
            return_messages=True
        )

        # Intent patterns and examples for better parsing - all 28 agents covered
        self.intent_patterns = {
            # Core Infrastructure Intents
            IntentType.COST_ANALYSIS: [
                "cost", "spending", "budget", "billing", "optimization", "savings",
                "aws cost", "azure cost", "gcp cost", "cloud cost", "cost analysis"
            ],
            IntentType.SECURITY_SCAN: [
                "security", "vulnerability", "scan", "threat", "security scan",
                "vulnerability assessment", "security check", "penetration test"
            ],
            IntentType.DEPLOYMENT: [
                "deploy", "deployment", "release", "devops", "automation",
                "deploy to", "release to", "devops automation"
            ],
            IntentType.INFRASTRUCTURE: [
                "infrastructure", "provision", "scale", "health", "resources",
                "provision resources", "infrastructure health", "system health"
            ],
            
            # Advanced AI Intents
            IntentType.CODE_GENERATION: [
                "generate", "terraform", "ansible", "iac", "infrastructure as code",
                "generate terraform", "create ansible", "write code", "code generation"
            ],
            IntentType.PREDICTIVE_ANALYTICS: [
                "predict", "forecast", "trend", "analytics", "prediction",
                "predictive analysis", "forecast trends", "predict usage"
            ],
            IntentType.TROUBLESHOOTING: [
                "troubleshoot", "debug", "issue", "problem", "error", "root cause",
                "fix issue", "debug problem", "troubleshoot error", "root cause analysis"
            ],
            IntentType.ARCHITECTURE_DESIGN: [
                "architecture", "design", "blueprint", "system design", "architectural",
                "design system", "architecture review", "system architecture"
            ],
            
            # Security & Compliance Intents
            IntentType.THREAT_HUNTING: [
                "threat", "hunting", "threat hunting", "advanced threat", "apt",
                "threat detection", "hunt threats", "security hunting"
            ],
            IntentType.COMPLIANCE: [
                "compliance", "audit", "policy", "soc2", "hipaa", "gdpr",
                "compliance check", "audit report", "policy enforcement"
            ],
            IntentType.ZERO_TRUST: [
                "zero trust", "zero-trust", "trust", "access control", "identity",
                "zero trust security", "access management", "identity verification"
            ],
            
            # Human-in-Loop Intents
            IntentType.APPROVAL_REQUEST: [
                "approve", "approval", "request approval", "need approval", "authorize",
                "approval workflow", "human approval", "manual approval"
            ],
            IntentType.RISK_ASSESSMENT: [
                "risk", "assessment", "risk assessment", "evaluate risk", "risk analysis",
                "assess risk", "risk evaluation", "security risk"
            ],
            IntentType.DECISION_SUPPORT: [
                "decision", "support", "recommendation", "advice", "suggest",
                "decision support", "what should", "recommend", "guidance"
            ],
            
            # Git & Deployment Intents
            IntentType.GIT_INTEGRATION: [
                "git", "repository", "repo", "version control", "commit",
                "git integration", "git workflow", "source control"
            ],
            IntentType.PIPELINE_GENERATION: [
                "pipeline", "ci/cd", "continuous", "generate pipeline", "create pipeline",
                "pipeline generation", "build pipeline", "deployment pipeline"
            ],
            IntentType.DEPLOYMENT_ORCHESTRATION: [
                "orchestration", "orchestrate", "coordinate", "deployment orchestration",
                "orchestrate deployment", "coordinate release", "manage deployment"
            ],
            
            # Analytics & Monitoring Intents
            IntentType.REPORTING: [
                "report", "dashboard", "insights", "summary", "business intelligence",
                "generate report", "show dashboard", "analytics summary"
            ],
            IntentType.MONITORING: [
                "monitor", "alert", "metrics", "performance", "logs", "anomaly",
                "check status", "show metrics", "monitor performance", "anomaly detection"
            ],
            IntentType.CAPACITY_PLANNING: [
                "capacity", "planning", "scaling", "capacity planning", "scale planning",
                "resource planning", "capacity analysis", "scaling strategy"
            ],
            
            # MLOps Intents
            IntentType.MODEL_TRAINING: [
                "train", "model", "machine learning", "ml", "training", "model training",
                "train model", "ml training", "model development"
            ],
            IntentType.DATA_PIPELINE: [
                "data", "etl", "data pipeline", "data processing", "data flow",
                "process data", "data transformation", "data ingestion"
            ],
            IntentType.MODEL_MONITORING: [
                "model monitoring", "ml monitoring", "drift", "model performance",
                "monitor model", "model drift", "model health", "ml metrics"
            ],
            
            # Advanced DevOps Intents
            IntentType.DOCKER_MANAGEMENT: [
                "docker", "container", "containerize", "docker management", "containers",
                "docker build", "container orchestration", "containerization"
            ],
            IntentType.KUBERNETES_MANAGEMENT: [
                "kubernetes", "k8s", "cluster", "kubernetes management", "k8s cluster",
                "kubernetes deployment", "cluster management", "k8s orchestration"
            ],
            
            # Specialized DevOps Intents
            IntentType.ARTIFACT_MANAGEMENT: [
                "artifact", "binary", "package", "artifact management", "versioning",
                "manage artifacts", "artifact storage", "package management"
            ],
            IntentType.PERFORMANCE_TESTING: [
                "performance", "load test", "stress test", "benchmark", "performance testing",
                "load testing", "stress testing", "performance analysis"
            ]
        }

        self.logger.info("DevOps Chat Agent initialized with orchestrator")

    async def _execute_task_logic(self, task: AgentTask) -> Dict[str, Any]:
        """Execute chat-related tasks"""
        task_type = task.task_type
        context = task.context

        if task_type == "process_message":
            return await self._process_user_message(context)
        elif task_type == "generate_response":
            return await self._generate_chat_response(context)
        elif task_type == "route_intent":
            return await self._route_intent_to_agent(context)
        elif task_type == "handle_approval":
            return await self._handle_approval_request(context)
        else:
            raise ValueError(f"Unsupported chat task: {task_type}")

    async def _generate_recommendation_logic(
        self,
        context: Dict[str, Any],
        task_type: str
    ) -> Dict[str, Any]:
        """Generate chat-based recommendations"""
        
        if task_type == "proactive_suggestion":
            return await self._generate_proactive_suggestion(context)
        
        return {
            "title": "Chat Assistant Available",
            "description": "I can help you with any DevOps task using natural language",
            "reasoning": "Available for cost analysis, security scanning, deployments, monitoring, and more",
            "confidence": 0.95,
            "impact": "Streamlined DevOps operations through conversation",
            "risk_level": RiskLevel.LOW
        }

    async def _analyze_data_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze conversation data for insights"""
        conversation_history = data.get('conversation_history', [])
        user_patterns = data.get('user_patterns', {})
        
        # Analyze conversation patterns
        intent_frequency = {}
        common_issues = []
        
        for message in conversation_history:
            if 'intent' in message:
                intent = message['intent']
                intent_frequency[intent] = intent_frequency.get(intent, 0) + 1
        
        return {
            'conversation_insights': {
                'total_messages': len(conversation_history),
                'intent_frequency': intent_frequency,
                'common_issues': common_issues,
                'user_satisfaction': 0.85  # Placeholder
            },
            'analysis_timestamp': datetime.now().isoformat()
        }

    async def process_message(self, message: str, user_id: str, session_id: str = None, tenant_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Main entry point for processing user messages
        """
        try:
            self.logger.info(f"Processing message from user {user_id}: {message[:50]}...")

            # Parse intent from user message
            parsed_intent = await self._parse_intent(message, user_id)
            
            # Add to conversation memory
            self.conversation_memory.chat_memory.add_user_message(message)
            
            # Route to appropriate agent or handle directly
            if parsed_intent.intent_type == IntentType.GENERAL_QUERY:
                response = await self._handle_general_query(message, parsed_intent)
            else:
                # For deployment and k8s intents, attempt ChatOps dispatch first
                if parsed_intent.intent_type in [
                    IntentType.DEPLOYMENT,
                    IntentType.KUBERNETES_MANAGEMENT,
                ]:
                    response = await self._handle_chatops(message, parsed_intent, tenant_id=tenant_id)
                else:
                    response = await self._route_to_specialized_agent(message, parsed_intent, user_id)
            
            # Add response to memory
            self.conversation_memory.chat_memory.add_ai_message(response['message'])
            
            # Generate follow-up suggestions
            suggestions = await self._generate_follow_up_suggestions(parsed_intent, response)
            
            return {
                'message': response['message'],
                'intent': parsed_intent.intent_type.value,
                'confidence': parsed_intent.confidence,
                'requires_approval': response.get('requires_approval', False),
                'actions': response.get('actions', []),
                'suggestions': suggestions,
                'session_id': session_id,
                'timestamp': datetime.now().isoformat()
            }

        except Exception as e:
            self.logger.error(f"Error processing message: {str(e)}")
            return {
                'message': f"I encountered an error processing your request: {str(e)}. Please try again or contact support.",
                'error': True,
                'timestamp': datetime.now().isoformat()
            }

    async def _handle_chatops(self, message: str, parsed_intent: ParsedIntent, tenant_id: Optional[str]) -> Dict[str, Any]:
        entities = parsed_intent.entities
        env = entities.get('environment', 'staging')
        service = entities.get('service', 'ai-services')
        action = entities.get('action')
        subaction = entities.get('subaction')
        replicas = entities.get('replicas')
        node_name = entities.get('node_name')
        try:
            self.chatops = ChatOpsOrchestrator(tenant_id=tenant_id) if tenant_id else self.chatops
            if parsed_intent.intent_type == IntentType.DEPLOYMENT:
                result = self.chatops.deploy(environment=env, service=service, strategy='rolling')
                return {
                    'message': f"Triggered deployment for {service} in {env}. Workflow dispatched.",
                    'actions': [{'type': 'workflow_dispatch', 'result': result}],
                }
            elif parsed_intent.intent_type == IntentType.KUBERNETES_MANAGEMENT:
                # Route common sub-ops
                if action == 'scale' and replicas is not None:
                    result = self.chatops.scale(environment=env, service=service, replicas=int(replicas))
                elif action == 'restart':
                    result = self.chatops.restart(environment=env, service=service)
                elif action == 'rollout' and subaction:
                    result = self.chatops.rollout(environment=env, service=service, subaction=subaction)
                elif action == 'logs':
                    result = self.chatops.logs(environment=env, service=service)
                elif action == 'events':
                    result = self.chatops.logs(environment=env, service=service)  # events uploaded alongside logs
                elif action == 'node' and node_name and subaction:
                    result = self.chatops.node(node_name=node_name, subaction=subaction, environment=env)
                elif action == 'gitops_pr':
                    image_tag = entities.get('image_tag') or 'latest'
                    result = self.chatops.gitops_pr(environment=env, service=service, image_tag=image_tag)
                elif action == 'promote':
                    result = self.chatops.promote(environment=env, service=service)
                elif action == 'abort':
                    result = self.chatops.abort(environment=env, service=service)
                else:
                    # Default to restart if not specified
                    result = self.chatops.restart(environment=env, service=service)
                return {
                    'message': f"Triggered restart for {service} in {env}. Workflow dispatched.",
                    'actions': [{'type': 'workflow_dispatch', 'result': result}],
                }
        except Exception as e:
            return {
                'message': f"Failed to trigger ChatOps action: {str(e)}",
                'error': True,
            }
        return {
            'message': "No ChatOps action matched.",
            'actions': []
        }

    async def _parse_intent(self, message: str, user_id: str) -> ParsedIntent:
        """Parse user intent using LLM and pattern matching"""
        
        # First, try pattern matching for quick intent detection
        intent_type, confidence = self._pattern_match_intent(message.lower())
        
        # If pattern matching is not confident, use LLM
        if confidence < 0.7:
            intent_type, confidence, entities = await self._llm_parse_intent(message)
        else:
            entities = self._extract_entities(message, intent_type)
        
        # Determine if approval is needed based on intent
        requires_approval = self._requires_approval(intent_type, entities)
        risk_level = self._assess_risk_level(intent_type, entities)
        
        return ParsedIntent(
            intent_type=intent_type,
            confidence=confidence,
            entities=entities,
            context={'user_id': user_id, 'timestamp': datetime.now()},
            requires_approval=requires_approval,
            risk_level=risk_level
        )

    def _pattern_match_intent(self, message: str) -> Tuple[IntentType, float]:
        """Quick pattern matching for intent detection"""
        message_lower = message.lower()
        
        for intent_type, patterns in self.intent_patterns.items():
            for pattern in patterns:
                if pattern in message_lower:
                    return intent_type, 0.8
        
        return IntentType.GENERAL_QUERY, 0.3

    async def _llm_parse_intent(self, message: str) -> Tuple[IntentType, float, Dict[str, Any]]:
        """Use LLM for more sophisticated intent parsing"""
        
        system_prompt = """
        You are an intent parser for a DevOps AI platform. Analyze the user message and determine:
        1. The primary intent (cost_analysis, security_scan, deployment, infrastructure, monitoring, compliance, troubleshooting, reporting, general_query)
        2. Confidence level (0.0-1.0)
        3. Key entities (environment, service, cloud_provider, etc.)
        
        Respond in JSON format:
        {
            "intent": "intent_type",
            "confidence": 0.85,
            "entities": {
                "environment": "production",
                "service": "web-app",
                "cloud_provider": "aws"
            }
        }
        """
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Parse intent for: {message}")
        ]
        
        try:
            response = await self.llm.agenerate([messages])
            result_text = response.generations[0][0].text
            
            # Parse JSON response
            result = json.loads(result_text)
            
            intent_type = IntentType(result.get('intent', 'general_query'))
            confidence = result.get('confidence', 0.5)
            entities = result.get('entities', {})
            
            return intent_type, confidence, entities
            
        except Exception as e:
            self.logger.warning(f"LLM intent parsing failed: {str(e)}, falling back to pattern matching")
            return IntentType.GENERAL_QUERY, 0.5, {}

    def _extract_entities(self, message: str, intent_type: IntentType) -> Dict[str, Any]:
        """Extract entities from message based on intent type"""
        entities = {}
        message_lower = message.lower()
        
        # Environment detection
        if 'prod' in message_lower or 'production' in message_lower:
            entities['environment'] = 'production'
        elif 'staging' in message_lower:
            entities['environment'] = 'staging'
        elif 'dev' in message_lower or 'development' in message_lower:
            entities['environment'] = 'development'
        
        # Cloud provider detection
        if 'aws' in message_lower:
            entities['cloud_provider'] = 'aws'
        elif 'azure' in message_lower:
            entities['cloud_provider'] = 'azure'
        elif 'gcp' in message_lower or 'google' in message_lower:
            entities['cloud_provider'] = 'gcp'
        
        # Service detection
        if 'web' in message_lower or 'app' in message_lower:
            entities['service'] = 'web-app'
        elif 'api' in message_lower:
            entities['service'] = 'api'
        elif 'database' in message_lower or 'db' in message_lower:
            entities['service'] = 'database'
        
        return entities

    def _requires_approval(self, intent_type: IntentType, entities: Dict[str, Any]) -> bool:
        """Determine if the action requires human approval"""
        
        # High-risk actions that require approval
        high_risk_intents = [
            IntentType.DEPLOYMENT,
            IntentType.INFRASTRUCTURE
        ]
        
        # Production environment actions require approval
        if entities.get('environment') == 'production':
            return True
        
        # High-risk intents require approval
        if intent_type in high_risk_intents:
            return True
        
        return False

    def _assess_risk_level(self, intent_type: IntentType, entities: Dict[str, Any]) -> RiskLevel:
        """Assess the risk level of the intended action"""
        
        if entities.get('environment') == 'production':
            return RiskLevel.HIGH
        
        if intent_type in [IntentType.DEPLOYMENT, IntentType.INFRASTRUCTURE]:
            return RiskLevel.MEDIUM
        
        if intent_type in [IntentType.SECURITY_SCAN, IntentType.COMPLIANCE]:
            return RiskLevel.LOW
        
        return RiskLevel.LOW

    async def _route_to_specialized_agent(self, message: str, parsed_intent: ParsedIntent, user_id: str) -> Dict[str, Any]:
        """Route the request to the appropriate specialized agent"""
        
        # Map intent to agent type - complete mapping for all 28 agents
        agent_mapping = {
            # Core Infrastructure Agents
            IntentType.COST_ANALYSIS: AgentType.COST_OPTIMIZATION,
            IntentType.SECURITY_SCAN: AgentType.SECURITY_ANALYSIS,
            IntentType.DEPLOYMENT: AgentType.DEVOPS,
            IntentType.INFRASTRUCTURE: AgentType.INFRASTRUCTURE,
            
            # Advanced AI Agents
            IntentType.CODE_GENERATION: AgentType.CODE_GENERATION,
            IntentType.PREDICTIVE_ANALYTICS: AgentType.PREDICTIVE_ANALYTICS,
            IntentType.TROUBLESHOOTING: AgentType.ROOT_CAUSE_ANALYSIS,
            IntentType.ARCHITECTURE_DESIGN: AgentType.ARCHITECTURE_DESIGN,
            
            # Security & Compliance Agents
            IntentType.THREAT_HUNTING: AgentType.THREAT_HUNTING,
            IntentType.COMPLIANCE: AgentType.COMPLIANCE_AUTOMATION,
            IntentType.ZERO_TRUST: AgentType.ZERO_TRUST_SECURITY,
            
            # Human-in-Loop Agents
            IntentType.APPROVAL_REQUEST: AgentType.APPROVAL_WORKFLOW,
            IntentType.RISK_ASSESSMENT: AgentType.RISK_ASSESSMENT,
            IntentType.DECISION_SUPPORT: AgentType.DECISION_SUPPORT,
            
            # Git & Deployment Agents
            IntentType.GIT_INTEGRATION: AgentType.GIT_INTEGRATION,
            IntentType.PIPELINE_GENERATION: AgentType.PIPELINE_GENERATION,
            IntentType.DEPLOYMENT_ORCHESTRATION: AgentType.DEPLOYMENT_ORCHESTRATION,
            
            # Analytics & Monitoring Agents
            IntentType.REPORTING: AgentType.BUSINESS_INTELLIGENCE,
            IntentType.MONITORING: AgentType.ANOMALY_DETECTION,
            IntentType.CAPACITY_PLANNING: AgentType.CAPACITY_PLANNING,
            
            # MLOps Agents
            IntentType.MODEL_TRAINING: AgentType.MODEL_TRAINING,
            IntentType.DATA_PIPELINE: AgentType.DATA_PIPELINE,
            IntentType.MODEL_MONITORING: AgentType.MODEL_MONITORING,
            
            # Advanced DevOps Agents
            IntentType.DOCKER_MANAGEMENT: AgentType.DOCKER,
            IntentType.KUBERNETES_MANAGEMENT: AgentType.KUBERNETES,
            
            # Specialized DevOps Agents
            IntentType.ARTIFACT_MANAGEMENT: AgentType.ARTIFACT_MANAGEMENT,
            IntentType.PERFORMANCE_TESTING: AgentType.PERFORMANCE_TESTING
        }
        
        target_agent_type = agent_mapping.get(parsed_intent.intent_type)
        
        if not target_agent_type:
            return await self._handle_general_query(message, parsed_intent)
        
        try:
            # Get the appropriate agent from orchestrator
            agent = await self.orchestrator.get_agent(target_agent_type)
            
            if not agent:
                return {
                    'message': f"I understand you want to perform {parsed_intent.intent_type.value}, but the specialized agent is not available. Please try again later.",
                    'requires_approval': False
                }
            
            # Create a task for the specialized agent
            task = AgentTask(
                task_type=parsed_intent.intent_type.value,
                description=message,
                context={
                    'user_message': message,
                    'entities': parsed_intent.entities,
                    'user_id': user_id,
                    'requires_approval': parsed_intent.requires_approval
                },
                priority='high' if parsed_intent.risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL] else 'medium'
            )
            
            # Execute the task
            result = await agent.execute_task(task)
            
            if result.status == 'completed':
                # Generate a natural language response from the result
                response_message = await self._format_agent_response(result.result, parsed_intent)
                
                return {
                    'message': response_message,
                    'requires_approval': parsed_intent.requires_approval,
                    'actions': result.result.get('actions', []),
                    'agent_type': target_agent_type.value
                }
            else:
                return {
                    'message': f"I tried to process your request but encountered an issue: {result.error}. Please try again or contact support.",
                    'requires_approval': False
                }
                
        except Exception as e:
            self.logger.error(f"Error routing to specialized agent: {str(e)}")
            return {
                'message': f"I encountered an error while processing your request. Please try again or contact support.",
                'requires_approval': False
            }

    async def _handle_general_query(self, message: str, parsed_intent: ParsedIntent) -> Dict[str, Any]:
        """Handle general queries and questions"""
        
        system_prompt = """
        You are a helpful DevOps AI assistant. Provide clear, concise answers about DevOps topics,
        infrastructure, cloud computing, security, and best practices. Be informative but conversational.
        """
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=message)
        ]
        
        try:
            response = await self.llm.agenerate([messages])
            response_text = response.generations[0][0].text
            
            return {
                'message': response_text,
                'requires_approval': False
            }
        except Exception as e:
            return {
                'message': "I'm here to help with DevOps tasks! You can ask me about cost optimization, security scanning, deployments, monitoring, and more. What would you like to do?",
                'requires_approval': False
            }

    async def _format_agent_response(self, result: Dict[str, Any], parsed_intent: ParsedIntent) -> str:
        """Format agent results into natural language response"""
        
        if parsed_intent.intent_type == IntentType.COST_ANALYSIS:
            total_cost = result.get('total_monthly_cost', 0)
            potential_savings = result.get('potential_savings', 0)
            
            return f"""
            📊 **Cost Analysis Complete**
            
            Your current monthly cloud spending is **${total_cost:,.2f}**.
            
            I've identified **${potential_savings:,.2f}** in potential monthly savings through:
            • Rightsizing opportunities: ${result.get('rightsizing_savings', 0):,.2f}
            • Reserved instance optimization: ${result.get('ri_savings', 0):,.2f}
            • Storage optimization: ${result.get('storage_savings', 0):,.2f}
            
            Would you like me to implement these optimizations?
            """
        
        elif parsed_intent.intent_type == IntentType.SECURITY_SCAN:
            threats_found = result.get('threats_detected', [])
            threat_score = result.get('overall_threat_score', 0)
            
            return f"""
            🔒 **Security Scan Complete**
            
            Overall threat score: **{threat_score}/100**
            Threats detected: **{len(threats_found)}**
            
            {'🚨 **High-severity threats found!** Immediate action required.' if threat_score > 70 else '✅ Security posture looks good.'}
            
            Would you like me to investigate specific threats or generate a detailed report?
            """
        
        elif parsed_intent.intent_type == IntentType.DEPLOYMENT:
            return f"""
            🚀 **Deployment Analysis**
            
            {result.get('message', 'Deployment analysis completed.')}
            
            {f"⚠️ **Approval Required**: This deployment requires human approval before proceeding." if parsed_intent.requires_approval else "✅ Ready to proceed with deployment."}
            """
        
        else:
            # Generic response for other agent types
            return result.get('message', 'Task completed successfully. Is there anything else you need help with?')

    async def _generate_follow_up_suggestions(self, parsed_intent: ParsedIntent, response: Dict[str, Any]) -> List[str]:
        """Generate contextual follow-up suggestions"""
        
        suggestions = []
        
        if parsed_intent.intent_type == IntentType.COST_ANALYSIS:
            suggestions.extend([
                "Show me a detailed cost breakdown",
                "Implement the cost optimizations",
                "Set up cost alerts",
                "Generate a cost forecast"
            ])
        
        elif parsed_intent.intent_type == IntentType.SECURITY_SCAN:
            suggestions.extend([
                "Show me the detailed security report",
                "Fix the identified vulnerabilities",
                "Set up continuous security monitoring",
                "Run a compliance check"
            ])
        
        elif parsed_intent.intent_type == IntentType.DEPLOYMENT:
            suggestions.extend([
                "Show me the deployment status",
                "Rollback the deployment",
                "Check deployment logs",
                "Monitor application performance"
            ])
        
        # Always include general suggestions
        suggestions.extend([
            "What can you help me with?",
            "Show me the system status",
            "Generate a summary report"
        ])
        
        return suggestions[:5]  # Limit to 5 suggestions

    async def _generate_proactive_suggestion(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate proactive suggestions based on context"""
        
        return {
            "title": "Proactive DevOps Assistant",
            "description": "I can help you with any DevOps task - just ask!",
            "reasoning": "Available for cost optimization, security scanning, deployments, monitoring, and more",
            "confidence": 0.95,
            "impact": "Streamlined DevOps operations through natural language",
            "risk_level": RiskLevel.LOW,
            "suggestions": [
                "Analyze cloud costs and find savings",
                "Scan for security vulnerabilities",
                "Deploy to staging environment",
                "Check system health and performance",
                "Generate compliance reports"
            ]
        }

    async def get_conversation_history(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get conversation history for a user"""
        # This would typically fetch from a database
        # For now, return recent messages from memory
        messages = self.conversation_memory.chat_memory.messages
        return [
            {
                'role': 'user' if isinstance(msg, HumanMessage) else 'assistant',
                'content': msg.content,
                'timestamp': datetime.now().isoformat()
            }
            for msg in messages[-limit*2:]  # Get last N exchanges
        ]

    async def clear_conversation_history(self, user_id: str) -> bool:
        """Clear conversation history for a user"""
        try:
            self.conversation_memory.clear()
            return True
        except Exception as e:
            self.logger.error(f"Error clearing conversation history: {str(e)}")
            return False 