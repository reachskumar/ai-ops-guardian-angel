
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { validateGcpCredentials, validateAwsCredentials, validateAzureCredentials } from "../_shared/credential-helpers.ts";

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
    
    console.log(`Connecting to ${provider} with name "${name}"`);
    
    let isValid = false;
    let validationError = '';
    
    // Validate credentials based on provider
    switch (provider) {
      case 'gcp':
        if (!credentials.serviceAccountKey) {
          validationError = 'Missing GCP service account key';
        } else {
          try {
            const serviceAccountKey = JSON.parse(credentials.serviceAccountKey);
            isValid = validateGcpCredentials(serviceAccountKey);
            if (!isValid) {
              validationError = 'Invalid GCP service account key format';
            }
          } catch (error) {
            validationError = 'Invalid JSON format for service account key';
          }
        }
        break;
        
      case 'aws':
        isValid = validateAwsCredentials(credentials);
        if (!isValid) {
          validationError = 'Invalid AWS credentials';
        }
        break;
        
      case 'azure':
        isValid = validateAzureCredentials(credentials);
        if (!isValid) {
          validationError = 'Invalid Azure credentials';
        }
        break;
        
      default:
        validationError = `Unsupported provider: ${provider}`;
    }
    
    if (!isValid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: validationError
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Generate a unique account ID
    const accountId = crypto.randomUUID();
    
    console.log(`Successfully validated ${provider} credentials for account ${accountId}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        accountId: accountId,
        message: `Successfully connected to ${provider}`,
        provider: provider,
        name: name
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    return handleError(error, "Error connecting cloud provider");
  }
});
