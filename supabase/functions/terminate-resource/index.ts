
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Import AWS SDK
import { EC2Client, TerminateInstancesCommand } from "https://esm.sh/@aws-sdk/client-ec2@3.462.0";
import { RDSClient, DeleteDBInstanceCommand } from "https://esm.sh/@aws-sdk/client-rds@3.462.0";
import { S3Client, DeleteBucketCommand } from "https://esm.sh/@aws-sdk/client-s3@3.462.0";

// Import Azure SDK
import { ComputeManagementClient } from "https://esm.sh/@azure/arm-compute@21.0.0";
import { ClientSecretCredential } from "https://esm.sh/@azure/identity@4.0.0";

// Import GCP SDK
import { JWT } from "https://esm.sh/google-auth-library@9.0.0";

const handleError = (error: any, message: string) => {
  console.error(message, error);
  return new Response(
    JSON.stringify({ success: false, error: `${message}: ${error.message}` }),
    {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { accountId, provider, resourceId, credentials } = await req.json();
    
    let result;
    
    switch (provider.toLowerCase()) {
      case 'aws':
        result = await terminateAwsResource(resourceId, credentials);
        break;
      case 'azure':
        result = await terminateAzureResource(resourceId, credentials);
        break;
      case 'gcp':
        result = await terminateGcpResource(resourceId, credentials);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return handleError(error, "Failed to terminate resource");
  }
});

const terminateAwsResource = async (resourceId: string, credentials: any) => {
  const ec2Client = new EC2Client({
    region: credentials.region || 'us-east-1',
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey
    }
  });
  
  try {
    const command = new TerminateInstancesCommand({
      InstanceIds: [resourceId]
    });
    await ec2Client.send(command);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const terminateAzureResource = async (resourceId: string, credentials: any) => {
  const credential = new ClientSecretCredential(
    credentials.tenantId,
    credentials.clientId,
    credentials.clientSecret
  );
  
  try {
    const resourceParts = resourceId.split('/');
    const resourceGroup = resourceParts[4];
    const vmName = resourceParts[8];
    
    const computeClient = new ComputeManagementClient(credential, credentials.subscriptionId);
    await computeClient.virtualMachines.beginDelete(resourceGroup, vmName);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const terminateGcpResource = async (resourceId: string, credentials: any) => {
  const serviceAccountKey = JSON.parse(credentials.serviceAccountKey);
  const [projectId, zone, instanceName] = resourceId.split('/');
  
  try {
    const jwtClient = new JWT({
      email: serviceAccountKey.client_email,
      key: serviceAccountKey.private_key,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    
    await jwtClient.authorize();
    const accessToken = await jwtClient.getAccessToken();
    
    const response = await fetch(
      `https://compute.googleapis.com/compute/v1/projects/${projectId}/zones/${zone}/instances/${instanceName}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`GCP API error: ${response.statusText}`);
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
