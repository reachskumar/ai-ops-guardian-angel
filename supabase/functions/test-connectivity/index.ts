
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

console.log("Test connectivity function starting up...");

serve(async (req) => {
  console.log(`=== Test Connectivity Function Called ===`);
  console.log(`Request method: ${req.method}`);
  console.log(`Request URL: ${req.url}`);
  console.log(`Function is running and responding!`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }
  
  try {
    // Simple test response to verify function is working
    if (req.method === 'GET') {
      console.log("GET request - returning test response");
      return new Response(
        JSON.stringify({
          message: "Test connectivity function is working!",
          timestamp: new Date().toISOString(),
          method: req.method
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Handle POST requests for actual connectivity testing
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    console.log("Processing POST request for connectivity test...");
    
    let requestBody;
    try {
      const bodyText = await req.text();
      console.log("Raw request body received");
      if (bodyText) {
        requestBody = JSON.parse(bodyText);
      } else {
        requestBody = {};
      }
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({
          provider: 'unknown',
          success: false,
          isRealTime: false,
          error: 'Invalid request body - must be valid JSON'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    const { provider, credentials } = requestBody;
    console.log(`Testing connectivity for provider: ${provider}`);
    
    if (!provider) {
      console.error("No provider specified");
      return new Response(
        JSON.stringify({
          provider: 'unknown',
          success: false,
          isRealTime: false,
          error: 'Provider is required'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    if (!credentials || Object.keys(credentials).length === 0) {
      console.error("No credentials provided");
      return new Response(
        JSON.stringify({
          provider,
          success: false,
          isRealTime: false,
          error: 'Credentials are required'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // For now, return a simple validation response
    // Real API testing can be added later once the basic function is working
    console.log("Returning validation response for now");
    
    return new Response(
      JSON.stringify({
        provider,
        success: true,
        isRealTime: false,
        details: {
          testType: 'basic_validation',
          message: `Function is working. Provider: ${provider}`,
          timestamp: new Date().toISOString(),
          note: 'Full API testing will be implemented once basic function deployment is confirmed'
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
    
  } catch (error) {
    console.error("Connectivity test error:", error);
    return new Response(
      JSON.stringify({
        provider: 'unknown',
        success: false,
        isRealTime: false,
        error: `Test failed: ${error.message}`
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
