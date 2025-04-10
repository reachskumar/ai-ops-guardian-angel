
import { useState, useCallback } from "react";
import { 
  DatabaseInstance,
  getDatabaseInstance
} from "@/services/databaseService";
import { toast } from "sonner";

/**
 * Hook for managing database details
 */
export const useDatabaseDetails = () => {
  const [selectedDatabase, setSelectedDatabase] = useState<DatabaseInstance | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Fetch a specific database instance
  const fetchDatabase = useCallback(async (id: string) => {
    try {
      const data = await getDatabaseInstance(id);
      if (data) {
        setSelectedDatabase(data);
      }
    } catch (error) {
      console.error(`Error fetching database ${id}:`, error);
      toast.error("Failed to fetch database details");
    }
  }, []);

  // Open database details modal
  const handleOpenDetails = useCallback((database: DatabaseInstance) => {
    setSelectedDatabase(database);
    setIsDetailsOpen(true);
  }, []);

  return {
    selectedDatabase,
    setSelectedDatabase,
    isDetailsOpen,
    setIsDetailsOpen,
    fetchDatabase,
    handleOpenDetails
  };
};
