"""
Security Orchestration, Automation and Response (SOAR) Platform
Enterprise-grade security orchestration with automated response workflows
"""

import asyncio
import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Callable
from dataclasses import dataclass, asdict
from enum import Enum
import logging

class PlaybookStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"
    CANCELLED = "cancelled"

class ActionType(Enum):
    INVESTIGATE = "investigate"
    CONTAIN = "contain"
    ERADICATE = "eradicate"
    RECOVER = "recover"
    NOTIFY = "notify"
    ANALYZE = "analyze"
    BLOCK = "block"
    QUARANTINE = "quarantine"

class ApprovalLevel(Enum):
    AUTOMATIC = "automatic"
    ANALYST = "analyst"
    MANAGER = "manager"
    CISO = "ciso"

@dataclass
class PlaybookAction:
    action_id: str
    action_type: ActionType
    description: str
    parameters: Dict[str, Any]
    approval_required: ApprovalLevel
    timeout_seconds: int
    retry_count: int
    depends_on: List[str]
    success_criteria: Dict[str, Any]

@dataclass
class PlaybookExecution:
    execution_id: str
    playbook_id: str
    trigger_event: Dict[str, Any]
    status: PlaybookStatus
    started_at: datetime
    completed_at: Optional[datetime]
    executed_actions: List[Dict[str, Any]]
    current_action: Optional[str]
    approval_queue: List[Dict[str, Any]]
    execution_context: Dict[str, Any]

@dataclass
class SecurityPlaybook:
    playbook_id: str
    name: str
    description: str
    trigger_conditions: List[Dict[str, Any]]
    actions: List[PlaybookAction]
    priority: int
    auto_execute: bool
    tags: List[str]
    created_by: str
    last_modified: datetime

class SecurityOrchestrationPlatform:
    """Enterprise Security Orchestration, Automation and Response (SOAR) Platform"""
    
    def __init__(self):
        self.playbooks = {}
        self.active_executions = {}
        self.approval_queue = {}
        self.integrations = {}
        self.workflow_engine = WorkflowEngine()
        self.decision_engine = DecisionEngine()
        self.notification_service = NotificationService()
        
        # Initialize default playbooks
        self._initialize_default_playbooks()
        self._initialize_integrations()
    
    def _initialize_default_playbooks(self):
        """Initialize default security playbooks"""
        
        # Malware Detection Response Playbook
        malware_playbook = SecurityPlaybook(
            playbook_id="pb_malware_001",
            name="Malware Detection Response",
            description="Automated response to malware detection incidents",
            trigger_conditions=[
                {"event_type": "malware_detected", "severity": "high"},
                {"event_type": "virus_scan_positive", "confidence": ">0.8"}
            ],
            actions=[
                PlaybookAction(
                    action_id="isolate_endpoint",
                    action_type=ActionType.CONTAIN,
                    description="Isolate infected endpoint from network",
                    parameters={"isolation_type": "network", "duration": 3600},
                    approval_required=ApprovalLevel.AUTOMATIC,
                    timeout_seconds=300,
                    retry_count=3,
                    depends_on=[],
                    success_criteria={"endpoint_isolated": True}
                ),
                PlaybookAction(
                    action_id="collect_forensics",
                    action_type=ActionType.INVESTIGATE,
                    description="Collect forensic artifacts from infected system",
                    parameters={"artifacts": ["memory_dump", "disk_image", "network_logs"]},
                    approval_required=ApprovalLevel.ANALYST,
                    timeout_seconds=1800,
                    retry_count=1,
                    depends_on=["isolate_endpoint"],
                    success_criteria={"artifacts_collected": True}
                ),
                PlaybookAction(
                    action_id="notify_incident_team",
                    action_type=ActionType.NOTIFY,
                    description="Notify incident response team",
                    parameters={"channels": ["email", "slack", "phone"], "urgency": "high"},
                    approval_required=ApprovalLevel.AUTOMATIC,
                    timeout_seconds=60,
                    retry_count=2,
                    depends_on=[],
                    success_criteria={"notification_sent": True}
                ),
                PlaybookAction(
                    action_id="scan_similar_systems",
                    action_type=ActionType.INVESTIGATE,
                    description="Scan similar systems for indicators of compromise",
                    parameters={"scan_scope": "subnet", "ioc_list": "extracted"},
                    approval_required=ApprovalLevel.ANALYST,
                    timeout_seconds=3600,
                    retry_count=1,
                    depends_on=["collect_forensics"],
                    success_criteria={"scan_completed": True}
                ),
                PlaybookAction(
                    action_id="eradicate_malware",
                    action_type=ActionType.ERADICATE,
                    description="Remove malware from infected systems",
                    parameters={"method": "automated_removal", "verify": True},
                    approval_required=ApprovalLevel.ANALYST,
                    timeout_seconds=1800,
                    retry_count=2,
                    depends_on=["scan_similar_systems"],
                    success_criteria={"malware_removed": True}
                ),
                PlaybookAction(
                    action_id="restore_systems",
                    action_type=ActionType.RECOVER,
                    description="Restore systems to operational state",
                    parameters={"backup_restore": True, "validation_required": True},
                    approval_required=ApprovalLevel.MANAGER,
                    timeout_seconds=7200,
                    retry_count=1,
                    depends_on=["eradicate_malware"],
                    success_criteria={"systems_operational": True}
                )
            ],
            priority=1,
            auto_execute=True,
            tags=["malware", "incident_response", "containment"],
            created_by="system",
            last_modified=datetime.now()
        )
        
        # Data Breach Response Playbook
        data_breach_playbook = SecurityPlaybook(
            playbook_id="pb_breach_001",
            name="Data Breach Response",
            description="Comprehensive response to data breach incidents",
            trigger_conditions=[
                {"event_type": "data_exfiltration", "severity": "critical"},
                {"event_type": "unauthorized_data_access", "data_classification": "sensitive"}
            ],
            actions=[
                PlaybookAction(
                    action_id="assess_breach_scope",
                    action_type=ActionType.INVESTIGATE,
                    description="Assess the scope and impact of data breach",
                    parameters={"assessment_type": "comprehensive", "data_inventory": True},
                    approval_required=ApprovalLevel.AUTOMATIC,
                    timeout_seconds=1800,
                    retry_count=1,
                    depends_on=[],
                    success_criteria={"scope_assessed": True}
                ),
                PlaybookAction(
                    action_id="contain_breach",
                    action_type=ActionType.CONTAIN,
                    description="Contain the data breach to prevent further exposure",
                    parameters={"containment_methods": ["access_revocation", "system_isolation"]},
                    approval_required=ApprovalLevel.ANALYST,
                    timeout_seconds=600,
                    retry_count=2,
                    depends_on=["assess_breach_scope"],
                    success_criteria={"breach_contained": True}
                ),
                PlaybookAction(
                    action_id="notify_stakeholders",
                    action_type=ActionType.NOTIFY,
                    description="Notify internal stakeholders and authorities",
                    parameters={"stakeholders": ["legal", "compliance", "executives", "regulators"]},
                    approval_required=ApprovalLevel.CISO,
                    timeout_seconds=3600,
                    retry_count=1,
                    depends_on=["assess_breach_scope"],
                    success_criteria={"notifications_sent": True}
                ),
                PlaybookAction(
                    action_id="preserve_evidence",
                    action_type=ActionType.INVESTIGATE,
                    description="Preserve digital evidence for investigation",
                    parameters={"evidence_types": ["logs", "memory", "network_traffic"]},
                    approval_required=ApprovalLevel.ANALYST,
                    timeout_seconds=7200,
                    retry_count=1,
                    depends_on=["contain_breach"],
                    success_criteria={"evidence_preserved": True}
                ),
                PlaybookAction(
                    action_id="customer_notification",
                    action_type=ActionType.NOTIFY,
                    description="Notify affected customers within regulatory timeframes",
                    parameters={"notification_method": "multi_channel", "timeline": "72_hours"},
                    approval_required=ApprovalLevel.CISO,
                    timeout_seconds=259200,  # 72 hours
                    retry_count=1,
                    depends_on=["notify_stakeholders"],
                    success_criteria={"customers_notified": True}
                )
            ],
            priority=1,
            auto_execute=False,  # Requires approval due to sensitivity
            tags=["data_breach", "compliance", "notification"],
            created_by="system",
            last_modified=datetime.now()
        )
        
        # Phishing Response Playbook
        phishing_playbook = SecurityPlaybook(
            playbook_id="pb_phishing_001",
            name="Phishing Attack Response",
            description="Automated response to phishing attacks",
            trigger_conditions=[
                {"event_type": "phishing_email_detected", "confidence": ">0.7"},
                {"event_type": "suspicious_link_clicked", "user_count": ">1"}
            ],
            actions=[
                PlaybookAction(
                    action_id="analyze_phishing_email",
                    action_type=ActionType.ANALYZE,
                    description="Analyze phishing email for indicators and techniques",
                    parameters={"analysis_depth": "comprehensive", "ioc_extraction": True},
                    approval_required=ApprovalLevel.AUTOMATIC,
                    timeout_seconds=600,
                    retry_count=2,
                    depends_on=[],
                    success_criteria={"analysis_complete": True}
                ),
                PlaybookAction(
                    action_id="block_malicious_domains",
                    action_type=ActionType.BLOCK,
                    description="Block malicious domains and URLs",
                    parameters={"block_scope": "organization", "dns_sinkhole": True},
                    approval_required=ApprovalLevel.ANALYST,
                    timeout_seconds=300,
                    retry_count=3,
                    depends_on=["analyze_phishing_email"],
                    success_criteria={"domains_blocked": True}
                ),
                PlaybookAction(
                    action_id="quarantine_emails",
                    action_type=ActionType.QUARANTINE,
                    description="Quarantine similar phishing emails",
                    parameters={"search_criteria": "ioc_based", "scope": "all_mailboxes"},
                    approval_required=ApprovalLevel.AUTOMATIC,
                    timeout_seconds=1800,
                    retry_count=2,
                    depends_on=["analyze_phishing_email"],
                    success_criteria={"emails_quarantined": True}
                ),
                PlaybookAction(
                    action_id="user_education_alert",
                    action_type=ActionType.NOTIFY,
                    description="Send security awareness alert to users",
                    parameters={"alert_type": "phishing_awareness", "target": "all_users"},
                    approval_required=ApprovalLevel.AUTOMATIC,
                    timeout_seconds=300,
                    retry_count=1,
                    depends_on=["block_malicious_domains"],
                    success_criteria={"alert_sent": True}
                ),
                PlaybookAction(
                    action_id="assess_user_impact",
                    action_type=ActionType.INVESTIGATE,
                    description="Assess which users may have been affected",
                    parameters={"check_credentials": True, "monitor_accounts": True},
                    approval_required=ApprovalLevel.ANALYST,
                    timeout_seconds=3600,
                    retry_count=1,
                    depends_on=["quarantine_emails"],
                    success_criteria={"impact_assessed": True}
                )
            ],
            priority=2,
            auto_execute=True,
            tags=["phishing", "email_security", "user_awareness"],
            created_by="system",
            last_modified=datetime.now()
        )
        
        self.playbooks = {
            malware_playbook.playbook_id: malware_playbook,
            data_breach_playbook.playbook_id: data_breach_playbook,
            phishing_playbook.playbook_id: phishing_playbook
        }
    
    def _initialize_integrations(self):
        """Initialize security tool integrations"""
        self.integrations = {
            "endpoint_protection": {
                "name": "CrowdStrike Falcon",
                "type": "edr",
                "actions": ["isolate_endpoint", "collect_artifacts", "scan_system"],
                "status": "connected"
            },
            "email_security": {
                "name": "Proofpoint Email Protection",
                "type": "email_gateway",
                "actions": ["quarantine_email", "block_sender", "release_email"],
                "status": "connected"
            },
            "network_security": {
                "name": "Palo Alto Networks Firewall",
                "type": "firewall",
                "actions": ["block_ip", "create_rule", "update_policy"],
                "status": "connected"
            },
            "siem": {
                "name": "Splunk Enterprise Security",
                "type": "siem",
                "actions": ["create_event", "search_logs", "generate_report"],
                "status": "connected"
            },
            "threat_intelligence": {
                "name": "ThreatConnect Platform",
                "type": "threat_intel",
                "actions": ["lookup_ioc", "enrich_data", "update_feeds"],
                "status": "connected"
            },
            "identity_management": {
                "name": "Active Directory",
                "type": "identity",
                "actions": ["disable_account", "reset_password", "check_permissions"],
                "status": "connected"
            }
        }
    
    async def trigger_playbook(self, event: Dict[str, Any], playbook_id: Optional[str] = None) -> Dict[str, Any]:
        """Trigger security playbook based on event or specific playbook ID"""
        try:
            if playbook_id:
                # Execute specific playbook
                if playbook_id not in self.playbooks:
                    return {"error": f"Playbook {playbook_id} not found"}
                
                playbook = self.playbooks[playbook_id]
                execution = await self._create_execution(playbook, event)
                
            else:
                # Find matching playbooks based on event
                matching_playbooks = await self._find_matching_playbooks(event)
                
                if not matching_playbooks:
                    return {
                        "status": "no_match",
                        "message": "No playbooks matched the event conditions",
                        "event": event
                    }
                
                # Execute highest priority playbook
                playbook = max(matching_playbooks, key=lambda p: p.priority)
                execution = await self._create_execution(playbook, event)
            
            # Start execution if auto-execute is enabled
            if playbook.auto_execute:
                await self._start_execution(execution.execution_id)
            else:
                # Add to approval queue
                await self._queue_for_approval(execution)
            
            return {
                "status": "triggered",
                "execution_id": execution.execution_id,
                "playbook_name": playbook.name,
                "auto_executed": playbook.auto_execute,
                "estimated_duration": await self._estimate_execution_time(playbook)
            }
            
        except Exception as e:
            return {"error": f"Failed to trigger playbook: {str(e)}"}
    
    async def _find_matching_playbooks(self, event: Dict[str, Any]) -> List[SecurityPlaybook]:
        """Find playbooks that match the event conditions"""
        matching_playbooks = []
        
        for playbook in self.playbooks.values():
            if await self._event_matches_conditions(event, playbook.trigger_conditions):
                matching_playbooks.append(playbook)
        
        return matching_playbooks
    
    async def _event_matches_conditions(self, event: Dict[str, Any], 
                                       conditions: List[Dict[str, Any]]) -> bool:
        """Check if event matches trigger conditions"""
        for condition in conditions:
            if await self._evaluate_condition(event, condition):
                return True
        return False
    
    async def _evaluate_condition(self, event: Dict[str, Any], condition: Dict[str, Any]) -> bool:
        """Evaluate a single trigger condition"""
        for key, value in condition.items():
            event_value = event.get(key)
            
            if isinstance(value, str) and value.startswith(">"):
                # Numeric comparison
                threshold = float(value[1:])
                if event_value is None or float(event_value) <= threshold:
                    return False
            elif isinstance(value, str) and value.startswith("<"):
                # Numeric comparison
                threshold = float(value[1:])
                if event_value is None or float(event_value) >= threshold:
                    return False
            else:
                # Exact match
                if event_value != value:
                    return False
        
        return True
    
    async def _create_execution(self, playbook: SecurityPlaybook, 
                               event: Dict[str, Any]) -> PlaybookExecution:
        """Create new playbook execution"""
        execution = PlaybookExecution(
            execution_id=str(uuid.uuid4()),
            playbook_id=playbook.playbook_id,
            trigger_event=event,
            status=PlaybookStatus.PENDING,
            started_at=datetime.now(),
            completed_at=None,
            executed_actions=[],
            current_action=None,
            approval_queue=[],
            execution_context={"event": event, "variables": {}}
        )
        
        self.active_executions[execution.execution_id] = execution
        return execution
    
    async def _start_execution(self, execution_id: str):
        """Start playbook execution"""
        if execution_id not in self.active_executions:
            return {"error": "Execution not found"}
        
        execution = self.active_executions[execution_id]
        playbook = self.playbooks[execution.playbook_id]
        
        execution.status = PlaybookStatus.RUNNING
        
        # Execute actions in dependency order
        await self._execute_playbook_actions(execution, playbook)
    
    async def _execute_playbook_actions(self, execution: PlaybookExecution, 
                                       playbook: SecurityPlaybook):
        """Execute playbook actions in correct order"""
        try:
            # Build dependency graph
            action_graph = self._build_action_graph(playbook.actions)
            
            # Execute actions in topological order
            executed_actions = set()
            
            while len(executed_actions) < len(playbook.actions):
                # Find actions ready to execute (dependencies satisfied)
                ready_actions = [
                    action for action in playbook.actions
                    if action.action_id not in executed_actions and
                    all(dep in executed_actions for dep in action.depends_on)
                ]
                
                if not ready_actions:
                    # Check for circular dependencies or approval blocks
                    pending_approvals = [
                        action for action in playbook.actions
                        if action.action_id not in executed_actions and
                        action.approval_required != ApprovalLevel.AUTOMATIC
                    ]
                    
                    if pending_approvals:
                        # Wait for approvals
                        execution.status = PlaybookStatus.PAUSED
                        await self._handle_approval_workflow(execution, pending_approvals)
                        break
                    else:
                        # Circular dependency detected
                        execution.status = PlaybookStatus.FAILED
                        break
                
                # Execute ready actions
                for action in ready_actions:
                    if action.approval_required == ApprovalLevel.AUTOMATIC:
                        result = await self._execute_action(execution, action)
                        executed_actions.add(action.action_id)
                        
                        execution.executed_actions.append({
                            "action_id": action.action_id,
                            "status": "completed" if result["success"] else "failed",
                            "result": result,
                            "executed_at": datetime.now().isoformat()
                        })
                    else:
                        # Queue for approval
                        await self._queue_action_for_approval(execution, action)
            
            # Check if all actions completed successfully
            if len(executed_actions) == len(playbook.actions):
                execution.status = PlaybookStatus.COMPLETED
                execution.completed_at = datetime.now()
            
        except Exception as e:
            execution.status = PlaybookStatus.FAILED
            logging.error(f"Playbook execution failed: {str(e)}")
    
    def _build_action_graph(self, actions: List[PlaybookAction]) -> Dict[str, List[str]]:
        """Build action dependency graph"""
        graph = {}
        for action in actions:
            graph[action.action_id] = action.depends_on
        return graph
    
    async def _execute_action(self, execution: PlaybookExecution, 
                             action: PlaybookAction) -> Dict[str, Any]:
        """Execute a single playbook action"""
        try:
            execution.current_action = action.action_id
            
            # Route to appropriate integration
            result = await self._route_action_to_integration(action, execution.execution_context)
            
            # Verify success criteria
            success = await self._verify_success_criteria(result, action.success_criteria)
            
            return {
                "success": success,
                "result": result,
                "action_id": action.action_id,
                "execution_time": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "action_id": action.action_id,
                "execution_time": datetime.now().isoformat()
            }
    
    async def _route_action_to_integration(self, action: PlaybookAction, 
                                          context: Dict[str, Any]) -> Dict[str, Any]:
        """Route action to appropriate security tool integration"""
        action_type = action.action_type
        
        if action_type == ActionType.CONTAIN:
            if "isolate_endpoint" in action.action_id:
                return await self._execute_endpoint_isolation(action.parameters)
            elif "contain_breach" in action.action_id:
                return await self._execute_breach_containment(action.parameters)
        
        elif action_type == ActionType.INVESTIGATE:
            if "collect_forensics" in action.action_id:
                return await self._execute_forensic_collection(action.parameters)
            elif "assess_breach_scope" in action.action_id:
                return await self._execute_breach_assessment(action.parameters)
        
        elif action_type == ActionType.NOTIFY:
            return await self._execute_notification(action.parameters)
        
        elif action_type == ActionType.BLOCK:
            return await self._execute_blocking_action(action.parameters)
        
        elif action_type == ActionType.QUARANTINE:
            return await self._execute_quarantine_action(action.parameters)
        
        elif action_type == ActionType.ANALYZE:
            return await self._execute_analysis_action(action.parameters)
        
        # Default mock execution
        return {"status": "executed", "message": f"Mock execution of {action.description}"}
    
    async def _execute_endpoint_isolation(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute endpoint isolation through EDR integration"""
        # Mock implementation - would integrate with actual EDR
        return {
            "status": "success",
            "endpoint_isolated": True,
            "isolation_type": parameters.get("isolation_type", "network"),
            "duration": parameters.get("duration", 3600),
            "timestamp": datetime.now().isoformat()
        }
    
    async def _execute_breach_containment(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute breach containment actions"""
        return {
            "status": "success",
            "breach_contained": True,
            "containment_methods": parameters.get("containment_methods", []),
            "affected_systems": [],
            "timestamp": datetime.now().isoformat()
        }
    
    async def _execute_forensic_collection(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute forensic artifact collection"""
        return {
            "status": "success",
            "artifacts_collected": True,
            "artifacts": parameters.get("artifacts", []),
            "collection_size": "2.5GB",
            "timestamp": datetime.now().isoformat()
        }
    
    async def _execute_breach_assessment(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute breach scope assessment"""
        return {
            "status": "success",
            "scope_assessed": True,
            "affected_records": 1250,
            "data_types": ["PII", "financial"],
            "severity": "high",
            "timestamp": datetime.now().isoformat()
        }
    
    async def _execute_notification(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute notification actions"""
        channels = parameters.get("channels", ["email"])
        recipients = parameters.get("stakeholders", ["security_team"])
        
        # Mock notification execution
        notifications_sent = []
        for channel in channels:
            for recipient in recipients:
                notifications_sent.append({
                    "channel": channel,
                    "recipient": recipient,
                    "status": "sent",
                    "timestamp": datetime.now().isoformat()
                })
        
        return {
            "status": "success",
            "notification_sent": True,
            "notifications": notifications_sent
        }
    
    async def _execute_blocking_action(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute blocking actions"""
        return {
            "status": "success",
            "domains_blocked": True,
            "blocked_count": 15,
            "block_scope": parameters.get("block_scope", "organization"),
            "timestamp": datetime.now().isoformat()
        }
    
    async def _execute_quarantine_action(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute quarantine actions"""
        return {
            "status": "success",
            "emails_quarantined": True,
            "quarantined_count": 23,
            "scope": parameters.get("scope", "all_mailboxes"),
            "timestamp": datetime.now().isoformat()
        }
    
    async def _execute_analysis_action(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute analysis actions"""
        return {
            "status": "success",
            "analysis_complete": True,
            "iocs_extracted": 8,
            "threat_family": "PhishKit-2024",
            "confidence": 0.92,
            "timestamp": datetime.now().isoformat()
        }
    
    async def _verify_success_criteria(self, result: Dict[str, Any], 
                                     criteria: Dict[str, Any]) -> bool:
        """Verify if action met success criteria"""
        for key, expected_value in criteria.items():
            if key not in result:
                return False
            
            actual_value = result[key]
            if actual_value != expected_value:
                return False
        
        return True
    
    async def _handle_approval_workflow(self, execution: PlaybookExecution, 
                                       pending_actions: List[PlaybookAction]):
        """Handle approval workflow for actions requiring approval"""
        for action in pending_actions:
            approval_request = {
                "request_id": str(uuid.uuid4()),
                "execution_id": execution.execution_id,
                "action_id": action.action_id,
                "action_description": action.description,
                "approval_level": action.approval_required.value,
                "requested_at": datetime.now(),
                "parameters": action.parameters,
                "risk_assessment": await self._assess_action_risk(action),
                "estimated_impact": await self._estimate_action_impact(action)
            }
            
            execution.approval_queue.append(approval_request)
            self.approval_queue[approval_request["request_id"]] = approval_request
    
    async def _assess_action_risk(self, action: PlaybookAction) -> Dict[str, Any]:
        """Assess risk of executing action"""
        risk_levels = {
            ActionType.INVESTIGATE: "low",
            ActionType.NOTIFY: "low",
            ActionType.ANALYZE: "low",
            ActionType.CONTAIN: "medium",
            ActionType.BLOCK: "medium",
            ActionType.QUARANTINE: "medium",
            ActionType.ERADICATE: "high",
            ActionType.RECOVER: "high"
        }
        
        return {
            "risk_level": risk_levels.get(action.action_type, "medium"),
            "business_impact": "medium",
            "reversibility": "high" if action.action_type in [ActionType.BLOCK, ActionType.QUARANTINE] else "low"
        }
    
    async def _estimate_action_impact(self, action: PlaybookAction) -> Dict[str, Any]:
        """Estimate impact of executing action"""
        return {
            "systems_affected": 1,
            "users_affected": 0,
            "downtime_minutes": 0,
            "data_impact": "none"
        }
    
    async def _queue_action_for_approval(self, execution: PlaybookExecution, 
                                        action: PlaybookAction):
        """Queue action for approval"""
        approval_request = {
            "request_id": str(uuid.uuid4()),
            "execution_id": execution.execution_id,
            "action_id": action.action_id,
            "action_description": action.description,
            "approval_level": action.approval_required.value,
            "requested_at": datetime.now().isoformat(),
            "status": "pending"
        }
        
        execution.approval_queue.append(approval_request)
    
    async def _queue_for_approval(self, execution: PlaybookExecution):
        """Queue entire execution for approval"""
        playbook = self.playbooks[execution.playbook_id]
        
        approval_request = {
            "request_id": str(uuid.uuid4()),
            "execution_id": execution.execution_id,
            "playbook_name": playbook.name,
            "approval_level": "manager",
            "requested_at": datetime.now().isoformat(),
            "trigger_event": execution.trigger_event,
            "estimated_duration": await self._estimate_execution_time(playbook)
        }
        
        self.approval_queue[approval_request["request_id"]] = approval_request
    
    async def _estimate_execution_time(self, playbook: SecurityPlaybook) -> str:
        """Estimate total execution time for playbook"""
        total_seconds = sum(action.timeout_seconds for action in playbook.actions)
        
        if total_seconds < 3600:
            return f"{total_seconds // 60} minutes"
        else:
            return f"{total_seconds // 3600} hours"
    
    async def get_execution_status(self, execution_id: str) -> Dict[str, Any]:
        """Get status of playbook execution"""
        if execution_id not in self.active_executions:
            return {"error": "Execution not found"}
        
        execution = self.active_executions[execution_id]
        playbook = self.playbooks[execution.playbook_id]
        
        return {
            "execution_id": execution_id,
            "playbook_name": playbook.name,
            "status": execution.status.value,
            "started_at": execution.started_at.isoformat(),
            "completed_at": execution.completed_at.isoformat() if execution.completed_at else None,
            "progress": {
                "total_actions": len(playbook.actions),
                "completed_actions": len(execution.executed_actions),
                "current_action": execution.current_action,
                "pending_approvals": len(execution.approval_queue)
            },
            "executed_actions": execution.executed_actions,
            "approval_queue": execution.approval_queue
        }
    
    async def approve_action(self, request_id: str, approver: str, 
                            approved: bool, notes: str = "") -> Dict[str, Any]:
        """Approve or deny pending action"""
        if request_id not in self.approval_queue:
            return {"error": "Approval request not found"}
        
        approval_request = self.approval_queue[request_id]
        
        approval_request.update({
            "status": "approved" if approved else "denied",
            "approver": approver,
            "approval_time": datetime.now().isoformat(),
            "notes": notes
        })
        
        if approved:
            # Resume execution for this action
            execution_id = approval_request["execution_id"]
            if execution_id in self.active_executions:
                execution = self.active_executions[execution_id]
                playbook = self.playbooks[execution.playbook_id]
                
                # Find and execute the approved action
                action = next(
                    (a for a in playbook.actions if a.action_id == approval_request["action_id"]),
                    None
                )
                
                if action:
                    result = await self._execute_action(execution, action)
                    execution.executed_actions.append({
                        "action_id": action.action_id,
                        "status": "completed" if result["success"] else "failed",
                        "result": result,
                        "executed_at": datetime.now().isoformat(),
                        "approver": approver
                    })
        
        return {
            "status": "processed",
            "request_id": request_id,
            "approved": approved,
            "approver": approver
        }

class WorkflowEngine:
    """Workflow execution engine for complex security processes"""
    
    async def execute_workflow(self, workflow_definition: Dict[str, Any]) -> Dict[str, Any]:
        """Execute custom security workflow"""
        return {"status": "workflow_executed", "workflow_id": str(uuid.uuid4())}

class DecisionEngine:
    """AI-powered decision engine for security automation"""
    
    async def make_decision(self, context: Dict[str, Any], 
                           decision_point: str) -> Dict[str, Any]:
        """Make intelligent security decisions"""
        return {
            "decision": "approve",
            "confidence": 0.85,
            "reasoning": "Low risk action with clear business justification"
        }

class NotificationService:
    """Multi-channel notification service"""
    
    async def send_notification(self, message: str, channels: List[str], 
                               recipients: List[str]) -> Dict[str, Any]:
        """Send notifications through multiple channels"""
        return {
            "status": "sent",
            "channels": channels,
            "recipients": recipients,
            "message_id": str(uuid.uuid4())
        }

# Global instances
soar_platform = SecurityOrchestrationPlatform()
workflow_engine = WorkflowEngine()
decision_engine = DecisionEngine()
notification_service = NotificationService()