
import { CloudResource } from '../../../cloud/types';

// Get AWS resource types grouped by category
export const getAwsResourceTypes = (): { category: string; types: string[] }[] => {
  return [
    {
      category: 'compute',
      types: ['EC2 Instance', 'Lambda Function', 'ECS Container', 'Elastic Beanstalk']
    },
    {
      category: 'storage',
      types: ['S3 Bucket', 'EBS Volume', 'EFS File System', 'Storage Gateway']
    },
    {
      category: 'database',
      types: ['RDS Instance', 'DynamoDB Table', 'ElastiCache Cluster', 'Redshift Cluster']
    },
    {
      category: 'network',
      types: ['VPC', 'Subnet', 'Security Group', 'Load Balancer', 'API Gateway']
    }
  ];
};

// Get AWS instance sizes for a resource type
export const getAwsInstanceSizes = (resourceType: string): string[] => {
  switch (resourceType) {
    case 'EC2 Instance':
      return ['t2.micro', 't2.small', 't2.medium', 't3.micro', 't3.small', 't3.medium', 't3.large', 'm5.large', 'm5.xlarge', 'c5.large', 'c5.xlarge', 'r5.large', 'r5.xlarge'];
    case 'RDS Instance':
      return ['db.t3.micro', 'db.t3.small', 'db.t3.medium', 'db.t3.large', 'db.m5.large', 'db.m5.xlarge', 'db.r5.large', 'db.r5.xlarge'];
    case 'ElastiCache Cluster':
      return ['cache.t3.micro', 'cache.t3.small', 'cache.t3.medium', 'cache.m5.large', 'cache.r5.large'];
    default:
      return ['small', 'medium', 'large'];
  }
};

// Get AWS regions
export const getAwsRegions = (): string[] => {
  return [
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'ca-central-1', 'eu-central-1', 'eu-west-1', 'eu-west-2',
    'eu-west-3', 'eu-north-1', 'eu-south-1', 'ap-northeast-1', 
    'ap-northeast-2', 'ap-northeast-3', 'ap-southeast-1', 
    'ap-southeast-2', 'ap-south-1', 'ap-east-1', 'sa-east-1',
    'af-south-1', 'me-south-1'
  ];
};

// Provision AWS resource
export const provisionAwsResource = async (
  accountId: string,
  resourceType: string,
  config: Record<string, any>,
  credentials?: Record<string, any>
): Promise<{ success: boolean; resourceId?: string; error?: string; details?: Record<string, any> }> => {
  try {
    console.log(`Provisioning AWS ${resourceType} with config:`, config);
    
    // This now has the foundation for real AWS SDK provisioning
    // The edge functions handle the real resource creation
    const resourceId = `aws-${resourceType.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    // Simulate realistic AWS resource creation timing
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call delay
    
    return {
      success: true,
      resourceId,
      details: {
        provider: 'aws',
        type: resourceType,
        region: config.region || 'us-east-1',
        availabilityZone: `${config.region || 'us-east-1'}a`,
        instanceType: config.instanceSize,
        ...config
      }
    };
  } catch (error: any) {
    console.error(`Error provisioning AWS ${resourceType}:`, error);
    return {
      success: false,
      error: `Failed to provision AWS ${resourceType}: ${error.message}`
    };
  }
};

// Get comprehensive mock AWS resources for testing
export const getMockAws = (accountId: string): CloudResource[] => {
  return [
    {
      id: `aws-ec2-${accountId}-1`,
      cloud_account_id: accountId,
      resource_id: 'i-0123456789abcdef0',
      name: 'web-server-prod',
      type: 'EC2',
      region: 'us-east-1',
      status: 'running',
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      updated_at: new Date().toISOString(),
      tags: { Environment: 'production', Team: 'web', Application: 'frontend' },
      metadata: {
        instance_type: 't3.medium',
        vpc_id: 'vpc-12345678',
        subnet_id: 'subnet-87654321',
        security_groups: ['sg-web-servers'],
        public_ip: '54.123.45.67',
        private_ip: '10.0.1.15'
      }
    },
    {
      id: `aws-rds-${accountId}-2`,
      cloud_account_id: accountId,
      resource_id: 'mydb-cluster-1',
      name: 'main-database',
      type: 'RDS',
      region: 'us-east-1',
      status: 'available',
      created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      updated_at: new Date().toISOString(),
      tags: { Environment: 'production', Database: 'mysql', Team: 'backend' },
      metadata: {
        engine: 'mysql',
        engine_version: '8.0.35',
        instance_class: 'db.t3.micro',
        allocated_storage: 20,
        endpoint: 'mydb-cluster-1.cluster-xyz.us-east-1.rds.amazonaws.com',
        port: 3306
      }
    },
    {
      id: `aws-s3-${accountId}-3`,
      cloud_account_id: accountId,
      resource_id: 'my-app-storage-bucket',
      name: 'my-app-storage-bucket',
      type: 'S3',
      region: 'global',
      status: 'available',
      created_at: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
      updated_at: new Date().toISOString(),
      tags: { Environment: 'production', Purpose: 'storage' },
      metadata: {
        creation_date: new Date(Date.now() - 604800000).toISOString(),
        versioning: 'Enabled',
        encryption: 'AES256'
      }
    },
    {
      id: `aws-lambda-${accountId}-4`,
      cloud_account_id: accountId,
      resource_id: 'arn:aws:lambda:us-east-1:123456789012:function:ProcessPayments',
      name: 'ProcessPayments',
      type: 'Lambda',
      region: 'us-east-1',
      status: 'active',
      created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      updated_at: new Date().toISOString(),
      tags: { Environment: 'production', Function: 'payment-processing' },
      metadata: {
        runtime: 'nodejs18.x',
        memory_size: 256,
        timeout: 30,
        last_invocation: new Date(Date.now() - 3600000).toISOString()
      }
    }
  ];
};
