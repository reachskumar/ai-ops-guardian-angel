
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
      const accountsResult = await getCloudAccounts();
      const resourcesResult = await getCloudResources();
      
      setAccounts(accountsResult);
      setResources(resourcesResult.resources);
    } catch (error) {
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
