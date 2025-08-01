#!/usr/bin/env python3
"""
Customer Success & Analytics Platform
Handles onboarding, feature flags, usage analytics, and customer insights
"""

import uuid
import time
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Set
from enum import Enum
from dataclasses import dataclass, field
from collections import defaultdict
import json

class OnboardingStage(str, Enum):
    NOT_STARTED = "not_started"
    ACCOUNT_SETUP = "account_setup"
    TEAM_CREATION = "team_creation"
    FIRST_AGENT_USE = "first_agent_use"
    FIRST_WORKFLOW = "first_workflow"
    INTEGRATION_SETUP = "integration_setup"
    COMPLETED = "completed"

class CustomerHealth(str, Enum):
    HEALTHY = "healthy"           # Active usage, growing
    AT_RISK = "at_risk"          # Declining usage
    CHURNING = "churning"        # Very low activity
    CHAMPION = "champion"        # Heavy usage, potential expansion

class FeatureFlag(str, Enum):
    # Core Features
    BASIC_AGENTS = "basic_agents"
    ADVANCED_AGENTS = "advanced_agents"
    WORKFLOW_ORCHESTRATION = "workflow_orchestration"
    MULTI_AGENT_COLLABORATION = "multi_agent_collaboration"
    
    # Analytics & Insights
    BASIC_ANALYTICS = "basic_analytics"
    ADVANCED_ANALYTICS = "advanced_analytics"
    CUSTOM_DASHBOARDS = "custom_dashboards"
    REAL_TIME_MONITORING = "real_time_monitoring"
    
    # Integrations
    SLACK_INTEGRATION = "slack_integration"
    TEAMS_INTEGRATION = "teams_integration"
    JIRA_INTEGRATION = "jira_integration"
    CI_CD_INTEGRATION = "ci_cd_integration"
    
    # Security & Compliance
    SSO_INTEGRATION = "sso_integration"
    AUDIT_LOGS = "audit_logs"
    COMPLIANCE_REPORTING = "compliance_reporting"
    CUSTOM_SECURITY_POLICIES = "custom_security_policies"
    
    # Beta Features
    AI_CODE_GENERATION = "ai_code_generation"
    PREDICTIVE_ANALYTICS = "predictive_analytics"
    NATURAL_LANGUAGE_QUERIES = "natural_language_queries"
    CUSTOM_AGENT_CREATION = "custom_agent_creation"

@dataclass
class UsageMetrics:
    timestamp: datetime
    org_id: str
    user_id: str
    event_type: str  # agent_execution, workflow_start, api_call, etc.
    agent_type: str = ""
    duration_ms: int = 0
    success: bool = True
    error_message: str = ""
    tokens_consumed: int = 0
    cost_usd: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class OnboardingTask:
    task_id: str
    title: str
    description: str
    stage: OnboardingStage
    completed: bool = False
    completed_at: Optional[datetime] = None
    action_url: str = ""
    estimated_minutes: int = 5

@dataclass
class CustomerInsight:
    org_id: str
    health_score: float  # 0-100
    health_status: CustomerHealth
    risk_factors: List[str]
    success_indicators: List[str]
    recommended_actions: List[str]
    expansion_opportunities: List[str]
    last_updated: datetime

class CustomerSuccessPlatform:
    """Complete customer success and analytics platform"""
    
    def __init__(self):
        self.usage_events: List[UsageMetrics] = []
        self.onboarding_progress: Dict[str, Dict[str, Any]] = {}
        self.feature_flags: Dict[str, Dict[FeatureFlag, bool]] = {}
        self.customer_insights: Dict[str, CustomerInsight] = {}
        self.error_tracking: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
        
        # Initialize feature flag templates
        self._initialize_feature_templates()
        
        # Initialize onboarding templates
        self._initialize_onboarding_templates()
    
    def _initialize_feature_templates(self):
        """Initialize feature flag templates for different plans"""
        
        self.plan_features = {
            "starter": {
                FeatureFlag.BASIC_AGENTS: True,
                FeatureFlag.BASIC_ANALYTICS: True,
                FeatureFlag.SLACK_INTEGRATION: True,
                FeatureFlag.WORKFLOW_ORCHESTRATION: False,
                FeatureFlag.ADVANCED_AGENTS: False,
                FeatureFlag.ADVANCED_ANALYTICS: False,
                FeatureFlag.SSO_INTEGRATION: False,
                FeatureFlag.AUDIT_LOGS: False,
                FeatureFlag.AI_CODE_GENERATION: False,
                FeatureFlag.PREDICTIVE_ANALYTICS: False
            },
            "professional": {
                FeatureFlag.BASIC_AGENTS: True,
                FeatureFlag.ADVANCED_AGENTS: True,
                FeatureFlag.WORKFLOW_ORCHESTRATION: True,
                FeatureFlag.BASIC_ANALYTICS: True,
                FeatureFlag.ADVANCED_ANALYTICS: True,
                FeatureFlag.SLACK_INTEGRATION: True,
                FeatureFlag.TEAMS_INTEGRATION: True,
                FeatureFlag.JIRA_INTEGRATION: True,
                FeatureFlag.CI_CD_INTEGRATION: True,
                FeatureFlag.REAL_TIME_MONITORING: True,
                FeatureFlag.SSO_INTEGRATION: False,
                FeatureFlag.AUDIT_LOGS: True,
                FeatureFlag.AI_CODE_GENERATION: False,
                FeatureFlag.PREDICTIVE_ANALYTICS: False
            },
            "enterprise": {
                # All features enabled for enterprise
                feature: True for feature in FeatureFlag
            }
        }
    
    def _initialize_onboarding_templates(self):
        """Initialize onboarding task templates"""
        
        self.onboarding_tasks = {
            OnboardingStage.ACCOUNT_SETUP: [
                OnboardingTask(
                    task_id="setup_org",
                    title="Complete Organization Setup",
                    description="Set up your organization profile and billing information",
                    stage=OnboardingStage.ACCOUNT_SETUP,
                    action_url="/onboarding/organization",
                    estimated_minutes=5
                ),
                OnboardingTask(
                    task_id="invite_team",
                    title="Invite Team Members",
                    description="Invite your first team members to get started",
                    stage=OnboardingStage.ACCOUNT_SETUP,
                    action_url="/onboarding/team-invites",
                    estimated_minutes=3
                )
            ],
            OnboardingStage.TEAM_CREATION: [
                OnboardingTask(
                    task_id="create_devops_team",
                    title="Create DevOps Team",
                    description="Set up your first DevOps team and assign roles",
                    stage=OnboardingStage.TEAM_CREATION,
                    action_url="/teams/create",
                    estimated_minutes=5
                ),
                OnboardingTask(
                    task_id="configure_permissions",
                    title="Configure Team Permissions",
                    description="Set up role-based access controls for your team",
                    stage=OnboardingStage.TEAM_CREATION,
                    action_url="/teams/permissions",
                    estimated_minutes=7
                )
            ],
            OnboardingStage.FIRST_AGENT_USE: [
                OnboardingTask(
                    task_id="first_cost_analysis",
                    title="Run Your First Cost Analysis",
                    description="Analyze your cloud costs to see immediate value",
                    stage=OnboardingStage.FIRST_AGENT_USE,
                    action_url="/chat?suggest=analyze%20cloud%20costs",
                    estimated_minutes=2
                ),
                OnboardingTask(
                    task_id="security_scan",
                    title="Perform Security Scan",
                    description="Run a security assessment on your infrastructure",
                    stage=OnboardingStage.FIRST_AGENT_USE,
                    action_url="/chat?suggest=run%20security%20scan",
                    estimated_minutes=3
                )
            ],
            OnboardingStage.FIRST_WORKFLOW: [
                OnboardingTask(
                    task_id="cost_optimization_workflow",
                    title="Start Cost Optimization Workflow",
                    description="Run your first automated workflow",
                    stage=OnboardingStage.FIRST_WORKFLOW,
                    action_url="/workflows/start?type=cost_optimization",
                    estimated_minutes=10
                )
            ],
            OnboardingStage.INTEGRATION_SETUP: [
                OnboardingTask(
                    task_id="cloud_integration",
                    title="Connect Cloud Provider",
                    description="Connect AWS, Azure, or GCP for real-time data",
                    stage=OnboardingStage.INTEGRATION_SETUP,
                    action_url="/integrations/cloud",
                    estimated_minutes=15
                ),
                OnboardingTask(
                    task_id="slack_integration",
                    title="Enable Slack Integration",
                    description="Get AI insights directly in your Slack workspace",
                    stage=OnboardingStage.INTEGRATION_SETUP,
                    action_url="/integrations/slack",
                    estimated_minutes=5
                )
            ]
        }
    
    def initialize_customer(self, org_id: str, plan_type: str) -> Dict[str, Any]:
        """Initialize a new customer with onboarding and feature flags"""
        
        # Set up feature flags based on plan
        self.feature_flags[org_id] = self.plan_features.get(plan_type, self.plan_features["starter"]).copy()
        
        # Initialize onboarding progress
        self.onboarding_progress[org_id] = {
            "current_stage": OnboardingStage.ACCOUNT_SETUP,
            "started_at": datetime.now(),
            "completed_tasks": set(),
            "stage_completion": {stage: False for stage in OnboardingStage},
            "overall_progress": 0.0
        }
        
        # Create customer insight profile
        self.customer_insights[org_id] = CustomerInsight(
            org_id=org_id,
            health_score=50.0,  # Start with neutral score
            health_status=CustomerHealth.HEALTHY,
            risk_factors=[],
            success_indicators=[],
            recommended_actions=["Complete organization setup", "Invite team members"],
            expansion_opportunities=[],
            last_updated=datetime.now()
        )
        
        print(f"✅ Initialized customer success platform for org: {org_id}")
        return self.get_onboarding_status(org_id)
    
    def track_usage_event(self, event: UsageMetrics) -> None:
        """Track a usage event for analytics"""
        
        self.usage_events.append(event)
        
        # Update onboarding progress based on usage
        self._update_onboarding_from_usage(event)
        
        # Track errors for customer success
        if not event.success:
            self.error_tracking[event.org_id].append({
                "timestamp": event.timestamp,
                "event_type": event.event_type,
                "agent_type": event.agent_type,
                "error": event.error_message,
                "user_id": event.user_id
            })
        
        # Update customer health score
        self._update_customer_health(event.org_id)
    
    def _update_onboarding_from_usage(self, event: UsageMetrics) -> None:
        """Update onboarding progress based on usage events"""
        
        org_id = event.org_id
        if org_id not in self.onboarding_progress:
            return
        
        progress = self.onboarding_progress[org_id]
        completed_tasks = progress["completed_tasks"]
        
        # Mark tasks as completed based on usage events
        if event.event_type == "agent_execution" and event.success:
            if event.agent_type == "cost_analysis":
                completed_tasks.add("first_cost_analysis")
            elif event.agent_type == "security_scan":
                completed_tasks.add("security_scan")
        
        elif event.event_type == "workflow_start":
            completed_tasks.add("cost_optimization_workflow")
        
        elif event.event_type == "integration_connected":
            if "cloud" in event.metadata.get("integration_type", ""):
                completed_tasks.add("cloud_integration")
            elif "slack" in event.metadata.get("integration_type", ""):
                completed_tasks.add("slack_integration")
        
        # Update overall progress
        self._calculate_onboarding_progress(org_id)
    
    def _calculate_onboarding_progress(self, org_id: str) -> None:
        """Calculate overall onboarding progress"""
        
        if org_id not in self.onboarding_progress:
            return
        
        progress = self.onboarding_progress[org_id]
        completed_tasks = progress["completed_tasks"]
        
        # Calculate stage completion
        for stage, tasks in self.onboarding_tasks.items():
            stage_tasks = {task.task_id for task in tasks}
            if stage_tasks.issubset(completed_tasks):
                progress["stage_completion"][stage] = True
                progress["current_stage"] = self._get_next_stage(stage)
        
        # Calculate overall progress percentage
        total_tasks = sum(len(tasks) for tasks in self.onboarding_tasks.values())
        completed_count = len(completed_tasks)
        progress["overall_progress"] = (completed_count / total_tasks) * 100
        
        # Mark as completed if all stages done
        if progress["overall_progress"] >= 100:
            progress["current_stage"] = OnboardingStage.COMPLETED
            progress["completed_at"] = datetime.now()
    
    def _get_next_stage(self, current_stage: OnboardingStage) -> OnboardingStage:
        """Get the next onboarding stage"""
        
        stages = list(OnboardingStage)
        try:
            current_index = stages.index(current_stage)
            if current_index < len(stages) - 1:
                return stages[current_index + 1]
        except ValueError:
            pass
        
        return current_stage
    
    def get_onboarding_status(self, org_id: str) -> Dict[str, Any]:
        """Get complete onboarding status for an organization"""
        
        if org_id not in self.onboarding_progress:
            return {"error": "Organization not found in onboarding system"}
        
        progress = self.onboarding_progress[org_id]
        current_stage = progress["current_stage"]
        completed_tasks = progress["completed_tasks"]
        
        # Get current stage tasks
        current_tasks = []
        if current_stage != OnboardingStage.COMPLETED:
            stage_tasks = self.onboarding_tasks.get(current_stage, [])
            for task in stage_tasks:
                task_dict = {
                    "task_id": task.task_id,
                    "title": task.title,
                    "description": task.description,
                    "completed": task.task_id in completed_tasks,
                    "action_url": task.action_url,
                    "estimated_minutes": task.estimated_minutes
                }
                current_tasks.append(task_dict)
        
        # Calculate time in onboarding
        started_at = progress["started_at"]
        time_in_onboarding = datetime.now() - started_at
        
        return {
            "org_id": org_id,
            "current_stage": current_stage,
            "overall_progress": progress["overall_progress"],
            "current_tasks": current_tasks,
            "completed_tasks_count": len(completed_tasks),
            "total_tasks_count": sum(len(tasks) for tasks in self.onboarding_tasks.values()),
            "time_in_onboarding_days": time_in_onboarding.days,
            "stage_completion": progress["stage_completion"],
            "next_recommended_action": self._get_next_recommended_action(org_id)
        }
    
    def _get_next_recommended_action(self, org_id: str) -> str:
        """Get the next recommended action for the customer"""
        
        progress = self.onboarding_progress[org_id]
        current_stage = progress["current_stage"]
        completed_tasks = progress["completed_tasks"]
        
        if current_stage == OnboardingStage.COMPLETED:
            return "Explore advanced features and workflows"
        
        # Find first incomplete task in current stage
        stage_tasks = self.onboarding_tasks.get(current_stage, [])
        for task in stage_tasks:
            if task.task_id not in completed_tasks:
                return task.title
        
        return "Continue with onboarding process"
    
    def get_feature_flags(self, org_id: str) -> Dict[str, bool]:
        """Get feature flags for an organization"""
        
        return {
            flag.value: enabled 
            for flag, enabled in self.feature_flags.get(org_id, {}).items()
        }
    
    def update_feature_flag(self, org_id: str, feature: FeatureFlag, enabled: bool) -> Dict[str, Any]:
        """Update a feature flag for an organization"""
        
        if org_id not in self.feature_flags:
            self.feature_flags[org_id] = {}
        
        old_value = self.feature_flags[org_id].get(feature, False)
        self.feature_flags[org_id][feature] = enabled
        
        # Track feature flag change
        self.track_usage_event(UsageMetrics(
            timestamp=datetime.now(),
            org_id=org_id,
            user_id="system",
            event_type="feature_flag_changed",
            metadata={
                "feature": feature.value,
                "old_value": old_value,
                "new_value": enabled
            }
        ))
        
        return {
            "feature": feature.value,
            "enabled": enabled,
            "changed": old_value != enabled,
            "message": f"Feature {feature.value} {'enabled' if enabled else 'disabled'}"
        }
    
    def rollout_feature_gradually(self, feature: FeatureFlag, percentage: int, 
                                  target_plan: str = None) -> Dict[str, Any]:
        """Gradually roll out a feature to a percentage of customers"""
        
        eligible_orgs = []
        
        for org_id, flags in self.feature_flags.items():
            # Filter by plan if specified
            if target_plan:
                # You'd get plan info from tenant manager here
                # For now, assume all orgs are eligible
                pass
            
            # Use hash of org_id to determine if they get the feature
            import hashlib
            org_hash = int(hashlib.md5(org_id.encode()).hexdigest(), 16)
            if (org_hash % 100) < percentage:
                eligible_orgs.append(org_id)
                self.update_feature_flag(org_id, feature, True)
        
        return {
            "feature": feature.value,
            "rollout_percentage": percentage,
            "eligible_organizations": len(eligible_orgs),
            "target_plan": target_plan,
            "rollout_completed": True
        }
    
    def get_usage_analytics(self, org_id: str, days: int = 30) -> Dict[str, Any]:
        """Get comprehensive usage analytics for an organization"""
        
        # Filter events for the organization and time period
        cutoff_date = datetime.now() - timedelta(days=days)
        org_events = [
            event for event in self.usage_events 
            if event.org_id == org_id and event.timestamp >= cutoff_date
        ]
        
        if not org_events:
            return {
                "org_id": org_id,
                "period_days": days,
                "total_events": 0,
                "message": "No usage data available for this period"
            }
        
        # Calculate metrics
        total_events = len(org_events)
        successful_events = len([e for e in org_events if e.success])
        error_rate = ((total_events - successful_events) / total_events) * 100 if total_events > 0 else 0
        
        # Agent usage breakdown
        agent_usage = defaultdict(int)
        for event in org_events:
            if event.agent_type:
                agent_usage[event.agent_type] += 1
        
        # Token and cost analysis
        total_tokens = sum(event.tokens_consumed for event in org_events)
        total_cost = sum(event.cost_usd for event in org_events)
        
        # Daily usage trend
        daily_usage = defaultdict(int)
        for event in org_events:
            day_key = event.timestamp.strftime("%Y-%m-%d")
            daily_usage[day_key] += 1
        
        # Most active users
        user_activity = defaultdict(int)
        for event in org_events:
            user_activity[event.user_id] += 1
        
        top_users = sorted(user_activity.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Recent errors
        recent_errors = self.error_tracking[org_id][-10:]  # Last 10 errors
        
        return {
            "org_id": org_id,
            "period_days": days,
            "summary": {
                "total_events": total_events,
                "successful_events": successful_events,
                "error_rate_percentage": round(error_rate, 2),
                "total_tokens_consumed": total_tokens,
                "total_cost_usd": round(total_cost, 4),
                "unique_users": len(user_activity),
                "unique_agents_used": len(agent_usage)
            },
            "agent_usage": dict(sorted(agent_usage.items(), key=lambda x: x[1], reverse=True)),
            "daily_usage_trend": dict(sorted(daily_usage.items())),
            "top_users": [{"user_id": user, "events": count} for user, count in top_users],
            "recent_errors": recent_errors,
            "cost_breakdown": {
                "average_cost_per_event": round(total_cost / total_events, 4) if total_events > 0 else 0,
                "average_tokens_per_event": round(total_tokens / total_events, 2) if total_events > 0 else 0
            }
        }
    
    def _update_customer_health(self, org_id: str) -> None:
        """Update customer health score based on usage patterns"""
        
        if org_id not in self.customer_insights:
            return
        
        # Get recent usage (last 7 days)
        recent_events = [
            event for event in self.usage_events[-1000:]  # Last 1000 events for performance
            if event.org_id == org_id and 
               event.timestamp >= datetime.now() - timedelta(days=7)
        ]
        
        # Calculate health factors
        health_score = 50.0  # Base score
        risk_factors = []
        success_indicators = []
        
        if recent_events:
            # Usage frequency
            daily_avg = len(recent_events) / 7
            if daily_avg > 10:
                health_score += 20
                success_indicators.append("High daily usage")
            elif daily_avg < 1:
                health_score -= 20
                risk_factors.append("Low usage frequency")
            
            # Error rate
            error_rate = len([e for e in recent_events if not e.success]) / len(recent_events)
            if error_rate > 0.1:  # >10% error rate
                health_score -= 15
                risk_factors.append("High error rate")
            elif error_rate < 0.02:  # <2% error rate
                health_score += 10
                success_indicators.append("Low error rate")
            
            # Feature adoption
            unique_agents = len(set(e.agent_type for e in recent_events if e.agent_type))
            if unique_agents > 5:
                health_score += 15
                success_indicators.append("High feature adoption")
            elif unique_agents < 2:
                health_score -= 10
                risk_factors.append("Limited feature usage")
        else:
            health_score -= 30
            risk_factors.append("No recent activity")
        
        # Determine health status
        if health_score >= 80:
            health_status = CustomerHealth.CHAMPION
        elif health_score >= 60:
            health_status = CustomerHealth.HEALTHY
        elif health_score >= 40:
            health_status = CustomerHealth.AT_RISK
        else:
            health_status = CustomerHealth.CHURNING
        
        # Generate recommendations
        recommended_actions = []
        if health_status == CustomerHealth.AT_RISK:
            recommended_actions.extend([
                "Schedule customer success call",
                "Review onboarding completion",
                "Provide training resources"
            ])
        elif health_status == CustomerHealth.CHURNING:
            recommended_actions.extend([
                "Immediate intervention required",
                "Executive engagement",
                "Identify blocker issues"
            ])
        
        # Update customer insight
        self.customer_insights[org_id].health_score = max(0, min(100, health_score))
        self.customer_insights[org_id].health_status = health_status
        self.customer_insights[org_id].risk_factors = risk_factors
        self.customer_insights[org_id].success_indicators = success_indicators
        self.customer_insights[org_id].recommended_actions = recommended_actions
        self.customer_insights[org_id].last_updated = datetime.now()
    
    def get_customer_insights(self, org_id: str) -> Dict[str, Any]:
        """Get comprehensive customer insights and health metrics"""
        
        if org_id not in self.customer_insights:
            return {"error": "Customer insights not available"}
        
        insight = self.customer_insights[org_id]
        onboarding = self.get_onboarding_status(org_id)
        usage = self.get_usage_analytics(org_id, days=30)
        
        return {
            "org_id": org_id,
            "health_score": insight.health_score,
            "health_status": insight.health_status,
            "risk_factors": insight.risk_factors,
            "success_indicators": insight.success_indicators,
            "recommended_actions": insight.recommended_actions,
            "expansion_opportunities": insight.expansion_opportunities,
            "onboarding_status": {
                "current_stage": onboarding.get("current_stage"),
                "progress_percentage": onboarding.get("overall_progress", 0),
                "time_in_onboarding_days": onboarding.get("time_in_onboarding_days", 0)
            },
            "usage_summary": usage.get("summary", {}),
            "last_updated": insight.last_updated.isoformat()
        }
    
    def get_platform_insights(self) -> Dict[str, Any]:
        """Get platform-wide customer success insights"""
        
        total_customers = len(self.customer_insights)
        if total_customers == 0:
            return {"message": "No customer data available"}
        
        # Health distribution
        health_distribution = defaultdict(int)
        for insight in self.customer_insights.values():
            health_distribution[insight.health_status] += 1
        
        # Onboarding insights
        onboarding_stages = defaultdict(int)
        for progress in self.onboarding_progress.values():
            onboarding_stages[progress["current_stage"]] += 1
        
        # Feature adoption
        feature_adoption = defaultdict(int)
        for flags in self.feature_flags.values():
            for feature, enabled in flags.items():
                if enabled:
                    feature_adoption[feature.value] += 1
        
        # Calculate averages
        avg_health_score = sum(i.health_score for i in self.customer_insights.values()) / total_customers
        
        return {
            "platform_summary": {
                "total_customers": total_customers,
                "average_health_score": round(avg_health_score, 1),
                "healthy_customers": health_distribution[CustomerHealth.HEALTHY] + health_distribution[CustomerHealth.CHAMPION],
                "at_risk_customers": health_distribution[CustomerHealth.AT_RISK] + health_distribution[CustomerHealth.CHURNING]
            },
            "health_distribution": dict(health_distribution),
            "onboarding_stages": dict(onboarding_stages),
            "feature_adoption": dict(sorted(feature_adoption.items(), key=lambda x: x[1], reverse=True)),
            "total_usage_events": len(self.usage_events),
            "generated_at": datetime.now().isoformat()
        }

# Usage tracking helpers
def create_usage_event(org_id: str, user_id: str, event_type: str, agent_type: str = "", 
                      success: bool = True, error_message: str = "", tokens: int = 0, 
                      cost: float = 0.0, **metadata) -> UsageMetrics:
    """Helper to create usage tracking events"""
    
    return UsageMetrics(
        timestamp=datetime.now(),
        org_id=org_id,
        user_id=user_id,
        event_type=event_type,
        agent_type=agent_type,
        duration_ms=metadata.get("duration_ms", 0),
        success=success,
        error_message=error_message,
        tokens_consumed=tokens,
        cost_usd=cost,
        metadata=metadata
    ) 