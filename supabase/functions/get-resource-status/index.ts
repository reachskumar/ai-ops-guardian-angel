
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Import AWS SDK
import { EC2Client, DescribeInstancesCommand } from "https://esm.sh/@aws-sdk/client-ec2@3.462.0";
import { RDSClient, DescribeDBInstancesCommand } from "https://esm.sh/@aws-sdk/client-rds@3.462.0";
import { S3Client, HeadBucketCommand } from "https://esm.sh/@aws-sdk/client-s3@3.462.0";

// Import Azure SDK
import { ComputeManagementClient } from "https://esm.sh/@azure/arm-compute@21.0.0";
import { ClientSecretCredential } from "https://esm.sh/@azure/identity@4.0.0";

// Import GCP SDK
import { JWT } from "https://esm.sh/google-auth-library@9.0.0";

const handleError = (error: any, message: string) => {
  console.error(message, error);
  return new Response(
    JSON.stringify({
      status: 'error',
      error: `${message}: ${error.message || 'Unknown error'}`
    }),
    {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
};

const getAwsResourceStatus = async (resourceId: string, credentials: any) => {
  const region = 'us-east-1'; // Default region or extract from resourceId
  const awsConfig = {
    region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      ...(credentials.sessionToken && { sessionToken: credentials.sessionToken })
    }
  };

  // Determine resource type based on resourceId format
  if (resourceId.startsWith('i-')) {
    // EC2 Instance
    const ec2Client = new EC2Client(awsConfig);
    const command = new DescribeInstancesCommand({
      InstanceIds: [resourceId]
    });
    
    const response = await ec2Client.send(command);
    const instance = response.Reservations?.[0]?.Instances?.[0];
    
    return {
      status: instance?.State?.Name || 'unknown',
      details: {
        instanceType: instance?.InstanceType,
        publicIp: instance?.PublicIpAddress,
        privateIp: instance?.PrivateIpAddress,
        launchTime: instance?.LaunchTime,
        state: instance?.State?.Name
      }
    };
  } else if (resourceId.includes('db-')) {
    // RDS Instance
    const rdsClient = new RDSClient(awsConfig);
    const command = new DescribeDBInstancesCommand({
      DBInstanceIdentifier: resourceId
    });
    
    const response = await rdsClient.send(command);
    const dbInstance = response.DBInstances?.[0];
    
    return {
      status: dbInstance?.DBInstanceStatus || 'unknown',
      details: {
        engine: dbInstance?.Engine,
        endpoint: dbInstance?.Endpoint?.Address,
        port: dbInstance?.Endpoint?.Port,
        status: dbInstance?.DBInstanceStatus
      }
    };
  } else {
    // Assume S3 Bucket
    const s3Client = new S3Client(awsConfig);
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: resourceId }));
      return {
        status: 'available',
        details: {
          bucketName: resourceId,
          region: awsConfig.region
        }
      };
    } catch (error: any) {
      if (error.name === 'NotFound') {
        return { status: 'not-found' };
      }
      throw error;
    }
  }
};

const getAzureResourceStatus = async (resourceId: string, credentials: any) => {
  const credential = new ClientSecretCredential(
    credentials.tenantId,
    credentials.clientId,
    credentials.clientSecret
  );
  
  // Parse Azure resource ID to get components
  const resourceParts = resourceId.split('/');
  const subscriptionId = resourceParts[2];
  const resourceGroupName = resourceParts[4];
  const resourceName = resourceParts[8];
  
  if (resourceId.includes('Microsoft.Compute/virtualMachines')) {
    const computeClient = new ComputeManagementClient(credential, subscriptionId);
    const vm = await computeClient.virtualMachines.get(resourceGroupName, resourceName);
    
    return {
      status: vm.provisioningState || 'unknown',
      details: {
        name: vm.name,
        location: vm.location,
        vmSize: vm.hardwareProfile?.vmSize,
        provisioningState: vm.provisioningState
      }
    };
  }
  
  return { status: 'unknown' };
};

const getGcpResourceStatus = async (resourceId: string, credentials: any) => {
  const serviceAccountKey = JSON.parse(credentials.serviceAccountKey);
  const jwtClient = new JWT({
    email: serviceAccountKey.client_email,
    key: serviceAccountKey.private_key,
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  
  await jwtClient.authorize();
  const accessToken = await jwtClient.getAccessToken();
  
  // Parse GCP resource ID format: project/zone/instance
  const [projectId, zone, instanceName] = resourceId.split('/');
  
  const response = await fetch(
    `https://compute.googleapis.com/compute/v1/projects/${projectId}/zones/${zone}/instances/${instanceName}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  
  if (!response.ok) {
    if (response.status === 404) {
      return { status: 'not-found' };
    }
    throw new Error(`GCP API error: ${response.statusText}`);
  }
  
  const instance = await response.json();
  
  return {
    status: instance.status?.toLowerCase() || 'unknown',
    details: {
      name: instance.name,
      machineType: instance.machineType?.split('/').pop(),
      zone: instance.zone?.split('/').pop(),
      status: instance.status,
      networkInterfaces: instance.networkInterfaces
    }
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { provider, resourceId, credentials } = await req.json();
    
    if (!provider || !resourceId || !credentials) {
      return handleError(
        new Error("Missing required parameters"),
        "Invalid request"
      );
    }
    
    console.log(`Getting status for ${provider} resource: ${resourceId}`);
    
    let result;
    
    switch (provider.toLowerCase()) {
      case 'aws':
        result = await getAwsResourceStatus(resourceId, credentials);
        break;
      case 'azure':
        result = await getAzureResourceStatus(resourceId, credentials);
        break;
      case 'gcp':
        result = await getGcpResourceStatus(resourceId, credentials);
        break;
      default:
        throw new Error(`Unsupported cloud provider: ${provider}`);
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error("Get status error:", error);
    return handleError(error, "Failed to get resource status");
  }
});
