
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { 
  DatabaseInstance,
  createDatabaseInstance,
  startDatabaseInstance,
  stopDatabaseInstance,
  updateDatabaseInstance
} from "@/services/databaseService";

interface UseDatabaseOperationsProps {
  databases: DatabaseInstance[];
  selectedDatabase: DatabaseInstance | null;
  setDatabases: React.Dispatch<React.SetStateAction<DatabaseInstance[]>>;
  setSelectedDatabase: React.Dispatch<React.SetStateAction<DatabaseInstance | null>>;
}

/**
 * Hook for database CRUD operations
 */
export const useDatabaseOperations = ({
  databases,
  selectedDatabase,
  setDatabases,
  setSelectedDatabase
}: UseDatabaseOperationsProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Create a new database instance
  const handleCreateDatabase = useCallback(async (database: {
    name: string;
    type: string;
    region: string;
    version: string;
  }) => {
    try {
      const result = await createDatabaseInstance({
        ...database,
        status: "Running",
        resources: {
          cpu: 2,
          memory: 8,
          storage: 100
        }
      });
      
      if (result.success) {
        toast.success("Database created successfully");
        
        // We'll need to reload the databases list
        return true;
      } else {
        toast.error(result.error || "Failed to create database");
        return false;
      }
    } catch (error: any) {
      console.error("Error creating database:", error);
      toast.error(error.message || "An error occurred");
      return false;
    }
  }, []);

  // Start a database instance
  const handleStartDatabase = useCallback(async (id: string) => {
    try {
      const result = await startDatabaseInstance(id);
      
      if (result.success) {
        toast.success("Database started successfully");
        
        // Update local state to reflect changes immediately
        setDatabases(prev => 
          prev.map(db => db.id === id ? { ...db, status: "Running" } : db)
        );
        
        if (selectedDatabase?.id === id) {
          setSelectedDatabase(prev => prev ? { ...prev, status: "Running" } : null);
        }
        
        return true;
      } else {
        toast.error(result.error || "Failed to start database");
        return false;
      }
    } catch (error: any) {
      console.error("Error starting database:", error);
      toast.error(error.message || "An error occurred");
      return false;
    }
  }, [selectedDatabase, setDatabases, setSelectedDatabase]);

  // Stop a database instance
  const handleStopDatabase = useCallback(async (id: string) => {
    try {
      const result = await stopDatabaseInstance(id);
      
      if (result.success) {
        toast.success("Database stopped successfully");
        
        // Update local state to reflect changes immediately
        setDatabases(prev => 
          prev.map(db => db.id === id ? { ...db, status: "Stopped" } : db)
        );
        
        if (selectedDatabase?.id === id) {
          setSelectedDatabase(prev => prev ? { ...prev, status: "Stopped" } : null);
        }
        
        return true;
      } else {
        toast.error(result.error || "Failed to stop database");
        return false;
      }
    } catch (error: any) {
      console.error("Error stopping database:", error);
      toast.error(error.message || "An error occurred");
      return false;
    }
  }, [selectedDatabase, setDatabases, setSelectedDatabase]);

  // Handle saving database settings
  const handleSaveSettings = useCallback(async (updates: Partial<DatabaseInstance>) => {
    if (!selectedDatabase) return;
    
    try {
      const result = await updateDatabaseInstance(selectedDatabase.id, updates);
      
      if (result.success) {
        toast.success("Settings updated successfully");
        
        // Update local state
        setSelectedDatabase(prev => prev ? { ...prev, ...updates } : null);
        setDatabases(prev => 
          prev.map(db => db.id === selectedDatabase.id ? { ...db, ...updates } : db)
        );
        
        return true;
      } else {
        toast.error(result.error || "Failed to update settings");
        return false;
      }
    } catch (error: any) {
      console.error("Error updating settings:", error);
      toast.error(error.message || "An error occurred");
      return false;
    }
  }, [selectedDatabase, setDatabases, setSelectedDatabase]);

  return {
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    handleCreateDatabase,
    handleStartDatabase,
    handleStopDatabase,
    handleSaveSettings
  };
};
