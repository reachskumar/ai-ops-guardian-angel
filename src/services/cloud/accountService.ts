import { supabase } from "@/integrations/supabase/client";
import { CloudAccount, CloudProvider } from "./types";

export const getCloudAccounts = async (): Promise<CloudAccount[]> => {
  try {
    console.log("Fetching cloud accounts from Supabase...");
    
    const { data, error } = await supabase
      .from('users_cloud_accounts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Failed to fetch cloud accounts:", error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} cloud accounts`);
    return (data || []).map(account => ({
      ...account,
      provider: account.provider as CloudProvider,
      tags: account.metadata || {},
      metadata: account.metadata || {}
    }));
  } catch (error) {
    console.error("Get cloud accounts error:", error);
    return [];
  }
};

export const connectCloudProvider = async (
  name: string,
  provider: CloudProvider,
  credentials: Record<string, string>
): Promise<{ success: boolean; accountId?: string; error?: string }> => {
  return createCloudAccount(name, provider, credentials);
};

export const createCloudAccount = async (
  name: string,
  provider: CloudProvider,
  credentials: Record<string, string>
): Promise<{ success: boolean; accountId?: string; error?: string }> => {
  try {
    console.log(`Creating cloud account: ${name} (${provider})`);
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    // Create the account record
    const { data: account, error: accountError } = await supabase
      .from('users_cloud_accounts')
      .insert({
        name,
        provider,
        status: 'connected',
        user_id: user.id
      })
      .select()
      .single();
    
    if (accountError) {
      console.error("Failed to create account:", accountError);
      return { success: false, error: 'Failed to create account' };
    }
    
    // Store credentials securely
    for (const [key, value] of Object.entries(credentials)) {
      const { error: credError } = await supabase.rpc('store_credential', {
        account_id: account.id,
        credential_key: key,
        credential_value: value
      });
      
      if (credError) {
        console.error("Failed to store credential:", credError);
        // Clean up the account if credential storage fails
        await supabase
          .from('users_cloud_accounts')
          .delete()
          .eq('id', account.id);
        return { success: false, error: 'Failed to store credentials' };
      }
    }
    
    console.log(`Cloud account created successfully: ${account.id}`);
    return { success: true, accountId: account.id };
  } catch (error: any) {
    console.error("Create cloud account error:", error);
    return { success: false, error: error.message || 'Failed to create account' };
  }
};

export const deleteCloudAccount = async (accountId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(`Deleting cloud account: ${accountId}`);
    
    // Delete credentials first
    const { error: credError } = await supabase.rpc('delete_account_credentials', {
      account_id: accountId
    });
    
    if (credError) {
      console.error("Failed to delete credentials:", credError);
      return { success: false, error: 'Failed to delete account credentials' };
    }
    
    // Delete the account (this will cascade delete resources)
    const { error: accountError } = await supabase
      .from('users_cloud_accounts')
      .delete()
      .eq('id', accountId);
    
    if (accountError) {
      console.error("Failed to delete account:", accountError);
      return { success: false, error: 'Failed to delete account' };
    }
    
    console.log(`Cloud account deleted successfully: ${accountId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Delete cloud account error:", error);
    return { success: false, error: error.message || 'Failed to delete account' };
  }
};

export const syncCloudResources = async (accountId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(`Syncing resources for account: ${accountId}`);
    
    // Get account details
    const { data: account, error: accountError } = await supabase
      .from('users_cloud_accounts')
      .select('*')
      .eq('id', accountId)
      .single();
    
    if (accountError || !account) {
      return { success: false, error: 'Account not found' };
    }
    
    // Get credentials
    const { data: credentialsData, error: credError } = await supabase.rpc('get_account_credentials', {
      account_id: accountId
    });
    
    if (credError) {
      console.error('Failed to get credentials:', credError);
      return { success: false, error: 'Failed to get account credentials' };
    }
    
    // Convert credentials array to object
    const credentials: Record<string, string> = {};
    credentialsData?.forEach((cred: any) => {
      credentials[cred.key] = cred.value;
    });
    
    // Try to sync using edge function
    try {
      const { data, error } = await supabase.functions.invoke('sync-cloud-resources', {
        body: { 
          accountId,
          provider: account.provider,
          credentials
        }
      });
      
      if (error) {
        console.warn("Edge function sync failed:", error);
        return { success: true, error: `Edge function unavailable: ${error.message}` };
      }
      
      // Update last synced timestamp
      await supabase
        .from('users_cloud_accounts')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', accountId);
      
      return { success: true };
    } catch (edgeError: any) {
      console.warn("Edge function unavailable for sync:", edgeError);
      
      // Update last synced timestamp even if edge function fails
      await supabase
        .from('users_cloud_accounts')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', accountId);
      
      return { success: true, error: `Edge function unavailable: ${edgeError.message}` };
    }
  } catch (error: any) {
    console.error("Sync cloud resources error:", error);
    return { success: false, error: error.message || 'Failed to sync resources' };
  }
};

export const getAccountCredentials = async (accountId: string): Promise<Record<string, string>> => {
  try {
    const { data, error } = await supabase.rpc('get_account_credentials', {
      account_id: accountId
    });
    
    if (error) {
      console.error('Failed to get account credentials:', error);
      return {};
    }
    
    const credentials: Record<string, string> = {};
    data?.forEach((cred: any) => {
      credentials[cred.key] = cred.value;
    });
    
    return credentials;
  } catch (error) {
    console.error('Get account credentials error:', error);
    return {};
  }
};
