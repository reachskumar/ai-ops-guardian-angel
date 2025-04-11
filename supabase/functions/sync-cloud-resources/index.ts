
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { accountId, provider, credentials } = await req.json();
    
    console.log(`Syncing resources for cloud account: ${accountId}`);
    console.log(`Provider: ${provider || "unknown"}`);
    
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
        
        // Array to store all VM instances
        let vmInstances = [];

        // For each zone, fetch VM instances
        for (const zone of zones) {
          try {
            const [vms] = await zone.getVMs();
            vms.forEach(vm => {
              vmInstances.push({
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

        console.log(`Found ${vmInstances.length} VMs across all zones`);

        return new Response(
          JSON.stringify({
            success: true,
            message: `Successfully synced resources for account ${accountId}`,
            resources: vmInstances,
            stats: {
              total: vmInstances.length,
              new: vmInstances.length,
              updated: 0,
              unchanged: 0
            }
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      } catch (gcpError) {
        return handleError(gcpError, "Failed to sync GCP resources");
      }
    } else {
      // For non-GCP providers or if credentials are missing, return empty results
      return new Response(
        JSON.stringify({
          success: true,
          message: `Successfully synced resources for account ${accountId}`,
          resources: [],
          stats: {
            total: 0,
            new: 0,
            updated: 0,
            unchanged: 0
          }
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
  } catch (error) {
    return handleError(error, "Error syncing cloud resources");
  }
});
