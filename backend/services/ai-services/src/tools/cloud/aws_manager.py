from __future__ import annotations

from typing import List, Dict, Any, Optional
import boto3
from botocore.config import Config


class AWSManager:
    """AWS operations wrapper (inventory + basic lifecycle and networking)."""

    def __init__(self, access_key_id: str, secret_access_key: str, region: str) -> None:
        session = boto3.Session(
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
            region_name=region,
        )
        cfg = Config(retries={"max_attempts": 5, "mode": "standard"})
        self.ec2 = session.client("ec2", config=cfg)
        self.rds = session.client("rds", config=cfg)
        self.route53 = session.client("route53", config=cfg)
        self.cloudfront = session.client("cloudfront", config=cfg)
        self.wafv2 = session.client("wafv2", config=cfg)

    # Inventory
    def list_instances(self, states: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        filters = []
        if states:
            filters.append({"Name": "instance-state-name", "Values": states})
        resp = self.ec2.describe_instances(Filters=filters) if filters else self.ec2.describe_instances()
        out: List[Dict[str, Any]] = []
        for r in resp.get("Reservations", []):
            for i in r.get("Instances", []):
                out.append({
                    "instance_id": i["InstanceId"],
                    "type": i.get("InstanceType"),
                    "state": i.get("State", {}).get("Name"),
                    "az": i.get("Placement", {}).get("AvailabilityZone"),
                    "name": next((t["Value"] for t in i.get("Tags", []) if t["Key"] == "Name"), None),
                })
        return out

    # Lifecycle
    def start_instances(self, instance_ids: List[str]) -> Dict[str, Any]:
        return self.ec2.start_instances(InstanceIds=instance_ids)

    def stop_instances(self, instance_ids: List[str]) -> Dict[str, Any]:
        return self.ec2.stop_instances(InstanceIds=instance_ids)

    def reboot_instances(self, instance_ids: List[str]) -> Dict[str, Any]:
        return self.ec2.reboot_instances(InstanceIds=instance_ids)

    def resize_instance(self, instance_id: str, instance_type: str) -> Dict[str, Any]:
        return self.ec2.modify_instance_attribute(InstanceId=instance_id, InstanceType={"Value": instance_type})

    # Security groups
    def authorize_sg_ingress(self, sg_id: str, protocol: str, from_port: int, to_port: int, cidr: str) -> Dict[str, Any]:
        return self.ec2.authorize_security_group_ingress(
            GroupId=sg_id,
            IpPermissions=[
                {
                    "IpProtocol": protocol,
                    "FromPort": from_port,
                    "ToPort": to_port,
                    "IpRanges": [{"CidrIp": cidr}],
                }
            ],
        )

    def revoke_sg_ingress(self, sg_id: str, protocol: str, from_port: int, to_port: int, cidr: str) -> Dict[str, Any]:
        return self.ec2.revoke_security_group_ingress(
            GroupId=sg_id,
            IpPermissions=[
                {
                    "IpProtocol": protocol,
                    "FromPort": from_port,
                    "ToPort": to_port,
                    "IpRanges": [{"CidrIp": cidr}],
                }
            ],
        )

    # Snapshots
    def create_ebs_snapshot(self, volume_id: str, description: str = "") -> Dict[str, Any]:
        return self.ec2.create_snapshot(VolumeId=volume_id, Description=description)

    # DNS / CDN
    def route53_upsert_record(self, hosted_zone_id: str, name: str, rtype: str, value: str, ttl: int = 60) -> Dict[str, Any]:
        return self.route53.change_resource_record_sets(
            HostedZoneId=hosted_zone_id,
            ChangeBatch={
                "Changes": [
                    {
                        "Action": "UPSERT",
                        "ResourceRecordSet": {
                            "Name": name,
                            "Type": rtype,
                            "TTL": ttl,
                            "ResourceRecords": [{"Value": value}],
                        },
                    }
                ]
            },
        )

    def cloudfront_invalidate(self, distribution_id: str, paths: List[str]) -> Dict[str, Any]:
        caller_ref = "invalidate-" + "-".join(paths)[:120]
        return self.cloudfront.create_invalidation(
            DistributionId=distribution_id,
            InvalidationBatch={"Paths": {"Quantity": len(paths), "Items": paths}, "CallerReference": caller_ref},
        )

    # WAF (placeholder minimal)
    def list_waf_web_acls(self, scope: str = "CLOUDFRONT") -> Dict[str, Any]:
        return self.wafv2.list_web_acls(Scope=scope, Limit=25)

"""
AWS Cloud Manager - Real AWS API integration for resource management
Provides comprehensive AWS resource discovery, management, and monitoring
"""

import boto3
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json
from botocore.exceptions import ClientError, NoCredentialsError

class AWSManager:
    """
    Real AWS cloud resource manager with comprehensive capabilities
    """
    
    def __init__(self, aws_access_key: str, aws_secret_key: str, region: str = 'us-east-1'):
        """Initialize AWS clients with provided credentials"""
        self.region = region
        
        try:
            # Initialize AWS clients
            self.ec2 = boto3.client(
                'ec2',
                aws_access_key_id=aws_access_key,
                aws_secret_access_key=aws_secret_key,
                region_name=region
            )
            
            self.elbv2 = boto3.client(
                'elbv2',
                aws_access_key_id=aws_access_key,
                aws_secret_access_key=aws_secret_key,
                region_name=region
            )
            
            self.rds = boto3.client(
                'rds',
                aws_access_key_id=aws_access_key,
                aws_secret_access_key=aws_secret_key,
                region_name=region
            )
            
            self.s3 = boto3.client(
                's3',
                aws_access_key_id=aws_access_key,
                aws_secret_access_key=aws_secret_key,
                region_name=region
            )
            
            self.cloudwatch = boto3.client(
                'cloudwatch',
                aws_access_key_id=aws_access_key,
                aws_secret_access_key=aws_secret_key,
                region_name=region
            )
            
            self.cost_explorer = boto3.client(
                'ce',
                aws_access_key_id=aws_access_key,
                aws_secret_access_key=aws_secret_key,
                region_name=region
            )
            
            self.connected = True
            
        except (ClientError, NoCredentialsError) as e:
            self.connected = False
            raise Exception(f"Failed to connect to AWS: {str(e)}")
    
    async def list_all_resources(self) -> Dict[str, List[Dict[str, Any]]]:
        """Get comprehensive list of all AWS resources"""
        try:
            resources = {
                'ec2_instances': await self.list_ec2_instances(),
                'ebs_volumes': await self.list_ebs_volumes(),
                'load_balancers': await self.list_load_balancers(),
                'rds_instances': await self.list_rds_instances(),
                's3_buckets': await self.list_s3_buckets(),
                'security_groups': await self.list_security_groups(),
                'vpcs': await self.list_vpcs()
            }
            
            return resources
            
        except Exception as e:
            raise Exception(f"Failed to list AWS resources: {str(e)}")
    
    async def list_ec2_instances(self) -> List[Dict[str, Any]]:
        """List all EC2 instances with detailed information"""
        try:
            response = self.ec2.describe_instances()
            instances = []
            
            for reservation in response['Reservations']:
                for instance in reservation['Instances']:
                    instances.append({
                        'id': instance['InstanceId'],
                        'name': self._get_tag_value(instance.get('Tags', []), 'Name') or instance['InstanceId'],
                        'type': 'ec2',
                        'instance_type': instance['InstanceType'],
                        'state': instance['State']['Name'],
                        'launch_time': instance['LaunchTime'].isoformat() if 'LaunchTime' in instance else None,
                        'public_ip': instance.get('PublicIpAddress'),
                        'private_ip': instance.get('PrivateIpAddress'),
                        'vpc_id': instance.get('VpcId'),
                        'subnet_id': instance.get('SubnetId'),
                        'security_groups': [sg['GroupName'] for sg in instance.get('SecurityGroups', [])],
                        'tags': instance.get('Tags', []),
                        'region': self.region,
                        'cost_estimate': await self._get_instance_cost_estimate(instance['InstanceId'])
                    })
            
            return instances
            
        except ClientError as e:
            raise Exception(f"Failed to list EC2 instances: {str(e)}")
    
    async def manage_instance(self, instance_id: str, action: str) -> Dict[str, Any]:
        """Start, stop, restart, or terminate an EC2 instance"""
        try:
            if action == 'start':
                response = self.ec2.start_instances(InstanceIds=[instance_id])
            elif action == 'stop':
                response = self.ec2.stop_instances(InstanceIds=[instance_id])
            elif action == 'restart':
                response = self.ec2.reboot_instances(InstanceIds=[instance_id])
            elif action == 'terminate':
                response = self.ec2.terminate_instances(InstanceIds=[instance_id])
            else:
                raise Exception(f"Invalid action: {action}")
            
            return {
                'success': True,
                'action': action,
                'instance_id': instance_id,
                'response': response
            }
            
        except ClientError as e:
            return {
                'success': False,
                'error': str(e),
                'action': action,
                'instance_id': instance_id
            }
    
    async def provision_instance(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Provision a new EC2 instance"""
        try:
            response = self.ec2.run_instances(
                ImageId=config.get('ami_id', 'ami-0c02fb55956c7d316'),  # Amazon Linux 2
                MinCount=1,
                MaxCount=1,
                InstanceType=config.get('instance_type', 't3.micro'),
                KeyName=config.get('key_name'),
                SecurityGroupIds=config.get('security_groups', []),
                SubnetId=config.get('subnet_id'),
                TagSpecifications=[
                    {
                        'ResourceType': 'instance',
                        'Tags': [
                            {'Key': 'Name', 'Value': config.get('name', 'AI-Ops-Instance')},
                            {'Key': 'CreatedBy', 'Value': 'AI-Ops-Guardian'},
                            {'Key': 'Environment', 'Value': config.get('environment', 'production')}
                        ]
                    }
                ]
            )
            
            instance = response['Instances'][0]
            return {
                'success': True,
                'instance_id': instance['InstanceId'],
                'instance': instance
            }
            
        except ClientError as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    async def get_cost_analysis(self, days: int = 30) -> Dict[str, Any]:
        """Get detailed cost analysis for the account"""
        try:
            end_date = datetime.now().date()
            start_date = end_date - timedelta(days=days)
            
            # Get overall costs
            response = self.cost_explorer.get_cost_and_usage(
                TimePeriod={
                    'Start': start_date.strftime('%Y-%m-%d'),
                    'End': end_date.strftime('%Y-%m-%d')
                },
                Granularity='DAILY',
                Metrics=['BlendedCost'],
                GroupBy=[
                    {'Type': 'DIMENSION', 'Key': 'SERVICE'}
                ]
            )
            
            # Process cost data
            service_costs = {}
            total_cost = 0
            
            for result in response['ResultsByTime']:
                for group in result['Groups']:
                    service = group['Keys'][0]
                    cost = float(group['Metrics']['BlendedCost']['Amount'])
                    
                    if service not in service_costs:
                        service_costs[service] = 0
                    service_costs[service] += cost
                    total_cost += cost
            
            # Get cost optimization recommendations
            savings_response = self.cost_explorer.get_rightsizing_recommendation()
            potential_savings = 0
            
            for recommendation in savings_response.get('RightsizingRecommendations', []):
                savings = recommendation.get('EstimatedMonthlySavings', {}).get('Amount', '0')
                potential_savings += float(savings)
            
            return {
                'total_cost': total_cost,
                'service_breakdown': service_costs,
                'potential_monthly_savings': potential_savings,
                'period_days': days,
                'cost_per_day': total_cost / days if days > 0 else 0
            }
            
        except ClientError as e:
            raise Exception(f"Failed to get cost analysis: {str(e)}")
    
    async def get_security_findings(self) -> List[Dict[str, Any]]:
        """Analyze security configuration and return findings"""
        findings = []
        
        try:
            # Check for publicly accessible instances
            instances = await self.list_ec2_instances()
            for instance in instances:
                if instance.get('public_ip') and instance['state'] == 'running':
                    findings.append({
                        'type': 'security',
                        'severity': 'medium',
                        'resource': instance['id'],
                        'issue': 'Instance has public IP address',
                        'recommendation': 'Consider using NAT gateway or VPN for external access'
                    })
            
            # Check security groups for overly permissive rules
            security_groups = await self.list_security_groups()
            for sg in security_groups:
                for rule in sg.get('ingress_rules', []):
                    if rule.get('cidr') == '0.0.0.0/0' and rule.get('port') in [22, 3389]:
                        findings.append({
                            'type': 'security',
                            'severity': 'high',
                            'resource': sg['id'],
                            'issue': f"Security group allows SSH/RDP from anywhere",
                            'recommendation': 'Restrict access to specific IP ranges'
                        })
            
            return findings
            
        except Exception as e:
            return [{'type': 'error', 'message': f"Security analysis failed: {str(e)}"}]
    
    # Helper methods
    def _get_tag_value(self, tags: List[Dict], key: str) -> Optional[str]:
        """Get value for a specific tag key"""
        for tag in tags:
            if tag['Key'] == key:
                return tag['Value']
        return None
    
    async def _get_instance_cost_estimate(self, instance_id: str) -> float:
        """Estimate monthly cost for an instance"""
        # This would integrate with AWS Cost Explorer for real estimates
        # For now, return a placeholder
        return 50.0  # Placeholder monthly cost
    
    # Additional methods for other AWS services
    async def list_ebs_volumes(self) -> List[Dict[str, Any]]:
        """List EBS volumes"""
        try:
            response = self.ec2.describe_volumes()
            volumes = []
            
            for volume in response['Volumes']:
                volumes.append({
                    'id': volume['VolumeId'],
                    'name': self._get_tag_value(volume.get('Tags', []), 'Name') or volume['VolumeId'],
                    'type': 'ebs',
                    'size': volume['Size'],
                    'volume_type': volume['VolumeType'],
                    'state': volume['State'],
                    'encrypted': volume.get('Encrypted', False),
                    'attachments': volume.get('Attachments', []),
                    'region': self.region
                })
            
            return volumes
            
        except ClientError as e:
            raise Exception(f"Failed to list EBS volumes: {str(e)}")
    
    async def list_s3_buckets(self) -> List[Dict[str, Any]]:
        """List S3 buckets"""
        try:
            response = self.s3.list_buckets()
            buckets = []
            
            for bucket in response['Buckets']:
                buckets.append({
                    'id': bucket['Name'],
                    'name': bucket['Name'],
                    'type': 's3',
                    'creation_date': bucket['CreationDate'].isoformat(),
                    'region': await self._get_bucket_region(bucket['Name'])
                })
            
            return buckets
            
        except ClientError as e:
            raise Exception(f"Failed to list S3 buckets: {str(e)}")
    
    async def _get_bucket_region(self, bucket_name: str) -> str:
        """Get the region of an S3 bucket"""
        try:
            response = self.s3.get_bucket_location(Bucket=bucket_name)
            return response.get('LocationConstraint') or 'us-east-1'
        except:
            return 'unknown'
    
    async def list_load_balancers(self) -> List[Dict[str, Any]]:
        """List Application Load Balancers"""
        try:
            response = self.elbv2.describe_load_balancers()
            load_balancers = []
            
            for lb in response['LoadBalancers']:
                load_balancers.append({
                    'id': lb['LoadBalancerArn'],
                    'name': lb['LoadBalancerName'],
                    'type': 'alb',
                    'scheme': lb['Scheme'],
                    'state': lb['State']['Code'],
                    'dns_name': lb['DNSName'],
                    'vpc_id': lb['VpcId'],
                    'region': self.region
                })
            
            return load_balancers
            
        except ClientError as e:
            raise Exception(f"Failed to list load balancers: {str(e)}")
    
    async def list_rds_instances(self) -> List[Dict[str, Any]]:
        """List RDS database instances"""
        try:
            response = self.rds.describe_db_instances()
            databases = []
            
            for db in response['DBInstances']:
                databases.append({
                    'id': db['DBInstanceIdentifier'],
                    'name': db['DBInstanceIdentifier'],
                    'type': 'rds',
                    'engine': db['Engine'],
                    'engine_version': db['EngineVersion'],
                    'instance_class': db['DBInstanceClass'],
                    'status': db['DBInstanceStatus'],
                    'endpoint': db.get('Endpoint', {}).get('Address'),
                    'port': db.get('Endpoint', {}).get('Port'),
                    'storage': db.get('AllocatedStorage'),
                    'region': self.region
                })
            
            return databases
            
        except ClientError as e:
            raise Exception(f"Failed to list RDS instances: {str(e)}")
    
    async def list_security_groups(self) -> List[Dict[str, Any]]:
        """List security groups with rules"""
        try:
            response = self.ec2.describe_security_groups()
            security_groups = []
            
            for sg in response['SecurityGroups']:
                security_groups.append({
                    'id': sg['GroupId'],
                    'name': sg['GroupName'],
                    'type': 'security_group',
                    'description': sg['Description'],
                    'vpc_id': sg['VpcId'],
                    'ingress_rules': sg['IpPermissions'],
                    'egress_rules': sg['IpPermissionsEgress'],
                    'region': self.region
                })
            
            return security_groups
            
        except ClientError as e:
            raise Exception(f"Failed to list security groups: {str(e)}")
    
    async def list_vpcs(self) -> List[Dict[str, Any]]:
        """List VPCs"""
        try:
            response = self.ec2.describe_vpcs()
            vpcs = []
            
            for vpc in response['Vpcs']:
                vpcs.append({
                    'id': vpc['VpcId'],
                    'name': self._get_tag_value(vpc.get('Tags', []), 'Name') or vpc['VpcId'],
                    'type': 'vpc',
                    'cidr_block': vpc['CidrBlock'],
                    'state': vpc['State'],
                    'is_default': vpc['IsDefault'],
                    'region': self.region
                })
            
            return vpcs
            
        except ClientError as e:
            raise Exception(f"Failed to list VPCs: {str(e)}") 