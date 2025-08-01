
// Sync Cloud Resources Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// Import AWS SDK v3
import { EC2Client, DescribeInstancesCommand, DescribeVolumesCommand } from "https://esm.sh/@aws-sdk/client-ec2@3.462.0";
import { RDSClient, DescribeDBInstancesCommand } from "https://esm.sh/@aws-sdk/client-rds@3.462.0";
import { S3Client, ListBucketsCommand } from "https://esm.sh/@aws-sdk/client-s3@3.462.0";
import { ELBv2Client, DescribeLoadBalancersCommand } from "https://esm.sh/@aws-sdk/client-elastic-load-balancing-v2@3.462.0";

// Import Azure SDK
import { ComputeManagementClient } from "https://esm.sh/@azure/arm-compute@21.0.0";
import { StorageManagementClient } from "https://esm.sh/@azure/arm-storage@18.1.0";
import { SqlManagementClient } from "https://esm.sh/@azure/arm-sql@10.0.0";
import { ClientSecretCredential } from "https://esm.sh/@azure/identity@4.0.0";

// Import GCP SDK
import { JWT } from "https://esm.sh/google-auth-library@9.0.0";

const handleError = (error: any, message: string) => {
  console.error(message, error);
  return new Response(
    JSON.stringify({
      success: false,
      error: `${message}: ${error.message || 'Unknown error'}`,
      timestamp: new Date().toISOString()
    }),
    {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
};

// AWS Resource Discovery
const discoverAwsResources = async (credentials: any) => {
  const config = {
    region: credentials.region || 'us-east-1',
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      ...(credentials.sessionToken && { sessionToken: credentials.sessionToken })
    }
  };

  const resources: any[] = [];

  try {
    // Discover EC2 Instances
    const ec2Client = new EC2Client(config);
    const instancesCommand = new DescribeInstancesCommand({});
    const instancesResult = await ec2Client.send(instancesCommand);

    if (instancesResult.Reservations) {
      for (const reservation of instancesResult.Reservations) {
        if (reservation.Instances) {
          for (const instance of reservation.Instances) {
            resources.push({
              id: instance.InstanceId,
              name: instance.Tags?.find(tag => tag.Key === 'Name')?.Value || instance.InstanceId,
              type: 'compute',
              subtype: 'ec2-instance',
              provider: 'aws',
              region: instance.Placement?.AvailabilityZone?.slice(0, -1),
              status: instance.State?.Name,
              details: {
                instanceType: instance.InstanceType,
                platform: instance.Platform || 'linux',
                privateIpAddress: instance.PrivateIpAddress,
                publicIpAddress: instance.PublicIpAddress,
                vpcId: instance.VpcId,
                subnetId: instance.SubnetId,
                securityGroups: instance.SecurityGroups,
                launchTime: instance.LaunchTime?.toISOString()
              },
              tags: instance.Tags?.reduce((acc: any, tag: any) => {
                acc[tag.Key] = tag.Value;
                return acc;
              }, {}) || {},
              cost_monthly: estimateCost('ec2', instance.InstanceType),
              last_updated: new Date().toISOString()
            });
          }
        }
      }
    }

    // Discover EBS Volumes
    const volumesCommand = new DescribeVolumesCommand({});
    const volumesResult = await ec2Client.send(volumesCommand);

    if (volumesResult.Volumes) {
      for (const volume of volumesResult.Volumes) {
        resources.push({
          id: volume.VolumeId,
          name: volume.Tags?.find(tag => tag.Key === 'Name')?.Value || volume.VolumeId,
          type: 'storage',
          subtype: 'ebs-volume',
          provider: 'aws',
          region: volume.AvailabilityZone?.slice(0, -1),
          status: volume.State,
          details: {
            size: volume.Size,
            volumeType: volume.VolumeType,
            iops: volume.Iops,
            encrypted: volume.Encrypted,
            attachments: volume.Attachments
          },
          tags: volume.Tags?.reduce((acc: any, tag: any) => {
            acc[tag.Key] = tag.Value;
            return acc;
          }, {}) || {},
          cost_monthly: estimateCost('ebs', volume.VolumeType, volume.Size),
          last_updated: new Date().toISOString()
        });
      }
    }

    // Discover RDS Instances
    const rdsClient = new RDSClient(config);
    const dbInstancesCommand = new DescribeDBInstancesCommand({});
    const dbInstancesResult = await rdsClient.send(dbInstancesCommand);

    if (dbInstancesResult.DBInstances) {
      for (const dbInstance of dbInstancesResult.DBInstances) {
        resources.push({
          id: dbInstance.DBInstanceIdentifier,
          name: dbInstance.DBName || dbInstance.DBInstanceIdentifier,
          type: 'database',
          subtype: 'rds-instance',
          provider: 'aws',
          region: dbInstance.AvailabilityZone?.slice(0, -1),
          status: dbInstance.DBInstanceStatus,
          details: {
            engine: dbInstance.Engine,
            engineVersion: dbInstance.EngineVersion,
            instanceClass: dbInstance.DBInstanceClass,
            allocatedStorage: dbInstance.AllocatedStorage,
            storageType: dbInstance.StorageType,
            multiAZ: dbInstance.MultiAZ,
            endpoint: dbInstance.Endpoint?.Address
          },
          tags: dbInstance.TagList?.reduce((acc: any, tag: any) => {
            acc[tag.Key] = tag.Value;
            return acc;
          }, {}) || {},
          cost_monthly: estimateCost('rds', dbInstance.DBInstanceClass),
          last_updated: new Date().toISOString()
        });
      }
    }

    // Discover S3 Buckets
    const s3Client = new S3Client(config);
    const bucketsCommand = new ListBucketsCommand({});
    const bucketsResult = await s3Client.send(bucketsCommand);

    if (bucketsResult.Buckets) {
      for (const bucket of bucketsResult.Buckets) {
        resources.push({
          id: bucket.Name,
          name: bucket.Name,
          type: 'storage',
          subtype: 's3-bucket',
          provider: 'aws',
          region: config.region, // S3 region detection would need separate call
          status: 'active',
          details: {
            creationDate: bucket.CreationDate?.toISOString()
          },
          tags: {},
          cost_monthly: estimateCost('s3'),
          last_updated: new Date().toISOString()
        });
      }
    }

    console.log(`Discovered ${resources.length} AWS resources`);
    return resources;

  } catch (error) {
    console.error('AWS resource discovery error:', error);
    throw new Error(`AWS resource discovery failed: ${error.message}`);
  }
};

// Azure Resource Discovery
const discoverAzureResources = async (credentials: any) => {
  try {
    // Get access token
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${credentials.tenantId}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'client_id': credentials.clientId,
        'client_secret': credentials.clientSecret,
        'scope': 'https://management.azure.com/.default',
        'grant_type': 'client_credentials'
      })
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const resources: any[] = [];

    // Discover Virtual Machines
    const vmResponse = await fetch(`https://management.azure.com/subscriptions/${credentials.subscriptionId}/providers/Microsoft.Compute/virtualMachines?api-version=2021-07-01`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (vmResponse.ok) {
      const vmData = await vmResponse.json();
      
      for (const vm of vmData.value || []) {
        resources.push({
          id: vm.id,
          name: vm.name,
          type: 'compute',
          subtype: 'virtual-machine',
          provider: 'azure',
          region: vm.location,
          status: vm.properties?.provisioningState,
          details: {
            vmSize: vm.properties?.hardwareProfile?.vmSize,
            osType: vm.properties?.storageProfile?.osDisk?.osType,
            imageReference: vm.properties?.storageProfile?.imageReference
          },
          tags: vm.tags || {},
          cost_monthly: estimateCost('azure-vm', vm.properties?.hardwareProfile?.vmSize),
          last_updated: new Date().toISOString()
        });
      }
    }

    // Discover Storage Accounts
    const storageResponse = await fetch(`https://management.azure.com/subscriptions/${credentials.subscriptionId}/providers/Microsoft.Storage/storageAccounts?api-version=2021-04-01`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (storageResponse.ok) {
      const storageData = await storageResponse.json();
      
      for (const storage of storageData.value || []) {
        resources.push({
          id: storage.id,
          name: storage.name,
          type: 'storage',
          subtype: 'storage-account',
          provider: 'azure',
          region: storage.location,
          status: storage.properties?.provisioningState,
          details: {
            accountType: storage.properties?.accountType,
            tier: storage.properties?.accessTier
          },
          tags: storage.tags || {},
          cost_monthly: estimateCost('azure-storage'),
          last_updated: new Date().toISOString()
        });
      }
    }

    console.log(`Discovered ${resources.length} Azure resources`);
    return resources;

  } catch (error) {
    console.error('Azure resource discovery error:', error);
    throw new Error(`Azure resource discovery failed: ${error.message}`);
  }
};

// Simple cost estimation function
const estimateCost = (type: string, size?: string, additionalParam?: any): number => {
  // Very simplified cost estimation - in production, use real pricing APIs
  const baseCosts: any = {
    'ec2': {
      't3.micro': 8.4,
      't3.small': 16.8,
      't3.medium': 33.6,
      't3.large': 67.2,
      'm5.large': 70.08,
      'm5.xlarge': 140.16
    },
    'ebs': {
      'gp3': 0.08 * (additionalParam || 20), // per GB/month
      'gp2': 0.10 * (additionalParam || 20),
      'io1': 0.125 * (additionalParam || 20)
    },
    'rds': {
      'db.t3.micro': 12.5,
      'db.t3.small': 25,
      'db.t3.medium': 50
    },
    's3': 23, // Base estimate
    'azure-vm': {
      'Standard_B1s': 7.59,
      'Standard_B2s': 30.37,
      'Standard_D2s_v3': 70.08
    },
    'azure-storage': 20 // Base estimate
  };

  return baseCosts[type]?.[size] || baseCosts[type] || 0;
};

// Store resources in database
const storeResources = async (supabase: any, resources: any[], accountId: string, userId: string) => {
  try {
    // First, mark existing resources as potentially stale
    await supabase
      .from('cloud_resources')
      .update({ status: 'sync_pending' })
      .eq('account_id', accountId);

    // Insert or update discovered resources
    for (const resource of resources) {
      const { error } = await supabase
        .from('cloud_resources')
        .upsert({
          id: resource.id,
          account_id: accountId,
          user_id: userId,
          name: resource.name,
          type: resource.type,
          subtype: resource.subtype,
          provider: resource.provider,
          region: resource.region,
          status: resource.status,
          details: resource.details,
          tags: resource.tags,
          cost_monthly: resource.cost_monthly,
          last_updated: resource.last_updated,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error(`Error storing resource ${resource.id}:`, error);
      }
    }

    // Remove resources that were not found in this sync
    await supabase
      .from('cloud_resources')
      .delete()
      .eq('account_id', accountId)
      .eq('status', 'sync_pending');

    console.log(`Stored ${resources.length} resources for account ${accountId}`);

  } catch (error) {
    console.error('Error storing resources:', error);
    throw error;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { accountId, provider, credentials, userId } = await req.json();

    if (!accountId || !provider || !credentials || !userId) {
      throw new Error('Account ID, provider, credentials, and user ID are required');
    }

    console.log(`Starting resource sync for ${provider} account ${accountId}...`);

    let resources: any[] = [];

    switch (provider.toLowerCase()) {
      case 'aws':
        resources = await discoverAwsResources(credentials);
        break;
      case 'azure':
        resources = await discoverAzureResources(credentials);
        break;
      case 'gcp':
        // GCP implementation would go here
        resources = [];
        console.log('GCP resource discovery not yet implemented');
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    // Store resources in database
    await storeResources(supabase, resources, accountId, userId);

    // Update account last sync time
    await supabase
      .from('cloud_accounts')
      .update({
        last_sync: new Date().toISOString(),
        status: 'connected'
      })
      .eq('id', accountId);

    console.log(`✅ Resource sync completed for ${provider} - discovered ${resources.length} resources`);

    return new Response(
      JSON.stringify({
        success: true,
        resources_discovered: resources.length,
        resources: resources.slice(0, 10), // Return first 10 for preview
        total_monthly_cost: resources.reduce((sum, r) => sum + (r.cost_monthly || 0), 0),
        message: `Successfully synced ${resources.length} resources`,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error('Resource sync error:', error);
    return handleError(error, "Resource synchronization failed");
  }
});
