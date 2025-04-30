
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
      return ['t2.micro', 't2.small', 't2.medium', 't3.micro', 't3.small', 'm5.large', 'c5.large', 'r5.large'];
    case 'RDS Instance':
      return ['db.t3.micro', 'db.t3.small', 'db.t3.medium', 'db.m5.large', 'db.r5.large'];
    case 'ElastiCache Cluster':
      return ['cache.t3.micro', 'cache.t3.small', 'cache.m5.large', 'cache.r5.large'];
    default:
      return ['small', 'medium', 'large'];
  }
};

// Get AWS regions
export const getAwsRegions = (): string[] => {
  return [
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'ca-central-1', 'eu-central-1', 'eu-west-1', 'eu-west-2',
    'eu-west-3', 'eu-north-1', 'ap-northeast-1', 'ap-northeast-2',
    'ap-southeast-1', 'ap-southeast-2', 'ap-south-1', 'sa-east-1'
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
    
    // This would use AWS SDK in a real implementation
    // For now, return a mock success response
    const resourceId = `aws-${resourceType.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    return {
      success: true,
      resourceId,
      details: {
        provider: 'aws',
        type: resourceType,
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
