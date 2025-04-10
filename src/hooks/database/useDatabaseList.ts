
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { 
  DatabaseInstance, 
  getDatabaseInstances,
} from "@/services/databaseService";

/**
 * Hook for managing database listing functionality
 */
export const useDatabaseList = () => {
  const [databases, setDatabases] = useState<DatabaseInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch all database instances
  const fetchDatabases = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getDatabaseInstances();
      setDatabases(data);
    } catch (error) {
      console.error("Error fetching databases:", error);
      toast.error("Failed to fetch databases");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    fetchDatabases();
  }, [fetchDatabases]);

  return {
    databases,
    isLoading,
    fetchDatabases,
    setDatabases
  };
};
