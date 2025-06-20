
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Import AWS SDK v3
import { EC2Client, DescribeInstancesCommand } from "https://esm.sh/@aws-sdk/client-ec2@3.462.0";
import { RDSClient, DescribeDBInstancesCommand } from "https://esm.sh/@aws-sdk/client-rds@3.462.0";
import { S3Client, HeadBucketCommand } from "https://esm.sh/@aws-sdk/client-s3@3.462.0";

// Import Azure SDK
import { ComputeManagementClient } from "https://esm.sh/@azure/arm-compute@21.0.0";
import { StorageManagementClient } from "https://esm.sh/@azure/arm-storage@18.1.0";
import { ClientSecretCredential } from "https://esm.sh/@azure/identity@4.0.0";

// Import GCP SDK
import { JWT } from "https://esm.sh/google-auth-library@9.0.0";

const handleError = (error: any, message: string) => {
  console.error(message, error);
  return new Response(
    JSON.stringify({
      status: 'unknown',
      error: `${message}: ${error.message || 'Unknown error'}`
    }),
    {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
};

const getAwsResourceStatus = async (resourceId: string, credentials: any) => {
  const awsConfig = {
    region: credentials.region || 'us-east-1',
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      ...(credentials.sessionToken && { sessionToken: credentials.sessionToken })
    }
  };

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
        launchTime: instance?.LaunchTime
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
        port: dbInstance?.Endpoint?.Port
      }
    };
  } else {
    // S3 Bucket
    const s3Client = new S3Client(awsConfig);
    const command = new HeadBucketCommand({
      Bucket: resourceId
    });
    
    try {
      await s3Client.send(command);
      return {
        status: 'available',
        details: {
          region: awsConfig.region
        }
      };
    } catch (error) {
      return {
        status: 'error',
        details: {
          error: error.message
        }
      };
    }
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { accountId, provider, resourceId, credentials } = await req.json();
    
    console.log(`Getting status for ${resourceId} on ${provider}`);
    
    let result;
    
    switch (provider) {
      case 'aws':
        result = await getAwsResourceStatus(resourceId, credentials);
        break;
      case 'azure':
        result = { status: 'unknown', details: { message: 'Azure status check not implemented yet' } };
        break;
      case 'gcp':
        result = { status: 'unknown', details: { message: 'GCP status check not implemented yet' } };
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
    
    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    return handleError(error, "Error getting resource status");
  }
});
