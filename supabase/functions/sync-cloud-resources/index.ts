
// Sync Cloud Resources Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Import AWS SDK v3 modules
import { EC2Client, DescribeInstancesCommand } from "https://esm.sh/@aws-sdk/client-ec2@3.462.0";
import { RDSClient, DescribeDBInstancesCommand } from "https://esm.sh/@aws-sdk/client-rds@3.462.0";
import { S3Client, ListBucketsCommand } from "https://esm.sh/@aws-sdk/client-s3@3.462.0";

// Import Azure SDK modules  
import { ComputeManagementClient } from "https://esm.sh/@azure/arm-compute@21.0.0";
import { ResourceManagementClient } from "https://esm.sh/@azure/arm-resources@5.2.0";
import { StorageManagementClient } from "https://esm.sh/@azure/arm-storage@18.1.0";
import { ClientSecretCredential } from "https://esm.sh/@azure/identity@4.0.0";

// Import the Google Cloud Compute Engine client
import { Compute } from "https://cdn.jsdelivr.net/npm/@google-cloud/compute@4.1.0/+esm";

// Common error handler
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

// AWS Resource Discovery with real SDK
const syncAwsResources = async (accountId: string, credentials: any) => {
  console.log("Starting AWS resource sync with real SDK...");
  
  try {
    const resources: any[] = [];
    const region = credentials.region || 'us-east-1';
    
    // Configure AWS clients
    const ec2Client = new EC2Client({
      region: region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        ...(credentials.sessionToken && { sessionToken: credentials.sessionToken })
      }
    });
    
    const rdsClient = new RDSClient({
      region: region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        ...(credentials.sessionToken && { sessionToken: credentials.sessionToken })
      }
    });
    
    const s3Client = new S3Client({
      region: region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        ...(credentials.sessionToken && { sessionToken: credentials.sessionToken })
      }
    });

    // Fetch EC2 instances
    try {
      const ec2Response = await ec2Client.send(new DescribeInstancesCommand({}));
      
      if (ec2Response.Reservations) {
        for (const reservation of ec2Response.Reservations) {
          if (reservation.Instances) {
            for (const instance of reservation.Instances) {
              resources.push({
                id: `aws-ec2-${instance.InstanceId}`,
                cloud_account_id: accountId,
                resource_id: instance.InstanceId || `unknown-${Date.now()}`,
                name: instance.Tags?.find(tag => tag.Key === 'Name')?.Value || instance.InstanceId || 'Unnamed Instance',
                type: 'EC2',
                region: instance.Placement?.AvailabilityZone?.slice(0, -1) || region,
                status: instance.State?.Name || 'unknown',
                created_at: instance.LaunchTime?.toISOString() || new Date().toISOString(),
                updated_at: new Date().toISOString(),
                tags: instance.Tags ? Object.fromEntries(instance.Tags.map(tag => [tag.Key || '', tag.Value || ''])) : {},
                metadata: {
                  instance_type: instance.InstanceType,
                  vpc_id: instance.VpcId,
                  subnet_id: instance.SubnetId,
                  security_groups: instance.SecurityGroups?.map(sg => sg.GroupId) || [],
                  public_ip: instance.PublicIpAddress,
                  private_ip: instance.PrivateIpAddress
                }
              });
            }
          }
        }
      }
    } catch (ec2Error) {
      console.error("Error fetching EC2 instances:", ec2Error);
    }

    // Fetch RDS instances
    try {
      const rdsResponse = await rdsClient.send(new DescribeDBInstancesCommand({}));
      
      if (rdsResponse.DBInstances) {
        for (const dbInstance of rdsResponse.DBInstances) {
          resources.push({
            id: `aws-rds-${dbInstance.DBInstanceIdentifier}`,
            cloud_account_id: accountId,
            resource_id: dbInstance.DBInstanceIdentifier || `unknown-${Date.now()}`,
            name: dbInstance.DBName || dbInstance.DBInstanceIdentifier || 'Unnamed Database',
            type: 'RDS',
            region: dbInstance.AvailabilityZone?.slice(0, -1) || region,
            status: dbInstance.DBInstanceStatus || 'unknown',
            created_at: dbInstance.InstanceCreateTime?.toISOString() || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            tags: {},
            metadata: {
              engine: dbInstance.Engine,
              engine_version: dbInstance.EngineVersion,
              instance_class: dbInstance.DBInstanceClass,
              allocated_storage: dbInstance.AllocatedStorage,
              endpoint: dbInstance.Endpoint?.Address,
              port: dbInstance.Endpoint?.Port
            }
          });
        }
      }
    } catch (rdsError) {
      console.error("Error fetching RDS instances:", rdsError);
    }

    // Fetch S3 buckets
    try {
      const s3Response = await s3Client.send(new ListBucketsCommand({}));
      
      if (s3Response.Buckets) {
        for (const bucket of s3Response.Buckets) {
          resources.push({
            id: `aws-s3-${bucket.Name}`,
            cloud_account_id: accountId,
            resource_id: bucket.Name || `unknown-${Date.now()}`,
            name: bucket.Name || 'Unnamed Bucket',
            type: 'S3',
            region: 'global', // S3 buckets are global but have region constraints
            status: 'available',
            created_at: bucket.CreationDate?.toISOString() || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            tags: {},
            metadata: {
              creation_date: bucket.CreationDate?.toISOString()
            }
          });
        }
      }
    } catch (s3Error) {
      console.error("Error fetching S3 buckets:", s3Error);
    }
    
    return resources;
  } catch (error) {
    console.error("AWS SDK error:", error);
    throw new Error(`AWS resource sync failed: ${error.message}`);
  }
};

// Azure Resource Discovery with real SDK
const syncAzureResources = async (accountId: string, credentials: any) => {
  console.log("Starting Azure resource sync with real SDK...");
  
  try {
    const resources: any[] = [];
    
    // Configure Azure credentials
    const credential = new ClientSecretCredential(
      credentials.tenantId,
      credentials.clientId,
      credentials.clientSecret
    );
    
    const subscriptionId = credentials.subscriptionId;
    if (!subscriptionId) {
      throw new Error("Azure subscription ID is required");
    }
    
    // Configure Azure clients
    const computeClient = new ComputeManagementClient(credential, subscriptionId);
    const resourceClient = new ResourceManagementClient(credential, subscriptionId);
    const storageClient = new StorageManagementClient(credential, subscriptionId);

    // Fetch Virtual Machines
    try {
      const vmIterator = computeClient.virtualMachines.listAll();
      
      for await (const vm of vmIterator) {
        const resourceGroup = vm.id?.split('/')[4] || 'unknown';
        
        resources.push({
          id: `azure-vm-${vm.name}`,
          cloud_account_id: accountId,
          resource_id: vm.id || `unknown-${Date.now()}`,
          name: vm.name || 'Unnamed VM',
          type: 'VM',
          region: vm.location || 'unknown',
          status: vm.provisioningState || 'unknown',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tags: vm.tags || {},
          metadata: {
            vm_size: vm.hardwareProfile?.vmSize,
            os_type: vm.storageProfile?.osDisk?.osType,
            resource_group: resourceGroup,
            subscription_id: subscriptionId
          }
        });
      }
    } catch (vmError) {
      console.error("Error fetching Azure VMs:", vmError);
    }

    // Fetch Storage Accounts
    try {
      const storageIterator = storageClient.storageAccounts.list();
      
      for await (const storageAccount of storageIterator) {
        const resourceGroup = storageAccount.id?.split('/')[4] || 'unknown';
        
        resources.push({
          id: `azure-storage-${storageAccount.name}`,
          cloud_account_id: accountId,
          resource_id: storageAccount.id || `unknown-${Date.now()}`,
          name: storageAccount.name || 'Unnamed Storage Account',
          type: 'Storage Account',
          region: storageAccount.location || 'unknown',
          status: storageAccount.provisioningState || 'unknown',
          created_at: storageAccount.creationTime?.toISOString() || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tags: storageAccount.tags || {},
          metadata: {
            sku: storageAccount.sku?.name,
            kind: storageAccount.kind,
            resource_group: resourceGroup,
            subscription_id: subscriptionId,
            primary_endpoints: storageAccount.primaryEndpoints
          }
        });
      }
    } catch (storageError) {
      console.error("Error fetching Azure Storage Accounts:", storageError);
    }

    // Fetch Resource Groups (as resources themselves)
    try {
      const rgIterator = resourceClient.resourceGroups.list();
      
      for await (const rg of rgIterator) {
        resources.push({
          id: `azure-rg-${rg.name}`,
          cloud_account_id: accountId,
          resource_id: rg.id || `unknown-${Date.now()}`,
          name: rg.name || 'Unnamed Resource Group',
          type: 'Resource Group',
          region: rg.location || 'unknown',
          status: rg.provisioningState || 'unknown',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tags: rg.tags || {},
          metadata: {
            subscription_id: subscriptionId
          }
        });
      }
    } catch (rgError) {
      console.error("Error fetching Azure Resource Groups:", rgError);
    }
    
    return resources;
  } catch (error) {
    console.error("Azure SDK error:", error);
    throw new Error(`Azure resource sync failed: ${error.message}`);
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { accountId, provider, credentials } = await req.json();
    
    console.log(`Syncing resources for cloud account: ${accountId}`);
    console.log(`Provider: ${provider || "unknown"}`);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    let resources = [];
    
    if (provider === 'gcp' && credentials) {
      try {
        let serviceAccountKey;
        try {
          // Parse the service account key JSON
          serviceAccountKey = JSON.parse(credentials.serviceAccountKey);
        } catch (parseError) {
          throw new Error("Invalid service account key format: must be valid JSON");
        }

        // Initialize the Google Cloud Compute client
        const compute = new Compute({
          projectId: credentials.projectId,
          credentials: serviceAccountKey
        });

        // Get zones to fetch VM instances from
        const [zones] = await compute.getZones();
        
        // For each zone, fetch VM instances
        for (const zone of zones) {
          try {
            const [vms] = await zone.getVMs();
            vms.forEach(vm => {
              resources.push({
                id: `gcp-vm-${vm.id || vm.name}`,
                cloud_account_id: accountId,
                resource_id: vm.id || vm.name,
                name: vm.name,
                type: "VM",
                region: zone.name,
                status: vm.metadata.status ? vm.metadata.status.toLowerCase() : "unknown",
                created_at: vm.metadata.creationTimestamp || new Date().toISOString(),
                updated_at: new Date().toISOString(),
                tags: vm.metadata.tags?.items ? Object.fromEntries(vm.metadata.tags.items.map((tag: string) => [tag, 'true'])) : {},
                metadata: {
                  machine_type: vm.metadata.machineType?.split('/').pop(),
                  zone: zone.name,
                  network: vm.metadata.networkInterfaces?.[0]?.network?.split('/').pop() || 'default'
                }
              });
            });
          } catch (zoneError) {
            console.error(`Error fetching VMs from zone ${zone.name}:`, zoneError);
            // Continue to next zone
          }
        }

        console.log(`Found ${resources.length} GCP VMs across all zones`);
      } catch (gcpError) {
        return handleError(gcpError, "Failed to sync GCP resources");
      }
    } else if (provider === 'aws' && credentials) {
      try {
        resources = await syncAwsResources(accountId, credentials);
        console.log(`Found ${resources.length} AWS resources`);
      } catch (awsError) {
        return handleError(awsError, "Failed to sync AWS resources");
      }
    } else if (provider === 'azure' && credentials) {
      try {
        resources = await syncAzureResources(accountId, credentials);
        console.log(`Found ${resources.length} Azure resources`);
      } catch (azureError) {
        return handleError(azureError, "Failed to sync Azure resources");
      }
    }

    // Store discovered resources in the database
    let newResourcesCount = 0;
    let updatedResourcesCount = 0;
    let unchangedResourcesCount = 0;

    if (resources.length > 0) {
      console.log(`Storing ${resources.length} resources in database...`);
      
      for (const resource of resources) {
        try {
          // Check if resource already exists
          const { data: existingResource, error: selectError } = await supabase
            .from('cloud_resources')
            .select('id, updated_at')
            .eq('resource_id', resource.resource_id)
            .eq('cloud_account_id', accountId)
            .single();

          if (selectError && selectError.code !== 'PGRST116') {
            console.error("Error checking existing resource:", selectError);
            continue;
          }

          if (existingResource) {
            // Update existing resource
            const { error: updateError } = await supabase
              .from('cloud_resources')
              .update({
                name: resource.name,
                type: resource.type,
                region: resource.region,
                status: resource.status,
                updated_at: resource.updated_at,
                tags: resource.tags,
                metadata: resource.metadata
              })
              .eq('id', existingResource.id);

            if (updateError) {
              console.error("Error updating resource:", updateError);
            } else {
              updatedResourcesCount++;
            }
          } else {
            // Insert new resource
            const { error: insertError } = await supabase
              .from('cloud_resources')
              .insert([resource]);

            if (insertError) {
              console.error("Error inserting resource:", insertError);
            } else {
              newResourcesCount++;
            }
          }
        } catch (resourceError) {
          console.error("Error processing resource:", resourceError);
        }
      }
    }

    console.log(`Resource sync complete: ${newResourcesCount} new, ${updatedResourcesCount} updated, ${unchangedResourcesCount} unchanged`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced resources for account ${accountId}`,
        resources: resources,
        stats: {
          total: resources.length,
          new: newResourcesCount,
          updated: updatedResourcesCount,
          unchanged: unchangedResourcesCount
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    return handleError(error, "Error syncing cloud resources");
  }
});
