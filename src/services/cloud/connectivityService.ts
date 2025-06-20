
import { supabase } from '@/integrations/supabase/client';
import { CloudProvider } from './types';
import { getAccountCredentials } from './accountService';
import { validateAwsCredentials, validateAzureCredentials, validateGcpCredentials } from '@/utils/credentialValidation';

export interface ConnectivityTestResult {
  provider: CloudProvider;
  success: boolean;
  details?: Record<string, any>;
  error?: string;
}

// Fallback validation when edge function is not available
const performFallbackValidation = async (
  provider: CloudProvider,
  accountId: string,
  credentials: Record<string, string>
): Promise<ConnectivityTestResult> => {
  console.log(`Performing fallback validation for ${provider} with account ID: ${accountId}`);
  
  switch (provider) {
    case 'aws':
      const awsValidation = await validateAwsCredentials(accountId);
      if (!awsValidation.isValid) {
        return {
          provider,
          success: false,
          error: awsValidation.error
        };
      }
      return {
        provider,
        success: true,
        details: {
          fallbackMode: true,
          message: 'Credentials format validated (edge function unavailable)',
          accessKeyId: credentials.accessKeyId?.substring(0, 10) + '...',
          region: credentials.region || 'us-east-1'
        }
      };
      
    case 'azure':
      const azureValidation = await validateAzureCredentials(accountId);
      if (!azureValidation.isValid) {
        return {
          provider,
          success: false,
          error: azureValidation.error
        };
      }
      return {
        provider,
        success: true,
        details: {
          fallbackMode: true,
          message: 'Credentials format validated (edge function unavailable)',
          tenantId: azureValidation.tenantId,
          subscriptionId: azureValidation.subscriptionId?.substring(0, 8) + '...'
        }
      };
      
    case 'gcp':
      const gcpValidation = await validateGcpCredentials(accountId);
      if (!gcpValidation.isValid) {
        return {
          provider,
          success: false,
          error: gcpValidation.error
        };
      }
      return {
        provider,
        success: true,
        details: {
          fallbackMode: true,
          message: 'Credentials format validated (edge function unavailable)',
          projectId: gcpValidation.projectId,
          serviceAccountEmail: gcpValidation.serviceAccountEmail
        }
      };
      
    default:
      return {
        provider,
        success: false,
        error: `Unsupported provider: ${provider}`
      };
  }
};

export const testCloudConnectivity = async (
  accountId: string,
  provider: CloudProvider
): Promise<ConnectivityTestResult> => {
  try {
    console.log(`Testing connectivity for account: ${accountId}, provider: ${provider}`);
    
    // Get account credentials
    const credentials = await getAccountCredentials(accountId);
    if (!credentials || Object.keys(credentials).length === 0) {
      return {
        provider,
        success: false,
        error: 'No credentials found for this account'
      };
    }
    
    console.log(`Found credentials for ${provider}, testing connectivity...`);
    
    // Try edge function first with a shorter timeout
    try {
      const { data, error } = await Promise.race([
        supabase.functions.invoke('test-connectivity', {
          body: {
            provider,
            credentials
          }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Edge function timeout')), 10000)
        )
      ]) as any;
      
      if (error) {
        console.warn('Edge function error, falling back to local validation:', error);
        return await performFallbackValidation(provider, accountId, credentials);
      }
      
      console.log('Edge function connectivity test result:', data);
      
      return {
        provider,
        success: data.success,
        details: data.details,
        error: data.error
      };
    } catch (edgeFunctionError: any) {
      console.warn('Edge function unavailable, using fallback validation:', edgeFunctionError.message);
      return await performFallbackValidation(provider, accountId, credentials);
    }
  } catch (error: any) {
    console.error('Connectivity test error:', error);
    return {
      provider,
      success: false,
      error: error.message || 'Failed to test connectivity'
    };
  }
};

export const testAllConnectedAccounts = async (): Promise<ConnectivityTestResult[]> => {
  try {
    const { data: accounts, error } = await supabase
      .from('users_cloud_accounts')
      .select('*');
    
    if (error) {
      console.error('Failed to get accounts:', error);
      return [];
    }
    
    const results: ConnectivityTestResult[] = [];
    
    for (const account of accounts || []) {
      const result = await testCloudConnectivity(account.id, account.provider as CloudProvider);
      results.push(result);
    }
    
    return results;
  } catch (error: any) {
    console.error('Test all accounts error:', error);
    return [];
  }
};
