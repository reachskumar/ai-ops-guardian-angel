
import { supabase } from '@/integrations/supabase/client';
import { CloudProvider } from './types';
import { getAccountCredentials } from './accountService';

export interface ConnectivityTestResult {
  provider: CloudProvider;
  success: boolean;
  details?: Record<string, any>;
  error?: string;
}

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
    
    // Call the test-connectivity edge function
    const { data, error } = await supabase.functions.invoke('test-connectivity', {
      body: {
        provider,
        credentials
      }
    });
    
    if (error) {
      console.error('Connectivity test edge function error:', error);
      return {
        provider,
        success: false,
        error: `Edge function error: ${error.message}`
      };
    }
    
    console.log('Connectivity test result:', data);
    
    return {
      provider,
      success: data.success,
      details: data.details,
      error: data.error
    };
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
