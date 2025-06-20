
import { getAccountCredentials } from "@/services/cloud/accountService";

/**
 * Validates GCP credentials and returns the parsed service account key
 * @param accountId The ID of the GCP account to validate
 * @returns Object containing validation status and parsed key if available
 */
export const validateGcpCredentials = async (accountId: string): Promise<{
  isValid: boolean;
  parsedKey?: any;
  serviceAccountEmail?: string;
  projectId?: string;
  error?: string;
}> => {
  try {
    // Get credentials from secure storage
    const credentials = await getAccountCredentials(accountId);
    
    if (!credentials) {
      return { isValid: false, error: 'No credentials found for this account' };
    }
    
    // Check if serviceAccountKey exists in credentials
    if (!credentials.serviceAccountKey) {
      return { isValid: false, error: 'No service account key found in credentials' };
    }
    
    try {
      // Parse the service account key JSON
      const parsedKey = JSON.parse(credentials.serviceAccountKey);
      
      // Validate required fields in service account key
      const requiredFields = ['client_email', 'project_id', 'private_key', 'type'];
      const missingFields = requiredFields.filter(field => !parsedKey[field]);
      
      if (missingFields.length > 0) {
        return { 
          isValid: false, 
          error: `Invalid service account key format: missing required fields: ${missingFields.join(', ')}` 
        };
      }
      
      if (parsedKey.type !== 'service_account') {
        return { 
          isValid: false, 
          error: 'Invalid service account key type: must be a service account key' 
        };
      }
      
      return { 
        isValid: true, 
        parsedKey: parsedKey,
        serviceAccountEmail: parsedKey.client_email,
        projectId: parsedKey.project_id
      };
    } catch (parseError) {
      return { isValid: false, error: 'Invalid service account key format: must be valid JSON' };
    }
  } catch (error: any) {
    return { isValid: false, error: error.message || 'Failed to validate credentials' };
  }
};

/**
 * Validates AWS credentials
 * @param accountId The ID of the AWS account to validate
 * @returns Object containing validation status
 */
export const validateAwsCredentials = async (accountId: string): Promise<{
  isValid: boolean;
  accessKeyId?: string;
  region?: string;
  accountId?: string;
  error?: string;
}> => {
  try {
    // Get credentials from secure storage
    const credentials = await getAccountCredentials(accountId);
    
    if (!credentials) {
      return { isValid: false, error: 'No credentials found for this account' };
    }
    
    // Check for required AWS credentials
    if (!credentials.accessKeyId || !credentials.secretAccessKey) {
      return { isValid: false, error: 'Missing required AWS credentials (accessKeyId, secretAccessKey)' };
    }
    
    // Validate format of access key ID (should be 20 characters, alphanumeric)
    if (!credentials.accessKeyId.match(/^[A-Z0-9]{20}$/)) {
      return { isValid: false, error: 'AWS Access Key ID format is invalid (should be 20 alphanumeric characters)' };
    }
    
    // Validate format of secret access key (should be 40 characters)
    if (credentials.secretAccessKey.length !== 40) {
      return { isValid: false, error: 'AWS Secret Access Key format is invalid (should be 40 characters)' };
    }
    
    return { 
      isValid: true, 
      accessKeyId: credentials.accessKeyId,
      region: credentials.region || 'us-east-1'
    };
  } catch (error: any) {
    return { isValid: false, error: error.message || 'Failed to validate credentials' };
  }
};

/**
 * Validates Azure credentials
 * @param accountId The ID of the Azure account to validate
 * @returns Object containing validation status
 */
export const validateAzureCredentials = async (accountId: string): Promise<{
  isValid: boolean;
  tenantId?: string;
  clientId?: string;
  subscriptionId?: string;
  error?: string;
}> => {
  try {
    // Get credentials from secure storage
    const credentials = await getAccountCredentials(accountId);
    
    if (!credentials) {
      return { isValid: false, error: 'No credentials found for this account' };
    }
    
    // Check for required Azure credentials
    if (!credentials.tenantId || !credentials.clientId || !credentials.clientSecret) {
      return { isValid: false, error: 'Missing required Azure credentials (tenantId, clientId, clientSecret)' };
    }
    
    // Validate GUID format for tenantId and clientId
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!guidRegex.test(credentials.tenantId)) {
      return { isValid: false, error: 'Azure Tenant ID format is invalid (should be a GUID)' };
    }
    
    if (!guidRegex.test(credentials.clientId)) {
      return { isValid: false, error: 'Azure Client ID format is invalid (should be a GUID)' };
    }
    
    // Validate subscription ID if provided
    if (credentials.subscriptionId && !guidRegex.test(credentials.subscriptionId)) {
      return { isValid: false, error: 'Azure Subscription ID format is invalid (should be a GUID)' };
    }
    
    if (!credentials.subscriptionId) {
      return { isValid: false, error: 'Azure Subscription ID is required' };
    }
    
    return { 
      isValid: true, 
      tenantId: credentials.tenantId,
      clientId: credentials.clientId,
      subscriptionId: credentials.subscriptionId
    };
  } catch (error: any) {
    return { isValid: false, error: error.message || 'Failed to validate credentials' };
  }
};
