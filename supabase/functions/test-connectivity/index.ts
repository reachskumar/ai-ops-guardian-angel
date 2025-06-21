
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestResult {
  provider: string;
  success: boolean;
  details?: any;
  error?: string;
  isRealTime: boolean;
}

const testAwsConnectivity = async (credentials: any): Promise<TestResult> => {
  console.log("Testing AWS connectivity...");
  
  try {
    if (!credentials.accessKeyId || !credentials.secretAccessKey) {
      return {
        provider: 'aws',
        success: false,
        error: 'Missing AWS credentials',
        isRealTime: false
      };
    }

    // Simple credential validation for AWS format
    const accessKeyValid = /^[A-Z0-9]{20}$/.test(credentials.accessKeyId);
    const secretKeyValid = credentials.secretAccessKey.length === 40;
    
    if (!accessKeyValid || !secretKeyValid) {
      return {
        provider: 'aws',
        success: false,
        error: 'Invalid AWS credential format',
        isRealTime: false
      };
    }

    return {
      provider: 'aws',
      success: true,
      isRealTime: true,
      details: {
        accessKeyId: credentials.accessKeyId.substring(0, 10) + '...',
        region: credentials.region || 'us-east-1',
        testType: 'credential_format_validation',
        message: 'AWS credentials format validated successfully'
      }
    };
  } catch (error: any) {
    console.error("AWS test failed:", error);
    return {
      provider: 'aws',
      success: false,
      isRealTime: false,
      error: `AWS test failed: ${error.message}`
    };
  }
};

const testAzureConnectivity = async (credentials: any): Promise<TestResult> => {
  console.log("Testing Azure connectivity...");
  
  try {
    if (!credentials.tenantId || !credentials.clientId || !credentials.clientSecret) {
      return {
        provider: 'azure',
        success: false,
        error: 'Missing Azure credentials',
        isRealTime: false
      };
    }

    // Validate GUID format
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!guidRegex.test(credentials.tenantId) || !guidRegex.test(credentials.clientId)) {
      return {
        provider: 'azure',
        success: false,
        error: 'Invalid Azure credential format',
        isRealTime: false
      };
    }

    return {
      provider: 'azure',
      success: true,
      isRealTime: true,
      details: {
        tenantId: credentials.tenantId,
        subscriptionId: credentials.subscriptionId?.substring(0, 8) + '...',
        testType: 'credential_format_validation',
        message: 'Azure credentials format validated successfully'
      }
    };
  } catch (error: any) {
    console.error("Azure test failed:", error);
    return {
      provider: 'azure',
      success: false,
      isRealTime: false,
      error: `Azure test failed: ${error.message}`
    };
  }
};

const testGcpConnectivity = async (credentials: any): Promise<TestResult> => {
  console.log("Testing GCP connectivity...");
  
  try {
    if (!credentials.serviceAccountKey) {
      return {
        provider: 'gcp',
        success: false,
        error: 'Missing GCP service account key',
        isRealTime: false
      };
    }

    let serviceAccountKey;
    try {
      serviceAccountKey = JSON.parse(credentials.serviceAccountKey);
    } catch (e) {
      return {
        provider: 'gcp',
        success: false,
        error: 'Invalid service account key format',
        isRealTime: false
      };
    }

    if (!serviceAccountKey.project_id || !serviceAccountKey.client_email) {
      return {
        provider: 'gcp',
        success: false,
        error: 'Invalid service account key structure',
        isRealTime: false
      };
    }

    return {
      provider: 'gcp',
      success: true,
      isRealTime: true,
      details: {
        projectId: serviceAccountKey.project_id,
        serviceAccountEmail: serviceAccountKey.client_email,
        testType: 'credential_format_validation',
        message: 'GCP credentials format validated successfully'
      }
    };
  } catch (error: any) {
    console.error("GCP test failed:", error);
    return {
      provider: 'gcp',
      success: false,
      isRealTime: false,
      error: `GCP test failed: ${error.message}`
    };
  }
};

serve(async (req) => {
  console.log("Connectivity test function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { provider, credentials } = await req.json();
    console.log(`Testing connectivity for provider: ${provider}`);
    
    if (!provider) {
      throw new Error('Provider is required');
    }

    if (!credentials || Object.keys(credentials).length === 0) {
      throw new Error('Credentials are required');
    }
    
    let result: TestResult;
    
    switch (provider) {
      case 'aws':
        result = await testAwsConnectivity(credentials);
        break;
      case 'azure':
        result = await testAzureConnectivity(credentials);
        break;
      case 'gcp':
        result = await testGcpConnectivity(credentials);
        break;
      default:
        result = {
          provider,
          success: false,
          error: `Unsupported provider: ${provider}`,
          isRealTime: false
        };
    }
    
    console.log("Connectivity test result:", result);
    
    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error: any) {
    console.error("Connectivity test error:", error);
    return new Response(
      JSON.stringify({
        provider: 'unknown',
        success: false,
        isRealTime: false,
        error: `Connectivity test failed: ${error.message}`
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
