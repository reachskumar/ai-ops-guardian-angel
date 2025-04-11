import { useState, useEffect, useCallback } from 'react';
import { 
  getCloudAccounts,
  getCloudResources,
  deleteCloudAccount,
  CloudResource,
  CloudAccount,
  syncCloudResources
} from '@/services/cloud';
import { useToast } from '@/hooks/use-toast';

export const useCloudResources = () => {
  // State for resources and accounts
  const [resources, setResources] = useState<CloudResource[]>([]);
  const [accounts, setAccounts] = useState<CloudAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [syncStatus, setSyncStatus] = useState<{[accountId: string]: 'idle' | 'syncing' | 'success' | 'error'}>({});
  const [syncErrorMessages, setSyncErrorMessages] = useState<{[accountId: string]: string | null}>({});
  
  const { toast } = useToast();

  // Fetch resources and accounts
  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Fetching cloud accounts...");
      const accountsResult = await getCloudAccounts();
      console.log("Fetched cloud accounts:", accountsResult);
      
      const resourcesResult = await getCloudResources();
      console.log("Fetched cloud resources:", resourcesResult);
      
      setAccounts(accountsResult);
      setResources(resourcesResult.resources);
      setLastRefresh(Date.now());
    } catch (error) {
      console.error("Error fetching cloud resources:", error);
      toast({
        title: "Error fetching resources",
        description: "Could not load cloud resources",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Sync cloud resources for a specific account
  const syncResources = useCallback(async (accountId: string) => {
    try {
      console.log(`Syncing resources for account: ${accountId}`);
      // Update sync status to syncing
      setSyncStatus(prev => ({ ...prev, [accountId]: 'syncing' }));
      setSyncErrorMessages(prev => ({ ...prev, [accountId]: null }));
      
      // When using local mocks, we want to handle the response even with edge function errors
      const result = await syncCloudResources(accountId);
      
      // Consider it a success even if there's a non-critical error like "Edge function unavailable"
      // This allows the app to keep working in development without real edge functions
      if (result.success) {
        setSyncStatus(prev => ({ ...prev, [accountId]: 'success' }));
        
        // Check if there's a warning message (like edge function unavailable)
        const hasWarning = !!result.error && result.error.includes("Edge function");
        
        toast({
          title: hasWarning ? "Resources Synced with Note" : "Resources Synced",
          description: hasWarning 
            ? result.error 
            : "Cloud resources have been synchronized successfully",
          variant: hasWarning ? "default" : "default"
        });
        
        // Store warning message for display
        if (hasWarning && result.error) {
          setSyncErrorMessages(prev => ({ ...prev, [accountId]: result.error }));
        }
        
        // Refresh the resources after sync
        fetchResources();
        return true;
      } else {
        // This is a real error that prevented successful sync
        setSyncStatus(prev => ({ ...prev, [accountId]: 'error' }));
        const errorMessage = result.error || "Failed to sync cloud resources";
        setSyncErrorMessages(prev => ({ ...prev, [accountId]: errorMessage }));
        
        toast({
          title: "Sync Failed",
          description: errorMessage,
          variant: "destructive"
        });
        return false;
      }
    } catch (error: any) {
      console.error("Error syncing cloud resources:", error);
      setSyncStatus(prev => ({ ...prev, [accountId]: 'error' }));
      const errorMessage = error.message || "An error occurred while syncing resources";
      setSyncErrorMessages(prev => ({ ...prev, [accountId]: errorMessage }));
      
      toast({
        title: "Sync Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  }, [toast, fetchResources]);
  
  // Delete an account
  const deleteAccount = useCallback(async (accountId: string) => {
    try {
      console.log(`Deleting account: ${accountId}`);
      const result = await deleteCloudAccount(accountId);
      
      if (result.success) {
        toast({
          title: "Account Removed",
          description: "The cloud account has been successfully disconnected"
        });
        
        // Clean up sync status for the removed account
        setSyncStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[accountId];
          return newStatus;
        });
        
        setSyncErrorMessages(prev => {
          const newMessages = { ...prev };
          delete newMessages[accountId];
          return newMessages;
        });
        
        // Refresh the resources and accounts after deletion
        fetchResources();
        return true;
      } else {
        toast({
          title: "Removal Failed",
          description: result.error || "Failed to remove cloud account",
          variant: "destructive"
        });
        return false;
      }
    } catch (error: any) {
      console.error("Error removing cloud account:", error);
      toast({
          title: "Removal Failed",
          description: "An error occurred while removing the account",
          variant: "destructive"
      });
      return false;
    }
  }, [toast, fetchResources]);

  // Initial load
  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Setup periodic refresh (every 60 seconds)
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log("Auto-refreshing cloud resources");
      fetchResources();
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [fetchResources]);

  return { 
    resources, 
    accounts, 
    loading, 
    fetchResources, 
    syncResources,
    deleteAccount,
    lastRefresh,
    syncStatus,
    syncErrorMessages
  };
};
