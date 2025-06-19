
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { validateGcpCredentials, validateAwsCredentials, validateAzureCredentials } from "../_shared/credential-helpers.ts";

// Import AWS SDK for credential validation
import { STSClient, GetCallerIdentityCommand } from "https://esm.sh/@aws-sdk/client-sts@3.462.0";

// Import Azure SDK for credential validation
import { ClientSecretCredential } from "https://esm.sh/@azure/identity@4.0.0";
import { ResourceManagementClient } from "https://esm.sh/@azure/arm-resources@5.2.0";

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

// Real AWS credential validation
const validateAwsCredentialsReal = async (credentials: any): Promise<{ isValid: boolean; error?: string; accountId?: string }> => {
  try {
    const stsClient = new STSClient({
      region: credentials.region || 'us-east-1',
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        ...(credentials.sessionToken && { sessionToken: credentials.sessionToken })
      }
    });

    const command = new GetCallerIdentityCommand({});
    const response = await stsClient.send(command);
    
    return {
      isValid: true,
      accountId: response.Account
    };
  } catch (error: any) {
    console.error("AWS credential validation failed:", error);
    return {
      isValid: false,
      error: `AWS credential validation failed: ${error.message}`
    };
  }
};

// Real Azure credential validation
const validateAzureCredentialsReal = async (credentials: any): Promise<{ isValid: boolean; error?: string; subscriptionId?: string }> => {
  try {
    const credential = new ClientSecretCredential(
      credentials.tenantId,
      credentials.clientId,
      credentials.clientSecret
    );

    // Test the credentials by trying to list subscriptions or resource groups
    const subscriptionId = credentials.subscriptionId;
    if (!subscriptionId) {
      throw new Error("Subscription ID is required for Azure validation");
    }

    const resourceClient = new ResourceManagementClient(credential, subscriptionId);
    
    // Try to list resource groups as a validation test
    const rgIterator = resourceClient.resourceGroups.list();
    const firstResult = await rgIterator.next();
    
    return {
      isValid: true,
      subscriptionId: subscriptionId
    };
  } catch (error: any) {
    console.error("Azure credential validation failed:", error);
    return {
      isValid: false,
      error: `Azure credential validation failed: ${error.message}`
    };
  }
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
    let additionalInfo: any = {};
    
    // Validate credentials based on provider with real SDK validation
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
            } else {
              additionalInfo.projectId = serviceAccountKey.project_id;
              additionalInfo.serviceAccountEmail = serviceAccountKey.client_email;
            }
          } catch (error) {
            validationError = 'Invalid JSON format for service account key';
          }
        }
        break;
        
      case 'aws':
        // Use real AWS STS validation
        const awsValidation = await validateAwsCredentialsReal(credentials);
        isValid = awsValidation.isValid;
        if (!isValid) {
          validationError = awsValidation.error || 'Invalid AWS credentials';
        } else {
          additionalInfo.accountId = awsValidation.accountId;
          additionalInfo.region = credentials.region || 'us-east-1';
        }
        break;
        
      case 'azure':
        // Use real Azure validation
        const azureValidation = await validateAzureCredentialsReal(credentials);
        isValid = azureValidation.isValid;
        if (!isValid) {
          validationError = azureValidation.error || 'Invalid Azure credentials';
        } else {
          additionalInfo.subscriptionId = azureValidation.subscriptionId;
          additionalInfo.tenantId = credentials.tenantId;
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
        name: name,
        additionalInfo: additionalInfo
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    return handleError(error, "Error connecting cloud provider");
  }
});
