
import { useCallback, useEffect } from "react";
import { useDatabaseList } from "./useDatabaseList";
import { useDatabaseOperations } from "./useDatabaseOperations";
import { useDatabaseMetrics } from "./useDatabaseMetrics";
import { useDatabaseBackups } from "./useDatabaseBackups";
import { useDatabaseDetails } from "./useDatabaseDetails";
import { DatabaseInstance } from "@/services/databaseService";

/**
 * Combined hook for database management
 * This is the main hook that composes all the other database hooks
 */
export const useDatabase = () => {
  // Get database list functionality
  const {
    databases,
    isLoading,
    fetchDatabases,
    setDatabases
  } = useDatabaseList();

  // Get database details functionality
  const {
    selectedDatabase,
    setSelectedDatabase,
    isDetailsOpen,
    setIsDetailsOpen,
    handleOpenDetails
  } = useDatabaseDetails();

  // Get database operations functionality
  const {
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    handleCreateDatabase,
    handleStartDatabase,
    handleStopDatabase,
    handleSaveSettings
  } = useDatabaseOperations({
    databases,
    selectedDatabase,
    setDatabases,
    setSelectedDatabase
  });

  // Get database metrics functionality
  const {
    cpuMetrics,
    memoryMetrics,
    connectionMetrics,
    diskMetrics,
    isLoadingMetrics,
    timeRange,
    fetchMetrics,
    handleTimeRangeChange
  } = useDatabaseMetrics();

  // Get database backups functionality
  const {
    backups,
    isLoadingBackups,
    fetchBackups,
    handleCreateBackup: baseHandleCreateBackup,
    handleDeleteBackup,
    handleDownloadBackup,
    handleRestoreBackup
  } = useDatabaseBackups();

  // Composite function for opening database details
  const openDatabaseDetails = useCallback((database: DatabaseInstance) => {
    handleOpenDetails(database);
    
    // Fetch related data
    fetchBackups(database.id);
    fetchMetrics(database.id);
  }, [handleOpenDetails, fetchBackups, fetchMetrics]);

  // Wrapper for create database to update the list after creation
  const wrappedHandleCreateDatabase = useCallback(async (database: {
    name: string;
    type: string;
    region: string;
    version: string;
  }) => {
    const result = await handleCreateDatabase(database);
    if (result) {
      fetchDatabases();
      setIsCreateDialogOpen(false);
    }
  }, [handleCreateDatabase, fetchDatabases, setIsCreateDialogOpen]);

  // Wrapper for handleCreateBackup that gets the database id from selectedDatabase
  const wrappedHandleCreateBackup = useCallback(async () => {
    if (!selectedDatabase) return;
    return baseHandleCreateBackup(selectedDatabase.id, selectedDatabase.name);
  }, [selectedDatabase, baseHandleCreateBackup]);

  // Effect to handle time range changes
  useEffect(() => {
    if (selectedDatabase && timeRange) {
      fetchMetrics(selectedDatabase.id);
    }
  }, [selectedDatabase, timeRange, fetchMetrics]);

  return {
    // Database list state
    databases,
    isLoading,
    fetchDatabases,
    
    // Database details state
    selectedDatabase,
    isDetailsOpen,
    setIsDetailsOpen,
    
    // Database operations
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    handleCreateDatabase: wrappedHandleCreateDatabase,
    handleStartDatabase,
    handleStopDatabase,
    handleSaveSettings,
    
    // Database metrics
    cpuMetrics,
    memoryMetrics,
    connectionMetrics,
    diskMetrics,
    isLoadingMetrics,
    timeRange,
    handleTimeRangeChange,
    
    // Database backups
    backups,
    isLoadingBackups,
    handleCreateBackup: wrappedHandleCreateBackup,
    handleDeleteBackup,
    handleDownloadBackup,
    handleRestoreBackup,
    
    // Composite functions
    handleOpenDetails: openDatabaseDetails
  };
};
