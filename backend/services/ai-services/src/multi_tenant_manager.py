#!/usr/bin/env python3
"""
Multi-Tenant SaaS Management System
Handles enterprise organizations, teams, users, and resource isolation
"""

import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from enum import Enum
from dataclasses import dataclass, field
from collections import defaultdict

class PlanType(str, Enum):
    STARTER = "starter"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"
    CUSTOM = "custom"

class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"           # Platform admin
    ORG_OWNER = "org_owner"               # Enterprise owner
    ORG_ADMIN = "org_admin"               # Enterprise admin
    TEAM_LEAD = "team_lead"               # Team leader
    TEAM_MEMBER = "team_member"           # Regular user
    READONLY = "readonly"                 # Read-only access

class ResourceQuota(str, Enum):
    AGENTS_PER_MONTH = "agents_per_month"
    WORKFLOWS_PER_MONTH = "workflows_per_month"
    STORAGE_GB = "storage_gb"
    API_CALLS_PER_HOUR = "api_calls_per_hour"
    TEAM_MEMBERS = "team_members"
    CONCURRENT_WORKFLOWS = "concurrent_workflows"

@dataclass
class Organization:
    org_id: str
    name: str
    domain: str
    plan_type: PlanType
    created_at: datetime
    owner_id: str
    is_active: bool = True
    billing_email: str = ""
    quotas: Dict[str, int] = field(default_factory=dict)
    usage_stats: Dict[str, int] = field(default_factory=dict)
    settings: Dict[str, Any] = field(default_factory=dict)

@dataclass
class Team:
    team_id: str
    org_id: str
    name: str
    description: str
    created_at: datetime
    lead_id: str
    members: List[str] = field(default_factory=list)
    permissions: Dict[str, bool] = field(default_factory=dict)
    quotas: Dict[str, int] = field(default_factory=dict)
    is_active: bool = True

@dataclass
class User:
    user_id: str
    email: str
    name: str
    org_id: str
    team_ids: List[str]
    role: UserRole
    created_at: datetime
    last_login: Optional[datetime] = None
    is_active: bool = True
    preferences: Dict[str, Any] = field(default_factory=dict)
    permissions: List[str] = field(default_factory=list)

class MultiTenantManager:
    """Manages multi-tenant SaaS operations"""
    
    def __init__(self):
        self.organizations: Dict[str, Organization] = {}
        self.teams: Dict[str, Team] = {}
        self.users: Dict[str, User] = {}
        self.user_sessions: Dict[str, Dict[str, Any]] = {}
        
        # Plan configurations
        self.plan_quotas = {
            PlanType.STARTER: {
                ResourceQuota.AGENTS_PER_MONTH: 1000,
                ResourceQuota.WORKFLOWS_PER_MONTH: 50,
                ResourceQuota.STORAGE_GB: 5,
                ResourceQuota.API_CALLS_PER_HOUR: 100,
                ResourceQuota.TEAM_MEMBERS: 5,
                ResourceQuota.CONCURRENT_WORKFLOWS: 2
            },
            PlanType.PROFESSIONAL: {
                ResourceQuota.AGENTS_PER_MONTH: 10000,
                ResourceQuota.WORKFLOWS_PER_MONTH: 500,
                ResourceQuota.STORAGE_GB: 50,
                ResourceQuota.API_CALLS_PER_HOUR: 1000,
                ResourceQuota.TEAM_MEMBERS: 25,
                ResourceQuota.CONCURRENT_WORKFLOWS: 5
            },
            PlanType.ENTERPRISE: {
                ResourceQuota.AGENTS_PER_MONTH: 100000,
                ResourceQuota.WORKFLOWS_PER_MONTH: 5000,
                ResourceQuota.STORAGE_GB: 500,
                ResourceQuota.API_CALLS_PER_HOUR: 10000,
                ResourceQuota.TEAM_MEMBERS: 100,
                ResourceQuota.CONCURRENT_WORKFLOWS: 20
            },
            PlanType.CUSTOM: {
                # Custom quotas set per organization
            }
        }
        
        # Initialize demo organizations
        self._initialize_demo_data()
    
    def create_organization(self, name: str, domain: str, owner_email: str, 
                          plan_type: PlanType = PlanType.STARTER) -> str:
        """Create a new organization"""
        
        org_id = f"org_{uuid.uuid4().hex[:8]}"
        
        # Create organization owner
        owner_id = self.create_user(
            email=owner_email,
            name=owner_email.split("@")[0].title(),
            org_id=org_id,
            role=UserRole.ORG_OWNER
        )
        
        # Set up organization quotas
        quotas = self.plan_quotas.get(plan_type, {}).copy()
        
        organization = Organization(
            org_id=org_id,
            name=name,
            domain=domain,
            plan_type=plan_type,
            created_at=datetime.now(),
            owner_id=owner_id,
            billing_email=owner_email,
            quotas=quotas,
            usage_stats={quota: 0 for quota in quotas.keys()},
            settings={
                "timezone": "UTC",
                "enable_audit_logs": True,
                "data_retention_days": 90,
                "enable_sso": plan_type in [PlanType.ENTERPRISE, PlanType.CUSTOM]
            }
        )
        
        self.organizations[org_id] = organization
        
        # Create default team
        self.create_team(
            org_id=org_id,
            name="Default Team",
            description="Default team for organization",
            lead_id=owner_id
        )
        
        print(f"✅ Created organization: {name} ({org_id}) with {plan_type} plan")
        return org_id
    
    def create_team(self, org_id: str, name: str, description: str, lead_id: str) -> str:
        """Create a new team within an organization"""
        
        if org_id not in self.organizations:
            raise ValueError(f"Organization {org_id} not found")
        
        team_id = f"team_{uuid.uuid4().hex[:8]}"
        
        team = Team(
            team_id=team_id,
            org_id=org_id,
            name=name,
            description=description,
            created_at=datetime.now(),
            lead_id=lead_id,
            members=[lead_id],
            permissions={
                "can_create_workflows": True,
                "can_view_org_analytics": False,
                "can_manage_team": True,
                "can_access_all_agents": True
            }
        )
        
        self.teams[team_id] = team
        
        # Add team to user's team list
        if lead_id in self.users:
            self.users[lead_id].team_ids.append(team_id)
        
        print(f"✅ Created team: {name} ({team_id}) in org {org_id}")
        return team_id
    
    def create_user(self, email: str, name: str, org_id: str, 
                   role: UserRole = UserRole.TEAM_MEMBER, team_id: str = None) -> str:
        """Create a new user"""
        
        if org_id not in self.organizations:
            raise ValueError(f"Organization {org_id} not found")
        
        user_id = f"user_{uuid.uuid4().hex[:8]}"
        
        # Set permissions based on role
        permissions = self._get_role_permissions(role)
        
        user = User(
            user_id=user_id,
            email=email,
            name=name,
            org_id=org_id,
            team_ids=[team_id] if team_id else [],
            role=role,
            created_at=datetime.now(),
            permissions=permissions,
            preferences={
                "timezone": "UTC",
                "email_notifications": True,
                "slack_notifications": False,
                "favorite_agents": [],
                "dashboard_layout": "default"
            }
        )
        
        self.users[user_id] = user
        
        # Add to team if specified
        if team_id and team_id in self.teams:
            self.teams[team_id].members.append(user_id)
        
        print(f"✅ Created user: {name} ({email}) with role {role}")
        return user_id
    
    def _get_role_permissions(self, role: UserRole) -> List[str]:
        """Get permissions based on user role"""
        
        permissions_map = {
            UserRole.SUPER_ADMIN: [
                "manage_platform", "view_all_orgs", "manage_billing",
                "access_admin_panel", "manage_users", "view_analytics"
            ],
            UserRole.ORG_OWNER: [
                "manage_org", "manage_teams", "manage_users", "view_billing",
                "create_workflows", "access_all_agents", "view_org_analytics"
            ],
            UserRole.ORG_ADMIN: [
                "manage_teams", "manage_users", "create_workflows", 
                "access_all_agents", "view_org_analytics"
            ],
            UserRole.TEAM_LEAD: [
                "manage_team", "create_workflows", "access_all_agents",
                "view_team_analytics"
            ],
            UserRole.TEAM_MEMBER: [
                "create_workflows", "access_assigned_agents", "view_own_analytics"
            ],
            UserRole.READONLY: [
                "view_workflows", "view_own_analytics"
            ]
        }
        
        return permissions_map.get(role, [])
    
    def check_quota(self, org_id: str, resource: ResourceQuota, amount: int = 1) -> bool:
        """Check if organization has quota for resource usage"""
        
        org = self.organizations.get(org_id)
        if not org:
            return False
        
        current_usage = org.usage_stats.get(resource, 0)
        quota_limit = org.quotas.get(resource, 0)
        
        return current_usage + amount <= quota_limit
    
    def consume_quota(self, org_id: str, resource: ResourceQuota, amount: int = 1) -> bool:
        """Consume quota for resource usage"""
        
        if not self.check_quota(org_id, resource, amount):
            return False
        
        org = self.organizations[org_id]
        org.usage_stats[resource] = org.usage_stats.get(resource, 0) + amount
        
        return True
    
    def get_user_context(self, user_id: str) -> Dict[str, Any]:
        """Get complete user context for request processing"""
        
        user = self.users.get(user_id)
        if not user:
            return {"error": "User not found"}
        
        org = self.organizations.get(user.org_id)
        teams = [self.teams[team_id] for team_id in user.team_ids if team_id in self.teams]
        
        return {
            "user": {
                "user_id": user.user_id,
                "email": user.email,
                "name": user.name,
                "role": user.role,
                "permissions": user.permissions,
                "preferences": user.preferences
            },
            "organization": {
                "org_id": org.org_id,
                "name": org.name,
                "plan_type": org.plan_type,
                "quotas": org.quotas,
                "usage_stats": org.usage_stats,
                "settings": org.settings
            },
            "teams": [
                {
                    "team_id": team.team_id,
                    "name": team.name,
                    "permissions": team.permissions
                } for team in teams
            ]
        }
    
    def validate_access(self, user_id: str, resource: str, action: str) -> Dict[str, Any]:
        """Validate if user has access to perform action on resource"""
        
        context = self.get_user_context(user_id)
        if "error" in context:
            return {"allowed": False, "reason": context["error"]}
        
        user_permissions = context["user"]["permissions"]
        
        # Check specific permissions
        access_rules = {
            "workflows": {
                "create": ["create_workflows"],
                "view": ["create_workflows", "view_workflows"],
                "delete": ["manage_org", "manage_team"]
            },
            "agents": {
                "execute": ["access_all_agents", "access_assigned_agents"],
                "configure": ["manage_org", "manage_team"]
            },
            "analytics": {
                "view": ["view_org_analytics", "view_team_analytics", "view_own_analytics"]
            }
        }
        
        required_permissions = access_rules.get(resource, {}).get(action, [])
        has_permission = any(perm in user_permissions for perm in required_permissions)
        
        return {
            "allowed": has_permission,
            "user_context": context,
            "required_permissions": required_permissions
        }
    
    def get_organization_analytics(self, org_id: str) -> Dict[str, Any]:
        """Get analytics for an organization"""
        
        org = self.organizations.get(org_id)
        if not org:
            return {"error": "Organization not found"}
        
        # Get organization users and teams
        org_users = [u for u in self.users.values() if u.org_id == org_id]
        org_teams = [t for t in self.teams.values() if t.org_id == org_id]
        
        return {
            "organization": {
                "name": org.name,
                "plan_type": org.plan_type,
                "created_at": org.created_at.isoformat()
            },
            "usage": {
                "quotas": org.quotas,
                "current_usage": org.usage_stats,
                "quota_utilization": {
                    quota: (org.usage_stats.get(quota, 0) / limit * 100)
                    for quota, limit in org.quotas.items() if limit > 0
                }
            },
            "team_stats": {
                "total_teams": len(org_teams),
                "active_teams": len([t for t in org_teams if t.is_active]),
                "total_members": len(org_users),
                "active_members": len([u for u in org_users if u.is_active])
            },
            "role_distribution": {
                role.value: len([u for u in org_users if u.role == role])
                for role in UserRole
            }
        }
    
    def _initialize_demo_data(self):
        """Initialize demo organizations for testing"""
        
        # Create consistent demo organization IDs
        demo_org_id = "demo_org"
        enterprise_org_id = "demo_enterprise_123"
        startup_org_id = "demo_startup_456"
        
        # Create demo organizations with specific IDs
        demo_org = Organization(
            org_id=demo_org_id,
            name="Demo Organization", 
            domain="demo.com",
            owner_id="demo_user_owner",
            plan_type=PlanType.ENTERPRISE,
            created_at=datetime.now(),
            is_active=True,
            billing_email="admin@demo.com",
            quotas={quota.value: limit for quota, limit in {
                ResourceQuota.AGENTS_PER_MONTH: 10000,
                ResourceQuota.WORKFLOWS_PER_MONTH: 1000,
                ResourceQuota.STORAGE_GB: 100,
                ResourceQuota.API_CALLS_PER_HOUR: 10000,
                ResourceQuota.TEAM_MEMBERS: 50,
                ResourceQuota.CONCURRENT_WORKFLOWS: 10
            }.items()},
            usage_stats={}
        )
        
        enterprise_org = Organization(
            org_id=enterprise_org_id,
            name="TechCorp Enterprise",
            domain="techcorp.com", 
            owner_id="enterprise_user_owner",
            plan_type=PlanType.ENTERPRISE,
            created_at=datetime.now(),
            is_active=True,
            billing_email="admin@techcorp.com",
            quotas={quota.value: limit for quota, limit in {
                ResourceQuota.AGENTS_PER_MONTH: 10000,
                ResourceQuota.WORKFLOWS_PER_MONTH: 1000,
                ResourceQuota.STORAGE_GB: 100,
                ResourceQuota.API_CALLS_PER_HOUR: 10000,
                ResourceQuota.TEAM_MEMBERS: 50,
                ResourceQuota.CONCURRENT_WORKFLOWS: 10
            }.items()},
            usage_stats={}
        )
        
        startup_org = Organization(
            org_id=startup_org_id,
            name="StartupCo",
            domain="startupco.io",
            owner_id="startup_user_owner",
            plan_type=PlanType.PROFESSIONAL,
            created_at=datetime.now(),
            is_active=True,
            billing_email="founder@startupco.io",
            quotas={quota.value: limit for quota, limit in {
                ResourceQuota.AGENTS_PER_MONTH: 1000,
                ResourceQuota.WORKFLOWS_PER_MONTH: 100,
                ResourceQuota.STORAGE_GB: 50,
                ResourceQuota.API_CALLS_PER_HOUR: 1000,
                ResourceQuota.TEAM_MEMBERS: 10,
                ResourceQuota.CONCURRENT_WORKFLOWS: 3
            }.items()},
            usage_stats={}
        )
        
        # Add to organizations dict
        self.organizations[demo_org_id] = demo_org
        self.organizations[enterprise_org_id] = enterprise_org
        self.organizations[startup_org_id] = startup_org
        
        # Create demo users
        self.create_user(
            email="admin@demo.com",
            name="Demo Admin", 
            org_id=demo_org_id,
            role=UserRole.ORG_OWNER
        )
        
        self.create_user(
            email="user@demo.com",
            name="Demo User",
            org_id=demo_org_id,
            role=UserRole.TEAM_MEMBER
        )
        
        print("🎯 Demo multi-tenant data initialized")
    
    def get_tenant_summary(self) -> Dict[str, Any]:
        """Get summary of all tenants"""
        
        return {
            "platform_stats": {
                "total_organizations": len(self.organizations),
                "total_teams": len(self.teams),
                "total_users": len(self.users),
                "active_organizations": len([o for o in self.organizations.values() if o.is_active])
            },
            "plan_distribution": {
                plan.value: len([o for o in self.organizations.values() if o.plan_type == plan])
                for plan in PlanType
            },
            "organizations": [
                {
                    "org_id": org.org_id,
                    "name": org.name,
                    "plan_type": org.plan_type,
                    "users": len([u for u in self.users.values() if u.org_id == org.org_id]),
                    "teams": len([t for t in self.teams.values() if t.org_id == org.org_id])
                }
                for org in self.organizations.values()
            ]
        } 