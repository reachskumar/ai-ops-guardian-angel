
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Import AWS SDK v3
import { EC2Client, RunInstancesCommand, DescribeInstancesCommand } from "https://esm.sh/@aws-sdk/client-ec2@3.462.0";
import { RDSClient, CreateDBInstanceCommand } from "https://esm.sh/@aws-sdk/client-rds@3.462.0";
import { S3Client, CreateBucketCommand } from "https://esm.sh/@aws-sdk/client-s3@3.462.0";

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
      success: false,
      error: `${message}: ${error.message || 'Unknown error'}`
    }),
    {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
};

// AWS Resource Provisioning
const provisionAwsResource = async (resourceType: string, config: any, credentials: any) => {
  const awsConfig = {
    region: config.region || 'us-east-1',
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      ...(credentials.sessionToken && { sessionToken: credentials.sessionToken })
    }
  };

  switch (resourceType.toLowerCase()) {
    case 'ec2 instance':
    case 'ec2':
      return await provisionAwsEc2(config, awsConfig);
    case 'rds instance':
    case 'rds':
      return await provisionAwsRds(config, awsConfig);
    case 's3 bucket':
    case 's3':
      return await provisionAwsS3(config, awsConfig);
    default:
      throw new Error(`Unsupported AWS resource type: ${resourceType}`);
  }
};

const provisionAwsEc2 = async (config: any, awsConfig: any) => {
  const ec2Client = new EC2Client(awsConfig);
  
  const params = {
    ImageId: config.baseImage || 'ami-0c94855ba95b798c2', // Amazon Linux 2023
    InstanceType: config.size || 't3.micro',
    MinCount: 1,
    MaxCount: 1,
    TagSpecifications: [
      {
        ResourceType: 'instance',
        Tags: Object.entries(config.tags || {}).map(([key, value]) => ({
          Key: key,
          Value: String(value)
        })).concat([
          { Key: 'Name', Value: config.name }
        ])
      }
    ],
    ...(config.securityGroups && { SecurityGroupIds: config.securityGroups }),
    ...(config.subnet && { SubnetId: config.subnet }),
    ...(config.encryption && {
      BlockDeviceMappings: [{
        DeviceName: '/dev/xvda',
        Ebs: {
          VolumeSize: config.storageSize || 8,
          VolumeType: config.storageType || 'gp3',
          Encrypted: true
        }
      }]
    })
  };

  const command = new RunInstancesCommand(params);
  const response = await ec2Client.send(command);
  
  const instanceId = response.Instances?.[0]?.InstanceId;
  if (!instanceId) {
    throw new Error('Failed to get instance ID from AWS response');
  }

  return {
    success: true,
    resourceId: instanceId,
    details: {
      provider: 'aws',
      type: 'EC2 Instance',
      instanceId,
      region: awsConfig.region,
      instanceType: config.size,
      imageId: params.ImageId,
      state: response.Instances?.[0]?.State?.Name || 'pending'
    }
  };
};

const provisionAwsRds = async (config: any, awsConfig: any) => {
  const rdsClient = new RDSClient(awsConfig);
  
  const params = {
    DBInstanceIdentifier: config.name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    DBInstanceClass: config.size || 'db.t3.micro',
    Engine: config.engine || 'mysql',
    EngineVersion: config.engineVersion || '8.0',
    MasterUsername: config.masterUsername || 'admin',
    MasterUserPassword: config.masterPassword || 'TempPassword123!',
    AllocatedStorage: config.storageSize || 20,
    StorageType: config.storageType || 'gp2',
    StorageEncrypted: config.encryption || true,
    ...(config.vpc && { DBSubnetGroupName: config.dbSubnetGroup }),
    ...(config.securityGroups && { VpcSecurityGroupIds: config.securityGroups }),
    Tags: Object.entries(config.tags || {}).map(([key, value]) => ({
      Key: key,
      Value: String(value)
    }))
  };

  const command = new CreateDBInstanceCommand(params);
  const response = await rdsClient.send(command);
  
  return {
    success: true,
    resourceId: response.DBInstance?.DBInstanceIdentifier,
    details: {
      provider: 'aws',
      type: 'RDS Instance',
      dbInstanceId: response.DBInstance?.DBInstanceIdentifier,
      engine: response.DBInstance?.Engine,
      status: response.DBInstance?.DBInstanceStatus,
      endpoint: response.DBInstance?.Endpoint?.Address
    }
  };
};

const provisionAwsS3 = async (config: any, awsConfig: any) => {
  const s3Client = new S3Client(awsConfig);
  
  const bucketName = config.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const params = {
    Bucket: bucketName,
    ...(awsConfig.region !== 'us-east-1' && {
      CreateBucketConfiguration: {
        LocationConstraint: awsConfig.region
      }
    })
  };

  const command = new CreateBucketCommand(params);
  await s3Client.send(command);
  
  return {
    success: true,
    resourceId: bucketName,
    details: {
      provider: 'aws',
      type: 'S3 Bucket',
      bucketName,
      region: awsConfig.region,
      url: `https://${bucketName}.s3.${awsConfig.region}.amazonaws.com`
    }
  };
};

// Azure Resource Provisioning
const provisionAzureResource = async (resourceType: string, config: any, credentials: any) => {
  const credential = new ClientSecretCredential(
    credentials.tenantId,
    credentials.clientId,
    credentials.clientSecret
  );
  
  switch (resourceType.toLowerCase()) {
    case 'virtual machine':
    case 'vm':
      return await provisionAzureVm(config, credentials, credential);
    case 'storage account':
      return await provisionAzureStorage(config, credentials, credential);
    default:
      throw new Error(`Unsupported Azure resource type: ${resourceType}`);
  }
};

const provisionAzureVm = async (config: any, credentials: any, credential: any) => {
  const computeClient = new ComputeManagementClient(credential, credentials.subscriptionId);
  
  const resourceGroupName = config.resourceGroup || 'rg-default';
  const vmName = config.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  
  const vmParams = {
    location: config.region || 'eastus',
    hardwareProfile: {
      vmSize: config.size || 'Standard_B2s'
    },
    storageProfile: {
      imageReference: {
        publisher: 'Canonical',
        offer: 'UbuntuServer',
        sku: '18.04-LTS',
        version: 'latest'
      },
      osDisk: {
        createOption: 'FromImage',
        diskSizeGB: config.storageSize || 30,
        managedDisk: {
          storageAccountType: 'Premium_LRS'
        }
      }
    },
    osProfile: {
      computerName: vmName,
      adminUsername: config.adminUsername || 'azureuser',
      adminPassword: config.adminPassword || 'TempPassword123!'
    },
    networkProfile: {
      networkInterfaces: [
        {
          id: `/subscriptions/${credentials.subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Network/networkInterfaces/${vmName}-nic`
        }
      ]
    },
    tags: config.tags || {}
  };

  const operation = await computeClient.virtualMachines.beginCreateOrUpdate(
    resourceGroupName,
    vmName,
    vmParams
  );
  
  const result = await operation.pollUntilDone();
  
  return {
    success: true,
    resourceId: result.id,
    details: {
      provider: 'azure',
      type: 'Virtual Machine',
      name: vmName,
      resourceGroup: resourceGroupName,
      location: config.region,
      vmSize: config.size,
      status: 'Creating'
    }
  };
};

const provisionAzureStorage = async (config: any, credentials: any, credential: any) => {
  const storageClient = new StorageManagementClient(credential, credentials.subscriptionId);
  
  const resourceGroupName = config.resourceGroup || 'rg-default';
  const accountName = config.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  const storageParams = {
    location: config.region || 'eastus',
    sku: {
      name: config.sku || 'Standard_LRS'
    },
    kind: 'StorageV2',
    tags: config.tags || {}
  };

  const operation = await storageClient.storageAccounts.beginCreate(
    resourceGroupName,
    accountName,
    storageParams
  );
  
  const result = await operation.pollUntilDone();
  
  return {
    success: true,
    resourceId: result.id,
    details: {
      provider: 'azure',
      type: 'Storage Account',
      name: accountName,
      resourceGroup: resourceGroupName,
      location: config.region,
      sku: config.sku
    }
  };
};

// GCP Resource Provisioning
const provisionGcpResource = async (resourceType: string, config: any, credentials: any) => {
  const serviceAccountKey = JSON.parse(credentials.serviceAccountKey);
  
  // Create JWT client for authentication
  const jwtClient = new JWT({
    email: serviceAccountKey.client_email,
    key: serviceAccountKey.private_key,
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  
  await jwtClient.authorize();
  const accessToken = await jwtClient.getAccessToken();
  
  switch (resourceType.toLowerCase()) {
    case 'compute engine':
    case 'vm instance':
      return await provisionGcpCompute(config, serviceAccountKey, accessToken);
    case 'cloud storage':
      return await provisionGcpStorage(config, serviceAccountKey, accessToken);
    default:
      throw new Error(`Unsupported GCP resource type: ${resourceType}`);
  }
};

const provisionGcpCompute = async (config: any, serviceAccountKey: any, accessToken: string) => {
  const projectId = serviceAccountKey.project_id;
  const zone = config.region || 'us-central1-a';
  const instanceName = config.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  
  const instanceConfig = {
    name: instanceName,
    machineType: `zones/${zone}/machineTypes/${config.size || 'e2-medium'}`,
    disks: [
      {
        boot: true,
        autoDelete: true,
        initializeParams: {
          sourceImage: 'projects/debian-cloud/global/images/family/debian-11',
          diskSizeGb: String(config.storageSize || 10)
        }
      }
    ],
    networkInterfaces: [
      {
        network: 'global/networks/default',
        accessConfigs: [
          {
            type: 'ONE_TO_ONE_NAT',
            name: 'External NAT'
          }
        ]
      }
    ],
    tags: {
      items: Object.keys(config.tags || {})
    },
    labels: config.tags || {}
  };

  const response = await fetch(
    `https://compute.googleapis.com/compute/v1/projects/${projectId}/zones/${zone}/instances`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(instanceConfig)
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GCP API error: ${error}`);
  }

  const result = await response.json();
  
  return {
    success: true,
    resourceId: `${projectId}/${zone}/${instanceName}`,
    details: {
      provider: 'gcp',
      type: 'Compute Engine',
      name: instanceName,
      project: project Id,
      zone,
      machineType: config.size,
      operationId: result.id
    }
  };
};

const provisionGcpStorage = async (config: any, serviceAccountKey: any, accessToken: string) => {
  const projectId = serviceAccountKey.project_id;
  const bucketName = config.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  
  const bucketConfig = {
    name: bucketName,
    location: config.region || 'US',
    storageClass: config.storageClass || 'STANDARD',
    labels: config.tags || {}
  };

  const response = await fetch(
    `https://storage.googleapis.com/storage/v1/b?project=${projectId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bucketConfig)
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GCP Storage API error: ${error}`);
  }

  const result = await response.json();
  
  return {
    success: true,
    resourceId: bucketName,
    details: {
      provider: 'gcp',
      type: 'Cloud Storage',
      name: bucketName,
      project: projectId,
      location: config.region,
      url: `gs://${bucketName}`
    }
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { accountId, provider, resourceType, config, credentials } = await req.json();
    
    if (!accountId || !provider || !resourceType || !config || !credentials) {
      return handleError(
        new Error("Missing required parameters"),
        "Invalid request"
      );
    }
    
    console.log(`Provisioning ${resourceType} on ${provider} for account ${accountId}`);
    
    let result;
    
    switch (provider.toLowerCase()) {
      case 'aws':
        result = await provisionAwsResource(resourceType, config, credentials);
        break;
      case 'azure':
        result = await provisionAzureResource(resourceType, config, credentials);
        break;
      case 'gcp':
        result = await provisionGcpResource(resourceType, config, credentials);
        break;
      default:
        throw new Error(`Unsupported cloud provider: ${provider}`);
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error("Provisioning error:", error);
    return handleError(error, "Failed to provision resource");
  }
});
