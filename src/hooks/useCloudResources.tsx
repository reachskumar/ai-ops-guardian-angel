
import { useState, useEffect, useCallback } from 'react';
import { 
  getCloudAccounts,
  getCloudResources,
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
    setLoading(true);
    try {
      console.log(`Syncing resources for account: ${accountId}`);
      const result = await syncCloudResources(accountId);
      
      if (result.success) {
        toast({
          title: "Resources Synced",
          description: "Cloud resources have been synchronized"
        });
        // Refresh the resources after sync
        fetchResources();
      } else {
        toast({
          title: "Sync Failed",
          description: result.error || "Failed to sync cloud resources",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error syncing cloud resources:", error);
      toast({
        title: "Sync Failed",
        description: "An error occurred while syncing resources",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast, fetchResources]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  return { resources, accounts, loading, fetchResources, syncResources };
};
