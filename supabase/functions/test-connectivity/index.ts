
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  console.log("=== Test Connectivity Function Called ===");
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);
  console.log("Headers:", Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }
  
  try {
    console.log("Processing connectivity test request...");
    
    let requestBody;
    try {
      const bodyText = await req.text();
      console.log("Raw request body:", bodyText);
      requestBody = JSON.parse(bodyText);
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
    console.log("Credentials received:", credentials ? Object.keys(credentials) : 'No credentials');
    
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
    
    let result = {
      provider,
      success: false,
      isRealTime: true,
      details: {},
      error: ''
    };
    
    // Real cloud provider API testing
    switch (provider) {
      case 'aws':
        console.log("Testing AWS connectivity with real API...");
        result = await testAwsConnectivity(credentials);
        break;
        
      case 'azure':
        console.log("Testing Azure connectivity with real API...");
        result = await testAzureConnectivity(credentials);
        break;
        
      case 'gcp':
        console.log("Testing GCP connectivity with real API...");
        result = await testGcpConnectivity(credentials);
        break;
        
      default:
        console.error(`Unsupported provider: ${provider}`);
        result.error = `Unsupported provider: ${provider}`;
        result.success = false;
    }
    
    console.log("Connectivity test result:", result);
    
    return new Response(
      JSON.stringify(result),
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

// Real AWS connectivity testing using AWS STS API
async function testAwsConnectivity(credentials: Record<string, string>) {
  try {
    console.log("Starting AWS connectivity test...");
    const { accessKeyId, secretAccessKey, region = 'us-east-1' } = credentials;
    
    if (!accessKeyId || !secretAccessKey) {
      console.error("Missing AWS credentials");
      return {
        provider: 'aws',
        success: false,
        isRealTime: true,
        error: 'Missing AWS credentials (accessKeyId, secretAccessKey)'
      };
    }
    
    console.log(`Testing with Access Key: ${accessKeyId.substring(0, 10)}...`);
    
    // Create AWS signature for STS GetCallerIdentity
    const service = 'sts';
    const host = `${service}.${region}.amazonaws.com`;
    const endpoint = `https://${host}/`;
    
    const now = new Date();
    const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, '');
    const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
    
    console.log(`Making request to AWS STS: ${endpoint}`);
    
    // Create canonical request
    const method = 'POST';
    const canonicalUri = '/';
    const canonicalQuerystring = '';
    const payload = 'Action=GetCallerIdentity&Version=2011-06-15';
    const payloadHash = await sha256(payload);
    
    const canonicalHeaders = [
      `host:${host}`,
      `x-amz-date:${amzDate}`
    ].join('\n') + '\n';
    
    const signedHeaders = 'host;x-amz-date';
    
    const canonicalRequest = [
      method,
      canonicalUri,
      canonicalQuerystring,
      canonicalHeaders,
      signedHeaders,
      payloadHash
    ].join('\n');
    
    // Create string to sign
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = [
      algorithm,
      amzDate,
      credentialScope,
      await sha256(canonicalRequest)
    ].join('\n');
    
    // Calculate signature
    const signingKey = await getSignatureKey(secretAccessKey, dateStamp, region, service);
    const signature = await hmacSha256(signingKey, stringToSign);
    
    // Create authorization header
    const authorizationHeader = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
    
    console.log("Making authenticated request to AWS STS...");
    
    // Make the API call
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': authorizationHeader,
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'X-Amz-Date': amzDate,
        'Host': host
      },
      body: payload
    });
    
    console.log(`AWS STS Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.text();
      console.log("AWS STS response received successfully");
      
      // Extract account ID from response
      const accountMatch = data.match(/<Account>(\d+)<\/Account>/);
      const userIdMatch = data.match(/<UserId>([^<]+)<\/UserId>/);
      const arnMatch = data.match(/<Arn>([^<]+)<\/Arn>/);
      
      return {
        provider: 'aws',
        success: true,
        isRealTime: true,
        details: {
          accountId: accountMatch ? accountMatch[1] : 'Unknown',
          userId: userIdMatch ? userIdMatch[1] : 'Unknown',
          arn: arnMatch ? arnMatch[1] : 'Unknown',
          region: region,
          testType: 'real_api_call',
          message: 'Successfully authenticated with AWS STS API',
          accessKeyId: accessKeyId.substring(0, 10) + '***'
        }
      };
    } else {
      const errorText = await response.text();
      console.error("AWS API error:", response.status, errorText);
      
      return {
        provider: 'aws',
        success: false,
        isRealTime: true,
        error: `AWS API error (${response.status}): ${errorText.substring(0, 200)}`
      };
    }
    
  } catch (error) {
    console.error("AWS connectivity test error:", error);
    return {
      provider: 'aws',
      success: false,
      isRealTime: true,
      error: `AWS test failed: ${error.message}`
    };
  }
}

// Real Azure connectivity testing using Azure Resource Manager API
async function testAzureConnectivity(credentials: Record<string, string>) {
  try {
    console.log("Starting Azure connectivity test...");
    const { tenantId, clientId, clientSecret, subscriptionId } = credentials;
    
    if (!tenantId || !clientId || !clientSecret) {
      return {
        provider: 'azure',
        success: false,
        isRealTime: true,
        error: 'Missing Azure credentials (tenantId, clientId, clientSecret)'
      };
    }
    
    console.log(`Testing Azure with Tenant: ${tenantId}`);
    
    // Get access token from Azure AD
    const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const tokenParams = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'https://management.azure.com/.default'
    });
    
    console.log("Getting Azure access token...");
    
    const tokenResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Azure token error:", tokenResponse.status, errorText);
      return {
        provider: 'azure',
        success: false,
        isRealTime: true,
        error: `Azure authentication failed (${tokenResponse.status}): ${errorText.substring(0, 200)}`
      };
    }
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    console.log("Azure access token obtained, testing API...");
    
    // Test API call to get subscription info (if provided) or just verify token works
    let apiTestUrl = 'https://management.azure.com/subscriptions?api-version=2020-01-01';
    if (subscriptionId) {
      apiTestUrl = `https://management.azure.com/subscriptions/${subscriptionId}?api-version=2020-01-01`;
    }
    
    const apiResponse = await fetch(apiTestUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (apiResponse.ok) {
      const data = await apiResponse.json();
      console.log("Azure API test successful");
      
      return {
        provider: 'azure',
        success: true,
        isRealTime: true,
        details: {
          tenantId: tenantId,
          subscriptionId: subscriptionId || 'Not specified',
          testType: 'real_api_call',
          message: 'Successfully authenticated with Azure Resource Manager API'
        }
      };
    } else {
      const errorText = await apiResponse.text();
      console.error("Azure API error:", apiResponse.status, errorText);
      
      return {
        provider: 'azure',
        success: false,
        isRealTime: true,
        error: `Azure API error (${apiResponse.status}): ${errorText.substring(0, 200)}`
      };
    }
    
  } catch (error) {
    console.error("Azure connectivity test error:", error);
    return {
      provider: 'azure',
      success: false,
      isRealTime: true,
      error: `Azure test failed: ${error.message}`
    };
  }
}

// Real GCP connectivity testing using Google Cloud Resource Manager API
async function testGcpConnectivity(credentials: Record<string, string>) {
  try {
    console.log("Starting GCP connectivity test...");
    const { serviceAccountKey } = credentials;
    
    if (!serviceAccountKey) {
      return {
        provider: 'gcp',
        success: false,
        isRealTime: true,
        error: 'Missing GCP service account key'
      };
    }
    
    let parsedKey;
    try {
      parsedKey = JSON.parse(serviceAccountKey);
    } catch (parseError) {
      return {
        provider: 'gcp',
        success: false,
        isRealTime: true,
        error: 'Invalid service account key format - must be valid JSON'
      };
    }
    
    const { client_email, private_key, project_id } = parsedKey;
    
    if (!client_email || !private_key || !project_id) {
      return {
        provider: 'gcp',
        success: false,
        isRealTime: true,
        error: 'Invalid service account key - missing required fields (client_email, private_key, project_id)'
      };
    }
    
    console.log(`Testing GCP with Project: ${project_id}`);
    
    // For now, return a simulated success since proper JWT signing is complex
    // In a production environment, you'd implement proper JWT signing with the private key
    return {
      provider: 'gcp',
      success: false,
      isRealTime: true,
      error: 'GCP real-time testing not fully implemented yet - JWT signing required'
    };
    
  } catch (error) {
    console.error("GCP connectivity test error:", error);
    return {
      provider: 'gcp',
      success: false,
      isRealTime: true,
      error: `GCP test failed: ${error.message}`
    };
  }
}

// Crypto helper functions for AWS signatures
async function sha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSha256(key: Uint8Array, message: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message));
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string): Promise<Uint8Array> {
  const kDate = await hmacSha256Raw(new TextEncoder().encode('AWS4' + key), dateStamp);
  const kRegion = await hmacSha256Raw(kDate, regionName);
  const kService = await hmacSha256Raw(kRegion, serviceName);
  const kSigning = await hmacSha256Raw(kService, 'aws4_request');
  return kSigning;
}

async function hmacSha256Raw(key: Uint8Array, message: string): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message));
  return new Uint8Array(signature);
}
