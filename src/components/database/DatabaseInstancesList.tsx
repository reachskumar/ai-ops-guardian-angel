
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Play, Square, Settings } from "lucide-react";
import { DatabaseInstance } from "@/services/databaseService";

interface DatabaseInstancesListProps {
  databases: DatabaseInstance[];
  isLoading: boolean;
  onManage: (database: DatabaseInstance) => void;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
}

const DatabaseInstancesList: React.FC<DatabaseInstancesListProps> = ({
  databases,
  isLoading,
  onManage,
  onStart,
  onStop
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Running":
        return "text-green-500";
      case "Stopped":
        return "text-gray-500";
      case "Maintenance":
        return "text-amber-500";
      default:
        return "text-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6 h-[180px] flex flex-col justify-between">
              <div className="space-y-2">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
              <div className="flex justify-end">
                <div className="h-9 bg-muted rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!databases.length) {
    return (
      <div className="text-center py-12 border rounded-lg border-dashed">
        <Database className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
        <h3 className="mt-4 text-lg font-medium">No databases found</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          You haven't created any database instances yet. Add one to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {databases.map((db) => (
        <Card key={db.id}>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">{db.name}</h3>
                </div>
                <span className={getStatusColor(db.status)}>{db.status}</span>
              </div>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span>{db.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version:</span>
                  <span>{db.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Region:</span>
                  <span>{db.region}</span>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center pt-2">
                <div className="flex gap-2">
                  {db.status === "Running" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onStop(db.id)}
                    >
                      <Square className="h-4 w-4 mr-1" />
                      Stop
                    </Button>
                  )}
                  {db.status === "Stopped" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onStart(db.id)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Start
                    </Button>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => onManage(db)}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Manage
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DatabaseInstancesList;
