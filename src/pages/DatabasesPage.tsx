
import React from "react";
import { SidebarWithProvider } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Server, HardDrive, BarChart } from "lucide-react";

const DatabasesPage = () => {
  return (
    <SidebarWithProvider>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Database Management</h1>
        
        <Tabs defaultValue="instances">
          <TabsList className="mb-4">
            <TabsTrigger value="instances">Database Instances</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="backups">Backups</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="instances">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <DatabaseInstanceCard 
                name="Production DB" 
                type="PostgreSQL" 
                status="Running" 
                region="us-east-1"
                version="14.5"
              />
              <DatabaseInstanceCard 
                name="Analytics DB" 
                type="MySQL" 
                status="Running" 
                region="us-west-2"
                version="8.0"
              />
              <DatabaseInstanceCard 
                name="Development DB" 
                type="PostgreSQL" 
                status="Stopped" 
                region="eu-west-1"
                version="14.5"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Database Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Monitor CPU usage, memory allocation, IO operations, and other key performance metrics for your database instances.
                </p>
                <div className="h-64 flex items-center justify-center border rounded-md">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <BarChart className="h-12 w-12 mb-2" />
                    <p>Performance data visualization coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="backups">
            <Card>
              <CardHeader>
                <CardTitle>Database Backups</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Schedule, manage, and restore database backups to ensure data safety and business continuity.
                </p>
                <div className="h-64 flex items-center justify-center border rounded-md">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <HardDrive className="h-12 w-12 mb-2" />
                    <p>Backup management interface coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Database Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Configure database parameters, access controls, encryption settings, and maintenance windows.
                </p>
                <div className="h-64 flex items-center justify-center border rounded-md">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <Server className="h-12 w-12 mb-2" />
                    <p>Settings configuration interface coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarWithProvider>
  );
};

interface DatabaseInstanceCardProps {
  name: string;
  type: string;
  status: "Running" | "Stopped" | "Maintenance";
  region: string;
  version: string;
}

const DatabaseInstanceCard: React.FC<DatabaseInstanceCardProps> = ({
  name,
  type,
  status,
  region,
  version
}) => {
  const getStatusColor = () => {
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

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          {name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Type:</span>
            <span>{type}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Version:</span>
            <span>{version}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status:</span>
            <span className={getStatusColor()}>{status}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Region:</span>
            <span>{region}</span>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="text-sm text-primary hover:text-primary/80">
              Manage
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabasesPage;
