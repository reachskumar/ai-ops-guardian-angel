
// Helper functions for credential validation and cloud provider operations

// Import Google Cloud SDK for validation
import { GoogleAuth } from "https://esm.sh/google-auth-library@9.4.0";

// Validate GCP service account key
export const validateGcpCredentials = (serviceAccountKey: any): boolean => {
  try {
    // Check for required fields
    const requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email', 'client_id'];
    const missingFields = requiredFields.filter(field => !serviceAccountKey[field]);
    
    if (missingFields.length > 0) {
      console.error(`Invalid service account key: missing ${missingFields.join(', ')}`);
      return false;
    }
    
    if (serviceAccountKey.type !== 'service_account') {
      console.error('Invalid credential type: must be a service account key');
      return false;
    }
    
    // Additional validation: check if private key is properly formatted
    if (!serviceAccountKey.private_key.includes('BEGIN PRIVATE KEY')) {
      console.error('Invalid private key format');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error validating GCP credentials:", error);
    return false;
  }
};

// Real GCP credential validation with API call
export const validateGcpCredentialsReal = async (serviceAccountKey: any): Promise<{ isValid: boolean; error?: string; projectId?: string }> => {
  try {
    const auth = new GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ['https://www.googleapis.com/auth/cloud-platform.read-only']
    });

    // Try to get an access token to validate the credentials
    const client = await auth.getClient();
    await client.getAccessToken();
    
    return {
      isValid: true,
      projectId: serviceAccountKey.project_id
    };
  } catch (error: any) {
    console.error("GCP credential validation failed:", error);
    return {
      isValid: false,
      error: `GCP credential validation failed: ${error.message}`
    };
  }
};

// Validate AWS credentials (format validation only)
export const validateAwsCredentials = (credentials: any): boolean => {
  try {
    if (!credentials.accessKeyId || !credentials.secretAccessKey) {
      console.error('Missing required AWS credentials');
      return false;
    }
    
    // Validate format of access key ID (should be 20 characters, alphanumeric)
    if (credentials.accessKeyId && !credentials.accessKeyId.match(/^[A-Z0-9]{20}$/)) {
      console.error('AWS Access Key ID format is invalid');
      return false;
    }
    
    // Validate format of secret access key (should be 40 characters, base64-like)
    if (credentials.secretAccessKey && credentials.secretAccessKey.length !== 40) {
      console.error('AWS Secret Access Key format may be invalid');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error validating AWS credentials:", error);
    return false;
  }
};

// Validate Azure credentials (format validation only)
export const validateAzureCredentials = (credentials: any): boolean => {
  try {
    if (!credentials.tenantId || !credentials.clientId || !credentials.clientSecret) {
      console.error('Missing required Azure credentials (tenantId, clientId, clientSecret)');
      return false;
    }
    
    // Validate GUID format for tenantId and clientId
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!guidRegex.test(credentials.tenantId)) {
      console.error('Azure Tenant ID format is invalid');
      return false;
    }
    
    if (!guidRegex.test(credentials.clientId)) {
      console.error('Azure Client ID format is invalid');
      return false;
    }
    
    // Validate subscription ID if provided
    if (credentials.subscriptionId && !guidRegex.test(credentials.subscriptionId)) {
      console.error('Azure Subscription ID format is invalid');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error validating Azure credentials:", error);
    return false;
  }
};
