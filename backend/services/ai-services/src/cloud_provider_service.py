import boto3
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import os

# Azure imports
try:
    from azure.identity import ClientSecretCredential
    from azure.mgmt.compute import ComputeManagementClient
    from azure.mgmt.resource import ResourceManagementClient
    from azure.mgmt.storage import StorageManagementClient
    AZURE_AVAILABLE = True
except ImportError:
    AZURE_AVAILABLE = False

# GCP imports
try:
    from google.cloud import compute_v1
    from google.cloud import storage
    from google.oauth2 import service_account
    GCP_AVAILABLE = True
except ImportError:
    GCP_AVAILABLE = False

logger = logging.getLogger(__name__)

class CloudProviderService:
    """Service for managing real cloud provider connections"""
    
    def __init__(self):
        self.connections = {}
    
    def validate_aws_credentials(self, access_key_id: str, secret_access_key: str, region: str = 'us-east-1') -> Dict[str, Any]:
        """Validate AWS credentials and return account info"""
        try:
            # Create AWS session
            session = boto3.Session(
                aws_access_key_id=access_key_id,
                aws_secret_access_key=secret_access_key,
                region_name=region
            )
            
            # Test with STS to get account info
            sts_client = session.client('sts')
            identity = sts_client.get_caller_identity()
            
            # Test with EC2 to verify permissions
            ec2_client = session.client('ec2')
            ec2_client.describe_regions()
            
            return {
                "valid": True,
                "account_id": identity['Account'],
                "user_arn": identity['Arn'],
                "user_id": identity['UserId'],
                "regions": self._get_aws_regions(session),
                "services": self._get_aws_services()
            }
        except Exception as e:
            logger.error(f"AWS credential validation failed: {str(e)}")
            return {
                "valid": False,
                "error": str(e)
            }
    
    def validate_azure_credentials(self, subscription_id: str, client_id: str, client_secret: str, tenant_id: str) -> Dict[str, Any]:
        """Validate Azure credentials and return subscription info"""
        if not AZURE_AVAILABLE:
            return {
                "valid": False,
                "error": "Azure SDK not available. Install with: pip install azure-mgmt-compute azure-identity"
            }
        
        try:
            # Create credential
            credential = ClientSecretCredential(
                tenant_id=tenant_id,
                client_id=client_id,
                client_secret=client_secret
            )
            
            # Test with Resource Management
            resource_client = ResourceManagementClient(credential, subscription_id)
            subscription = resource_client.subscriptions.get(subscription_id)
            
            # Test with Compute Management
            compute_client = ComputeManagementClient(credential, subscription_id)
            locations = compute_client.resource_skus.list()
            
            return {
                "valid": True,
                "subscription_id": subscription_id,
                "subscription_name": subscription.display_name,
                "tenant_id": tenant_id,
                "regions": self._get_azure_regions(),
                "services": self._get_azure_services()
            }
        except Exception as e:
            logger.error(f"Azure credential validation failed: {str(e)}")
            return {
                "valid": False,
                "error": str(e)
            }
    
    def validate_gcp_credentials(self, service_account_key: str) -> Dict[str, Any]:
        """Validate GCP credentials and return project info"""
        if not GCP_AVAILABLE:
            return {
                "valid": False,
                "error": "GCP SDK not available. Install with: pip install google-cloud-compute google-cloud-storage"
            }
        
        try:
            # Parse service account key
            if isinstance(service_account_key, str):
                key_data = json.loads(service_account_key)
            else:
                key_data = service_account_key
            
            # Create credentials
            credentials = service_account.Credentials.from_service_account_info(key_data)
            
            # Test with Compute Engine
            compute_client = compute_v1.InstancesClient(credentials=credentials)
            project_id = key_data.get('project_id')
            
            # List instances to test permissions
            request = compute_v1.ListInstancesRequest(project=project_id, zone="us-central1-a")
            instances = compute_client.list(request=request)
            
            return {
                "valid": True,
                "project_id": project_id,
                "project_name": key_data.get('project_id', 'Unknown'),
                "client_email": key_data.get('client_email'),
                "regions": self._get_gcp_regions(),
                "services": self._get_gcp_services()
            }
        except Exception as e:
            logger.error(f"GCP credential validation failed: {str(e)}")
            return {
                "valid": False,
                "error": str(e)
            }
    
    def connect_aws_provider(self, access_key_id: str, secret_access_key: str, region: str = 'us-east-1', account_name: str = None) -> Dict[str, Any]:
        """Connect to AWS and store session"""
        validation = self.validate_aws_credentials(access_key_id, secret_access_key, region)
        
        if not validation["valid"]:
            return {
                "success": False,
                "error": validation["error"]
            }
        
        try:
            # Create session
            session = boto3.Session(
                aws_access_key_id=access_key_id,
                aws_secret_access_key=secret_access_key,
                region_name=region
            )
            
            # Store connection
            connection_id = f"aws_{validation['account_id']}_{account_name or 'default'}"
            self.connections[connection_id] = {
                "provider": "aws",
                "session": session,
                "account_id": validation["account_id"],
                "account_name": account_name or "default",
                "region": region,
                "connected_at": datetime.utcnow(),
                "regions": validation["regions"],
                "services": validation["services"]
            }
            
            return {
                "success": True,
                "connection_id": connection_id,
                "account_id": validation["account_id"],
                "message": f"Successfully connected to AWS account {validation['account_id']}"
            }
        except Exception as e:
            logger.error(f"AWS connection failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def connect_azure_provider(self, subscription_id: str, client_id: str, client_secret: str, tenant_id: str, account_name: str = None) -> Dict[str, Any]:
        """Connect to Azure and store credentials"""
        validation = self.validate_azure_credentials(subscription_id, client_id, client_secret, tenant_id)
        
        if not validation["valid"]:
            return {
                "success": False,
                "error": validation["error"]
            }
        
        try:
            # Create credential
            credential = ClientSecretCredential(
                tenant_id=tenant_id,
                client_id=client_id,
                client_secret=client_secret
            )
            
            # Store connection
            connection_id = f"azure_{subscription_id}_{account_name or 'default'}"
            self.connections[connection_id] = {
                "provider": "azure",
                "credential": credential,
                "subscription_id": subscription_id,
                "account_name": account_name or "default",
                "tenant_id": tenant_id,
                "connected_at": datetime.utcnow(),
                "regions": validation["regions"],
                "services": validation["services"]
            }
            
            return {
                "success": True,
                "connection_id": connection_id,
                "subscription_id": subscription_id,
                "message": f"Successfully connected to Azure subscription {subscription_id}"
            }
        except Exception as e:
            logger.error(f"Azure connection failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def connect_gcp_provider(self, service_account_key: str, account_name: str = None) -> Dict[str, Any]:
        """Connect to GCP and store credentials"""
        validation = self.validate_gcp_credentials(service_account_key)
        
        if not validation["valid"]:
            return {
                "success": False,
                "error": validation["error"]
            }
        
        try:
            # Parse service account key
            if isinstance(service_account_key, str):
                key_data = json.loads(service_account_key)
            else:
                key_data = service_account_key
            
            # Create credentials
            credentials = service_account.Credentials.from_service_account_info(key_data)
            
            # Store connection
            project_id = key_data.get('project_id')
            connection_id = f"gcp_{project_id}_{account_name or 'default'}"
            self.connections[connection_id] = {
                "provider": "gcp",
                "credentials": credentials,
                "project_id": project_id,
                "account_name": account_name or "default",
                "connected_at": datetime.utcnow(),
                "regions": validation["regions"],
                "services": validation["services"]
            }
            
            return {
                "success": True,
                "connection_id": connection_id,
                "project_id": project_id,
                "message": f"Successfully connected to GCP project {project_id}"
            }
        except Exception as e:
            logger.error(f"GCP connection failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_aws_resources(self, connection_id: str) -> List[Dict[str, Any]]:
        """Get real AWS resources"""
        if connection_id not in self.connections:
            return []
        
        connection = self.connections[connection_id]
        session = connection["session"]
        resources = []
        
        try:
            # Get EC2 instances
            ec2_client = session.client('ec2')
            instances = ec2_client.describe_instances()
            
            for reservation in instances['Reservations']:
                for instance in reservation['Instances']:
                    resources.append({
                        "id": instance['InstanceId'],
                        "name": instance.get('Tags', [{}])[0].get('Value', instance['InstanceId']),
                        "type": "EC2",
                        "provider": "AWS",
                        "region": instance['Placement']['AvailabilityZone'],
                        "status": instance['State']['Name'],
                        "cost": 0,  # Would need Cost Explorer API for real costs
                        "tags": [tag['Value'] for tag in instance.get('Tags', []) if tag.get('Key') != 'Name']
                    })
            
            # Get RDS instances
            rds_client = session.client('rds')
            db_instances = rds_client.describe_db_instances()
            
            for db in db_instances['DBInstances']:
                resources.append({
                    "id": db['DBInstanceIdentifier'],
                    "name": db['DBInstanceIdentifier'],
                    "type": "RDS",
                    "provider": "AWS",
                    "region": db['AvailabilityZone'],
                    "status": db['DBInstanceStatus'],
                    "cost": 0,
                    "tags": []
                })
            
            # Get S3 buckets
            s3_client = session.client('s3')
            buckets = s3_client.list_buckets()
            
            for bucket in buckets['Buckets']:
                resources.append({
                    "id": bucket['Name'],
                    "name": bucket['Name'],
                    "type": "S3",
                    "provider": "AWS",
                    "region": "us-east-1",  # S3 is global
                    "status": "active",
                    "cost": 0,
                    "tags": []
                })
                
        except Exception as e:
            logger.error(f"Failed to get AWS resources: {str(e)}")
        
        return resources
    
    def get_azure_resources(self, connection_id: str) -> List[Dict[str, Any]]:
        """Get real Azure resources"""
        if connection_id not in self.connections:
            return []
        
        connection = self.connections[connection_id]
        credential = connection["credential"]
        subscription_id = connection["subscription_id"]
        resources = []
        
        try:
            # Get Virtual Machines
            compute_client = ComputeManagementClient(credential, subscription_id)
            vms = compute_client.virtual_machines.list_all()
            
            for vm in vms:
                resources.append({
                    "id": vm.id,
                    "name": vm.name,
                    "type": "Virtual Machine",
                    "provider": "Azure",
                    "region": vm.location,
                    "status": vm.instance_view.statuses[-1].display_status if vm.instance_view else "unknown",
                    "cost": 0,
                    "tags": list(vm.tags.keys()) if vm.tags else []
                })
            
            # Get Storage Accounts
            storage_client = StorageManagementClient(credential, subscription_id)
            storage_accounts = storage_client.storage_accounts.list()
            
            for account in storage_accounts:
                resources.append({
                    "id": account.id,
                    "name": account.name,
                    "type": "Storage Account",
                    "provider": "Azure",
                    "region": account.location,
                    "status": account.status_of_primary,
                    "cost": 0,
                    "tags": list(account.tags.keys()) if account.tags else []
                })
                
        except Exception as e:
            logger.error(f"Failed to get Azure resources: {str(e)}")
        
        return resources
    
    def get_gcp_resources(self, connection_id: str) -> List[Dict[str, Any]]:
        """Get real GCP resources"""
        if connection_id not in self.connections:
            return []
        
        connection = self.connections[connection_id]
        credentials = connection["credentials"]
        project_id = connection["project_id"]
        resources = []
        
        try:
            # Get Compute Engine instances
            compute_client = compute_v1.InstancesClient(credentials=credentials)
            
            # List instances in different zones
            zones = ["us-central1-a", "us-east1-b", "us-west1-a"]
            
            for zone in zones:
                try:
                    request = compute_v1.ListInstancesRequest(project=project_id, zone=zone)
                    instances = compute_client.list(request=request)
                    
                    for instance in instances:
                        resources.append({
                            "id": instance.id,
                            "name": instance.name,
                            "type": "Compute Engine",
                            "provider": "GCP",
                            "region": zone,
                            "status": instance.status,
                            "cost": 0,
                            "tags": list(instance.labels.keys()) if instance.labels else []
                        })
                except Exception as e:
                    logger.warning(f"Failed to get instances in zone {zone}: {str(e)}")
                    continue
                    
        except Exception as e:
            logger.error(f"Failed to get GCP resources: {str(e)}")
        
        return resources
    
    def _get_aws_regions(self, session) -> List[str]:
        """Get available AWS regions"""
        try:
            ec2_client = session.client('ec2')
            regions = ec2_client.describe_regions()
            return [region['RegionName'] for region in regions['Regions']]
        except:
            return ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"]
    
    def _get_aws_services(self) -> List[str]:
        """Get available AWS services"""
        return ["EC2", "S3", "RDS", "Lambda", "ECS", "EKS", "VPC", "ELB", "CloudWatch"]
    
    def _get_azure_regions(self) -> List[str]:
        """Get available Azure regions"""
        return ["eastus", "westus", "centralus", "northeurope", "westeurope", "southeastasia"]
    
    def _get_azure_services(self) -> List[str]:
        """Get available Azure services"""
        return ["Virtual Machines", "Storage Accounts", "App Service", "SQL Database", "Functions", "AKS"]
    
    def _get_gcp_regions(self) -> List[str]:
        """Get available GCP regions"""
        return ["us-central1", "us-east1", "us-west1", "europe-west1", "asia-southeast1"]
    
    def _get_gcp_services(self) -> List[str]:
        """Get available GCP services"""
        return ["Compute Engine", "Cloud Storage", "Cloud SQL", "Cloud Functions", "GKE", "App Engine"]

# Global instance
cloud_provider_service = CloudProviderService() 