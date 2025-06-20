
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Import AWS SDK for testing
import { STSClient, GetCallerIdentityCommand } from "https://esm.sh/@aws-sdk/client-sts@3.462.0";
import { EC2Client, DescribeInstancesCommand } from "https://esm.sh/@aws-sdk/client-ec2@3.462.0";

// Import Azure SDK for testing
import { ClientSecretCredential } from "https://esm.sh/@azure/identity@4.0.0";
import { ResourceManagementClient } from "https://esm.sh/@azure/arm-resources@5.2.0";

// Import Google Auth for testing
import { GoogleAuth } from "https://esm.sh/google-auth-library@9.4.0";

interface TestResult {
  provider: string;
  success: boolean;
  details?: any;
  error?: string;
}

const testAwsConnectivity = async (credentials: any): Promise<TestResult> => {
  console.log("Testing AWS connectivity...");
  
  try {
    // Validate required credentials
    if (!credentials.accessKeyId || !credentials.secretAccessKey) {
      return {
        provider: 'aws',
        success: false,
        error: 'Missing required AWS credentials (accessKeyId or secretAccessKey)'
      };
    }

    // Test 1: Basic credential validation with STS
    const stsConfig = {
      region: credentials.region || 'us-east-1',
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        ...(credentials.sessionToken && { sessionToken: credentials.sessionToken })
      }
    };
    
    const stsClient = new STSClient(stsConfig);
    const stsCommand = new GetCallerIdentityCommand({});
    const stsResponse = await stsClient.send(stsCommand);
    
    console.log("AWS STS test successful:", stsResponse);
    
    // Test 2: Basic EC2 permissions check
    try {
      const ec2Client = new EC2Client(stsConfig);
      const ec2Command = new DescribeInstancesCommand({ MaxResults: 5 });
      const ec2Response = await ec2Client.send(ec2Command);
      
      console.log("AWS EC2 test successful. Found reservations:", ec2Response.Reservations?.length || 0);
      
      return {
        provider: 'aws',
        success: true,
        details: {
          accountId: stsResponse.Account,
          userId: stsResponse.UserId,
          arn: stsResponse.Arn,
          region: credentials.region || 'us-east-1',
          ec2Reservations: ec2Response.Reservations?.length || 0,
          hasEc2Access: true
        }
      };
    } catch (ec2Error: any) {
      console.log("EC2 access limited, but STS successful:", ec2Error.message);
      // STS worked, but EC2 might not have permissions - that's still a valid connection
      return {
        provider: 'aws',
        success: true,
        details: {
          accountId: stsResponse.Account,
          userId: stsResponse.UserId,
          arn: stsResponse.Arn,
          region: credentials.region || 'us-east-1',
          hasEc2Access: false,
          ec2Warning: 'Limited EC2 permissions, but connection is valid'
        }
      };
    }
  } catch (error: any) {
    console.error("AWS connectivity test failed:", error);
    return {
      provider: 'aws',
      success: false,
      error: `AWS connectivity failed: ${error.message}`
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
        error: 'Missing required Azure credentials (tenantId, clientId, or clientSecret)'
      };
    }

    const credential = new ClientSecretCredential(
      credentials.tenantId,
      credentials.clientId,
      credentials.clientSecret
    );
    
    const subscriptionId = credentials.subscriptionId;
    if (!subscriptionId) {
      return {
        provider: 'azure',
        success: false,
        error: 'Missing Azure subscription ID'
      };
    }

    const resourceClient = new ResourceManagementClient(credential, subscriptionId);
    
    // Try to list resource groups as a connectivity test
    const rgIterator = resourceClient.resourceGroups.list();
    const firstResult = await rgIterator.next();
    
    console.log("Azure connectivity test successful");
    
    return {
      provider: 'azure',
      success: true,
      details: {
        tenantId: credentials.tenantId,
        subscriptionId: subscriptionId,
        hasResourceGroups: !firstResult.done
      }
    };
  } catch (error: any) {
    console.error("Azure connectivity test failed:", error);
    return {
      provider: 'azure',
      success: false,
      error: `Azure connectivity failed: ${error.message}`
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
        error: 'Missing GCP service account key'
      };
    }

    const serviceAccountKey = JSON.parse(credentials.serviceAccountKey);
    
    const auth = new GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ['https://www.googleapis.com/auth/cloud-platform.read-only']
    });
    
    // Test getting an access token
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    
    console.log("GCP connectivity test successful");
    
    return {
      provider: 'gcp',
      success: true,
      details: {
        projectId: serviceAccountKey.project_id,
        serviceAccountEmail: serviceAccountKey.client_email,
        hasAccessToken: !!accessToken
      }
    };
  } catch (error: any) {
    console.error("GCP connectivity test failed:", error);
    return {
      provider: 'gcp',
      success: false,
      error: `GCP connectivity failed: ${error.message}`
    };
  }
};

serve(async (req) => {
  console.log("Test connectivity function called");
  
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
          error: `Unsupported provider: ${provider}`
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
    console.error("Test connectivity error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: `Test connectivity failed: ${error.message}`
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
