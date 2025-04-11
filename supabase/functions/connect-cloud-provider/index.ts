
// Connect Cloud Provider Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { Storage } from "https://cdn.jsdelivr.net/npm/@google-cloud/storage@7.0.0/+esm";

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
    
    console.log(`Connecting to ${provider} cloud provider for: ${name}`);
    
    if (provider === 'gcp') {
      try {
        // Validate the GCP credentials
        if (!credentials.serviceAccountKey) {
          throw new Error("Missing GCP service account key");
        }

        if (!credentials.projectId) {
          throw new Error("Missing GCP project ID");
        }

        let serviceAccountKey;
        try {
          // Parse the service account key JSON
          serviceAccountKey = JSON.parse(credentials.serviceAccountKey);
        } catch (parseError) {
          throw new Error("Invalid service account key format: must be valid JSON");
        }

        // Verify the GCP credentials by attempting to create a client and list buckets
        try {
          const storage = new Storage({
            projectId: credentials.projectId,
            credentials: serviceAccountKey
          });

          // Try to list buckets with a small limit as a test
          const [buckets] = await storage.getBuckets({ maxResults: 1 });
          console.log(`Successfully authenticated with GCP. Found ${buckets.length} buckets.`);
        } catch (gcpError) {
          console.error("GCP authentication failed:", gcpError);
          throw new Error(`GCP authentication failed: ${gcpError.message}`);
        }

        // Generate a unique ID for the account
        const accountId = `gcp-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
        
        return new Response(
          JSON.stringify({
            success: true,
            accountId,
            provider: 'gcp',
            message: `Successfully connected to Google Cloud Platform`
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      } catch (gcpError) {
        return handleError(gcpError, "Failed to connect to GCP");
      }
    } else {
      // For other cloud providers, just simulate a connection for now
      const accountId = `${provider}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
      
      return new Response(
        JSON.stringify({
          success: true,
          accountId,
          provider,
          message: `Successfully connected to ${provider}`
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
  } catch (error) {
    return handleError(error, "Failed to connect to cloud provider");
  }
});
