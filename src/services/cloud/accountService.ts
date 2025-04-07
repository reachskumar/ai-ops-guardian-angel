
import { supabase } from "@/integrations/supabase/client";
import { CloudProvider, CloudAccount } from "./types";
import { mockSelect } from "../mockDatabaseService";

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
    const { data, error } = mockSelect('cloud_accounts');

    if (error) throw error;
    
    return data as CloudAccount[];
  } catch (error) {
    console.error("Get cloud accounts error:", error);
    return [];
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
