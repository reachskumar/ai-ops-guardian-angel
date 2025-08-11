import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING
from pymongo.errors import DuplicateKeyError

from .models import (
    Resource, ResourceRelationship, ResourceSearch, ResourceGraph, 
    CMDBStats, ResourceType, CloudProvider, ResourceStatus
)


class CMDBStore:
    """CMDB data store using MongoDB"""
    
    def __init__(self, mongo_uri: str, database: str = "ai_ops_cmdb"):
        self.client = AsyncIOMotorClient(mongo_uri)
        self.db = self.client[database]
        self.resources = self.db.resources
        self.relationships = self.db.relationships
        self.discovery_logs = self.db.discovery_logs
        
        # Create indexes for performance
        self._create_indexes()
    
    def _create_indexes(self):
        """Create database indexes for optimal query performance"""
        # Resource indexes
        self.resources.create_index([("tenant_id", ASCENDING)])
        self.resources.create_index([("cloud_provider", ASCENDING)])
        self.resources.create_index([("resource_type", ASCENDING)])
        self.resources.create_index([("region", ASCENDING)])
        self.resources.create_index([("account_id", ASCENDING)])
        self.resources.create_index([("owner", ASCENDING)])
        self.resources.create_index([("team", ASCENDING)])
        self.resources.create_index([("project", ASCENDING)])
        self.resources.create_index([("public_exposure", ASCENDING)])
        self.resources.create_index([("compliance_status", ASCENDING)])
        self.resources.create_index([("tags", ASCENDING)])
        self.resources.create_index([("last_updated", DESCENDING)])
        
        # Relationship indexes
        self.relationships.create_index([("source_id", ASCENDING)])
        self.relationships.create_index([("target_id", ASCENDING)])
        self.relationships.create_index([("relationship_type", ASCENDING)])
        
        # Discovery log indexes
        self.discovery_logs.create_index([("tenant_id", ASCENDING)])
        self.discovery_logs.create_index([("cloud_provider", ASCENDING)])
        self.discovery_logs.create_index([("timestamp", DESCENDING)])
    
    async def upsert_resource(self, resource: Resource) -> bool:
        """Insert or update a resource"""
        try:
            resource_dict = resource.dict()
            resource_dict["last_updated"] = datetime.utcnow()
            
            result = await self.resources.replace_one(
                {"id": resource.id},
                resource_dict,
                upsert=True
            )
            return True
        except Exception as e:
            print(f"Error upserting resource {resource.id}: {e}")
            return False
    
    async def get_resource(self, resource_id: str) -> Optional[Resource]:
        """Get a resource by ID"""
        try:
            doc = await self.resources.find_one({"id": resource_id})
            if doc:
                return Resource(**doc)
            return None
        except Exception as e:
            print(f"Error getting resource {resource_id}: {e}")
            return None
    
    async def search_resources(self, search: ResourceSearch, limit: int = 100) -> List[Resource]:
        """Search resources based on criteria"""
        try:
            # Build query filter
            filter_query = {}
            
            if search.tenant_id:
                filter_query["tenant_id"] = search.tenant_id
            if search.cloud_provider:
                filter_query["cloud_provider"] = search.cloud_provider
            if search.resource_type:
                filter_query["resource_type"] = search.resource_type
            if search.region:
                filter_query["region"] = search.region
            if search.account_id:
                filter_query["account_id"] = search.account_id
            if search.owner:
                filter_query["owner"] = search.owner
            if search.team:
                filter_query["team"] = search.team
            if search.project:
                filter_query["project"] = search.project
            if search.public_exposure is not None:
                filter_query["public_exposure"] = search.public_exposure
            if search.compliance_status:
                filter_query["compliance_status"] = search.compliance_status
            if search.tags:
                for key, value in search.tags.items():
                    filter_query[f"tags.{key}"] = value
            
            # Cost range filter
            if search.cost_min is not None or search.cost_max is not None:
                cost_filter = {}
                if search.cost_min is not None:
                    cost_filter["$gte"] = search.cost_min
                if search.cost_max is not None:
                    cost_filter["$lte"] = search.cost_max
                filter_query["monthly_cost"] = cost_filter
            
            cursor = self.resources.find(filter_query).limit(limit)
            resources = []
            async for doc in cursor:
                resources.append(Resource(**doc))
            
            return resources
        except Exception as e:
            print(f"Error searching resources: {e}")
            return []
    
    async def get_resources_by_tenant(self, tenant_id: str, limit: int = 1000) -> List[Resource]:
        """Get all resources for a tenant"""
        return await self.search_resources(
            ResourceSearch(tenant_id=tenant_id), 
            limit=limit
        )
    
    async def get_public_resources(self, tenant_id: Optional[str] = None) -> List[Resource]:
        """Get all publicly exposed resources"""
        search = ResourceSearch(public_exposure=True)
        if tenant_id:
            search.tenant_id = tenant_id
        return await self.search_resources(search)
    
    async def get_untagged_resources(self, tenant_id: Optional[str] = None) -> List[Resource]:
        """Get resources without proper tags"""
        try:
            filter_query = {
                "$or": [
                    {"tags": {}},
                    {"tags": None},
                    {"owner": {"$exists": False}},
                    {"owner": None},
                    {"team": {"$exists": False}},
                    {"team": None},
                    {"project": {"$exists": False}},
                    {"project": None}
                ]
            }
            
            if tenant_id:
                filter_query["tenant_id"] = tenant_id
            
            cursor = self.resources.find(filter_query)
            resources = []
            async for doc in cursor:
                resources.append(Resource(**doc))
            
            return resources
        except Exception as e:
            print(f"Error getting untagged resources: {e}")
            return []
    
    async def upsert_relationship(self, relationship: ResourceRelationship) -> bool:
        """Insert or update a resource relationship"""
        try:
            relationship_dict = relationship.dict()
            result = await self.relationships.replace_one(
                {
                    "source_id": relationship.source_id,
                    "target_id": relationship.target_id,
                    "relationship_type": relationship.relationship_type
                },
                relationship_dict,
                upsert=True
            )
            return True
        except Exception as e:
            print(f"Error upserting relationship: {e}")
            return False
    
    async def get_resource_relationships(self, resource_id: str) -> List[ResourceRelationship]:
        """Get all relationships for a resource"""
        try:
            cursor = self.relationships.find({
                "$or": [
                    {"source_id": resource_id},
                    {"target_id": resource_id}
                ]
            })
            
            relationships = []
            async for doc in cursor:
                relationships.append(ResourceRelationship(**doc))
            
            return relationships
        except Exception as e:
            print(f"Error getting relationships for {resource_id}: {e}")
            return []
    
    async def build_resource_graph(self, tenant_id: str, max_depth: int = 3) -> ResourceGraph:
        """Build a resource graph for a tenant"""
        try:
            # Get all resources for the tenant
            resources = await self.get_resources_by_tenant(tenant_id)
            resource_map = {r.id: r for r in resources}
            
            # Get all relationships
            all_relationships = []
            for resource in resources:
                relationships = await self.get_resource_relationships(resource.id)
                all_relationships.extend(relationships)
            
            # Filter relationships to only include resources in our tenant
            filtered_relationships = [
                rel for rel in all_relationships
                if rel.source_id in resource_map and rel.target_id in resource_map
            ]
            
            return ResourceGraph(
                nodes=resources,
                edges=filtered_relationships,
                metadata={
                    "tenant_id": tenant_id,
                    "max_depth": max_depth,
                    "total_nodes": len(resources),
                    "total_edges": len(filtered_relationships),
                    "generated_at": datetime.utcnow().isoformat()
                }
            )
        except Exception as e:
            print(f"Error building resource graph: {e}")
            return ResourceGraph(nodes=[], edges=[], metadata={})
    
    async def get_cmdb_stats(self, tenant_id: Optional[str] = None) -> CMDBStats:
        """Get CMDB statistics"""
        try:
            # Build aggregation pipeline
            match_stage = {}
            if tenant_id:
                match_stage["tenant_id"] = tenant_id
            
            pipeline = [
                {"$match": match_stage} if match_stage else {"$match": {}},
                {
                    "$group": {
                        "_id": None,
                        "total_resources": {"$sum": 1},
                        "resources_by_provider": {
                            "$push": "$cloud_provider"
                        },
                        "resources_by_type": {
                            "$push": "$resource_type"
                        },
                        "resources_by_tenant": {
                            "$push": "$tenant_id"
                        },
                        "public_resources": {
                            "$sum": {"$cond": ["$public_exposure", 1, 0]}
                        },
                        "compliance_issues": {
                            "$sum": {
                                "$cond": [
                                    {"$ne": ["$compliance_status", "compliant"]},
                                    1,
                                    0
                                ]
                            }
                        },
                        "total_monthly_cost": {
                            "$sum": {"$ifNull": ["$monthly_cost", 0]}
                        },
                        "untagged_resources": {
                            "$sum": {
                                "$cond": [
                                    {
                                        "$or": [
                                            {"$eq": ["$tags", {}]},
                                            {"$eq": ["$tags", None]},
                                            {"$eq": ["$owner", None]},
                                            {"$eq": ["$team", None]},
                                            {"$eq": ["$project", None]}
                                        ]
                                    },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                }
            ]
            
            result = await self.resources.aggregate(pipeline).to_list(1)
            
            if result:
                stats = result[0]
                return CMDBStats(
                    total_resources=stats["total_resources"],
                    resources_by_provider=self._count_values(stats["resources_by_provider"]),
                    resources_by_type=self._count_values(stats["resources_by_type"]),
                    resources_by_tenant=self._count_values(stats["resources_by_tenant"]),
                    public_resources=stats["public_resources"],
                    compliance_issues=stats["compliance_issues"],
                    total_monthly_cost=stats["total_monthly_cost"],
                    untagged_resources=stats["untagged_resources"]
                )
            
            return CMDBStats(
                total_resources=0,
                resources_by_provider={},
                resources_by_type={},
                resources_by_tenant={},
                public_resources=0,
                compliance_issues=0,
                total_monthly_cost=0.0,
                untagged_resources=0
            )
            
        except Exception as e:
            print(f"Error getting CMDB stats: {e}")
            return CMDBStats(
                total_resources=0,
                resources_by_provider={},
                resources_by_type={},
                resources_by_tenant={},
                public_resources=0,
                compliance_issues=0,
                total_monthly_cost=0.0,
                untagged_resources=0
            )
    
    def _count_values(self, values: List[str]) -> Dict[str, int]:
        """Count occurrences of values in a list"""
        counts = {}
        for value in values:
            counts[value] = counts.get(value, 0) + 1
        return counts
    
    async def log_discovery(self, tenant_id: str, cloud_provider: CloudProvider, 
                           status: str, details: Dict[str, Any]) -> bool:
        """Log discovery operation"""
        try:
            log_entry = {
                "tenant_id": tenant_id,
                "cloud_provider": cloud_provider,
                "status": status,
                "details": details,
                "timestamp": datetime.utcnow()
            }
            
            await self.discovery_logs.insert_one(log_entry)
            return True
        except Exception as e:
            print(f"Error logging discovery: {e}")
            return False
    
    async def cleanup_old_resources(self, tenant_id: str, days_old: int = 30) -> int:
        """Clean up resources not updated in specified days"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days_old)
            
            result = await self.resources.delete_many({
                "tenant_id": tenant_id,
                "last_updated": {"$lt": cutoff_date}
            })
            
            return result.deleted_count
        except Exception as e:
            print(f"Error cleaning up old resources: {e}")
            return 0
    
    async def close(self):
        """Close database connection"""
        self.client.close()
