
import { useState, useEffect } from 'react';
import { 
  getCloudAccounts,
  getCloudResources,
  CloudResource,
  CloudAccount
} from '@/services/cloud';
import { useToast } from '@/hooks/use-toast';

export const useCloudResources = () => {
  // State for resources and accounts
  const [resources, setResources] = useState<CloudResource[]>([]);
  const [accounts, setAccounts] = useState<CloudAccount[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { toast } = useToast();

  // Fetch resources and accounts
  const fetchResources = async () => {
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
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return { resources, accounts, loading, fetchResources };
};
