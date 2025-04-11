
import { supabase } from "@/integrations/supabase/client";
import { CloudProvider, CloudAccount } from "./types";
import { mockSelect } from "../mockDatabaseService";

// Store for the mock accounts (since we're using mock data)
let mockAccounts: CloudAccount[] = [];

// Connect to cloud providers via Edge Function
export const connectCloudProvider = async (
  provider: CloudProvider,
  credentials: Record<string, string>,
  name: string
): Promise<{ success: boolean; accountId?: string; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('connect-cloud-provider', {
      body: { provider, credentials, name }
    });

    if (error) throw error;
    
    // When successful, also add to our mock accounts
    if (data.success && data.accountId) {
      const newAccount: CloudAccount = {
        id: data.accountId,
        name,
        provider,
        status: 'connected',
        created_at: new Date().toISOString(),
        last_synced_at: new Date().toISOString()
      };
      
      // Add to mock accounts
      mockAccounts.push(newAccount);
      console.log("Added new mock account:", newAccount);
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
    // First try to get from mock database
    const { data, error } = mockSelect('cloud_accounts');

    if (error) {
      console.warn("Mock database error, falling back to in-memory accounts");
      return mockAccounts;
    }
    
    // If we have data from the mock database but our in-memory store has accounts,
    // combine them to ensure we don't lose recently added accounts
    if (data && data.length > 0) {
      // Only add accounts from mockAccounts that aren't in data already
      const existingIds = new Set(data.map((account: CloudAccount) => account.id));
      const newAccounts = mockAccounts.filter(account => !existingIds.has(account.id));
      
      return [...data, ...newAccounts] as CloudAccount[];
    }
    
    // If no data from mock database, return our in-memory accounts
    return mockAccounts;
  } catch (error) {
    console.error("Get cloud accounts error:", error);
    // Fall back to in-memory accounts
    return mockAccounts;
  }
};

// Sync cloud resources for an account
export const syncCloudResources = async (
  accountId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('sync-cloud-resources', {
      body: { accountId }
    });

    if (error) throw error;
    
    return { 
      success: data.success, 
      error: data.error
    };
  } catch (error: any) {
    console.error("Sync cloud resources error:", error);
    return { success: false, error: error.message || 'Failed to sync cloud resources' };
  }
};
