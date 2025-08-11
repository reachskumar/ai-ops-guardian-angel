from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

from ..policy.tag_policy import TagPolicy, TagViolation, TagPolicyEngine
from ..cmdb.store import CMDBStore
from ..utils.secrets_provider import SecretsProvider
from ..config.settings import get_settings

router = APIRouter(prefix="/api/v1/tag-policy", tags=["Tag Policy"])

# Dependency to get CMDB store
async def get_cmdb_store() -> CMDBStore:
    settings = get_settings()
    mongo_uri = settings.MONGODB_URI
    return CMDBStore(mongo_uri)

# Dependency to get tag policy engine
async def get_tag_policy_engine(cmdb_store: CMDBStore = Depends(get_cmdb_store)) -> TagPolicyEngine:
    return TagPolicyEngine(cmdb_store)

# Dependency to get secrets provider
async def get_secrets_provider() -> SecretsProvider:
    return SecretsProvider()


class TagPolicyResponse(BaseModel):
    """Tag policy response model"""
    success: bool
    data: Optional[TagPolicy] = None
    message: str


class TagPolicyListResponse(BaseModel):
    """Tag policy list response model"""
    success: bool
    data: List[TagPolicy]
    message: str
    total: int


class TagViolationResponse(BaseModel):
    """Tag violation response model"""
    success: bool
    data: Optional[TagViolation] = None
    message: str


class TagViolationListResponse(BaseModel):
    """Tag violation list response model"""
    success: bool
    data: List[TagViolation]
    message: str
    total: int


class ComplianceReportResponse(BaseModel):
    """Compliance report response model"""
    success: bool
    data: Optional[Dict[str, Any]] = None
    message: str


class CreateTagPolicyRequest(BaseModel):
    """Create tag policy request model"""
    name: str
    description: str
    policy_type: str
    required_tags: Optional[List[str]] = None
    tag_formats: Optional[Dict[str, str]] = None
    allowed_values: Optional[Dict[str, List[str]]] = None
    cost_centers: Optional[List[str]] = None
    auto_remediate: bool = True
    severity: str = "medium"
    enabled: bool = True


class UpdateTagPolicyRequest(BaseModel):
    """Update tag policy request model"""
    name: Optional[str] = None
    description: Optional[str] = None
    required_tags: Optional[List[str]] = None
    tag_formats: Optional[Dict[str, str]] = None
    allowed_values: Optional[Dict[str, List[str]]] = None
    cost_centers: Optional[List[str]] = None
    auto_remediate: Optional[bool] = None
    severity: Optional[str] = None
    enabled: Optional[bool] = None


@router.get("/{tenant_id}/policies", response_model=TagPolicyListResponse)
async def get_tag_policies(
    tenant_id: str,
    policy_engine: TagPolicyEngine = Depends(get_tag_policy_engine)
):
    """Get all tag policies for a tenant"""
    try:
        # Get default policies and tenant-specific policies
        policies = [p for p in policy_engine.default_policies if p.tenant_id in ["default", tenant_id]]
        
        return TagPolicyListResponse(
            success=True,
            data=policies,
            message=f"Retrieved {len(policies)} tag policies for tenant {tenant_id}",
            total=len(policies)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving tag policies: {str(e)}")


@router.get("/{tenant_id}/policies/{policy_id}", response_model=TagPolicyResponse)
async def get_tag_policy(
    tenant_id: str,
    policy_id: str,
    policy_engine: TagPolicyEngine = Depends(get_tag_policy_engine)
):
    """Get a specific tag policy by ID"""
    try:
        # Find policy in default policies
        policy = next((p for p in policy_engine.default_policies if p.id == policy_id), None)
        
        if not policy:
            raise HTTPException(status_code=404, detail="Tag policy not found")
        
        if policy.tenant_id != "default" and policy.tenant_id != tenant_id:
            raise HTTPException(status_code=403, detail="Access denied to this policy")
        
        return TagPolicyResponse(
            success=True,
            data=policy,
            message=f"Retrieved tag policy {policy_id}"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving tag policy: {str(e)}")


@router.post("/{tenant_id}/policies", response_model=TagPolicyResponse)
async def create_tag_policy(
    tenant_id: str,
    request: CreateTagPolicyRequest,
    policy_engine: TagPolicyEngine = Depends(get_tag_policy_engine)
):
    """Create a new tag policy"""
    try:
        # Create new policy
        policy = TagPolicy(
            id=f"{tenant_id}_{request.name.lower().replace(' ', '_')}",
            name=request.name,
            description=request.description,
            policy_type=request.policy_type,
            tenant_id=tenant_id,
            required_tags=request.required_tags or [],
            tag_formats=request.tag_formats or {},
            allowed_values=request.allowed_values or {},
            cost_centers=request.cost_centers or [],
            auto_remediate=request.auto_remediate,
            severity=request.severity,
            enabled=request.enabled
        )
        
        # Add to default policies (in a real implementation, this would be stored in database)
        policy_engine.default_policies.append(policy)
        
        return TagPolicyResponse(
            success=True,
            data=policy,
            message=f"Created tag policy {policy.id}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating tag policy: {str(e)}")


@router.put("/{tenant_id}/policies/{policy_id}", response_model=TagPolicyResponse)
async def update_tag_policy(
    tenant_id: str,
    policy_id: str,
    request: UpdateTagPolicyRequest,
    policy_engine: TagPolicyEngine = Depends(get_tag_policy_engine)
):
    """Update an existing tag policy"""
    try:
        # Find policy
        policy = next((p for p in policy_engine.default_policies if p.id == policy_id), None)
        
        if not policy:
            raise HTTPException(status_code=404, detail="Tag policy not found")
        
        if policy.tenant_id != "default" and policy.tenant_id != tenant_id:
            raise HTTPException(status_code=403, detail="Access denied to this policy")
        
        # Update fields
        if request.name is not None:
            policy.name = request.name
        if request.description is not None:
            policy.description = request.description
        if request.required_tags is not None:
            policy.required_tags = request.required_tags
        if request.tag_formats is not None:
            policy.tag_formats = request.tag_formats
        if request.allowed_values is not None:
            policy.allowed_values = request.allowed_values
        if request.cost_centers is not None:
            policy.cost_centers = request.cost_centers
        if request.auto_remediate is not None:
            policy.auto_remediate = request.auto_remediate
        if request.severity is not None:
            policy.severity = request.severity
        if request.enabled is not None:
            policy.enabled = request.enabled
        
        policy.updated_at = datetime.utcnow()
        
        return TagPolicyResponse(
            success=True,
            data=policy,
            message=f"Updated tag policy {policy_id}"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating tag policy: {str(e)}")


@router.delete("/{tenant_id}/policies/{policy_id}")
async def delete_tag_policy(
    tenant_id: str,
    policy_id: str,
    policy_engine: TagPolicyEngine = Depends(get_tag_policy_engine)
):
    """Delete a tag policy"""
    try:
        # Find policy
        policy = next((p for p in policy_engine.default_policies if p.id == policy_id), None)
        
        if not policy:
            raise HTTPException(status_code=404, detail="Tag policy not found")
        
        if policy.tenant_id != "default" and policy.tenant_id != tenant_id:
            raise HTTPException(status_code=403, detail="Access denied to this policy")
        
        # Remove from policies
        policy_engine.default_policies = [p for p in policy_engine.default_policies if p.id != policy_id]
        
        return {"success": True, "message": f"Deleted tag policy {policy_id}"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting tag policy: {str(e)}")


@router.get("/{tenant_id}/violations", response_model=TagViolationListResponse)
async def get_tag_violations(
    tenant_id: str,
    policy_id: Optional[str] = Query(None, description="Filter by policy ID"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    status: Optional[str] = Query("open", description="Filter by status"),
    limit: int = Query(100, ge=1, le=1000),
    page: int = Query(1, ge=1),
    policy_engine: TagPolicyEngine = Depends(get_tag_policy_engine),
    cmdb_store: CMDBStore = Depends(get_cmdb_store)
):
    """Get tag policy violations for a tenant"""
    try:
        # Get all resources for tenant
        resources = await cmdb_store.get_resources_by_tenant(tenant_id)
        
        # Get policies
        policies = [p for p in policy_engine.default_policies if p.tenant_id in ["default", tenant_id]]
        
        # Filter policies if policy_id specified
        if policy_id:
            policies = [p for p in policies if p.id == policy_id]
        
        # Evaluate all resources
        all_violations = []
        for resource in resources:
            violations = await policy_engine.evaluate_resource(resource, policies)
            all_violations.extend(violations)
        
        # Apply filters
        filtered_violations = all_violations
        
        if severity:
            filtered_violations = [v for v in filtered_violations if v.severity == severity]
        
        if status:
            filtered_violations = [v for v in filtered_violations if v.status == status]
        
        # Apply pagination
        total = len(filtered_violations)
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_violations = filtered_violations[start_idx:end_idx]
        
        return TagViolationListResponse(
            success=True,
            data=paginated_violations,
            message=f"Retrieved {len(paginated_violations)} tag violations for tenant {tenant_id}",
            total=total
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving tag violations: {str(e)}")


@router.get("/{tenant_id}/violations/{violation_id}", response_model=TagViolationResponse)
async def get_tag_violation(
    tenant_id: str,
    violation_id: str,
    policy_engine: TagPolicyEngine = Depends(get_tag_policy_engine),
    cmdb_store: CMDBStore = Depends(get_cmdb_store)
):
    """Get a specific tag violation by ID"""
    try:
        # Get all resources for tenant
        resources = await cmdb_store.get_resources_by_tenant(tenant_id)
        
        # Get policies
        policies = [p for p in policy_engine.default_policies if p.tenant_id in ["default", tenant_id]]
        
        # Find violation
        violation = None
        for resource in resources:
            violations = await policy_engine.evaluate_resource(resource, policies)
            for v in violations:
                if v.resource_id == violation_id:
                    violation = v
                    break
            if violation:
                break
        
        if not violation:
            raise HTTPException(status_code=404, detail="Tag violation not found")
        
        return TagViolationResponse(
            success=True,
            data=violation,
            message=f"Retrieved tag violation for resource {violation_id}"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving tag violation: {str(e)}")


@router.post("/{tenant_id}/violations/{violation_id}/remediate")
async def remediate_violation(
    tenant_id: str,
    violation_id: str,
    policy_engine: TagPolicyEngine = Depends(get_tag_policy_engine),
    cmdb_store: CMDBStore = Depends(get_cmdb_store)
):
    """Manually remediate a tag violation"""
    try:
        # Get all resources for tenant
        resources = await cmdb_store.get_resources_by_tenant(tenant_id)
        
        # Get policies
        policies = [p for p in policy_engine.default_policies if p.tenant_id in ["default", tenant_id]]
        
        # Find violation
        violation = None
        for resource in resources:
            violations = await policy_engine.evaluate_resource(resource, policies)
            for v in violations:
                if v.resource_id == violation_id:
                    violation = v
                    break
            if violation:
                break
        
        if not violation:
            raise HTTPException(status_code=404, detail="Tag violation not found")
        
        # Auto-remediate the violation
        remediated = await policy_engine.auto_remediate_violations([violation])
        
        if remediated:
            return {"success": True, "message": f"Remediated tag violation for resource {violation_id}"}
        else:
            return {"success": False, "message": f"Failed to remediate tag violation for resource {violation_id}"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error remediating tag violation: {str(e)}")


@router.post("/{tenant_id}/violations/bulk-remediate")
async def bulk_remediate_violations(
    tenant_id: str,
    policy_ids: Optional[List[str]] = Query(None, description="Filter by policy IDs"),
    severities: Optional[List[str]] = Query(None, description="Filter by severities"),
    policy_engine: TagPolicyEngine = Depends(get_tag_policy_engine),
    cmdb_store: CMDBStore = Depends(get_cmdb_store)
):
    """Bulk remediate tag violations"""
    try:
        # Get all resources for tenant
        resources = await cmdb_store.get_resources_by_tenant(tenant_id)
        
        # Get policies
        policies = [p for p in policy_engine.default_policies if p.tenant_id in ["default", tenant_id]]
        
        # Filter policies if specified
        if policy_ids:
            policies = [p for p in policies if p.id in policy_ids]
        
        # Evaluate all resources
        all_violations = []
        for resource in resources:
            violations = await policy_engine.evaluate_resource(resource, policies)
            all_violations.extend(violations)
        
        # Apply severity filter if specified
        if severities:
            all_violations = [v for v in all_violations if v.severity in severities]
        
        # Auto-remediate violations
        remediated = await policy_engine.auto_remediate_violations(all_violations)
        
        return {
            "success": True,
            "message": f"Bulk remediated {len(remediated)} tag violations",
            "total_violations": len(all_violations),
            "remediated": len(remediated),
            "failed": len(all_violations) - len(remediated)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error bulk remediating violations: {str(e)}")


@router.get("/{tenant_id}/compliance", response_model=ComplianceReportResponse)
async def get_compliance_report(
    tenant_id: str,
    policy_engine: TagPolicyEngine = Depends(get_tag_policy_engine)
):
    """Get tag compliance report for a tenant"""
    try:
        # Generate compliance report
        report = await policy_engine.generate_compliance_report(tenant_id)
        
        return ComplianceReportResponse(
            success=True,
            data=report,
            message=f"Generated tag compliance report for tenant {tenant_id}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating compliance report: {str(e)}")


@router.post("/{tenant_id}/compliance/refresh")
async def refresh_compliance_report(
    tenant_id: str,
    policy_engine: TagPolicyEngine = Depends(get_tag_policy_engine)
):
    """Refresh tag compliance report for a tenant"""
    try:
        # Generate fresh compliance report
        report = await policy_engine.generate_compliance_report(tenant_id)
        
        return {
            "success": True,
            "message": f"Refreshed tag compliance report for tenant {tenant_id}",
            "data": report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error refreshing compliance report: {str(e)}")


@router.get("/{tenant_id}/stats")
async def get_tag_policy_stats(
    tenant_id: str,
    policy_engine: TagPolicyEngine = Depends(get_tag_policy_engine),
    cmdb_store: CMDBStore = Depends(get_cmdb_store)
):
    """Get tag policy statistics for a tenant"""
    try:
        # Get all resources for tenant
        resources = await cmdb_store.get_resources_by_tenant(tenant_id)
        
        # Get policies
        policies = [p for p in policy_engine.default_policies if p.tenant_id in ["default", tenant_id]]
        
        # Count resources by tag compliance
        tagged_resources = 0
        untagged_resources = 0
        properly_tagged_resources = 0
        
        for resource in resources:
            if resource.tags:
                tagged_resources += 1
                # Check if resource has required tags
                has_owner = "owner" in resource.tags and resource.tags["owner"]
                has_team = "team" in resource.tags and resource.tags["team"]
                has_project = "project" in resource.tags and resource.tags["project"]
                
                if has_owner and has_team and has_project:
                    properly_tagged_resources += 1
            else:
                untagged_resources += 1
        
        # Count violations by severity
        all_violations = []
        for resource in resources:
            violations = await policy_engine.evaluate_resource(resource, policies)
            all_violations.extend(violations)
        
        violations_by_severity = {}
        for violation in all_violations:
            severity = violation.severity
            if severity not in violations_by_severity:
                violations_by_severity[severity] = 0
            violations_by_severity[severity] += 1
        
        # Count violations by policy
        violations_by_policy = {}
        for violation in all_violations:
            policy_id = violation.policy_id
            if policy_id not in violations_by_policy:
                violations_by_policy[policy_id] = 0
            violations_by_policy[policy_id] += 1
        
        stats = {
            "tenant_id": tenant_id,
            "total_resources": len(resources),
            "tagged_resources": tagged_resources,
            "untagged_resources": untagged_resources,
            "properly_tagged_resources": properly_tagged_resources,
            "tagging_rate": round((tagged_resources / len(resources)) * 100, 2) if resources else 0,
            "proper_tagging_rate": round((properly_tagged_resources / len(resources)) * 100, 2) if resources else 0,
            "total_violations": len(all_violations),
            "violations_by_severity": violations_by_severity,
            "violations_by_policy": violations_by_policy,
            "policies_count": len(policies),
            "generated_at": datetime.utcnow().isoformat()
        }
        
        return {"success": True, "data": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating tag policy stats: {str(e)}")


@router.post("/{tenant_id}/policies/{policy_id}/toggle")
async def toggle_policy(
    tenant_id: str,
    policy_id: str,
    policy_engine: TagPolicyEngine = Depends(get_tag_policy_engine)
):
    """Toggle a tag policy on/off"""
    try:
        # Find policy
        policy = next((p for p in policy_engine.default_policies if p.id == policy_id), None)
        
        if not policy:
            raise HTTPException(status_code=404, detail="Tag policy not found")
        
        if policy.tenant_id != "default" and policy.tenant_id != tenant_id:
            raise HTTPException(status_code=403, detail="Access denied to this policy")
        
        # Toggle enabled status
        policy.enabled = not policy.enabled
        policy.updated_at = datetime.utcnow()
        
        status = "enabled" if policy.enabled else "disabled"
        
        return {
            "success": True,
            "message": f"Tag policy {policy_id} {status}",
            "data": {"enabled": policy.enabled}
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error toggling tag policy: {str(e)}")


@router.post("/{tenant_id}/policies/{policy_id}/test")
async def test_policy(
    tenant_id: str,
    policy_id: str,
    policy_engine: TagPolicyEngine = Depends(get_tag_policy_engine),
    cmdb_store: CMDBStore = Depends(get_cmdb_store)
):
    """Test a tag policy against tenant resources"""
    try:
        # Find policy
        policy = next((p for p in policy_engine.default_policies if p.id == policy_id), None)
        
        if not policy:
            raise HTTPException(status_code=404, detail="Tag policy not found")
        
        if policy.tenant_id != "default" and policy.tenant_id != tenant_id:
            raise HTTPException(status_code=403, detail="Access denied to this policy")
        
        # Get all resources for tenant
        resources = await cmdb_store.get_resources_by_tenant(tenant_id)
        
        # Test policy against resources
        test_results = []
        for resource in resources:
            violations = await policy_engine.evaluate_resource(resource, [policy])
            if violations:
                test_results.append({
                    "resource_id": resource.id,
                    "resource_name": resource.name,
                    "resource_type": resource.resource_type.value,
                    "violations": [v.dict() for v in violations]
                })
        
        return {
            "success": True,
            "message": f"Tested tag policy {policy_id} against {len(resources)} resources",
            "data": {
                "policy_id": policy_id,
                "resources_tested": len(resources),
                "resources_with_violations": len(test_results),
                "test_results": test_results
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error testing tag policy: {str(e)}")
