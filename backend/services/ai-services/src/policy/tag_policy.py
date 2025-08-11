from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
from enum import Enum
from pydantic import BaseModel, Field

from ..cmdb.models import Resource, ResourceType, CloudProvider
from ..cmdb.store import CMDBStore


class TagPolicyType(str, Enum):
    """Tag policy types"""
    REQUIRED = "required"
    FORMAT = "format"
    VALUE = "value"
    COST_ALLOCATION = "cost_allocation"
    COMPLIANCE = "compliance"


class TagPolicy(BaseModel):
    """Tag policy definition"""
    id: str = Field(..., description="Policy ID")
    name: str = Field(..., description="Policy name")
    description: str = Field(..., description="Policy description")
    policy_type: TagPolicyType = Field(..., description="Policy type")
    tenant_id: str = Field(..., description="Tenant ID")
    
    # Policy rules
    required_tags: List[str] = Field(default_factory=list, description="Required tag keys")
    tag_formats: Dict[str, str] = Field(default_factory=dict, description="Tag format patterns")
    allowed_values: Dict[str, List[str]] = Field(default_factory=dict, description="Allowed tag values")
    cost_centers: List[str] = Field(default_factory=list, description="Valid cost centers")
    
    # Enforcement
    auto_remediate: bool = Field(True, description="Auto-remediate violations")
    severity: str = Field("medium", description="Policy severity")
    enabled: bool = Field(True, description="Policy enabled")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class TagViolation(BaseModel):
    """Tag policy violation"""
    resource_id: str = Field(..., description="Resource ID")
    resource_name: str = Field(..., description="Resource name")
    resource_type: ResourceType = Field(..., description="Resource type")
    cloud_provider: CloudProvider = Field(..., description="Cloud provider")
    tenant_id: str = Field(..., description="Tenant ID")
    
    # Violation details
    policy_id: str = Field(..., description="Violated policy ID")
    violation_type: str = Field(..., description="Type of violation")
    description: str = Field(..., description="Violation description")
    severity: str = Field(..., description="Violation severity")
    
    # Current state
    current_tags: Dict[str, str] = Field(..., description="Current tags")
    missing_tags: List[str] = Field(default_factory=list, description="Missing tags")
    invalid_tags: List[str] = Field(default_factory=list, description="Invalid tags")
    
    # Remediation
    suggested_tags: Dict[str, str] = Field(default_factory=dict, description="Suggested tag values")
    auto_remediated: bool = Field(False, description="Auto-remediated")
    remediated_at: Optional[datetime] = Field(None, description="Remediation timestamp")
    
    # Metadata
    detected_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field("open", description="Violation status")


class TagPolicyEngine:
    """Tag policy enforcement engine"""
    
    def __init__(self, cmdb_store: CMDBStore):
        self.cmdb_store = cmdb_store
        self.default_policies = self._create_default_policies()
    
    def _create_default_policies(self) -> List[TagPolicy]:
        """Create default tag policies"""
        return [
            TagPolicy(
                id="required_tags",
                name="Required Tags",
                description="Resources must have owner, team, and project tags",
                policy_type=TagPolicyType.REQUIRED,
                tenant_id="default",
                required_tags=["owner", "team", "project"],
                severity="high",
                auto_remediate=True
            ),
            TagPolicy(
                id="cost_allocation",
                name="Cost Allocation Tags",
                description="Resources must have cost center tags for billing",
                policy_type=TagPolicyType.COST_ALLOCATION,
                tenant_id="default",
                cost_centers=["engineering", "marketing", "sales", "operations", "infrastructure"],
                severity="medium",
                auto_remediate=True
            ),
            TagPolicy(
                id="environment_tag",
                name="Environment Tag",
                description="Resources must have environment tag",
                policy_type=TagPolicyType.VALUE,
                tenant_id="default",
                allowed_values={"environment": ["dev", "staging", "prod", "test"]},
                severity="medium",
                auto_remediate=True
            ),
            TagPolicy(
                id="format_standards",
                name="Tag Format Standards",
                description="Tags must follow naming conventions",
                policy_type=TagPolicyType.FORMAT,
                tenant_id="default",
                tag_formats={
                    "owner": r"^[a-z]+\\.[a-z]+$",
                    "team": r"^[a-z-]+$",
                    "project": r"^[a-z0-9-]+$"
                },
                severity="low",
                auto_remediate=False
            )
        ]
    
    async def evaluate_resource(self, resource: Resource, policies: List[TagPolicy]) -> List[TagViolation]:
        """Evaluate a resource against tag policies"""
        violations = []
        
        for policy in policies:
            if not policy.enabled:
                continue
                
            if policy.tenant_id != "default" and policy.tenant_id != resource.tenant_id:
                continue
            
            policy_violations = await self._evaluate_policy(resource, policy)
            violations.extend(policy_violations)
        
        return violations
    
    async def _evaluate_policy(self, resource: Resource, policy: TagPolicy) -> List[TagViolation]:
        """Evaluate a resource against a specific policy"""
        violations = []
        
        if policy.policy_type == TagPolicyType.REQUIRED:
            violations.extend(self._check_required_tags(resource, policy))
        elif policy.policy_type == TagPolicyType.FORMAT:
            violations.extend(self._check_tag_formats(resource, policy))
        elif policy.policy_type == TagPolicyType.VALUE:
            violations.extend(self._check_tag_values(resource, policy))
        elif policy.policy_type == TagPolicyType.COST_ALLOCATION:
            violations.extend(self._check_cost_allocation(resource, policy))
        
        return violations
    
    def _check_required_tags(self, resource: Resource, policy: TagPolicy) -> List[TagViolation]:
        """Check for required tags"""
        violations = []
        missing_tags = []
        
        for required_tag in policy.required_tags:
            if required_tag not in resource.tags or not resource.tags[required_tag]:
                missing_tags.append(required_tag)
        
        if missing_tags:
            violation = TagViolation(
                resource_id=resource.id,
                resource_name=resource.name,
                resource_type=resource.resource_type,
                cloud_provider=resource.cloud_provider,
                tenant_id=resource.tenant_id,
                policy_id=policy.id,
                violation_type="missing_required_tags",
                description=f"Missing required tags: {', '.join(missing_tags)}",
                severity=policy.severity,
                current_tags=resource.tags,
                missing_tags=missing_tags,
                suggested_tags=self._suggest_tags(resource, missing_tags)
            )
            violations.append(violation)
        
        return violations
    
    def _check_tag_formats(self, resource: Resource, policy: TagPolicy) -> List[TagViolation]:
        """Check tag format compliance"""
        violations = []
        invalid_tags = []
        
        import re
        
        for tag_key, format_pattern in policy.tag_formats.items():
            if tag_key in resource.tags:
                tag_value = resource.tags[tag_key]
                if not re.match(format_pattern, tag_value):
                    invalid_tags.append(tag_key)
        
        if invalid_tags:
            violation = TagViolation(
                resource_id=resource.id,
                resource_name=resource.name,
                resource_type=resource.resource_type,
                cloud_provider=resource.cloud_provider,
                tenant_id=resource.tenant_id,
                policy_id=policy.id,
                violation_type="invalid_tag_format",
                description=f"Tags with invalid format: {', '.join(invalid_tags)}",
                severity=policy.severity,
                current_tags=resource.tags,
                invalid_tags=invalid_tags,
                suggested_tags=self._suggest_tag_formats(resource, invalid_tags)
            )
            violations.append(violation)
        
        return violations
    
    def _check_tag_values(self, resource: Resource, policy: TagPolicy) -> List[TagViolation]:
        """Check tag value compliance"""
        violations = []
        invalid_values = []
        
        for tag_key, allowed_values in policy.allowed_values.items():
            if tag_key in resource.tags:
                tag_value = resource.tags[tag_key]
                if tag_value not in allowed_values:
                    invalid_values.append(f"{tag_key}={tag_value}")
        
        if invalid_values:
            violation = TagViolation(
                resource_id=resource.id,
                resource_name=resource.name,
                resource_type=resource.resource_type,
                cloud_provider=resource.cloud_provider,
                tenant_id=resource.tenant_id,
                policy_id=policy.id,
                violation_type="invalid_tag_value",
                description=f"Tags with invalid values: {', '.join(invalid_values)}",
                severity=policy.severity,
                current_tags=resource.tags,
                invalid_tags=invalid_values,
                suggested_tags=self._suggest_tag_values(resource, policy.allowed_values)
            )
            violations.append(violation)
        
        return violations
    
    def _check_cost_allocation(self, resource: Resource, policy: TagPolicy) -> List[TagViolation]:
        """Check cost allocation tag compliance"""
        violations = []
        missing_cost_tags = []
        
        # Check if resource has cost center tag
        if "cost_center" not in resource.tags or not resource.tags["cost_center"]:
            missing_cost_tags.append("cost_center")
        
        # Check if cost center is valid
        if "cost_center" in resource.tags:
            cost_center = resource.tags["cost_center"]
            if cost_center not in policy.cost_centers:
                missing_cost_tags.append("cost_center")
        
        if missing_cost_tags:
            violation = TagViolation(
                resource_id=resource.id,
                resource_name=resource.name,
                resource_type=resource.resource_type,
                cloud_provider=resource.cloud_provider,
                tenant_id=resource.tenant_id,
                policy_id=policy.id,
                violation_type="missing_cost_allocation",
                description=f"Missing or invalid cost allocation tags: {', '.join(missing_cost_tags)}",
                severity=policy.severity,
                current_tags=resource.tags,
                missing_tags=missing_cost_tags,
                suggested_tags=self._suggest_cost_tags(resource, policy.cost_centers)
            )
            violations.append(violation)
        
        return violations
    
    def _suggest_tags(self, resource: Resource, missing_tags: List[str]) -> Dict[str, str]:
        """Suggest tag values for missing tags"""
        suggestions = {}
        
        # Try to infer from existing tags or resource attributes
        for tag in missing_tags:
            if tag == "owner":
                # Try to get owner from other tags or resource attributes
                if "created_by" in resource.cloud_attributes:
                    suggestions[tag] = resource.cloud_attributes["created_by"]
                else:
                    suggestions[tag] = "unknown"
            elif tag == "team":
                # Try to infer team from project or other context
                if "project" in resource.tags:
                    suggestions[tag] = self._infer_team_from_project(resource.tags["project"])
                else:
                    suggestions[tag] = "infrastructure"
            elif tag == "project":
                # Try to infer project from resource name or other attributes
                suggestions[tag] = self._infer_project_from_name(resource.name)
        
        return suggestions
    
    def _suggest_tag_formats(self, resource: Resource, invalid_tags: List[str]) -> Dict[str, str]:
        """Suggest corrected tag formats"""
        suggestions = {}
        
        for tag_key in invalid_tags:
            if tag_key in resource.tags:
                current_value = resource.tags[tag_key]
                if tag_key == "owner":
                    # Convert to lowercase with dots
                    suggestions[tag_key] = current_value.lower().replace(" ", ".")
                elif tag_key == "team":
                    # Convert to lowercase with hyphens
                    suggestions[tag_key] = current_value.lower().replace(" ", "-")
                elif tag_key == "project":
                    # Convert to lowercase with hyphens, remove special chars
                    import re
                    suggestions[tag_key] = re.sub(r'[^a-z0-9-]', '', current_value.lower())
        
        return suggestions
    
    def _suggest_tag_values(self, resource: Resource, allowed_values: Dict[str, List[str]]) -> Dict[str, str]:
        """Suggest valid tag values"""
        suggestions = {}
        
        for tag_key, values in allowed_values.items():
            if tag_key in resource.tags:
                current_value = resource.tags[tag_key]
                # Find closest match or use default
                if current_value not in values:
                    # Try to find similar value
                    similar = self._find_similar_value(current_value, values)
                    if similar:
                        suggestions[tag_key] = similar
                    else:
                        suggestions[tag_key] = values[0]  # Use first allowed value
        
        return suggestions
    
    def _suggest_cost_tags(self, resource: Resource, cost_centers: List[str]) -> Dict[str, str]:
        """Suggest cost center tags"""
        suggestions = {}
        
        # Try to infer cost center from other tags
        if "team" in resource.tags:
            team = resource.tags["team"]
            if team in cost_centers:
                suggestions["cost_center"] = team
            else:
                suggestions["cost_center"] = "infrastructure"
        elif "project" in resource.tags:
            project = resource.tags["project"]
            suggestions["cost_center"] = self._infer_cost_center_from_project(project)
        else:
            suggestions["cost_center"] = "infrastructure"
        
        return suggestions
    
    def _infer_team_from_project(self, project: str) -> str:
        """Infer team from project name"""
        project_lower = project.lower()
        
        if any(word in project_lower for word in ["frontend", "ui", "web"]):
            return "frontend"
        elif any(word in project_lower for word in ["backend", "api", "service"]):
            return "backend"
        elif any(word in project_lower for word in ["ml", "ai", "data"]):
            return "ml"
        elif any(word in project_lower for word in ["devops", "infra", "platform"]):
            return "infrastructure"
        else:
            return "engineering"
    
    def _infer_project_from_name(self, name: str) -> str:
        """Infer project from resource name"""
        # Extract project from resource name patterns
        import re
        
        # Common patterns: project-env-resource, project_resource, etc.
        patterns = [
            r'^([a-z0-9-]+)-[a-z]+-',  # project-env-
            r'^([a-z0-9-]+)_[a-z]+',   # project_resource
            r'^([a-z0-9-]+)[a-z]+',    # projectresource
        ]
        
        for pattern in patterns:
            match = re.match(pattern, name.lower())
            if match:
                return match.group(1)
        
        # Fallback: use first part of name
        return name.lower().split('-')[0].split('_')[0]
    
    def _find_similar_value(self, current: str, allowed: List[str]) -> Optional[str]:
        """Find similar value in allowed list"""
        current_lower = current.lower()
        
        # Exact match
        if current in allowed:
            return current
        
        # Case-insensitive match
        for value in allowed:
            if value.lower() == current_lower:
                return value
        
        # Partial match
        for value in allowed:
            if current_lower in value.lower() or value.lower() in current_lower:
                return value
        
        return None
    
    def _infer_cost_center_from_project(self, project: str) -> str:
        """Infer cost center from project"""
        project_lower = project.lower()
        
        if any(word in project_lower for word in ["marketing", "campaign", "ads"]):
            return "marketing"
        elif any(word in project_lower for word in ["sales", "crm", "leads"]):
            return "sales"
        elif any(word in project_lower for word in ["ops", "support", "customer"]):
            return "operations"
        else:
            return "engineering"
    
    async def auto_remediate_violations(self, violations: List[TagViolation]) -> List[TagViolation]:
        """Auto-remediate tag violations"""
        remediated = []
        
        for violation in violations:
            if violation.auto_remediated:
                continue
                
            # Get the resource
            resource = await self.cmdb_store.get_resource(violation.resource_id)
            if not resource:
                continue
            
            # Apply suggested tags
            if violation.suggested_tags:
                resource.tags.update(violation.suggested_tags)
                resource.last_updated = datetime.utcnow()
                
                # Update in CMDB
                success = await self.cmdb_store.upsert_resource(resource)
                
                if success:
                    violation.auto_remediated = True
                    violation.remediated_at = datetime.utcnow()
                    violation.status = "remediated"
                    remediated.append(violation)
        
        return remediated
    
    async def generate_compliance_report(self, tenant_id: str) -> Dict[str, Any]:
        """Generate tag compliance report"""
        # Get all resources for tenant
        resources = await self.cmdb_store.get_resources_by_tenant(tenant_id)
        
        # Get policies
        policies = [p for p in self.default_policies if p.tenant_id in ["default", tenant_id]]
        
        # Evaluate all resources
        all_violations = []
        compliant_resources = 0
        
        for resource in resources:
            violations = await self.evaluate_resource(resource, policies)
            if violations:
                all_violations.extend(violations)
            else:
                compliant_resources += 1
        
        # Auto-remediate if enabled
        remediated = []
        for policy in policies:
            if policy.auto_remediate:
                policy_violations = [v for v in all_violations if v.policy_id == policy.id]
                remediated.extend(await self.auto_remediate_violations(policy_violations))
        
        # Generate report
        report = {
            "tenant_id": tenant_id,
            "total_resources": len(resources),
            "compliant_resources": compliant_resources,
            "non_compliant_resources": len(resources) - compliant_resources,
            "total_violations": len(all_violations),
            "auto_remediated": len(remediated),
            "manual_remediation_needed": len(all_violations) - len(remediated),
            "compliance_score": round((compliant_resources / len(resources)) * 100, 2) if resources else 100,
            "violations_by_policy": {},
            "violations_by_severity": {},
            "generated_at": datetime.utcnow().isoformat()
        }
        
        # Group violations by policy
        for violation in all_violations:
            policy_id = violation.policy_id
            if policy_id not in report["violations_by_policy"]:
                report["violations_by_policy"][policy_id] = 0
            report["violations_by_policy"][policy_id] += 1
        
        # Group violations by severity
        for violation in all_violations:
            severity = violation.severity
            if severity not in report["violations_by_severity"]:
                report["violations_by_severity"][severity] = 0
            report["violations_by_severity"][severity] += 1
        
        return report
