
// Helper functions for credential validation and cloud provider operations

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
    
    return true;
  } catch (error) {
    console.error("Error validating GCP credentials:", error);
    return false;
  }
};

// Validate AWS credentials
export const validateAwsCredentials = (credentials: any): boolean => {
  try {
    if (!credentials.accessKeyId || !credentials.secretAccessKey) {
      console.error('Missing required AWS credentials');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error validating AWS credentials:", error);
    return false;
  }
};

// Validate Azure credentials
export const validateAzureCredentials = (credentials: any): boolean => {
  try {
    if (!credentials.tenantId || !credentials.clientId || !credentials.clientSecret) {
      console.error('Missing required Azure credentials');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error validating Azure credentials:", error);
    return false;
  }
};
