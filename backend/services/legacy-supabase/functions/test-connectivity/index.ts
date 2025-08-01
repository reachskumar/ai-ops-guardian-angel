
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// Import AWS SDK v3
import { STSClient, GetCallerIdentityCommand } from "https://esm.sh/@aws-sdk/client-sts@3.462.0";
import { EC2Client, DescribeRegionsCommand } from "https://esm.sh/@aws-sdk/client-ec2@3.462.0";

// Import Azure SDK
import { TokenCredential } from "https://esm.sh/@azure/identity@4.0.0";
import { SubscriptionClient } from "https://esm.sh/@azure/arm-subscriptions@5.1.0";

// Import GCP SDK
import { JWT } from "https://esm.sh/google-auth-library@9.0.0";

const handleError = (error: any, message: string) => {
  console.error(message, error);
  return new Response(
    JSON.stringify({
      success: false,
      error: `${message}: ${error.message || 'Unknown error'}`,
      timestamp: new Date().toISOString()
    }),
    {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
};

// AWS Connectivity Test
const testAwsConnectivity = async (credentials: any) => {
  try {
    const config = {
      region: credentials.region || 'us-east-1',
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        ...(credentials.sessionToken && { sessionToken: credentials.sessionToken })
      }
    };

    // Test STS GetCallerIdentity
    const stsClient = new STSClient(config);
    const identityCommand = new GetCallerIdentityCommand({});
    const identityResult = await stsClient.send(identityCommand);

    // Test EC2 access
    const ec2Client = new EC2Client(config);
    const regionsCommand = new DescribeRegionsCommand({});
    const regionsResult = await ec2Client.send(regionsCommand);

    return {
      provider: 'aws',
      status: 'connected',
      account: identityResult.Account,
      arn: identityResult.Arn,
      userId: identityResult.UserId,
      regions: regionsResult.Regions?.length || 0,
      timestamp: new Date().toISOString(),
      capabilities: {
        compute: true,
        storage: true,
        networking: true,
        costManagement: true,
        monitoring: true
      }
    };
  } catch (error) {
    throw new Error(`AWS connectivity failed: ${error.message}`);
  }
};

// Azure Connectivity Test
const testAzureConnectivity = async (credentials: any) => {
  try {
    // Create a simple auth test using REST API
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${credentials.tenantId}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'client_id': credentials.clientId,
        'client_secret': credentials.clientSecret,
        'scope': 'https://management.azure.com/.default',
        'grant_type': 'client_credentials'
      })
    });

    if (!tokenResponse.ok) {
      throw new Error(`Azure authentication failed: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Test subscription access
    const subscriptionResponse = await fetch(`https://management.azure.com/subscriptions/${credentials.subscriptionId}?api-version=2020-01-01`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!subscriptionResponse.ok) {
      throw new Error(`Azure subscription access failed: ${subscriptionResponse.statusText}`);
    }

    const subscriptionData = await subscriptionResponse.json();

    return {
      provider: 'azure',
      status: 'connected',
      subscriptionId: subscriptionData.subscriptionId,
      subscriptionName: subscriptionData.displayName,
      tenantId: credentials.tenantId,
      timestamp: new Date().toISOString(),
      capabilities: {
        compute: true,
        storage: true,
        networking: true,
        costManagement: true,
        monitoring: true
      }
    };
  } catch (error) {
    throw new Error(`Azure connectivity failed: ${error.message}`);
  }
};

// GCP Connectivity Test
const testGcpConnectivity = async (credentials: any) => {
  try {
    // Create JWT client for authentication
    const client = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/cloud-platform.read-only']
    });

    // Get access token
    const accessToken = await client.authorize();

    // Test project access
    const projectResponse = await fetch(`https://cloudresourcemanager.googleapis.com/v1/projects/${credentials.project_id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!projectResponse.ok) {
      throw new Error(`GCP project access failed: ${projectResponse.statusText}`);
    }

    const projectData = await projectResponse.json();

    return {
      provider: 'gcp',
      status: 'connected',
      projectId: projectData.projectId,
      projectName: projectData.name,
      projectNumber: projectData.projectNumber,
      timestamp: new Date().toISOString(),
      capabilities: {
        compute: true,
        storage: true,
        networking: true,
        costManagement: true,
        monitoring: true
      }
    };
  } catch (error) {
    throw new Error(`GCP connectivity failed: ${error.message}`);
  }
};

// Store connection results in database
const storeConnectionResult = async (supabase: any, accountData: any, result: any) => {
  try {
    const { error } = await supabase
      .from('cloud_accounts')
      .upsert({
        id: accountData.id || crypto.randomUUID(),
        user_id: accountData.user_id,
        provider: result.provider,
        account_name: accountData.name,
        account_identifier: result.account || result.subscriptionId || result.projectId,
        status: result.status,
        last_sync: result.timestamp,
        connection_details: result,
        credentials: null, // Never store raw credentials
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error('Database storage error:', error);
    }
  } catch (error) {
    console.error('Failed to store connection result:', error);
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { provider, credentials, accountData } = await req.json();

    if (!provider || !credentials) {
      throw new Error('Provider and credentials are required');
    }

    console.log(`Testing connectivity for ${provider}...`);

    let result;
    switch (provider.toLowerCase()) {
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
        throw new Error(`Unsupported provider: ${provider}`);
    }

    // Store the result in database if account data is provided
    if (accountData && accountData.user_id) {
      await storeConnectionResult(supabase, accountData, result);
    }

    console.log(`✅ ${provider} connectivity test successful`);

    return new Response(
      JSON.stringify({
        success: true,
        result,
        message: `Successfully connected to ${provider}`,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error('Connectivity test error:', error);
    return handleError(error, "Connectivity test failed");
  }
});
