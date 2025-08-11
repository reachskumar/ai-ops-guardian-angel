from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

from ..cmdb.models import (
    Resource, ResourceSearch, ResourceGraph, CMDBStats, 
    ResourceType, CloudProvider
)
from ..cmdb.store import CMDBStore
from ..utils.secrets_provider import SecretsProvider
from ..config.settings import get_settings

router = APIRouter(prefix="/api/v1/cmdb", tags=["CMDB"])

# Dependency to get CMDB store
async def get_cmdb_store() -> CMDBStore:
    settings = get_settings()
    mongo_uri = settings.MONGODB_URI
    return CMDBStore(mongo_uri)

# Dependency to get secrets provider
async def get_secrets_provider() -> SecretsProvider:
    return SecretsProvider()


class ResourceResponse(BaseModel):
    """Resource response model"""
    success: bool
    data: Optional[Resource] = None
    message: str
    total: Optional[int] = None


class ResourceListResponse(BaseModel):
    """Resource list response model"""
    success: bool
    data: List[Resource]
    message: str
    total: int
    page: int
    limit: int


class ResourceGraphResponse(BaseModel):
    """Resource graph response model"""
    success: bool
    data: Optional[ResourceGraph] = None
    message: str


class CMDBStatsResponse(BaseModel):
    """CMDB stats response model"""
    success: bool
    data: Optional[CMDBStats] = None
    message: str


class SearchRequest(BaseModel):
    """Search request model"""
    tenant_id: Optional[str] = None
    cloud_provider: Optional[CloudProvider] = None
    resource_type: Optional[ResourceType] = None
    region: Optional[str] = None
    account_id: Optional[str] = None
    owner: Optional[str] = None
    team: Optional[str] = None
    project: Optional[str] = None
    tags: Optional[Dict[str, str]] = None
    public_exposure: Optional[bool] = None
    compliance_status: Optional[str] = None
    cost_min: Optional[float] = None
    cost_max: Optional[float] = None
    limit: int = 100
    page: int = 1


@router.get("/{tenant_id}/resources", response_model=ResourceListResponse)
async def get_tenant_resources(
    tenant_id: str,
    limit: int = Query(100, ge=1, le=1000),
    page: int = Query(1, ge=1),
    cmdb_store: CMDBStore = Depends(get_cmdb_store)
):
    """Get all resources for a tenant with pagination"""
    try:
        offset = (page - 1) * limit
        
        # Get resources for tenant
        resources = await cmdb_store.get_resources_by_tenant(tenant_id, limit=limit)
        
        # Get total count for pagination
        search = ResourceSearch(tenant_id=tenant_id)
        all_resources = await cmdb_store.search_resources(search, limit=10000)
        total = len(all_resources)
        
        return ResourceListResponse(
            success=True,
            data=resources,
            message=f"Retrieved {len(resources)} resources for tenant {tenant_id}",
            total=total,
            page=page,
            limit=limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving resources: {str(e)}")


@router.get("/{tenant_id}/resources/{resource_id}", response_model=ResourceResponse)
async def get_resource(
    tenant_id: str,
    resource_id: str,
    cmdb_store: CMDBStore = Depends(get_cmdb_store)
):
    """Get a specific resource by ID"""
    try:
        resource = await cmdb_store.get_resource(resource_id)
        
        if not resource:
            raise HTTPException(status_code=404, detail="Resource not found")
        
        if resource.tenant_id != tenant_id:
            raise HTTPException(status_code=403, detail="Access denied to this resource")
        
        return ResourceResponse(
            success=True,
            data=resource,
            message=f"Retrieved resource {resource_id}",
            total=1
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving resource: {str(e)}")


@router.post("/{tenant_id}/search", response_model=ResourceListResponse)
async def search_resources(
    tenant_id: str,
    search_request: SearchRequest,
    cmdb_store: CMDBStore = Depends(get_cmdb_store)
):
    """Search resources based on criteria"""
    try:
        # Ensure tenant_id is set
        search_request.tenant_id = tenant_id
        
        # Convert to ResourceSearch
        search = ResourceSearch(**search_request.dict())
        
        # Perform search
        resources = await cmdb_store.search_resources(search, limit=search_request.limit)
        
        # Get total count for pagination
        search_for_count = ResourceSearch(**search_request.dict())
        search_for_count.limit = 10000  # Large limit to get total count
        all_matching = await cmdb_store.search_resources(search_for_count)
        total = len(all_matching)
        
        return ResourceListResponse(
            success=True,
            data=resources,
            message=f"Search returned {len(resources)} resources",
            total=total,
            page=search_request.page,
            limit=search_request.limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching resources: {str(e)}")


@router.get("/{tenant_id}/resources/public", response_model=ResourceListResponse)
async def get_public_resources(
    tenant_id: str,
    limit: int = Query(100, ge=1, le=1000),
    cmdb_store: CMDBStore = Depends(get_cmdb_store)
):
    """Get all publicly exposed resources for a tenant"""
    try:
        resources = await cmdb_store.get_public_resources(tenant_id=tenant_id)
        
        # Apply limit
        limited_resources = resources[:limit]
        
        return ResourceListResponse(
            success=True,
            data=limited_resources,
            message=f"Retrieved {len(limited_resources)} public resources for tenant {tenant_id}",
            total=len(resources),
            page=1,
            limit=limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving public resources: {str(e)}")


@router.get("/{tenant_id}/resources/untagged", response_model=ResourceListResponse)
async def get_untagged_resources(
    tenant_id: str,
    limit: int = Query(100, ge=1, le=1000),
    cmdb_store: CMDBStore = Depends(get_cmdb_store)
):
    """Get resources without proper tags for a tenant"""
    try:
        resources = await cmdb_store.get_untagged_resources(tenant_id=tenant_id)
        
        # Apply limit
        limited_resources = resources[:limit]
        
        return ResourceListResponse(
            success=True,
            data=limited_resources,
            message=f"Retrieved {len(limited_resources)} untagged resources for tenant {tenant_id}",
            total=len(resources),
            page=1,
            limit=limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving untagged resources: {str(e)}")


@router.get("/{tenant_id}/graph", response_model=ResourceGraphResponse)
async def get_resource_graph(
    tenant_id: str,
    max_depth: int = Query(3, ge=1, le=10),
    cmdb_store: CMDBStore = Depends(get_cmdb_store)
):
    """Get resource graph for a tenant"""
    try:
        graph = await cmdb_store.build_resource_graph(tenant_id, max_depth=max_depth)
        
        return ResourceGraphResponse(
            success=True,
            data=graph,
            message=f"Generated resource graph for tenant {tenant_id} with {len(graph.nodes)} nodes and {len(graph.edges)} edges"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating resource graph: {str(e)}")


@router.get("/{tenant_id}/stats", response_model=CMDBStatsResponse)
async def get_cmdb_stats(
    tenant_id: str,
    cmdb_store: CMDBStore = Depends(get_cmdb_store)
):
    """Get CMDB statistics for a tenant"""
    try:
        stats = await cmdb_store.get_cmdb_stats(tenant_id=tenant_id)
        
        return CMDBStatsResponse(
            success=True,
            data=stats,
            message=f"Retrieved CMDB statistics for tenant {tenant_id}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving CMDB stats: {str(e)}")


@router.get("/stats/global", response_model=CMDBStatsResponse)
async def get_global_cmdb_stats(
    cmdb_store: CMDBStore = Depends(get_cmdb_store)
):
    """Get global CMDB statistics across all tenants"""
    try:
        stats = await cmdb_store.get_cmdb_stats()
        
        return CMDBStatsResponse(
            success=True,
            data=stats,
            message="Retrieved global CMDB statistics"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving global CMDB stats: {str(e)}")


@router.get("/{tenant_id}/resources/type/{resource_type}", response_model=ResourceListResponse)
async def get_resources_by_type(
    tenant_id: str,
    resource_type: ResourceType,
    limit: int = Query(100, ge=1, le=1000),
    page: int = Query(1, ge=1),
    cmdb_store: CMDBStore = Depends(get_cmdb_store)
):
    """Get resources of a specific type for a tenant"""
    try:
        search = ResourceSearch(
            tenant_id=tenant_id,
            resource_type=resource_type
        )
        
        resources = await cmdb_store.search_resources(search, limit=limit)
        
        # Get total count for pagination
        search_for_count = ResourceSearch(
            tenant_id=tenant_id,
            resource_type=resource_type
        )
        all_matching = await cmdb_store.search_resources(search_for_count, limit=10000)
        total = len(all_matching)
        
        return ResourceListResponse(
            success=True,
            data=resources,
            message=f"Retrieved {len(resources)} {resource_type} resources for tenant {tenant_id}",
            total=total,
            page=page,
            limit=limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving resources by type: {str(e)}")


@router.get("/{tenant_id}/resources/provider/{cloud_provider}", response_model=ResourceListResponse)
async def get_resources_by_provider(
    tenant_id: str,
    cloud_provider: CloudProvider,
    limit: int = Query(100, ge=1, le=1000),
    page: int = Query(1, ge=1),
    cmdb_store: CMDBStore = Depends(get_cmdb_store)
):
    """Get resources from a specific cloud provider for a tenant"""
    try:
        search = ResourceSearch(
            tenant_id=tenant_id,
            cloud_provider=cloud_provider
        )
        
        resources = await cmdb_store.search_resources(search, limit=limit)
        
        # Get total count for pagination
        search_for_count = ResourceSearch(
            tenant_id=tenant_id,
            cloud_provider=cloud_provider
        )
        all_matching = await cmdb_store.search_resources(search_for_count, limit=10000)
        total = len(all_matching)
        
        return ResourceListResponse(
            success=True,
            data=resources,
            message=f"Retrieved {len(resources)} {cloud_provider} resources for tenant {tenant_id}",
            total=total,
            page=page,
            limit=limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving resources by provider: {str(e)}")


@router.get("/{tenant_id}/resources/owner/{owner}", response_model=ResourceListResponse)
async def get_resources_by_owner(
    tenant_id: str,
    owner: str,
    limit: int = Query(100, ge=1, le=1000),
    page: int = Query(1, ge=1),
    cmdb_store: CMDBStore = Depends(get_cmdb_store)
):
    """Get resources owned by a specific user for a tenant"""
    try:
        search = ResourceSearch(
            tenant_id=tenant_id,
            owner=owner
        )
        
        resources = await cmdb_store.search_resources(search, limit=limit)
        
        # Get total count for pagination
        search_for_count = ResourceSearch(
            tenant_id=tenant_id,
            owner=owner
        )
        all_matching = await cmdb_store.search_resources(search_for_count, limit=10000)
        total = len(all_matching)
        
        return ResourceListResponse(
            success=True,
            data=resources,
            message=f"Retrieved {len(resources)} resources owned by {owner} for tenant {tenant_id}",
            total=total,
            page=page,
            limit=limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving resources by owner: {str(e)}")


@router.get("/{tenant_id}/resources/team/{team}", response_model=ResourceListResponse)
async def get_resources_by_team(
    tenant_id: str,
    team: str,
    limit: int = Query(100, ge=1, le=1000),
    page: int = Query(1, ge=1),
    cmdb_store: CMDBStore = Depends(get_cmdb_store)
):
    """Get resources for a specific team for a tenant"""
    try:
        search = ResourceSearch(
            tenant_id=tenant_id,
            team=team
        )
        
        resources = await cmdb_store.search_resources(search, limit=limit)
        
        # Get total count for pagination
        search_for_count = ResourceSearch(
            tenant_id=tenant_id,
            team=team
        )
        all_matching = await cmdb_store.search_resources(search_for_count, limit=10000)
        total = len(all_matching)
        
        return ResourceListResponse(
            success=True,
            data=resources,
            message=f"Retrieved {len(resources)} resources for team {team} in tenant {tenant_id}",
            total=total,
            page=page,
            limit=limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving resources by team: {str(e)}")


@router.get("/{tenant_id}/resources/project/{project}", response_model=ResourceListResponse)
async def get_resources_by_project(
    tenant_id: str,
    project: str,
    limit: int = Query(100, ge=1, le=1000),
    page: int = Query(1, ge=1),
    cmdb_store: CMDBStore = Depends(get_cmdb_store)
):
    """Get resources for a specific project for a tenant"""
    try:
        search = ResourceSearch(
            tenant_id=tenant_id,
            project=project
        )
        
        resources = await cmdb_store.search_resources(search, limit=limit)
        
        # Get total count for pagination
        search_for_count = ResourceSearch(
            tenant_id=tenant_id,
            project=project
        )
        all_matching = await cmdb_store.search_resources(search_for_count, limit=10000)
        total = len(all_matching)
        
        return ResourceListResponse(
            success=True,
            data=resources,
            message=f"Retrieved {len(resources)} resources for project {project} in tenant {tenant_id}",
            total=total,
            page=page,
            limit=limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving resources by project: {str(e)}")


@router.get("/{tenant_id}/resources/region/{region}", response_model=ResourceListResponse)
async def get_resources_by_region(
    tenant_id: str,
    region: str,
    limit: int = Query(100, ge=1, le=1000),
    page: int = Query(1, ge=1),
    cmdb_store: CMDBStore = Depends(get_cmdb_store)
):
    """Get resources in a specific region for a tenant"""
    try:
        search = ResourceSearch(
            tenant_id=tenant_id,
            region=region
        )
        
        resources = await cmdb_store.search_resources(search, limit=limit)
        
        # Get total count for pagination
        search_for_count = ResourceSearch(
            tenant_id=tenant_id,
            region=region
        )
        all_matching = await cmdb_store.search_resources(search_for_count, limit=10000)
        total = len(all_matching)
        
        return ResourceListResponse(
            success=True,
            data=resources,
            message=f"Retrieved {len(resources)} resources in region {region} for tenant {tenant_id}",
            total=total,
            page=page,
            limit=limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving resources by region: {str(e)}")


@router.get("/{tenant_id}/resources/account/{account_id}", response_model=ResourceListResponse)
async def get_resources_by_account(
    tenant_id: str,
    account_id: str,
    limit: int = Query(100, ge=1, le=1000),
    page: int = Query(1, ge=1),
    cmdb_store: CMDBStore = Depends(get_cmdb_store)
):
    """Get resources in a specific cloud account for a tenant"""
    try:
        search = ResourceSearch(
            tenant_id=tenant_id,
            account_id=account_id
        )
        
        resources = await cmdb_store.search_resources(search, limit=limit)
        
        # Get total count for pagination
        search_for_count = ResourceSearch(
            tenant_id=tenant_id,
            account_id=account_id
        )
        all_matching = await cmdb_store.search_resources(search_for_count, limit=10000)
        total = len(all_matching)
        
        return ResourceListResponse(
            success=True,
            data=resources,
            message=f"Retrieved {len(resources)} resources in account {account_id} for tenant {tenant_id}",
            total=total,
            page=page,
            limit=limit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving resources by account: {str(e)}")
