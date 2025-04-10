
import React from "react";
import { SidebarWithProvider } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, RefreshCw } from "lucide-react";
import { useDatabase } from "@/hooks/useDatabase";
import {
  DatabaseInstancesList,
  CreateDatabaseDialog,
  DatabaseDetailsDialog
} from "@/components/database";

const DatabasesPage = () => {
  const {
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
    handleSaveSettings
  } = useDatabase();

  return (
    <SidebarWithProvider>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Database Management</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => fetchDatabases()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Database
            </Button>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Database Instances</CardTitle>
          </CardHeader>
          <CardContent>
            <DatabaseInstancesList
              databases={databases}
              isLoading={isLoading}
              onManage={handleOpenDetails}
              onStart={handleStartDatabase}
              onStop={handleStopDatabase}
            />
          </CardContent>
        </Card>
        
        {/* Create Database Dialog */}
        <CreateDatabaseDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onCreate={handleCreateDatabase}
        />
        
        {/* Database Details Dialog */}
        <DatabaseDetailsDialog
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          database={selectedDatabase}
          backups={backups}
          cpuMetrics={cpuMetrics}
          memoryMetrics={memoryMetrics}
          connectionMetrics={connectionMetrics}
          diskMetrics={diskMetrics}
          isLoadingMetrics={isLoadingMetrics}
          isLoadingBackups={isLoadingBackups}
          onCreateBackup={handleCreateBackup}
          onDeleteBackup={handleDeleteBackup}
          onDownloadBackup={handleDownloadBackup}
          onRestoreBackup={handleRestoreBackup}
          onSaveSettings={handleSaveSettings}
        />
      </div>
    </SidebarWithProvider>
  );
};

export default DatabasesPage;
