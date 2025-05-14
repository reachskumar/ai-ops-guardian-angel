
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
      if (!parsedKey.client_email || !parsedKey.project_id || !parsedKey.private_key) {
        return { 
          isValid: false, 
          error: 'Invalid service account key format: missing required fields' 
        };
      }
      
      return { 
        isValid: true, 
        parsedKey: parsedKey,
        serviceAccountEmail: parsedKey.client_email,
        projectId: parsedKey.project_id
      };
    } catch (parseError) {
      return { isValid: false, error: 'Invalid service account key format' };
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
      return { isValid: false, error: 'Missing required AWS credentials' };
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
