
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Download, Trash2, RotateCw } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DatabaseBackup } from "@/services/databaseService";

interface DatabaseBackupsProps {
  backups: DatabaseBackup[];
  isLoading: boolean;
  onCreateBackup: () => void;
  onDeleteBackup: (id: string) => void;
  onDownloadBackup: (id: string) => void;
  onRestoreBackup: (id: string) => void;
}

const DatabaseBackups: React.FC<DatabaseBackupsProps> = ({
  backups,
  isLoading,
  onCreateBackup,
  onDeleteBackup,
  onDownloadBackup,
  onRestoreBackup
}) => {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateBackup = () => {
    setIsCreating(true);
    onCreateBackup();
    setTimeout(() => setIsCreating(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge variant="outline" className="border-green-500 text-green-500">Completed</Badge>;
      case "In Progress":
        return <Badge variant="outline" className="border-amber-500 text-amber-500">In Progress</Badge>;
      case "Failed":
        return <Badge variant="outline" className="border-red-500 text-red-500">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Backups</CardTitle>
          <div className="h-9 w-32 bg-muted rounded animate-pulse"></div>
        </CardHeader>
        <CardContent className="animate-pulse">
          <div className="h-[300px] bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Backups</CardTitle>
        <Button 
          onClick={handleCreateBackup}
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <RotateCw className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create Backup
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {backups.length === 0 ? (
          <div className="text-center py-8 border rounded-lg border-dashed">
            <p className="text-muted-foreground">No backups found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create a backup to protect your data
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell>{backup.name}</TableCell>
                  <TableCell>{new Date(backup.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{backup.size}</TableCell>
                  <TableCell>{getStatusBadge(backup.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="icon" 
                        variant="ghost"
                        disabled={backup.status !== "Completed"}
                        onClick={() => onDownloadBackup(backup.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        disabled={backup.status !== "Completed"}
                        onClick={() => onRestoreBackup(backup.id)}
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => onDeleteBackup(backup.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default DatabaseBackups;
