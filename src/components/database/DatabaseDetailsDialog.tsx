
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatabaseInstance, DatabaseBackup, DatabaseMetric } from "@/services/databaseService";
import DatabasePerformance from "./DatabasePerformance";
import DatabaseBackups from "./DatabaseBackups";
import DatabaseSettings from "./DatabaseSettings";

interface DatabaseDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  database: DatabaseInstance | null;
  backups: DatabaseBackup[];
  cpuMetrics: DatabaseMetric[];
  memoryMetrics: DatabaseMetric[];
  connectionMetrics: DatabaseMetric[];
  diskMetrics: DatabaseMetric[];
  isLoadingMetrics: boolean;
  isLoadingBackups: boolean;
  onCreateBackup: () => void;
  onDeleteBackup: (id: string) => void;
  onDownloadBackup: (id: string) => void;
  onRestoreBackup: (id: string) => void;
  onSaveSettings: (updates: Partial<DatabaseInstance>) => Promise<void>;
}

const DatabaseDetailsDialog: React.FC<DatabaseDetailsDialogProps> = ({
  isOpen,
  onClose,
  database,
  backups,
  cpuMetrics,
  memoryMetrics,
  connectionMetrics,
  diskMetrics,
  isLoadingMetrics,
  isLoadingBackups,
  onCreateBackup,
  onDeleteBackup,
  onDownloadBackup,
  onRestoreBackup,
  onSaveSettings
}) => {
  const [activeTab, setActiveTab] = useState("performance");
  
  if (!database) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{database.name}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="backups">Backups</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="performance" className="space-y-4">
            <DatabasePerformance
              cpuMetrics={cpuMetrics}
              memoryMetrics={memoryMetrics}
              connectionMetrics={connectionMetrics}
              diskMetrics={diskMetrics}
              isLoading={isLoadingMetrics}
            />
          </TabsContent>
          
          <TabsContent value="backups">
            <DatabaseBackups
              backups={backups}
              isLoading={isLoadingBackups}
              onCreateBackup={onCreateBackup}
              onDeleteBackup={onDeleteBackup}
              onDownloadBackup={onDownloadBackup}
              onRestoreBackup={onRestoreBackup}
            />
          </TabsContent>
          
          <TabsContent value="settings">
            <DatabaseSettings
              database={database}
              onSave={onSaveSettings}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default DatabaseDetailsDialog;
