import { supabase } from '@/integrations/supabase/client';
import { CloudProvider } from './types';
import { getAccountCredentials } from './accountService';
import { validateAwsCredentials, validateAzureCredentials, validateGcpCredentials } from '@/utils/credentialValidation';

export interface ConnectivityTestResult {
  provider: CloudProvider;
  success: boolean;
  details?: Record<string, any>;
  error?: string;
  isRealTime?: boolean;
}

// Enhanced real-time connectivity test with better error handling
export const testCloudConnectivity = async (
  accountId: string,
  provider: CloudProvider
): Promise<ConnectivityTestResult> => {
  try {
    console.log(`Starting connectivity test for account: ${accountId}, provider: ${provider}`);
    
    // Get account credentials
    const credentials = await getAccountCredentials(accountId);
    if (!credentials || Object.keys(credentials).length === 0) {
      return {
        provider,
        success: false,
        error: 'No credentials found for this account',
        isRealTime: false
      };
    }
    
    console.log(`Found credentials for ${provider}, testing...`);
    
    // Try edge function test with timeout
    try {
      const { data, error } = await Promise.race([
        supabase.functions.invoke('test-connectivity', {
          body: {
            provider,
            credentials
          }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Edge function timeout')), 8000)
        )
      ]) as any;
      
      if (error) {
        console.warn('Edge function test failed:', error);
        return await performValidationFallback(provider, accountId, credentials);
      }
      
      if (data && data.success) {
        console.log('Edge function test successful:', data);
        return {
          provider,
          success: true,
          details: {
            ...data.details,
            isRealTime: true
          },
          isRealTime: true
        };
      } else {
        console.warn('Edge function returned unsuccessful result:', data);
        return {
          provider,
          success: false,
          error: data?.error || 'Edge function test failed',
          isRealTime: false
        };
      }
    } catch (edgeFunctionError: any) {
      console.warn('Edge function unavailable:', edgeFunctionError.message);
      return await performValidationFallback(provider, accountId, credentials);
    }
  } catch (error: any) {
    console.error('Connectivity test error:', error);
    return {
      provider,
      success: false,
      error: error.message || 'Failed to test connectivity',
      isRealTime: false
    };
  }
};

// Enhanced fallback validation with better messaging
const performValidationFallback = async (
  provider: CloudProvider,
  accountId: string,
  credentials: Record<string, string>
): Promise<ConnectivityTestResult> => {
  console.log(`Performing validation fallback for ${provider} with account ID: ${accountId}`);
  
  switch (provider) {
    case 'aws':
      const awsValidation = await validateAwsCredentials(accountId);
      if (!awsValidation.isValid) {
        return {
          provider,
          success: false,
          error: awsValidation.error,
          isRealTime: false
        };
      }
      return {
        provider,
        success: true,
        details: {
          fallbackMode: true,
          testType: 'credential_validation',
          message: 'Credentials validated. Real-time API test unavailable - check edge function logs.',
          accessKeyId: credentials.accessKeyId?.substring(0, 10) + '...',
          region: credentials.region || 'us-east-1',
          accountId: awsValidation.accountId,
          note: 'For real-time testing, ensure edge functions are working properly.'
        },
        isRealTime: false
      };
      
    case 'azure':
      const azureValidation = await validateAzureCredentials(accountId);
      if (!azureValidation.isValid) {
        return {
          provider,
          success: false,
          error: azureValidation.error,
          isRealTime: false
        };
      }
      return {
        provider,
        success: true,
        details: {
          fallbackMode: true,
          testType: 'credential_validation',
          message: 'Credentials validated. Real-time API test unavailable - check edge function logs.',
          tenantId: azureValidation.tenantId,
          subscriptionId: azureValidation.subscriptionId?.substring(0, 8) + '...',
          note: 'For real-time testing, ensure edge functions are working properly.'
        },
        isRealTime: false
      };
      
    case 'gcp':
      const gcpValidation = await validateGcpCredentials(accountId);
      if (!gcpValidation.isValid) {
        return {
          provider,
          success: false,
          error: gcpValidation.error,
          isRealTime: false
        };
      }
      return {
        provider,
        success: true,
        details: {
          fallbackMode: true,
          testType: 'credential_validation',
          message: 'Credentials validated. Real-time API test unavailable - check edge function logs.',
          projectId: gcpValidation.projectId,
          serviceAccountEmail: gcpValidation.serviceAccountEmail,
          note: 'For real-time testing, ensure edge functions are working properly.'
        },
        isRealTime: false
      };
      
    default:
      return {
        provider,
        success: false,
        error: `Unsupported provider: ${provider}`,
        isRealTime: false
      };
  }
};

// Test all connected accounts with real-time capabilities
export const testAllConnectedAccounts = async (): Promise<ConnectivityTestResult[]> => {
  try {
    const { data: accounts, error } = await supabase
      .from('users_cloud_accounts')
      .select('*');
    
    if (error) {
      console.error('Failed to get accounts:', error);
      return [];
    }
    
    console.log(`Testing connectivity for ${accounts?.length || 0} accounts`);
    
    const results: ConnectivityTestResult[] = [];
    
    // Test accounts in parallel for better performance
    const testPromises = (accounts || []).map(account => 
      testCloudConnectivity(account.id, account.provider as CloudProvider)
    );
    
    const testResults = await Promise.allSettled(testPromises);
    
    testResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        const account = accounts![index];
        results.push({
          provider: account.provider as CloudProvider,
          success: false,
          error: `Test failed: ${result.reason}`,
          isRealTime: false
        });
      }
    });
    
    return results;
  } catch (error: any) {
    console.error('Test all accounts error:', error);
    return [];
  }
};

// Real-time status monitoring with improved intervals
export const startRealTimeMonitoring = (
  accountId: string,
  provider: CloudProvider,
  onStatusChange: (result: ConnectivityTestResult) => void
) => {
  console.log(`Starting real-time monitoring for ${provider} account: ${accountId}`);
  
  // Initial test
  testCloudConnectivity(accountId, provider).then(onStatusChange);
  
  // Set up periodic testing (every 30 seconds for real-time monitoring)
  const interval = setInterval(async () => {
    try {
      const result = await testCloudConnectivity(accountId, provider);
      onStatusChange(result);
    } catch (error) {
      console.error('Real-time monitoring error:', error);
      onStatusChange({
        provider,
        success: false,
        error: 'Monitoring failed',
        isRealTime: false
      });
    }
  }, 30000);
  
  // Return cleanup function
  return () => {
    console.log(`Stopping real-time monitoring for ${provider} account: ${accountId}`);
    clearInterval(interval);
  };
};
