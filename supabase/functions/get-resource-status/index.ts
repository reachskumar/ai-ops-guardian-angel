
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Import AWS SDK
import { EC2Client, DescribeInstancesCommand } from "https://esm.sh/@aws-sdk/client-ec2@3.462.0";
import { RDSClient, DescribeDBInstancesCommand } from "https://esm.sh/@aws-sdk/client-rds@3.462.0";

// Import Azure SDK
import { ComputeManagementClient } from "https://esm.sh/@azure/arm-compute@21.0.0";
import { ClientSecretCredential } from "https://esm.sh/@azure/identity@4.0.0";

// Import GCP SDK
import { JWT } from "https://esm.sh/google-auth-library@9.0.0";

const handleError = (error: any, message: string) => {
  console.error(message, error);
  return new Response(
    JSON.stringify({ status: 'unknown', error: `${message}: ${error.message}` }),
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
    
    let status = 'unknown';
    let details = {};
    
    switch (provider.toLowerCase()) {
      case 'aws':
        const awsResult = await getAwsResourceStatus(resourceId, credentials);
        status = awsResult.status;
        details = awsResult.details;
        break;
      case 'azure':
        const azureResult = await getAzureResourceStatus(resourceId, credentials);
        status = azureResult.status;
        details = azureResult.details;
        break;
      case 'gcp':
        const gcpResult = await getGcpResourceStatus(resourceId, credentials);
        status = gcpResult.status;
        details = gcpResult.details;
        break;
    }
    
    return new Response(JSON.stringify({ status, details }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return handleError(error, "Failed to get resource status");
  }
});

const getAwsResourceStatus = async (resourceId: string, credentials: any) => {
  const ec2Client = new EC2Client({
    region: credentials.region || 'us-east-1',
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey
    }
  });
  
  try {
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
  } catch (error) {
    return { status: 'error', details: { error: error.message } };
  }
};

const getAzureResourceStatus = async (resourceId: string, credentials: any) => {
  const credential = new ClientSecretCredential(
    credentials.tenantId,
    credentials.clientId,
    credentials.clientSecret
  );
  
  try {
    // Parse resource ID to get resource group and VM name
    const resourceParts = resourceId.split('/');
    const resourceGroup = resourceParts[4];
    const vmName = resourceParts[8];
    
    const computeClient = new ComputeManagementClient(credential, credentials.subscriptionId);
    const vm = await computeClient.virtualMachines.get(resourceGroup, vmName);
    
    return {
      status: vm.provisioningState?.toLowerCase() || 'unknown',
      details: {
        vmSize: vm.hardwareProfile?.vmSize,
        location: vm.location,
        osType: vm.storageProfile?.osDisk?.osType
      }
    };
  } catch (error) {
    return { status: 'error', details: { error: error.message } };
  }
};

const getGcpResourceStatus = async (resourceId: string, credentials: any) => {
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
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`GCP API error: ${response.statusText}`);
    }
    
    const instance = await response.json();
    
    return {
      status: instance.status?.toLowerCase() || 'unknown',
      details: {
        machineType: instance.machineType?.split('/').pop(),
        zone: instance.zone?.split('/').pop(),
        creationTimestamp: instance.creationTimestamp
      }
    };
  } catch (error) {
    return { status: 'error', details: { error: error.message } };
  }
};
