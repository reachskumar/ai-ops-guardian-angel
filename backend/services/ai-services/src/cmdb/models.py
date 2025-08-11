from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from enum import Enum


class ResourceType(str, Enum):
    """Cloud resource types"""
    # Compute
    EC2_INSTANCE = "ec2_instance"
    VM = "vm"
    GCE_INSTANCE = "gce_instance"
    ASG = "asg"
    VMSS = "vmss"
    MIG = "mig"
    
    # Storage
    S3_BUCKET = "s3_bucket"
    BLOB_CONTAINER = "blob_container"
    GCS_BUCKET = "gcs_bucket"
    EBS_VOLUME = "ebs_volume"
    MANAGED_DISK = "managed_disk"
    PERSISTENT_DISK = "persistent_disk"
    
    # Database
    RDS_INSTANCE = "rds_instance"
    SQL_DATABASE = "sql_database"
    CLOUD_SQL = "cloud_sql"
    
    # Networking
    SECURITY_GROUP = "security_group"
    NSG = "nsg"
    FIREWALL = "firewall"
    VPC = "vpc"
    VNET = "vnet"
    SUBNET = "subnet"
    LOAD_BALANCER = "load_balancer"
    
    # Serverless
    LAMBDA_FUNCTION = "lambda_function"
    AZURE_FUNCTION = "azure_function"
    CLOUD_FUNCTION = "cloud_function"


class CloudProvider(str, Enum):
    """Cloud providers"""
    AWS = "aws"
    AZURE = "azure"
    GCP = "gcp"


class ResourceStatus(str, Enum):
    """Resource status"""
    RUNNING = "running"
    STOPPED = "stopped"
    TERMINATED = "terminated"
    CREATING = "creating"
    DELETING = "deleting"
    ERROR = "error"
    UNKNOWN = "unknown"


class Resource(BaseModel):
    """Core resource model"""
    id: str = Field(..., description="Unique resource identifier")
    name: str = Field(..., description="Resource name")
    resource_type: ResourceType = Field(..., description="Type of resource")
    cloud_provider: CloudProvider = Field(..., description="Cloud provider")
    region: str = Field(..., description="Cloud region")
    account_id: str = Field(..., description="Cloud account/subscription ID")
    tenant_id: str = Field(..., description="Tenant identifier")
    
    # Status and metadata
    status: ResourceStatus = Field(..., description="Current status")
    created_at: datetime = Field(..., description="Creation timestamp")
    last_updated: datetime = Field(..., description="Last update timestamp")
    
    # Ownership and cost
    owner: Optional[str] = Field(None, description="Resource owner")
    team: Optional[str] = Field(None, description="Team/department")
    cost_center: Optional[str] = Field(None, description="Cost center")
    project: Optional[str] = Field(None, description="Project name")
    
    # Tags and labels
    tags: Dict[str, str] = Field(default_factory=dict, description="Resource tags")
    labels: Dict[str, str] = Field(default_factory=dict, description="Resource labels")
    
    # Cloud-specific attributes
    cloud_attributes: Dict[str, Any] = Field(default_factory=dict, description="Provider-specific attributes")
    
    # Relationships
    parent_id: Optional[str] = Field(None, description="Parent resource ID")
    children: List[str] = Field(default_factory=list, description="Child resource IDs")
    
    # Security and compliance
    public_exposure: bool = Field(False, description="Is publicly accessible")
    compliance_status: Optional[str] = Field(None, description="Compliance status")
    security_score: Optional[float] = Field(None, description="Security score (0-100)")
    
    # Cost tracking
    monthly_cost: Optional[float] = Field(None, description="Monthly cost estimate")
    cost_trend: Optional[str] = Field(None, description="Cost trend direction")


class ResourceRelationship(BaseModel):
    """Resource relationship model"""
    source_id: str = Field(..., description="Source resource ID")
    target_id: str = Field(..., description="Target resource ID")
    relationship_type: str = Field(..., description="Type of relationship")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Relationship metadata")


class ResourceSearch(BaseModel):
    """Resource search criteria"""
    tenant_id: Optional[str] = Field(None, description="Tenant filter")
    cloud_provider: Optional[CloudProvider] = Field(None, description="Cloud provider filter")
    resource_type: Optional[ResourceType] = Field(None, description="Resource type filter")
    region: Optional[str] = Field(None, description="Region filter")
    account_id: Optional[str] = Field(None, description="Account filter")
    owner: Optional[str] = Field(None, description="Owner filter")
    team: Optional[str] = Field(None, description="Team filter")
    project: Optional[str] = Field(None, description="Project filter")
    tags: Optional[Dict[str, str]] = Field(None, description="Tag filters")
    public_exposure: Optional[bool] = Field(None, description="Public exposure filter")
    compliance_status: Optional[str] = Field(None, description="Compliance filter")
    cost_min: Optional[float] = Field(None, description="Minimum cost filter")
    cost_max: Optional[float] = Field(None, description="Maximum cost filter")


class ResourceGraph(BaseModel):
    """Resource graph representation"""
    nodes: List[Resource] = Field(..., description="Graph nodes (resources)")
    edges: List[ResourceRelationship] = Field(..., description="Graph edges (relationships)")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Graph metadata")


class CMDBStats(BaseModel):
    """CMDB statistics"""
    total_resources: int = Field(..., description="Total resource count")
    resources_by_provider: Dict[CloudProvider, int] = Field(..., description="Resources per provider")
    resources_by_type: Dict[ResourceType, int] = Field(..., description="Resources per type")
    resources_by_tenant: Dict[str, int] = Field(..., description="Resources per tenant")
    public_resources: int = Field(..., description="Publicly exposed resources")
    compliance_issues: int = Field(..., description="Resources with compliance issues")
    total_monthly_cost: float = Field(..., description="Total monthly cost")
    untagged_resources: int = Field(..., description="Resources without proper tags")
