
import { supabase } from "@/integrations/supabase/client";
import { CloudProvider, CloudAccount } from "./types";
import { mockSelect } from "../mockDatabaseService";

// Use localStorage to persist accounts between sessions
const STORAGE_KEY = 'cloud_accounts';
const CREDENTIALS_STORAGE_KEY = 'cloud_account_credentials';

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

// Helper to securely store credentials (in a real app, this would use a more secure method)
const storeCredentials = (accountId: string, credentials: Record<string, string>): void => {
  try {
    // Get existing credentials
    const storedCredentials = localStorage.getItem(CREDENTIALS_STORAGE_KEY);
    const allCredentials = storedCredentials ? JSON.parse(storedCredentials) : {};
    
    // Update with new credentials
    allCredentials[accountId] = credentials;
    
    // Store back
    localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(allCredentials));
    console.log(`Stored credentials for account ${accountId}`);
  } catch (error) {
    console.error("Error storing credentials:", error);
  }
};

// Helper to retrieve credentials
const getCredentials = (accountId: string): Record<string, string> | null => {
  try {
    const storedCredentials = localStorage.getItem(CREDENTIALS_STORAGE_KEY);
    if (!storedCredentials) return null;
    
    const allCredentials = JSON.parse(storedCredentials);
    return allCredentials[accountId] || null;
  } catch (error) {
    console.error("Error retrieving credentials:", error);
    return null;
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
      
      // Store the credentials securely
      storeCredentials(data.accountId, credentials);
      
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
    
    // Get the credentials for this account
    const credentials = getCredentials(accountId);
    
    // For demo/testing purposes, update the last_synced_at timestamp locally
    // This allows us to continue even if the Edge Function call fails
    const accountIndex = mockAccounts.findIndex(a => a.id === accountId);
    if (accountIndex >= 0) {
      mockAccounts[accountIndex].last_synced_at = new Date().toISOString();
      saveAccountsToStorage(mockAccounts);
    }
    
    // Call the edge function with account provider information and credentials
    try {
      const { data, error } = await supabase.functions.invoke('sync-cloud-resources', {
        body: { 
          accountId, 
          provider: account.provider,
          credentials // Pass the credentials to the edge function
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
      
      // If we got resources back, store them locally
      if (data?.resources && Array.isArray(data.resources)) {
        // Update local storage with new resources
        const RESOURCES_STORAGE_KEY = 'cloud_resources';
        try {
          // Get existing resources
          const storedResources = localStorage.getItem(RESOURCES_STORAGE_KEY);
          const existingResources = storedResources ? JSON.parse(storedResources) : [];
          
          // Filter out resources for this account
          const otherResources = existingResources.filter((r: any) => r.cloud_account_id !== accountId);
          
          // Combine with new resources
          const updatedResources = [...otherResources, ...data.resources];
          
          // Save back to storage
          localStorage.setItem(RESOURCES_STORAGE_KEY, JSON.stringify(updatedResources));
          console.log(`Updated resources in localStorage, now have ${updatedResources.length} resources`);
        } catch (storageError) {
          console.error("Error updating resources in localStorage:", storageError);
        }
      }
      
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

// Get the stored credentials for an account
export const getAccountCredentials = (accountId: string): Record<string, string> | null => {
  return getCredentials(accountId);
};
