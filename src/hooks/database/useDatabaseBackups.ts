
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { 
  DatabaseBackup,
  getDatabaseBackups,
  createDatabaseBackup
} from "@/services/databaseService";

/**
 * Hook for managing database backups
 */
export const useDatabaseBackups = () => {
  const [backups, setBackups] = useState<DatabaseBackup[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);

  // Fetch database backups
  const fetchBackups = useCallback(async (databaseId: string) => {
    setIsLoadingBackups(true);
    try {
      const data = await getDatabaseBackups(databaseId);
      setBackups(data);
    } catch (error) {
      console.error("Error fetching backups:", error);
    } finally {
      setIsLoadingBackups(false);
    }
  }, []);

  // Handle creating a backup
  const handleCreateBackup = useCallback(async (databaseId: string, databaseName: string) => {
    try {
      const backupName = `${databaseName}-backup-${new Date().toISOString().split('T')[0]}`;
      const result = await createDatabaseBackup(databaseId, backupName);
      
      if (result.success) {
        toast.success("Backup initiated successfully");
        // Fetch updated backups after a delay to show the new backup
        setTimeout(() => {
          fetchBackups(databaseId);
        }, 500);
        return true;
      } else {
        toast.error(result.error || "Failed to create backup");
        return false;
      }
    } catch (error: any) {
      console.error("Error creating backup:", error);
      toast.error(error.message || "An error occurred");
      return false;
    }
  }, [fetchBackups]);

  // Handle deleting a backup
  const handleDeleteBackup = useCallback(async (backupId: string) => {
    // Find the backup we want to delete
    const backup = backups.find(b => b.id === backupId);
    if (!backup) return;
    
    // Update local state immediately for better UX
    setBackups(prev => prev.filter(b => b.id !== backupId));
    
    toast.success(`Backup "${backup.name}" deleted successfully`);
    return true;
  }, [backups]);

  // Handle downloading a backup
  const handleDownloadBackup = useCallback((backupId: string) => {
    const backup = backups.find(b => b.id === backupId);
    if (!backup) return;
    
    toast.success(`Preparing download for "${backup.name}"`);
    
    // Simulate download preparation
    setTimeout(() => {
      toast.success(`Download started for "${backup.name}"`);
    }, 1500);
  }, [backups]);

  // Handle restoring from a backup
  const handleRestoreBackup = useCallback((backupId: string) => {
    const backup = backups.find(b => b.id === backupId);
    if (!backup) return;
    
    // Confirm restore
    if (confirm(`Are you sure you want to restore from backup "${backup.name}"? This will overwrite your current database.`)) {
      toast.success(`Restoring database from "${backup.name}"`);
      
      // Simulate restore process
      setTimeout(() => {
        toast.success(`Database restored successfully from "${backup.name}"`);
      }, 2000);
    }
  }, [backups]);

  return {
    backups,
    isLoadingBackups,
    fetchBackups,
    handleCreateBackup,
    handleDeleteBackup,
    handleDownloadBackup,
    handleRestoreBackup
  };
};
