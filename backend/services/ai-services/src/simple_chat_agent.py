#!/usr/bin/env python3
"""
Simplified Chat Agent - Import-safe version for immediate functionality
This bypasses the complex import issues while providing core chat capabilities
"""

from datetime import datetime
from typing import Dict, Any, List
from enum import Enum
from simple_orchestrator import SimpleOrchestrator
from workflow_orchestrator import WorkflowOrchestrator, WorkflowType
from session_manager import SessionManager

class IntentType(str, Enum):
    # Core Infrastructure (5)
    COST_ANALYSIS = "cost_analysis"
    SECURITY_SCAN = "security_scan"
    INFRASTRUCTURE = "infrastructure"
    DOCKER_MANAGEMENT = "docker_management"
    KUBERNETES_MANAGEMENT = "kubernetes_management"
    
    # Advanced AI & Analytics (6)
    ANALYTICS_INSIGHT = "analytics_insight"
    PERFORMANCE_MONITORING = "performance_monitoring"
    PREDICTIVE_ANALYSIS = "predictive_analysis"
    ANOMALY_DETECTION = "anomaly_detection"
    CAPACITY_PLANNING = "capacity_planning"
    RESOURCE_OPTIMIZATION = "resource_optimization"
    
    # Security & Compliance (4)
    VULNERABILITY_ASSESSMENT = "vulnerability_assessment"
    COMPLIANCE_AUDIT = "compliance_audit"
    PENETRATION_TESTING = "penetration_testing"
    IDENTITY_MANAGEMENT = "identity_management"
    
    # Human-in-Loop & Collaboration (3)
    APPROVAL_WORKFLOW = "approval_workflow"
    COLLABORATION = "collaboration"
    NOTIFICATION = "notification"
    
    # Git & Deployment (4)
    DEPLOYMENT = "deployment"
    DEPLOYMENT_ORCHESTRATION = "deployment_orchestration"
    GIT_INTEGRATION = "git_integration"
    ROLLBACK_MANAGEMENT = "rollback_management"
    
    # MLOps (3)
    MODEL_TRAINING = "model_training"
    MODEL_MONITORING = "model_monitoring"
    DATA_PIPELINE = "data_pipeline"
    
    # Advanced DevOps (2)
    ARTIFACT_MANAGEMENT = "artifact_management"
    PERFORMANCE_TESTING = "performance_testing"
    
    # Specialized (1)
    GENERAL_DEVOPS = "general_devops"
    
    # General fallback
    GENERAL_QUERY = "general_query"

class SimpleChatAgent:
    """Advanced chat agent with workflow orchestration and session memory"""
    
    def __init__(self):
        self.name = "DevOps Chat Agent"
        self.description = "AI-powered DevOps assistant with advanced workflow orchestration and context memory"
        
        # Initialize the real orchestrator
        print("🔗 Connecting to real agent orchestrator...")
        self.orchestrator = SimpleOrchestrator()
        print("✅ Real agent orchestrator connected")
        
        # Initialize workflow orchestrator
        print("🔄 Initializing workflow orchestrator...")
        self.workflow_orchestrator = WorkflowOrchestrator(self.orchestrator)
        print("✅ Workflow orchestrator ready")
        
        # Initialize session manager
        print("🧠 Initializing session memory...")
        self.session_manager = SessionManager()
        print("✅ Session memory system active")
        
        # Core agents that have real implementation - now all 28 agents!
        self.real_agents = {
            # Core Infrastructure (5)
            "cost_analysis", "security_scan", "infrastructure", 
            "docker_management", "kubernetes_management",
            
            # Advanced AI & Analytics (6)
            "analytics_insight", "performance_monitoring", "predictive_analysis",
            "anomaly_detection", "capacity_planning", "resource_optimization",
            
            # Security & Compliance (4)
            "vulnerability_assessment", "compliance_audit", 
            "penetration_testing", "identity_management",
            
            # Human-in-Loop & Collaboration (3)
            "approval_workflow", "collaboration", "notification",
            
            # Git & Deployment (4)
            "deployment", "deployment_orchestration", "git_integration", "rollback_management",
            
            # MLOps (3)
            "model_training", "model_monitoring", "data_pipeline",
            
            # Advanced DevOps (2)
            "artifact_management", "performance_testing",
            
            # Specialized (1)
            "general_devops"
        }
        
        # Intent patterns for keyword matching - ALL 28 AGENTS
        self.intent_patterns = {
            # Core Infrastructure (5)
            IntentType.COST_ANALYSIS: [
                "cost", "costs", "pricing", "budget", "billing", "spend", "expense", 
                "optimization", "savings", "aws costs", "cloud costs", "money"
            ],
            IntentType.SECURITY_SCAN: [
                "security", "vulnerability", "scan", "threat", "breach", "attack",
                "secure", "protection", "risks", "audit", "compliance"
            ],
            IntentType.INFRASTRUCTURE: [
                "infrastructure", "health", "status", "monitoring", "uptime", 
                "servers", "resources", "system", "performance", "availability"
            ],
            IntentType.DOCKER_MANAGEMENT: [
                "docker", "container", "containers", "images", "dockerfile", 
                "containerize", "pods", "registry", "build"
            ],
            IntentType.KUBERNETES_MANAGEMENT: [
                "kubernetes", "k8s", "cluster", "deployment", "pods", "services",
                "kubectl", "helm", "namespace", "scaling"
            ],
            
            # Advanced AI & Analytics (6)
            IntentType.ANALYTICS_INSIGHT: [
                "analytics", "insights", "performance metrics", "trends", "analysis",
                "data", "statistics", "reporting", "dashboard", "kpi"
            ],
            IntentType.PERFORMANCE_MONITORING: [
                "performance", "monitor", "monitoring", "metrics", "latency",
                "response time", "throughput", "bottleneck", "slow"
            ],
            IntentType.PREDICTIVE_ANALYSIS: [
                "predict", "forecast", "predictive", "trend", "future", 
                "prediction", "machine learning", "ai analysis", "patterns"
            ],
            IntentType.ANOMALY_DETECTION: [
                "anomaly", "anomalies", "unusual", "detect", "detection", "outlier",
                "abnormal", "strange", "irregular", "deviation"
            ],
            IntentType.CAPACITY_PLANNING: [
                "capacity", "planning", "scale", "scaling", "growth", "resources",
                "demand", "load", "utilization", "expansion"
            ],
            IntentType.RESOURCE_OPTIMIZATION: [
                "optimize", "optimization", "efficiency", "resource", "usage",
                "utilization", "performance tuning", "improve"
            ],
            
            # Security & Compliance (4)
            IntentType.VULNERABILITY_ASSESSMENT: [
                "vulnerability", "assessment", "cve", "security holes", "weaknesses",
                "penetration", "security test", "exploit", "patch"
            ],
            IntentType.COMPLIANCE_AUDIT: [
                "compliance", "audit", "regulation", "standards", "soc2", "pci",
                "gdpr", "hipaa", "iso", "certification"
            ],
            IntentType.PENETRATION_TESTING: [
                "penetration", "pentest", "ethical hacking", "security testing",
                "red team", "attack simulation", "breach test"
            ],
            IntentType.IDENTITY_MANAGEMENT: [
                "identity", "iam", "access", "authentication", "authorization",
                "users", "roles", "permissions", "sso", "oauth"
            ],
            
            # Human-in-Loop & Collaboration (3)
            IntentType.APPROVAL_WORKFLOW: [
                "approval", "approve", "workflow", "review", "authorization",
                "permission", "sign off", "validation", "confirm"
            ],
            IntentType.COLLABORATION: [
                "collaborate", "team", "sharing", "communication", "notify",
                "teamwork", "coordination", "discussion"
            ],
            IntentType.NOTIFICATION: [
                "notify", "notification", "alert", "message", "email", "slack",
                "notification", "inform", "update", "reminder"
            ],
            
            # Git & Deployment (4)
            IntentType.DEPLOYMENT: [
                "deploy", "deployment", "release", "publish", "go live", 
                "production", "staging", "environment", "launch"
            ],
            IntentType.DEPLOYMENT_ORCHESTRATION: [
                "orchestration", "pipeline", "ci/cd", "automation", "workflow",
                "build", "integration", "continuous"
            ],
            IntentType.GIT_INTEGRATION: [
                "git", "github", "gitlab", "repository", "commit", "branch",
                "merge", "pull request", "version control", "code"
            ],
            IntentType.ROLLBACK_MANAGEMENT: [
                "rollback", "revert", "undo", "previous version", "restore",
                "downgrade", "emergency", "hotfix"
            ],
            
            # MLOps (3)
            IntentType.MODEL_TRAINING: [
                "train", "training", "model", "machine learning", "ml", "ai",
                "algorithm", "dataset", "learning", "neural network"
            ],
            IntentType.MODEL_MONITORING: [
                "model monitoring", "model health", "drift", "accuracy", 
                "performance", "ml monitoring", "model metrics"
            ],
            IntentType.DATA_PIPELINE: [
                "data pipeline", "etl", "data processing", "data flow",
                "ingestion", "transformation", "data engineering"
            ],
            
            # Advanced DevOps (2)
            IntentType.ARTIFACT_MANAGEMENT: [
                "artifact", "artifacts", "packages", "libraries", "dependencies",
                "repository", "storage", "versions", "binaries"
            ],
            IntentType.PERFORMANCE_TESTING: [
                "performance test", "load test", "stress test", "benchmark",
                "testing", "performance", "load", "stress"
            ],
            
            # Specialized (1)
            IntentType.GENERAL_DEVOPS: [
                "devops", "general", "help", "assistance", "support", "guidance",
                "automation", "operations", "engineering"
            ]
        }
        
        # Agent responses for each intent
        self.agent_responses = {
            IntentType.COST_ANALYSIS: {
                "agent": "Cost Optimization Agent",
                "message": "🔍 Analyzing your cloud costs and identifying optimization opportunities...",
                "actions": [
                    {"type": "view", "title": "View cost breakdown by service", "endpoint": "/costs/breakdown"},
                    {"type": "report", "title": "Generate cost optimization report", "endpoint": "/costs/report"},
                    {"type": "configure", "title": "Set up budget alerts", "endpoint": "/costs/alerts"}
                ],
                "confidence": 0.85
            },
            IntentType.SECURITY_SCAN: {
                "agent": "Security Analysis Agent", 
                "message": "🛡️ Performing comprehensive security scan across your infrastructure...",
                "actions": [
                    {"type": "view", "title": "View vulnerability report", "endpoint": "/security/vulnerabilities"},
                    {"type": "review", "title": "Review security recommendations", "endpoint": "/security/recommendations"},
                    {"type": "schedule", "title": "Schedule automated scans", "endpoint": "/security/schedule"}
                ],
                "confidence": 0.88
            },
            IntentType.INFRASTRUCTURE: {
                "agent": "Infrastructure Agent",
                "message": "🏗️ Analyzing infrastructure health and performance metrics...",
                "actions": [
                    {"type": "dashboard", "title": "View system health dashboard", "endpoint": "/infrastructure/health"},
                    {"type": "metrics", "title": "Check resource utilization", "endpoint": "/infrastructure/metrics"},
                    {"type": "recommendations", "title": "Review scaling recommendations", "endpoint": "/infrastructure/scaling"}
                ],
                "confidence": 0.82
            },
            IntentType.DOCKER_MANAGEMENT: {
                "agent": "Docker Agent",
                "message": "🐳 Managing Docker containers and optimizing containerization strategy...",
                "actions": [
                    {"type": "status", "title": "View container status", "endpoint": "/docker/containers"},
                    {"type": "optimize", "title": "Optimize Docker images", "endpoint": "/docker/optimize"},
                    {"type": "deploy", "title": "Deploy new containers", "endpoint": "/docker/deploy"}
                ],
                "confidence": 0.90
            },
            IntentType.KUBERNETES_MANAGEMENT: {
                "agent": "Kubernetes Agent",
                "message": "☸️ Managing Kubernetes cluster and orchestrating deployments...",
                "actions": [
                    {"type": "status", "title": "View cluster status", "endpoint": "/kubernetes/cluster"},
                    {"type": "scale", "title": "Scale deployments", "endpoint": "/kubernetes/scale"},
                    {"type": "configure", "title": "Configure service mesh", "endpoint": "/kubernetes/mesh"}
                ],
                "confidence": 0.87
            }
        }
    
    def detect_intent(self, message: str) -> Dict[str, Any]:
        """Simple keyword-based intent detection"""
        message_lower = message.lower()
        
        # Score each intent based on keyword matches
        intent_scores = {}
        for intent, patterns in self.intent_patterns.items():
            score = 0
            for pattern in patterns:
                if pattern.lower() in message_lower:
                    score += 1
            if score > 0:
                intent_scores[intent] = score
        
        # Return the highest scoring intent
        if intent_scores:
            best_intent = max(intent_scores.keys(), key=lambda k: intent_scores[k])
            confidence = min(0.95, intent_scores[best_intent] * 0.2 + 0.5)
            return {
                "intent": best_intent,
                "confidence": confidence,
                "matched_patterns": intent_scores[best_intent]
            }
        
        return {
            "intent": IntentType.GENERAL_QUERY,
            "confidence": 0.3,
            "matched_patterns": 0
        }
    
    async def process_message(self, message: str, user_id: str, session_id: str = None) -> Dict[str, Any]:
        """Process user message with advanced workflow orchestration and context memory"""
        
        # Get or create session
        session = self.session_manager.get_or_create_session(user_id, session_id)
        current_session_id = session["session_id"]
        
        # Check for workflow intent first
        workflow_type = self.workflow_orchestrator.detect_workflow_intent(message)
        
        if workflow_type:
            print(f"🔄 Detected workflow intent: {workflow_type}")
            # Start workflow
            workflow_result = await self.workflow_orchestrator.start_workflow(
                workflow_type, user_id, message
            )
            
            # Create workflow response
            response = {
                "message": workflow_result["message"],
                "intent": "workflow_orchestration",
                "confidence": 1.0,
                "requires_approval": False,
                "actions": [
                    {"type": "continue", "title": "Continue workflow", "endpoint": f"/workflow/{workflow_result['workflow_id']}/continue"},
                    {"type": "pause", "title": "Pause workflow", "endpoint": f"/workflow/{workflow_result['workflow_id']}/pause"},
                    {"type": "status", "title": "View workflow status", "endpoint": f"/workflow/{workflow_result['workflow_id']}/status"}
                ],
                "suggestions": [
                    "View workflow progress",
                    "Check workflow steps",
                    "Pause if needed"
                ],
                "session_id": current_session_id,
                "timestamp": datetime.utcnow().isoformat(),
                "agent_used": "Workflow Orchestrator",
                "user_id": user_id,
                "execution_time": 0.5,
                "real_execution": True,
                "workflow_context": {
                    "workflow_id": workflow_result["workflow_id"],
                    "workflow_type": workflow_type,
                    "steps": workflow_result["total_steps"],
                    "estimated_duration": workflow_result["estimated_duration"]
                },
                "data": workflow_result
            }
            
            # Add to session memory
            self.session_manager.add_conversation_entry(current_session_id, message, response)
            
            return response
        
        # Detect regular intent
        intent_result = self.detect_intent(message)
        detected_intent = intent_result["intent"]
        confidence = intent_result["confidence"]
        
        # Check if this intent has real agent implementation
        if detected_intent.value in self.real_agents:
            print(f"🚀 Routing to real agent: {detected_intent.value}")
            
            # Execute real agent task
            real_result = await self.orchestrator.execute_agent_task(
                detected_intent.value, message, user_id
            )
            
            # Get contextual suggestions from session memory
            contextual_suggestions = self.session_manager.get_contextual_suggestions(
                current_session_id, detected_intent.value
            )
            
            # Format response with real agent data and enhanced context
            response = {
                "message": real_result["message"],
                "intent": detected_intent.value,
                "confidence": real_result["confidence"],
                "requires_approval": detected_intent in [IntentType.DEPLOYMENT, IntentType.DEPLOYMENT_ORCHESTRATION],
                "actions": real_result["actions"],
                "suggestions": contextual_suggestions,
                "session_id": current_session_id,
                "timestamp": datetime.utcnow().isoformat(),
                "agent_used": real_result["agent"],
                "user_id": user_id,
                "execution_time": real_result.get("execution_time", 0),
                "real_execution": real_result.get("real_execution", True),
                "data": real_result.get("data", {}),
                "session_context": {
                    "message_count": session["message_count"] + 1,
                    "context_summary": session["context"].get("context_summary", ""),
                    "favorite_agents": session["context"].get("favorite_agents", [])
                }
            }
            
            # Add to session memory
            self.session_manager.add_conversation_entry(current_session_id, message, response)
            
            return response
        
        # Fallback to simulated responses for other intents
        else:
            print(f"📋 Using simulated response for: {detected_intent.value}")
            
            # Get appropriate response
            if detected_intent in self.agent_responses:
                response_data = self.agent_responses[detected_intent]
                response_message = response_data["message"]
                agent_used = response_data["agent"]
                actions = response_data["actions"]
            else:
                # General response for unmatched intents
                response_message = f"🤖 I understand you're asking about {detected_intent.replace('_', ' ')}. I'm routing this to the appropriate specialist agent..."
                agent_used = "General DevOps Agent"
                actions = [
                    {"type": "explore", "title": "View available agents", "endpoint": "/agents/status"},
                    {"type": "capabilities", "title": "Explore agent capabilities", "endpoint": "/chat/capabilities"},
                    {"type": "help", "title": "Try a more specific request", "endpoint": "/docs"}
                ]
            
            # Get contextual suggestions from session memory
            contextual_suggestions = self.session_manager.get_contextual_suggestions(
                current_session_id, detected_intent.value
            )
            
            response = {
                "message": response_message,
                "intent": detected_intent.value,
                "confidence": confidence,
                "requires_approval": detected_intent in [IntentType.DEPLOYMENT, IntentType.DEPLOYMENT_ORCHESTRATION],
                "actions": actions,
                "suggestions": contextual_suggestions,
                "session_id": current_session_id,
                "timestamp": datetime.utcnow().isoformat(),
                "agent_used": agent_used,
                "user_id": user_id,
                "execution_time": 0.1,
                "real_execution": False,
                "session_context": {
                    "message_count": session["message_count"] + 1,
                    "context_summary": session["context"].get("context_summary", ""),
                    "favorite_agents": session["context"].get("favorite_agents", [])
                }
            }
            
            # Add to session memory
            self.session_manager.add_conversation_entry(current_session_id, message, response)
            
            return response
    
    def _get_contextual_suggestions(self, intent: IntentType) -> List[str]:
        """Get contextual suggestions based on intent"""
        suggestions_map = {
            IntentType.COST_ANALYSIS: [
                "Ask about security vulnerabilities",
                "Check infrastructure health", 
                "Get Docker optimization tips",
                "Review Kubernetes cluster status"
            ],
            IntentType.SECURITY_SCAN: [
                "Analyze cost optimization opportunities",
                "Check infrastructure performance",
                "Review container security",
                "Get compliance recommendations"
            ],
            IntentType.INFRASTRUCTURE: [
                "Optimize cloud costs",
                "Run security assessment",
                "Scale Kubernetes deployments",
                "Monitor Docker containers"
            ],
            IntentType.DOCKER_MANAGEMENT: [
                "Check infrastructure health",
                "Analyze container costs",
                "Deploy to Kubernetes",
                "Review security policies"
            ],
            IntentType.KUBERNETES_MANAGEMENT: [
                "Optimize cluster costs",
                "Check pod security",
                "Monitor infrastructure health",
                "Review deployment strategies"
            ]
        }
        
        return suggestions_map.get(intent, [
            "Ask about cost optimization",
            "Request a security scan", 
            "Check infrastructure health",
            "Get deployment assistance"
        ])
    
    async def get_conversation_history(self, user_id: str, session_id: str = None, limit: int = 10) -> List[Dict[str, Any]]:
        """Enhanced conversation history with session context"""
        
        if session_id:
            return self.session_manager.get_conversation_history(session_id, limit)
        else:
            # Get history from user's most recent session
            user_sessions = [s for s in self.session_manager.sessions.values() if s["user_id"] == user_id]
            if user_sessions:
                latest_session = max(user_sessions, key=lambda s: s["last_activity"])
                return self.session_manager.get_conversation_history(latest_session["session_id"], limit)
            return []
    
    async def clear_conversation_history(self, user_id: str, session_id: str = None) -> bool:
        """Enhanced history clearing with session management"""
        
        if session_id:
            return self.session_manager.clear_session_history(session_id)
        else:
            # Clear all sessions for user
            user_sessions = [s for s in self.session_manager.sessions.values() if s["user_id"] == user_id]
            cleared = 0
            for session in user_sessions:
                if self.session_manager.clear_session_history(session["session_id"]):
                    cleared += 1
            return cleared > 0
    
    def get_user_insights(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive user insights and analytics"""
        return self.session_manager.get_user_insights(user_id)
    
    def get_available_workflows(self) -> Dict[str, Any]:
        """Get available workflow templates"""
        return self.workflow_orchestrator.get_available_workflows()
    
    async def continue_workflow(self, workflow_id: str, message: str = None) -> Dict[str, Any]:
        """Continue a paused workflow"""
        return await self.workflow_orchestrator.continue_workflow(workflow_id, message)
    
    def get_workflow_status(self, workflow_id: str) -> Dict[str, Any]:
        """Get workflow status"""
        return self.workflow_orchestrator.get_workflow_status(workflow_id) 