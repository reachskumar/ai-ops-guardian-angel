
// Sync Cloud Resources Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

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

// AWS Resource Discovery
const syncAwsResources = async (accountId: string, credentials: any) => {
  console.log("Starting AWS resource sync...");
  
  // For now, return mock AWS resources until AWS SDK integration is complete
  // This provides a foundation for real AWS integration
  const mockAwsResources = [
    {
      id: `aws-ec2-${Date.now()}-1`,
      cloud_account_id: accountId,
      resource_id: `i-${Math.random().toString(36).substr(2, 9)}`,
      name: "web-server-prod",
      type: "EC2",
      region: credentials.region || "us-east-1",
      status: "running",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: { Environment: "production", Team: "web" },
      metadata: {
        instance_type: "t3.medium",
        vpc_id: "vpc-12345678",
        subnet_id: "subnet-87654321"
      }
    },
    {
      id: `aws-rds-${Date.now()}-2`,
      cloud_account_id: accountId,
      resource_id: `db-${Math.random().toString(36).substr(2, 9)}`,
      name: "main-database",
      type: "RDS",
      region: credentials.region || "us-east-1",
      status: "available",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: { Environment: "production", Database: "mysql" },
      metadata: {
        engine: "mysql",
        engine_version: "8.0.35",
        instance_class: "db.t3.micro"
      }
    }
  ];
  
  return mockAwsResources;
};

// Azure Resource Discovery
const syncAzureResources = async (accountId: string, credentials: any) => {
  console.log("Starting Azure resource sync...");
  
  // For now, return mock Azure resources until Azure SDK integration is complete
  const mockAzureResources = [
    {
      id: `azure-vm-${Date.now()}-1`,
      cloud_account_id: accountId,
      resource_id: `/subscriptions/${credentials.subscriptionId || 'sub-123'}/resourceGroups/rg-prod/providers/Microsoft.Compute/virtualMachines/vm-web-01`,
      name: "vm-web-01",
      type: "VM",
      region: "eastus",
      status: "running",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: { environment: "production", team: "platform" },
      metadata: {
        vm_size: "Standard_B2s",
        os_type: "Linux",
        resource_group: "rg-prod"
      }
    },
    {
      id: `azure-storage-${Date.now()}-2`,
      cloud_account_id: accountId,
      resource_id: `/subscriptions/${credentials.subscriptionId || 'sub-123'}/resourceGroups/rg-prod/providers/Microsoft.Storage/storageAccounts/storageacct01`,
      name: "storageacct01",
      type: "Storage Account",
      region: "eastus",
      status: "available",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: { environment: "production" },
      metadata: {
        sku: "Standard_LRS",
        kind: "StorageV2",
        resource_group: "rg-prod"
      }
    }
  ];
  
  return mockAzureResources;
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

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced resources for account ${accountId}`,
        resources: resources,
        stats: {
          total: resources.length,
          new: resources.length,
          updated: 0,
          unchanged: 0
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
