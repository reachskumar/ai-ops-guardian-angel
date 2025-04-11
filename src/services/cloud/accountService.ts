
import { supabase } from "@/integrations/supabase/client";
import { CloudProvider, CloudAccount } from "./types";
import { mockSelect } from "../mockDatabaseService";

// Use localStorage to persist accounts between sessions
const STORAGE_KEY = 'cloud_accounts';

// Helper to load accounts from localStorage
const loadAccountsFromStorage = (): CloudAccount[] => {
  try {
    const storedAccounts = localStorage.getItem(STORAGE_KEY);
    return storedAccounts ? JSON.parse(storedAccounts) : [];
  } catch (error) {
    console.error("Error loading accounts from localStorage:", error);
    return [];
  }
};

// Helper to save accounts to localStorage
const saveAccountsToStorage = (accounts: CloudAccount[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch (error) {
    console.error("Error saving accounts to localStorage:", error);
  }
};

// Initialize mock accounts from localStorage for persistence
let mockAccounts: CloudAccount[] = loadAccountsFromStorage();

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
      
      // Save to localStorage for persistence
      saveAccountsToStorage(mockAccounts);
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
      
      const combinedAccounts = [...data, ...newAccounts] as CloudAccount[];
      
      // Update localStorage with the combined accounts
      saveAccountsToStorage(combinedAccounts);
      
      return combinedAccounts;
    }
    
    // If no data from mock database, return our in-memory accounts
    console.log("Returning in-memory accounts:", mockAccounts);
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
    // Remove from local mock accounts
    const initialLength = mockAccounts.length;
    mockAccounts = mockAccounts.filter(account => account.id !== accountId);
    
    // Save updated accounts to localStorage
    saveAccountsToStorage(mockAccounts);
    
    // Check if account was actually removed
    if (mockAccounts.length < initialLength) {
      console.log(`Successfully removed account with ID: ${accountId}`);
      return { success: true };
    } else {
      console.warn(`Account with ID: ${accountId} not found`);
      return { success: false, error: 'Account not found' };
    }
  } catch (error: any) {
    console.error("Delete cloud account error:", error);
    return { success: false, error: error.message || 'Failed to delete cloud account' };
  }
};

// Sync cloud resources for an account
export const syncCloudResources = async (
  accountId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Find the account to get its provider
    const account = mockAccounts.find(a => a.id === accountId);
    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    console.log(`Starting sync for account ${accountId} (${account.provider})`);
    
    // For demo/testing purposes, update the last_synced_at timestamp locally
    // This allows us to continue even if the Edge Function call fails
    const accountIndex = mockAccounts.findIndex(a => a.id === accountId);
    if (accountIndex >= 0) {
      mockAccounts[accountIndex].last_synced_at = new Date().toISOString();
      saveAccountsToStorage(mockAccounts);
    }
    
    // Call the edge function with account provider information
    try {
      const { data, error } = await supabase.functions.invoke('sync-cloud-resources', {
        body: { 
          accountId, 
          provider: account.provider // Include provider info for the edge function
        }
      });

      if (error) {
        console.warn("Edge function error, but continuing with local mock update:", error);
        return { 
          success: true, 
          error: "Edge function error, but local state updated" 
        };
      }
      
      console.log("Sync response:", data);
      
      return { 
        success: data?.success || true, 
        error: data?.error
      };
    } catch (edgeError: any) {
      console.error("Edge function error:", edgeError);
      // Return success anyway since we updated the local state
      return { 
        success: true, 
        error: "Edge function unavailable, but local state updated"
      };
    }
  } catch (error: any) {
    console.error("Sync cloud resources error:", error);
    return { success: false, error: error.message || 'Failed to sync cloud resources' };
  }
};
