from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple, Set
from enum import Enum
from pydantic import BaseModel, Field
import asyncio
import time

from ..cmdb.models import Resource, CloudProvider, ResourceType, ResourceSearch
from ..cmdb.store import CMDBStore


class CleanupResourceType(str, Enum):
    """Types of resources that can be cleaned up"""
    UNUSED_VOLUMES = "unused_volumes"
    OLD_SNAPSHOTS = "old_snapshots"
    UNATTACHED_DISKS = "unattached_disks"
    IDLE_INSTANCES = "idle_instances"
    UNUSED_LOAD_BALANCERS = "unused_load_balancers"
    EMPTY_STORAGE_BUCKETS = "empty_storage_buckets"
    EXPIRED_CERTIFICATES = "expired_certificates"
    UNUSED_SECURITY_GROUPS = "unused_security_groups"
    ORPHANED_IPS = "orphaned_ips"
    UNUSED_NETWORK_INTERFACES = "unused_network_interfaces"


class CleanupPolicy(BaseModel):
    """Cleanup policy definition"""
    id: str = Field(..., description="Policy ID")
    name: str = Field(..., description="Policy name")
    description: str = Field(..., description="Policy description")
    tenant_id: str = Field(..., description="Tenant ID")
    
    # Resource type and conditions
    resource_type: CleanupResourceType = Field(..., description="Resource type to clean up")
    cloud_provider: CloudProvider = Field(..., description="Cloud provider")
    
    # Cleanup conditions
    age_threshold_days: int = Field(..., description="Minimum age in days before cleanup")
    size_threshold_gb: Optional[float] = Field(None, description="Minimum size in GB before cleanup")
    cost_threshold: Optional[float] = Field(None, description="Minimum cost before cleanup")
    
    # Safety conditions
    exclude_tags: Dict[str, str] = Field(default_factory=dict, description="Tags that exclude resources from cleanup")
    include_tags: Dict[str, str] = Field(default_factory=dict, description="Tags that include resources in cleanup")
    protected_resources: List[str] = Field(default_factory=list, description="Resource IDs that are protected")
    
    # Execution settings
    dry_run: bool = Field(True, description="Dry run mode (no actual deletion)")
    batch_size: int = Field(10, description="Number of resources to process in each batch")
    delay_between_batches: int = Field(30, description="Delay between batches in seconds")
    
    # Notifications
    notify_owners: bool = Field(True, description="Notify resource owners before cleanup")
    notification_days: int = Field(7, description="Days before cleanup to send notification")
    
    # Metadata
    enabled: bool = Field(True, description="Policy enabled")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class CleanupCandidate(BaseModel):
    """Resource candidate for cleanup"""
    resource_id: str = Field(..., description="Resource ID")
    resource_name: str = Field(..., description="Resource name")
    resource_type: ResourceType = Field(..., description="Resource type")
    cloud_provider: CloudProvider = Field(..., description="Cloud provider")
    tenant_id: str = Field(..., description="Tenant ID")
    
    # Cleanup reasons
    cleanup_reasons: List[str] = Field(..., description="Reasons for cleanup")
    age_days: int = Field(..., description="Age in days")
    size_gb: Optional[float] = Field(None, description="Size in GB")
    monthly_cost: Optional[float] = Field(None, description="Monthly cost")
    
    # Resource metadata
    owner: Optional[str] = Field(None, description="Resource owner")
    team: Optional[str] = Field(None, description="Team")
    project: Optional[str] = Field(None, description="Project")
    tags: Dict[str, str] = Field(default_factory=dict, description="Resource tags")
    
    # Safety checks
    is_protected: bool = Field(False, description="Is resource protected from cleanup")
    has_dependencies: bool = Field(False, description="Has dependent resources")
    last_accessed: Optional[datetime] = Field(None, description="Last access time")
    
    # Cleanup status
    cleanup_status: str = Field("pending", description="Cleanup status")
    cleanup_approved: bool = Field(False, description="Cleanup approved")
    cleanup_scheduled: Optional[datetime] = Field(None, description="Scheduled cleanup time")
    cleanup_completed: Optional[datetime] = Field(None, description="Cleanup completion time")


class CleanupJob(BaseModel):
    """Cleanup job execution"""
    id: str = Field(..., description="Job ID")
    tenant_id: str = Field(..., description="Tenant ID")
    policy_id: str = Field(..., description="Policy ID")
    
    # Execution details
    status: str = Field("pending", description="Job status")
    started_at: Optional[datetime] = Field(None, description="Start time")
    completed_at: Optional[datetime] = Field(None, description="Completion time")
    
    # Results
    total_candidates: int = Field(0, description="Total candidates found")
    approved_candidates: int = Field(0, description="Candidates approved for cleanup")
    cleaned_up: int = Field(0, description="Resources actually cleaned up")
    failed: int = Field(0, description="Cleanup failures")
    skipped: int = Field(0, description="Resources skipped")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    error_message: Optional[str] = Field(None, description="Error message if failed")


class BulkCleanupEngine:
    """Bulk cleanup engine for unused resources"""
    
    def __init__(self, cmdb_store: CMDBStore):
        self.cmdb_store = cmdb_store
        self.active_jobs: Dict[str, CleanupJob] = {}
        self.cleanup_policies: List[CleanupPolicy] = []
        self._load_default_policies()
    
    def _load_default_policies(self):
        """Load default cleanup policies"""
        self.cleanup_policies = [
            CleanupPolicy(
                id="unused_volumes_aws",
                name="Unused EBS Volumes (AWS)",
                description="Clean up unattached EBS volumes older than 30 days",
                tenant_id="default",
                resource_type=CleanupResourceType.UNUSED_VOLUMES,
                cloud_provider=CloudProvider.AWS,
                age_threshold_days=30,
                size_threshold_gb=1.0,
                exclude_tags={"backup": "true", "protected": "true"},
                dry_run=True
            ),
            CleanupPolicy(
                id="old_snapshots_aws",
                name="Old EBS Snapshots (AWS)",
                description="Clean up EBS snapshots older than 90 days",
                tenant_id="default",
                resource_type=CleanupResourceType.OLD_SNAPSHOTS,
                cloud_provider=CloudProvider.AWS,
                age_threshold_days=90,
                exclude_tags={"backup": "true", "protected": "true"},
                dry_run=True
            ),
            CleanupPolicy(
                id="unattached_disks_azure",
                name="Unattached Managed Disks (Azure)",
                description="Clean up unattached managed disks older than 30 days",
                tenant_id="default",
                resource_type=CleanupResourceType.UNATTACHED_DISKS,
                cloud_provider=CloudProvider.AZURE,
                age_threshold_days=30,
                size_threshold_gb=1.0,
                exclude_tags={"backup": "true", "protected": "true"},
                dry_run=True
            ),
            CleanupPolicy(
                id="idle_instances_all",
                name="Idle Instances (All Clouds)",
                description="Clean up instances with no activity for 7 days",
                tenant_id="default",
                resource_type=CleanupResourceType.IDLE_INSTANCES,
                cloud_provider=CloudProvider.AWS,  # Will be applied to all
                age_threshold_days=7,
                exclude_tags={"always_on": "true", "protected": "true"},
                dry_run=True
            )
        ]
    
    async def scan_for_cleanup_candidates(
        self,
        tenant_id: str,
        policy_id: Optional[str] = None,
        cloud_provider: Optional[CloudProvider] = None
    ) -> List[CleanupCandidate]:
        """Scan for resources that match cleanup policies"""
        candidates = []
        
        # Get applicable policies
        policies = self._get_applicable_policies(tenant_id, policy_id, cloud_provider)
        
        for policy in policies:
            policy_candidates = await self._scan_policy_candidates(policy)
            candidates.extend(policy_candidates)
        
        return candidates
    
    def _get_applicable_policies(
        self,
        tenant_id: str,
        policy_id: Optional[str] = None,
        cloud_provider: Optional[CloudProvider] = None
    ) -> List[CleanupPolicy]:
        """Get policies that apply to the given criteria"""
        applicable = []
        
        for policy in self.cleanup_policies:
            if not policy.enabled:
                continue
            
            if policy.tenant_id != "default" and policy.tenant_id != tenant_id:
                continue
            
            if policy_id and policy.id != policy_id:
                continue
            
            if cloud_provider and policy.cloud_provider != cloud_provider:
                continue
            
            applicable.append(policy)
        
        return applicable
    
    async def _scan_policy_candidates(self, policy: CleanupPolicy) -> List[CleanupCandidate]:
        """Scan for candidates based on a specific policy"""
        candidates = []
        
        try:
            if policy.resource_type == CleanupResourceType.UNUSED_VOLUMES:
                candidates.extend(await self._scan_unused_volumes(policy))
            elif policy.resource_type == CleanupResourceType.OLD_SNAPSHOTS:
                candidates.extend(await self._scan_old_snapshots(policy))
            elif policy.resource_type == CleanupResourceType.UNATTACHED_DISKS:
                candidates.extend(await self._scan_unattached_disks(policy))
            elif policy.resource_type == CleanupResourceType.IDLE_INSTANCES:
                candidates.extend(await self._scan_idle_instances(policy))
            elif policy.resource_type == CleanupResourceType.UNUSED_LOAD_BALANCERS:
                candidates.extend(await self._scan_unused_load_balancers(policy))
            elif policy.resource_type == CleanupResourceType.EMPTY_STORAGE_BUCKETS:
                candidates.extend(await self._scan_empty_storage_buckets(policy))
            elif policy.resource_type == CleanupResourceType.EXPIRED_CERTIFICATES:
                candidates.extend(await self._scan_expired_certificates(policy))
            elif policy.resource_type == CleanupResourceType.UNUSED_SECURITY_GROUPS:
                candidates.extend(await self._scan_unused_security_groups(policy))
            elif policy.resource_type == CleanupResourceType.ORPHANED_IPS:
                candidates.extend(await self._scan_orphaned_ips(policy))
            elif policy.resource_type == CleanupResourceType.UNUSED_NETWORK_INTERFACES:
                candidates.extend(await self._scan_unused_network_interfaces(policy))
        
        except Exception as e:
            print(f"Error scanning policy {policy.id}: {e}")
        
        return candidates
    
    async def _scan_unused_volumes(self, policy: CleanupPolicy) -> List[CleanupCandidate]:
        """Scan for unused volumes"""
        candidates = []
        
        try:
            # Get all volume resources for the cloud provider
            resources = await self.cmdb_store.search_resources(
                search=ResourceSearch(
                    tenant_id=policy.tenant_id,
                    cloud_provider=policy.cloud_provider,
                    resource_type=ResourceType.EBS_VOLUME
                )
            )
            
            for resource in resources:
                # Check if volume is attached
                is_attached = resource.cloud_attributes.get("attached", False)
                if is_attached:
                    continue
                
                # Check age
                created_at = resource.created_at
                age_days = (datetime.utcnow() - created_at).days
                if age_days < policy.age_threshold_days:
                    continue
                
                # Check size
                size_gb = resource.cloud_attributes.get("size_gb", 0)
                if policy.size_threshold_gb and size_gb < policy.size_threshold_gb:
                    continue
                
                # Check tags
                if self._should_exclude_by_tags(resource.tags, policy):
                    continue
                
                # Check if protected
                if resource.id in policy.protected_resources:
                    continue
                
                candidate = CleanupCandidate(
                    resource_id=resource.id,
                    resource_name=resource.name,
                    resource_type=resource.resource_type,
                    cloud_provider=resource.cloud_provider,
                    tenant_id=resource.tenant_id,
                    cleanup_reasons=[
                        f"Unattached for {age_days} days",
                        f"Size: {size_gb} GB"
                    ],
                    age_days=age_days,
                    size_gb=size_gb,
                    monthly_cost=resource.monthly_cost,
                    owner=resource.owner,
                    team=resource.team,
                    project=resource.project,
                    tags=resource.tags,
                    is_protected=False,
                    has_dependencies=False
                )
                
                candidates.append(candidate)
        
        except Exception as e:
            print(f"Error scanning unused volumes: {e}")
        
        return candidates
    
    async def _scan_old_snapshots(self, policy: CleanupPolicy) -> List[CleanupCandidate]:
        """Scan for old snapshots"""
        candidates = []
        
        try:
            # Get all snapshot resources
            resources = await self.cmdb_store.search_resources(
                search=ResourceSearch(
                    tenant_id=policy.tenant_id,
                    cloud_provider=policy.cloud_provider,
                    resource_type=ResourceType.EBS_VOLUME  # Snapshots are typically volume resources
                )
            )
            
            for resource in resources:
                # Check if it's a snapshot
                if "snapshot" not in resource.name.lower() and "snap" not in resource.name.lower():
                    continue
                
                # Check age
                created_at = resource.created_at
                age_days = (datetime.utcnow() - created_at).days
                if age_days < policy.age_threshold_days:
                    continue
                
                # Check tags
                if self._should_exclude_by_tags(resource.tags, policy):
                    continue
                
                # Check if protected
                if resource.id in policy.protected_resources:
                    continue
                
                candidate = CleanupCandidate(
                    resource_id=resource.id,
                    resource_name=resource.name,
                    resource_type=resource.resource_type,
                    cloud_provider=resource.cloud_provider,
                    tenant_id=resource.tenant_id,
                    cleanup_reasons=[
                        f"Snapshot older than {age_days} days"
                    ],
                    age_days=age_days,
                    size_gb=resource.cloud_attributes.get("size_gb"),
                    monthly_cost=resource.monthly_cost,
                    owner=resource.owner,
                    team=resource.team,
                    project=resource.project,
                    tags=resource.tags,
                    is_protected=False,
                    has_dependencies=False
                )
                
                candidates.append(candidate)
        
        except Exception as e:
            print(f"Error scanning old snapshots: {e}")
        
        return candidates
    
    async def _scan_unattached_disks(self, policy: CleanupPolicy) -> List[CleanupCandidate]:
        """Scan for unattached managed disks (Azure)"""
        candidates = []
        
        try:
            # Get all managed disk resources
            resources = await self.cmdb_store.search_resources(
                search=ResourceSearch(
                    tenant_id=policy.tenant_id,
                    cloud_provider=policy.cloud_provider,
                    resource_type=ResourceType.MANAGED_DISK
                )
            )
            
            for resource in resources:
                # Check if disk is attached
                is_attached = resource.cloud_attributes.get("attached", False)
                if is_attached:
                    continue
                
                # Check age
                created_at = resource.created_at
                age_days = (datetime.utcnow() - created_at).days
                if age_days < policy.age_threshold_days:
                    continue
                
                # Check size
                size_gb = resource.cloud_attributes.get("size_gb", 0)
                if policy.size_threshold_gb and size_gb < policy.size_threshold_gb:
                    continue
                
                # Check tags
                if self._should_exclude_by_tags(resource.tags, policy):
                    continue
                
                # Check if protected
                if resource.id in policy.protected_resources:
                    continue
                
                candidate = CleanupCandidate(
                    resource_id=resource.id,
                    resource_name=resource.name,
                    resource_type=resource.resource_type,
                    cloud_provider=resource.cloud_provider,
                    tenant_id=resource.tenant_id,
                    cleanup_reasons=[
                        f"Unattached for {age_days} days",
                        f"Size: {size_gb} GB"
                    ],
                    age_days=age_days,
                    size_gb=size_gb,
                    monthly_cost=resource.monthly_cost,
                    owner=resource.owner,
                    team=resource.team,
                    project=resource.project,
                    tags=resource.tags,
                    is_protected=False,
                    has_dependencies=False
                )
                
                candidates.append(candidate)
        
        except Exception as e:
            print(f"Error scanning unattached disks: {e}")
        
        return candidates
    
    async def _scan_idle_instances(self, policy: CleanupPolicy) -> List[CleanupCandidate]:
        """Scan for idle instances"""
        candidates = []
        
        try:
            # Get all instance resources
            instance_types = [ResourceType.EC2_INSTANCE, ResourceType.VM, ResourceType.GCE_INSTANCE]
            
            for instance_type in instance_types:
                resources = await self.cmdb_store.search_resources(
                    search=ResourceSearch(
                        tenant_id=policy.tenant_id,
                        resource_type=instance_type
                    )
                )
                
                for resource in resources:
                    # Check if instance is running
                    if resource.status != "running":
                        continue
                    
                    # Check last activity
                    last_activity = resource.cloud_attributes.get("last_activity")
                    if last_activity:
                        last_activity_dt = datetime.fromisoformat(last_activity.replace('Z', '+00:00'))
                        idle_days = (datetime.utcnow() - last_activity_dt).days
                    else:
                        # Use creation time as fallback
                        idle_days = (datetime.utcnow() - resource.created_at).days
                    
                    if idle_days < policy.age_threshold_days:
                        continue
                    
                    # Check tags
                    if self._should_exclude_by_tags(resource.tags, policy):
                        continue
                    
                    # Check if protected
                    if resource.id in policy.protected_resources:
                        continue
                    
                    candidate = CleanupCandidate(
                        resource_id=resource.id,
                        resource_name=resource.name,
                        resource_type=resource.resource_type,
                        cloud_provider=resource.cloud_provider,
                        tenant_id=resource.tenant_id,
                        cleanup_reasons=[
                            f"Idle for {idle_days} days",
                            f"Status: {resource.status}"
                        ],
                        age_days=idle_days,
                        monthly_cost=resource.monthly_cost,
                        owner=resource.owner,
                        team=resource.team,
                        project=resource.project,
                        tags=resource.tags,
                        is_protected=False,
                        has_dependencies=False,
                        last_accessed=last_activity_dt if last_activity else None
                    )
                    
                    candidates.append(candidate)
        
        except Exception as e:
            print(f"Error scanning idle instances: {e}")
        
        return candidates
    
    def _should_exclude_by_tags(self, resource_tags: Dict[str, str], policy: CleanupPolicy) -> bool:
        """Check if resource should be excluded based on tags"""
        # Check exclude tags
        for key, value in policy.exclude_tags.items():
            if key in resource_tags and resource_tags[key] == value:
                return True
        
        # Check include tags (if specified, resource must have all)
        if policy.include_tags:
            for key, value in policy.include_tags.items():
                if key not in resource_tags or resource_tags[key] != value:
                    return True
        
        return False
    
    async def execute_cleanup_job(
        self,
        tenant_id: str,
        policy_id: str,
        candidates: List[CleanupCandidate],
        dry_run: bool = True
    ) -> CleanupJob:
        """Execute a cleanup job"""
        job_id = f"cleanup_{tenant_id}_{int(time.time())}"
        
        job = CleanupJob(
            id=job_id,
            tenant_id=tenant_id,
            policy_id=policy_id,
            total_candidates=len(candidates),
            status="in_progress",
            started_at=datetime.utcnow()
        )
        
        self.active_jobs[job_id] = job
        
        try:
            # Process candidates in batches
            policy = next((p for p in self.cleanup_policies if p.id == policy_id), None)
            if not policy:
                raise ValueError(f"Policy {policy_id} not found")
            
            batch_size = policy.batch_size
            delay = policy.delay_between_batches
            
            for i in range(0, len(candidates), batch_size):
                batch = candidates[i:i + batch_size]
                
                # Process batch
                batch_results = await self._process_cleanup_batch(batch, dry_run)
                
                # Update job statistics
                job.cleaned_up += batch_results["cleaned_up"]
                job.failed += batch_results["failed"]
                job.skipped += batch_results["skipped"]
                
                # Wait between batches
                if i + batch_size < len(candidates):
                    await asyncio.sleep(delay)
            
            job.status = "completed"
            job.completed_at = datetime.utcnow()
            
        except Exception as e:
            job.status = "failed"
            job.error_message = str(e)
            job.completed_at = datetime.utcnow()
        
        finally:
            if job_id in self.active_jobs:
                del self.active_jobs[job_id]
        
        return job
    
    async def _process_cleanup_batch(
        self,
        candidates: List[CleanupCandidate],
        dry_run: bool
    ) -> Dict[str, int]:
        """Process a batch of cleanup candidates"""
        results = {"cleaned_up": 0, "failed": 0, "skipped": 0}
        
        for candidate in candidates:
            try:
                if candidate.is_protected:
                    results["skipped"] += 1
                    continue
                
                if candidate.has_dependencies:
                    results["skipped"] += 1
                    continue
                
                if dry_run:
                    # Just mark as approved in dry run
                    candidate.cleanup_approved = True
                    candidate.cleanup_status = "approved (dry run)"
                    results["cleaned_up"] += 1
                else:
                    # Actually perform cleanup
                    if await self._cleanup_resource(candidate):
                        candidate.cleanup_status = "completed"
                        candidate.cleanup_completed = datetime.utcnow()
                        results["cleaned_up"] += 1
                    else:
                        candidate.cleanup_status = "failed"
                        results["failed"] += 1
                
            except Exception as e:
                candidate.cleanup_status = "failed"
                results["failed"] += 1
                print(f"Error processing candidate {candidate.resource_id}: {e}")
        
        return results
    
    async def _cleanup_resource(self, candidate: CleanupCandidate) -> bool:
        """Actually clean up a resource"""
        try:
            # Route to appropriate cleanup method based on resource type
            if candidate.resource_type == ResourceType.EBS_VOLUME:
                return await self._cleanup_ebs_volume(candidate)
            elif candidate.resource_type == ResourceType.MANAGED_DISK:
                return await self._cleanup_managed_disk(candidate)
            elif candidate.resource_type in [ResourceType.EC2_INSTANCE, ResourceType.VM, ResourceType.GCE_INSTANCE]:
                return await self._cleanup_instance(candidate)
            else:
                print(f"Unknown resource type for cleanup: {candidate.resource_type}")
                return False
                
        except Exception as e:
            print(f"Cleanup failed for {candidate.resource_id}: {e}")
            return False
    
    async def _cleanup_ebs_volume(self, candidate: CleanupCandidate) -> bool:
        """Clean up an EBS volume"""
        try:
            # Implementation would use AWS SDK to delete volume
            print(f"Deleting EBS volume {candidate.resource_id}")
            
            # Simulate deletion
            await asyncio.sleep(2)
            
            # Update CMDB
            await self.cmdb_store.cleanup_old_resources(
                candidate.tenant_id,
                days_old=0  # Delete immediately
            )
            
            return True
        except Exception as e:
            print(f"EBS volume cleanup failed: {e}")
            return False
    
    async def _cleanup_managed_disk(self, candidate: CleanupCandidate) -> bool:
        """Clean up a managed disk"""
        try:
            # Implementation would use Azure SDK to delete disk
            print(f"Deleting managed disk {candidate.resource_id}")
            
            # Simulate deletion
            await asyncio.sleep(2)
            
            # Update CMDB
            await self.cmdb_store.cleanup_old_resources(
                candidate.tenant_id,
                days_old=0  # Delete immediately
            )
            
            return True
        except Exception as e:
            print(f"Managed disk cleanup failed: {e}")
            return False
    
    async def _cleanup_instance(self, candidate: CleanupCandidate) -> bool:
        """Clean up an instance"""
        try:
            # Implementation would use cloud provider SDK to terminate instance
            print(f"Terminating instance {candidate.resource_id}")
            
            # Simulate termination
            await asyncio.sleep(5)
            
            # Update CMDB
            await self.cmdb_store.cleanup_old_resources(
                candidate.tenant_id,
                days_old=0  # Delete immediately
            )
            
            return True
        except Exception as e:
            print(f"Instance cleanup failed: {e}")
            return False
    
    async def get_cleanup_job_status(self, job_id: str) -> Optional[CleanupJob]:
        """Get status of a cleanup job"""
        return self.active_jobs.get(job_id)
    
    async def create_cleanup_policy(self, policy: CleanupPolicy) -> bool:
        """Create a new cleanup policy"""
        try:
            # Check if policy with same ID exists
            existing = next((p for p in self.cleanup_policies if p.id == policy.id), None)
            if existing:
                return False
            
            self.cleanup_policies.append(policy)
            return True
        except Exception as e:
            print(f"Error creating cleanup policy: {e}")
            return False
    
    async def update_cleanup_policy(self, policy_id: str, updates: Dict[str, Any]) -> bool:
        """Update an existing cleanup policy"""
        try:
            policy = next((p for p in self.cleanup_policies if p.id == policy_id), None)
            if not policy:
                return False
            
            # Update fields
            for key, value in updates.items():
                if hasattr(policy, key):
                    setattr(policy, key, value)
            
            policy.updated_at = datetime.utcnow()
            return True
        except Exception as e:
            print(f"Error updating cleanup policy: {e}")
            return False
    
    async def delete_cleanup_policy(self, policy_id: str) -> bool:
        """Delete a cleanup policy"""
        try:
            self.cleanup_policies = [p for p in self.cleanup_policies if p.id != policy_id]
            return True
        except Exception as e:
            print(f"Error deleting cleanup policy: {e}")
            return False
    
    async def get_cleanup_policies(self, tenant_id: str) -> List[CleanupPolicy]:
        """Get cleanup policies for a tenant"""
        return [p for p in self.cleanup_policies if p.tenant_id in ["default", tenant_id]]
    
    async def estimate_cleanup_savings(self, candidates: List[CleanupCandidate]) -> Dict[str, float]:
        """Estimate cost savings from cleanup"""
        total_monthly_cost = sum(c.monthly_cost or 0 for c in candidates)
        total_size_gb = sum(c.size_gb or 0 for c in candidates)
        
        return {
            "monthly_cost_savings": total_monthly_cost,
            "annual_cost_savings": total_monthly_cost * 12,
            "storage_savings_gb": total_size_gb,
            "estimated_cleanup_time_minutes": len(candidates) * 2  # 2 minutes per resource
        }
