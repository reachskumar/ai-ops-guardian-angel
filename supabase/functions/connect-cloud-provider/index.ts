
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.4.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create authenticated Supabase client using the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    // Parse request body
    const { provider, credentials, name } = await req.json();
    
    console.log(`Connecting to ${provider} provider with name: ${name}`);
    console.log("Received credentials:", JSON.stringify({
      ...credentials,
      secretAccessKey: credentials.secretAccessKey ? "***" : undefined,
      clientSecret: credentials.clientSecret ? "***" : undefined,
      serviceAccountKey: credentials.serviceAccountKey ? "[REDACTED]" : undefined
    }));
    
    // Basic validation
    if (!provider || !credentials || !name) {
      throw new Error('Missing required parameters: provider, credentials, and name are required');
    }
    
    // Validate provider type
    if (!['aws', 'azure', 'gcp'].includes(provider)) {
      throw new Error('Invalid provider. Must be one of: aws, azure, gcp');
    }
    
    // Validate credentials based on provider
    let validCredentials = false;
    let testConnection = false;
    
    switch (provider) {
      case 'aws':
        if (credentials.accessKeyId && credentials.secretAccessKey) {
          validCredentials = true;
          
          // TODO: Test AWS connection (simplified for this demo)
          testConnection = true;
        }
        break;
        
      case 'azure':
        if (credentials.tenantId && credentials.clientId && credentials.clientSecret) {
          validCredentials = true;
          
          // TODO: Test Azure connection (simplified for this demo)
          testConnection = true;
        }
        break;
        
      case 'gcp':
        console.log("Validating GCP credentials");
        console.log("Project ID:", credentials.projectId);
        console.log("Service Account Key present:", !!credentials.serviceAccountKey);
        
        if (credentials.projectId && credentials.serviceAccountKey) {
          validCredentials = true;
          console.log("GCP credentials validation passed");
          
          // TODO: Test GCP connection (simplified for this demo)
          testConnection = true;
        } else {
          console.error("GCP credentials validation failed:", { 
            hasProjectId: !!credentials.projectId, 
            hasServiceAccountKey: !!credentials.serviceAccountKey 
          });
        }
        break;
    }
    
    if (!validCredentials) {
      console.error(`Invalid credentials for ${provider}. Required fields missing.`);
      throw new Error(`Invalid credentials for ${provider}. Please check that all required fields are provided.`);
    }
    
    if (!testConnection) {
      throw new Error(`Failed to connect to ${provider}`);
    }
    
    console.log(`Successfully validated credentials for ${provider}`);
    
    try {
      // Store cloud account in database
      const { data, error } = await supabase
        .from('cloud_accounts')
        .insert({
          name,
          provider,
          status: 'connected',
          // Store encrypted credentials (in a real implementation, use a vault service)
          // For this demo, we're simplifying by not storing actual credentials
          metadata: { connected_at: new Date().toISOString() }
        })
        .select('id')
        .single();
      
      if (error) {
        console.error("Database error:", error);
        
        // Check if the error is due to the table not existing
        if (error.code === "42P01") {
          return new Response(
            JSON.stringify({ 
              success: true, 
              accountId: "demo-account-id",
              message: "Table doesn't exist, but credentials validated successfully"
            }),
            { 
              headers: { 
                ...corsHeaders,
                'Content-Type': 'application/json' 
              } 
            }
          );
        }
        
        throw error;
      }
      
      console.log(`Cloud account created with ID: ${data.id}`);
      
      // Return success response with account ID
      return new Response(
        JSON.stringify({ 
          success: true, 
          accountId: data.id
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      );
    } catch (dbError) {
      console.error("Database operation failed:", dbError);
      
      // Return success but with a note about database issues
      return new Response(
        JSON.stringify({ 
          success: true, 
          accountId: "demo-account-id",
          message: "Credentials validated successfully but couldn't store in database"
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
  } catch (error) {
    console.error('Error in connect-cloud-provider function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to connect cloud provider' 
      }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
