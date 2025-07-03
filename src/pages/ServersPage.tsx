
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { SidebarWithProvider } from "@/components/Sidebar";
import { Server } from "lucide-react";
import { ServerSummaryCards, ServerTabs, SearchField } from "@/components/servers";

const ServersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const servers = [
    {
      id: "srv-1",
      name: "prod-web-01",
      status: "running",
      type: "web server",
      ip: "10.0.1.4",
      os: "Ubuntu 22.04",
      cpu: "4 vCPUs",
      memory: "16 GB",
      region: "us-east-1",
    },
    {
      id: "srv-2",
      name: "prod-db-01",
      status: "running",
      type: "database",
      ip: "10.0.1.5",
      os: "Debian 11",
      cpu: "8 vCPUs",
      memory: "32 GB",
      region: "us-east-1",
    },
    {
      id: "srv-3",
      name: "staging-web-01",
      status: "stopped",
      type: "web server",
      ip: "10.0.2.4",
      os: "Ubuntu 20.04",
      cpu: "2 vCPUs",
      memory: "8 GB",
      region: "eu-west-1",
    },
    {
      id: "srv-4",
      name: "dev-app-01",
      status: "running",
      type: "application",
      ip: "10.0.3.10",
      os: "Amazon Linux 2",
      cpu: "2 vCPUs",
      memory: "4 GB",
      region: "us-west-2",
    },
    {
      id: "srv-5",
      name: "prod-cache-01",
      status: "maintenance",
      type: "cache",
      ip: "10.0.1.6",
      os: "Redis OS",
      cpu: "2 vCPUs",
      memory: "8 GB",
      region: "us-east-1",
    },
  ];
  
  return (
    <SidebarWithProvider>
      <Helmet>
        <title>Servers - AI Ops Guardian</title>
      </Helmet>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Server Management</h1>
          <Button>
            <Server className="mr-2 h-4 w-4" />
            Add Server
          </Button>
        </div>

        <ServerSummaryCards servers={servers} />

        <div className="flex justify-between items-center mb-4">
          <div />
          <SearchField 
            searchQuery={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>

        <ServerTabs servers={servers} searchQuery={searchQuery} />
      </div>
    </SidebarWithProvider>
  );
};

export default ServersPage;
