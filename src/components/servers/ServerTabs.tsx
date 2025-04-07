
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ServerDetailPanel from "./ServerDetailPanel";

interface ServerData {
  id: string;
  name: string;
  status: string;
  type: string;
  ip: string;
  os: string;
  cpu: string;
  memory: string;
  region: string;
}

interface ServerTabsProps {
  servers: ServerData[];
  searchQuery: string;
}

const ServerTabs: React.FC<ServerTabsProps> = ({ servers, searchQuery }) => {
  const [selectedTab, setSelectedTab] = useState<string>("all");
  
  const filterServers = () => {
    let filteredServers = servers.filter(server => 
      server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.os.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.region.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (selectedTab !== "all") {
      filteredServers = filteredServers.filter(server => server.status === selectedTab);
    }
    
    return filteredServers;
  };
  
  const getStatusCount = (status: string) => {
    return servers.filter(server => server.status === status).length;
  };
  
  const runningCount = getStatusCount("running");
  const stoppedCount = getStatusCount("stopped");
  const warningCount = getStatusCount("warning");
  const maintenanceCount = getStatusCount("maintenance");
  
  const filteredServers = filterServers();

  return (
    <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
      <TabsList className="grid grid-cols-5 md:w-auto">
        <TabsTrigger value="all">
          All ({servers.length})
        </TabsTrigger>
        <TabsTrigger value="running">
          Running ({runningCount})
        </TabsTrigger>
        <TabsTrigger value="stopped">
          Stopped ({stoppedCount})
        </TabsTrigger>
        <TabsTrigger value="warning">
          Warning ({warningCount})
        </TabsTrigger>
        <TabsTrigger value="maintenance">
          Maintenance ({maintenanceCount})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value={selectedTab} className="mt-6">
        {filteredServers.length === 0 ? (
          <div className="text-center p-8 border border-dashed rounded-lg">
            <h3 className="font-medium text-lg">No servers found</h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery 
                ? `No servers match your search criteria "${searchQuery}"`
                : "No servers available in this category"
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredServers.map((server) => (
              <ServerDetailPanel key={server.id} server={server} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default ServerTabs;
