
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { 
  DatabaseInstance, 
  DatabaseBackup,
  DatabaseMetric,
  getDatabaseInstances,
  getDatabaseInstance,
  createDatabaseInstance,
  updateDatabaseInstance,
  startDatabaseInstance,
  stopDatabaseInstance,
  getDatabaseBackups,
  getDatabaseMetrics,
  createDatabaseBackup,
} from "@/services/databaseService";

export const useDatabase = () => {
  const [databases, setDatabases] = useState<DatabaseInstance[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<DatabaseInstance | null>(null);
  const [backups, setBackups] = useState<DatabaseBackup[]>([]);
  const [cpuMetrics, setCpuMetrics] = useState<DatabaseMetric[]>([]);
  const [memoryMetrics, setMemoryMetrics] = useState<DatabaseMetric[]>([]);
  const [connectionMetrics, setConnectionMetrics] = useState<DatabaseMetric[]>([]);
  const [diskMetrics, setDiskMetrics] = useState<DatabaseMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [timeRange, setTimeRange] = useState<string>("24h");

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

  // Fetch database metrics
  const fetchMetrics = useCallback(async (databaseId: string) => {
    setIsLoadingMetrics(true);
    try {
      const [cpu, memory, connections, disk] = await Promise.all([
        getDatabaseMetrics(databaseId, "cpu", timeRange),
        getDatabaseMetrics(databaseId, "memory", timeRange),
        getDatabaseMetrics(databaseId, "connections", timeRange),
        getDatabaseMetrics(databaseId, "disk_io", timeRange)
      ]);
      
      setCpuMetrics(cpu);
      setMemoryMetrics(memory);
      setConnectionMetrics(connections);
      setDiskMetrics(disk);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setIsLoadingMetrics(false);
    }
  }, [timeRange]);

  // Handle time range change
  const handleTimeRangeChange = useCallback((range: string) => {
    setTimeRange(range);
    if (selectedDatabase) {
      fetchMetrics(selectedDatabase.id);
    }
  }, [selectedDatabase, fetchMetrics]);

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
        fetchDatabases();
        setIsCreateDialogOpen(false);
      } else {
        toast.error(result.error || "Failed to create database");
      }
    } catch (error: any) {
      console.error("Error creating database:", error);
      toast.error(error.message || "An error occurred");
    }
  }, [fetchDatabases]);

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
      } else {
        toast.error(result.error || "Failed to start database");
      }
    } catch (error: any) {
      console.error("Error starting database:", error);
      toast.error(error.message || "An error occurred");
    }
  }, [selectedDatabase]);

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
      } else {
        toast.error(result.error || "Failed to stop database");
      }
    } catch (error: any) {
      console.error("Error stopping database:", error);
      toast.error(error.message || "An error occurred");
    }
  }, [selectedDatabase]);

  // Handle creating a backup
  const handleCreateBackup = useCallback(async () => {
    if (!selectedDatabase) return;
    
    try {
      const backupName = `${selectedDatabase.name}-backup-${new Date().toISOString().split('T')[0]}`;
      const result = await createDatabaseBackup(selectedDatabase.id, backupName);
      
      if (result.success) {
        toast.success("Backup initiated successfully");
        // Fetch updated backups after a delay to show the new backup
        setTimeout(() => {
          fetchBackups(selectedDatabase.id);
        }, 500);
      } else {
        toast.error(result.error || "Failed to create backup");
      }
    } catch (error: any) {
      console.error("Error creating backup:", error);
      toast.error(error.message || "An error occurred");
    }
  }, [selectedDatabase, fetchBackups]);

  // Handle deleting a backup
  const handleDeleteBackup = useCallback(async (backupId: string) => {
    if (!selectedDatabase) return;
    
    const backup = backups.find(b => b.id === backupId);
    if (!backup) return;
    
    // Update local state immediately for better UX
    setBackups(prev => prev.filter(b => b.id !== backupId));
    
    toast.success(`Backup "${backup.name}" deleted successfully`);
  }, [selectedDatabase, backups]);

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
      } else {
        toast.error(result.error || "Failed to update settings");
      }
    } catch (error: any) {
      console.error("Error updating settings:", error);
      toast.error(error.message || "An error occurred");
    }
  }, [selectedDatabase]);

  // Open database details modal
  const handleOpenDetails = useCallback((database: DatabaseInstance) => {
    setSelectedDatabase(database);
    setIsDetailsOpen(true);
    
    // Fetch related data
    fetchBackups(database.id);
    fetchMetrics(database.id);
  }, [fetchBackups, fetchMetrics]);

  // Load initial data
  useEffect(() => {
    fetchDatabases();
  }, [fetchDatabases]);

  return {
    databases,
    selectedDatabase,
    backups,
    cpuMetrics,
    memoryMetrics,
    connectionMetrics,
    diskMetrics,
    isLoading,
    isDetailsOpen,
    isCreateDialogOpen,
    isLoadingMetrics,
    isLoadingBackups,
    timeRange,
    fetchDatabases,
    handleCreateDatabase,
    handleStartDatabase,
    handleStopDatabase,
    handleOpenDetails,
    setIsDetailsOpen,
    setIsCreateDialogOpen,
    handleCreateBackup,
    handleDeleteBackup,
    handleDownloadBackup,
    handleRestoreBackup,
    handleSaveSettings,
    handleTimeRangeChange
  };
};
