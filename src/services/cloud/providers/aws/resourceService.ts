
import { CloudResource } from "../../types";

export const getAWSResources = async (credentials: Record<string, string>): Promise<CloudResource[]> => {
  console.log("Fetching AWS resources with credentials (simulated)");
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock AWS resources
  const mockResources: CloudResource[] = [
    {
      id: 'aws-ec2-1',
      cloud_account_id: 'aws-account-1',
      resource_id: 'i-1234567890abcdef0',
      name: 'Production Web Server',
      type: 'EC2 Instance',
      region: 'us-east-1',
      status: 'running',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cost_per_day: 12.50,
      tags: {
        Environment: 'production',
        Team: 'frontend',
        Application: 'web-app'
      },
      metadata: {
        instanceType: 't3.medium',
        imageId: 'ami-0123456789abcdef0',
        keyName: 'prod-web-key',
        securityGroups: ['sg-web', 'sg-ssh'],
        monitoring: true
      }
    },
    {
      id: 'aws-rds-1',
      cloud_account_id: 'aws-account-1',
      resource_id: 'db-ABCDEFGHIJ1234567890',
      name: 'Main Database',
      type: 'RDS MySQL',
      region: 'us-east-1',
      status: 'available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cost_per_day: 25.75,
      tags: {
        Environment: 'production',
        Database: 'mysql',
        Team: 'backend'
      },
      metadata: {
        engine: 'mysql',
        engineVersion: '8.0.28',
        instanceClass: 'db.t3.micro',
        allocatedStorage: 20,
        multiAZ: false
      }
    },
    {
      id: 'aws-s3-1',
      cloud_account_id: 'aws-account-1',
      resource_id: 'prod-app-assets-bucket',
      name: 'Application Assets',
      type: 'S3 Bucket',
      region: 'us-east-1',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cost_per_day: 5.20,
      tags: {
        Environment: 'production',
        Purpose: 'static-assets'
      },
      metadata: {
        versioning: 'Enabled',
        encryption: 'AES256',
        publicAccess: false,
        storageClass: 'STANDARD'
      }
    },
    {
      id: 'aws-lambda-1',
      cloud_account_id: 'aws-account-1',
      resource_id: 'arn:aws:lambda:us-east-1:123456789012:function:ProcessImages',
      name: 'Image Processing Function',
      type: 'Lambda Function',
      region: 'us-east-1',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cost_per_day: 1.50,
      tags: {
        Environment: 'production',
        Function: 'image-processing'
      },
      metadata: {
        runtime: 'python3.9',
        timeout: 30,
        memory: 512,
        lastModified: new Date().toISOString()
      }
    }
  ];

  console.log(`Retrieved ${mockResources.length} AWS resources`);
  return mockResources;
};

export const createAWSResource = async (
  credentials: Record<string, string>,
  resourceConfig: any
): Promise<{ success: boolean; resourceId?: string; error?: string }> => {
  console.log("Creating AWS resource:", resourceConfig);
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock resource creation
    const resourceId = `aws-${resourceConfig.type}-${Date.now()}`;
    
    console.log(`AWS resource created successfully: ${resourceId}`);
    return { success: true, resourceId };
  } catch (error: any) {
    console.error("Create AWS resource error:", error);
    return { success: false, error: error.message || 'Failed to create AWS resource' };
  }
};

export const deleteAWSResource = async (
  credentials: Record<string, string>,
  resourceId: string
): Promise<{ success: boolean; error?: string }> => {
  console.log("Deleting AWS resource:", resourceId);
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log(`AWS resource deleted successfully: ${resourceId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Delete AWS resource error:", error);
    return { success: false, error: error.message || 'Failed to delete AWS resource' };
  }
};
