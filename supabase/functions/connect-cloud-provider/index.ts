
// Connect Cloud Provider Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { v4 as uuidv4 } from "https://esm.sh/uuid@9.0.0";

// Import AWS SDK for validation
import { IAMClient, ListRolesCommand } from "https://esm.sh/@aws-sdk/client-iam@3.350.0";

// Import Azure SDK for validation
import { DefaultAzureCredential } from "https://esm.sh/@azure/identity@3.1.3";
import { SubscriptionClient } from "https://esm.sh/@azure/arm-subscriptions@3.1.1";

// Import GCP SDK for validation
import { Compute } from "https://esm.sh/@google-cloud/compute@4.1.0";

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
    const { provider, credentials, name } = await req.json();
    
    console.log(`Validating credentials for ${provider} account "${name}"`);
    
    if (provider === 'aws') {
      try {
        // Validate AWS credentials by making a simple API call
        const client = new IAMClient({ 
          region: credentials.region || 'us-east-1',
          credentials: {
            accessKeyId: credentials.accessKeyId,
            secretAccessKey: credentials.secretAccessKey
          }
        });
        
        // List roles to test access
        const command = new ListRolesCommand({
          MaxItems: 1  // Just get one role to minimize data transfer
        });
        
        await client.send(command);
        
        console.log("AWS credentials validated successfully");
        
        // Generate unique ID for this account
        const accountId = `aws-${uuidv4()}`;
        
        return new Response(
          JSON.stringify({
            success: true,
            accountId,
            message: "AWS credentials validated successfully"
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      } catch (awsError) {
        return handleError(awsError, "Failed to validate AWS credentials");
      }
    } else if (provider === 'azure') {
      try {
        // Validate Azure credentials
        const credential = new DefaultAzureCredential({
          tenantId: credentials.tenantId,
          clientId: credentials.clientId,
          clientSecret: credentials.clientSecret
        });
        
        const client = new SubscriptionClient(credential);
        
        // List subscriptions to test access
        const result = await client.subscriptions.list();
        
        console.log("Azure credentials validated successfully");
        
        // Generate unique ID for this account
        const accountId = `azure-${uuidv4()}`;
        
        return new Response(
          JSON.stringify({
            success: true,
            accountId,
            message: "Azure credentials validated successfully"
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      } catch (azureError) {
        return handleError(azureError, "Failed to validate Azure credentials");
      }
    } else if (provider === 'gcp') {
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

        // Get zones to test access
        const [zones] = await compute.getZones({ maxResults: 1 });
        
        console.log("GCP credentials validated successfully");
        
        // Generate unique ID for this account
        const accountId = `gcp-${uuidv4()}`;
        
        return new Response(
          JSON.stringify({
            success: true,
            accountId,
            message: "GCP credentials validated successfully"
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      } catch (gcpError) {
        return handleError(gcpError, "Failed to validate GCP credentials");
      }
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Unsupported cloud provider: ${provider}`
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
  } catch (error) {
    return handleError(error, "Error connecting to cloud provider");
  }
});
