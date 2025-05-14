
import { supabase } from "@/integrations/supabase/client";
import { CloudProvider, CloudAccount } from "./types";
import { mockSelect } from "../mockDatabaseService";

// Use Supabase for storing cloud accounts and credentials
// We'll still use localStorage as a fallback during development/transition

// Helper to load accounts from localStorage (for development/transition period)
const loadAccountsFromStorage = (): CloudAccount[] => {
  try {
    const storedAccounts = localStorage.getItem('cloud_accounts');
    return storedAccounts ? JSON.parse(storedAccounts) : [];
  } catch (error) {
    console.error("Error loading accounts from localStorage:", error);
    return [];
  }
};

// Mock accounts from localStorage for persistence during transition
let mockAccounts: CloudAccount[] = loadAccountsFromStorage();

// Connect to cloud providers via Edge Function
export const connectCloudProvider = async (
  provider: CloudProvider,
  credentials: Record<string, string>,
  name: string
): Promise<{ success: boolean; accountId?: string; error?: string }> => {
  try {
    console.log(`Connecting to ${provider} with name "${name}"`);
    
    // Call the edge function to validate credentials and create account
    const { data, error } = await supabase.functions.invoke('connect-cloud-provider', {
      body: { provider, credentials, name }
    });

    if (error) {
      console.error(`Edge function error:`, error);
      throw new Error(`Failed to connect to ${provider}: ${error.message}`);
    }
    
    if (!data.success) {
      throw new Error(data.error || `Unknown error connecting to ${provider}`);
    }
    
    // If successful, store account in Supabase
    if (data.success && data.accountId) {
      // Since we need to handle the case where tables don't exist yet,
      // we'll use a try-catch and fallback to local storage
      try {
        // Add to users_cloud_accounts table in Supabase
        const { error: insertError } = await supabase.from('users_cloud_accounts' as any)
          .insert({
            id: data.accountId,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            name,
            provider,
            status: 'connected',
            last_synced_at: new Date().toISOString(),
            // Don't store the credentials in this table
          });
        
        if (insertError) {
          console.error("Error adding account to Supabase:", insertError);
          // Fall back to local storage
          mockAccounts.push({
            id: data.accountId,
            name,
            provider,
            status: 'connected',
            created_at: new Date().toISOString(),
            last_synced_at: new Date().toISOString()
          });
          localStorage.setItem('cloud_accounts', JSON.stringify(mockAccounts));
        }
      } catch (dbError) {
        console.error("Database error, falling back to local storage:", dbError);
        // Fall back to local storage
        mockAccounts.push({
          id: data.accountId,
          name,
          provider,
          status: 'connected',
          created_at: new Date().toISOString(),
          last_synced_at: new Date().toISOString()
        });
        localStorage.setItem('cloud_accounts', JSON.stringify(mockAccounts));
      }
      
      // Store the credentials securely in Supabase using the vault feature
      try {
        // Store each credential securely
        for (const [key, value] of Object.entries(credentials)) {
          const { error: vaultError } = await supabase.rpc('store_credential', {
            account_id: data.accountId,
            credential_key: key,
            credential_value: value
          });
          
          if (vaultError) {
            console.error(`Error storing credential ${key}:`, vaultError);
            // Fall back to localStorage as a temporary measure
            try {
              const storedCredentials = localStorage.getItem('cloud_account_credentials') || '{}';
              const allCredentials = JSON.parse(storedCredentials);
              allCredentials[data.accountId] = credentials;
              localStorage.setItem('cloud_account_credentials', JSON.stringify(allCredentials));
            } catch (storageError) {
              console.error("Error storing credentials in localStorage:", storageError);
            }
          }
        }
      } catch (credError) {
        console.error("Error storing credentials:", credError);
      }
    }
    
    return { 
      success: data.success, 
      accountId: data.accountId,
      error: data.error
    };
  } catch (error: any) {
    console.error(`Connect to ${provider} error:`, error);
    return { success: false, error: error.message || 'Failed to connect cloud provider' };
  }
};

// Get cloud accounts
export const getCloudAccounts = async (): Promise<CloudAccount[]> => {
  try {
    // First try to get from Supabase
    try {
      const { data, error } = await supabase.from('users_cloud_accounts' as any).select('*');
      
      if (error) {
        console.warn("Supabase error getting accounts, falling back to mock data:", error);
        return mockAccounts;
      }
      
      if (data && data.length > 0) {
        return data as unknown as CloudAccount[];
      }
    } catch (supabaseError) {
      console.error("Supabase query error:", supabaseError);
      // Continue to fallback
    }
    
    // If no accounts in Supabase, check mock data
    return mockAccounts;
  } catch (error) {
    console.error("Get cloud accounts error:", error);
    // Fall back to in-memory accounts
    return mockAccounts;
  }
};

// Delete a cloud account
export const deleteCloudAccount = async (
  accountId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // First try to delete from Supabase
    try {
      const { error } = await supabase.from('users_cloud_accounts' as any)
        .delete()
        .eq('id', accountId);
      
      if (error) {
        console.warn("Supabase error deleting account, falling back to mock deletion:", error);
        // Fall through to local deletion
      } else {
        // Also delete credentials from Supabase vault if deletion was successful
        try {
          const { error: vaultError } = await supabase.rpc('delete_account_credentials', {
            account_id: accountId
          });
          
          if (vaultError) {
            console.error("Error deleting credentials from vault:", vaultError);
          }
        } catch (credError) {
          console.error("Error deleting credentials:", credError);
        }
        
        // Success case for Supabase deletion
        return { success: true };
      }
    } catch (supabaseError) {
      console.error("Supabase deletion error:", supabaseError);
      // Continue to fallback
    }
    
    // Remove from local mock accounts
    const initialLength = mockAccounts.length;
    mockAccounts = mockAccounts.filter(account => account.id !== accountId);
    
    // Save updated accounts to localStorage
    localStorage.setItem('cloud_accounts', JSON.stringify(mockAccounts));
    
    // Also remove credentials from localStorage
    try {
      const storedCredentials = localStorage.getItem('cloud_account_credentials');
      if (storedCredentials) {
        const allCredentials = JSON.parse(storedCredentials);
        delete allCredentials[accountId];
        localStorage.setItem('cloud_account_credentials', JSON.stringify(allCredentials));
      }
    } catch (storageError) {
      console.error("Error updating localStorage after deletion:", storageError);
    }
    
    return { 
      success: mockAccounts.length < initialLength,
      error: mockAccounts.length < initialLength ? undefined : 'Account not found'
    };
  } catch (error: any) {
    console.error("Delete cloud account error:", error);
    return { success: false, error: error.message || 'Failed to delete cloud account' };
  }
};

// Sync cloud resources for an account
export const syncCloudResources = async (
  accountId: string
): Promise<{ success: boolean; resources?: any[]; error?: string }> => {
  try {
    // Find the account to get its provider
    const accounts = await getCloudAccounts();
    const account = accounts.find(a => a.id === accountId);
    
    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    console.log(`Starting sync for account ${accountId} (${account.provider})`);
    
    // Get the credentials for this account
    const credentials = await getAccountCredentials(accountId);
    
    if (!credentials) {
      return { success: false, error: 'Credentials not found for account' };
    }
    
    // Call the edge function with account provider information and credentials
    const { data, error } = await supabase.functions.invoke('sync-cloud-resources', {
      body: { 
        accountId, 
        provider: account.provider,
        credentials
      }
    });

    if (error) {
      throw new Error(`Edge function error: ${error.message}`);
    }
    
    console.log("Sync response:", data);
    
    // Update the last_synced_at timestamp in Supabase
    try {
      const { error: updateError } = await supabase.from('users_cloud_accounts' as any)
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', accountId);
      
      if (updateError) {
        console.warn("Error updating last_synced_at in Supabase:", updateError);
      }
    } catch (updateError) {
      console.error("Supabase update error:", updateError);
    }
    
    // Update local mock account too
    const accountIndex = mockAccounts.findIndex(a => a.id === accountId);
    if (accountIndex >= 0) {
      mockAccounts[accountIndex].last_synced_at = new Date().toISOString();
      localStorage.setItem('cloud_accounts', JSON.stringify(mockAccounts));
    }
    
    // Store resources in Supabase
    if (data?.resources && Array.isArray(data.resources)) {
      try {
        const { error: resourceError } = await supabase.from('cloud_resources' as any)
          .upsert(
            data.resources.map((resource: any) => ({
              ...resource,
              updated_at: new Date().toISOString()
            })),
            { onConflict: 'id' }
          );
        
        if (resourceError) {
          console.error("Error storing resources in Supabase:", resourceError);
        }
      } catch (resourceError) {
        console.error("Resource storage error:", resourceError);
      }
    }
    
    return { 
      success: data?.success || false, 
      resources: data?.resources,
      error: data?.error
    };
  } catch (error: any) {
    console.error("Sync cloud resources error:", error);
    return { 
      success: false, 
      error: error.message || 'Failed to sync cloud resources'
    };
  }
};

// Get the stored credentials for an account
export const getAccountCredentials = async (accountId: string): Promise<Record<string, string> | null> => {
  try {
    // First try to get from Supabase vault
    try {
      const { data, error } = await supabase.rpc('get_account_credentials', {
        account_id: accountId
      });
      
      if (error) {
        console.warn("Error getting credentials from vault, falling back to localStorage:", error);
      } else if (data && Array.isArray(data) && data.length > 0) {
        // Convert array of {key, value} pairs to a simple object
        return data.reduce((acc, item) => {
          acc[item.key] = item.value;
          return acc;
        }, {} as Record<string, string>);
      }
    } catch (vaultError) {
      console.error("Vault retrieval error:", vaultError);
    }
    
    // Fall back to localStorage
    try {
      const storedCredentials = localStorage.getItem('cloud_account_credentials');
      if (!storedCredentials) return null;
      
      const allCredentials = JSON.parse(storedCredentials);
      return allCredentials[accountId] || null;
    } catch (storageError) {
      console.error("Error retrieving credentials from localStorage:", storageError);
      return null;
    }
  } catch (error) {
    console.error("Error retrieving account credentials:", error);
    return null;
  }
};
