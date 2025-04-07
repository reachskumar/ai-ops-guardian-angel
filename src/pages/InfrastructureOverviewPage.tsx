
import React, { useState, useEffect } from "react";
import { SidebarWithProvider } from "@/components/Sidebar";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, ServerIcon, HardDrive, Network, Cloud } from "lucide-react";
import {
  ServerList,
  MonitoringOverview,
  ServerPerformanceSummary,
  ResourceUtilizationChart,
  NetworkTrafficMonitor
} from "@/components/monitoring";

// Mock server data - you can replace with real API calls
const servers = [
  { 
    id: "srv-001", 
    name: "Web Server 01", 
    status: "running", 
    type: "t2.medium", 
    ip: "192.168.1.101", 
    os: "Ubuntu 22.04 LTS",
    cpu: "2 vCPU",
    memory: "4 GB",
    region: "us-west-1"
  },
  { 
    id: "srv-002", 
    name: "DB Server 01", 
    status: "warning", 
    type: "t3.large", 
    ip: "192.168.1.102", 
    os: "Amazon Linux 2",
    cpu: "2 vCPU",
    memory: "8 GB",
    region: "us-west-1"
  },
  { 
    id: "srv-003", 
    name: "API Server 01", 
    status: "running", 
    type: "t2.small", 
    ip: "192.168.1.103", 
    os: "Ubuntu 20.04 LTS",
    cpu: "1 vCPU",
    memory: "2 GB",
    region: "us-east-1"
  },
  { 
    id: "srv-004", 
    name: "Cache Server", 
    status: "maintenance", 
    type: "t3.medium", 
    ip: "192.168.1.104", 
    os: "Amazon Linux 2",
    cpu: "2 vCPU",
    memory: "4 GB",
    region: "us-east-1"
  }
];

// Mock metrics data
const mockMetricsData = {
  cpu: [
    { timestamp: "2025-04-07T08:00:00Z", value: 45 },
    { timestamp: "2025-04-07T09:00:00Z", value: 52 },
    { timestamp: "2025-04-07T10:00:00Z", value: 68 },
    { timestamp: "2025-04-07T11:00:00Z", value: 73 },
    { timestamp: "2025-04-07T12:00:00Z", value: 65 },
    { timestamp: "2025-04-07T13:00:00Z", value: 58 },
    { timestamp: "2025-04-07T14:00:00Z", value: 63 }
  ],
  memory: [
    { timestamp: "2025-04-07T08:00:00Z", value: 62 },
    { timestamp: "2025-04-07T09:00:00Z", value: 65 },
    { timestamp: "2025-04-07T10:00:00Z", value: 73 },
    { timestamp: "2025-04-07T11:00:00Z", value: 78 },
    { timestamp: "2025-04-07T12:00:00Z", value: 82 },
    { timestamp: "2025-04-07T13:00:00Z", value: 76 },
    { timestamp: "2025-04-07T14:00:00Z", value: 70 }
  ],
  disk: [
    { timestamp: "2025-04-07T08:00:00Z", value: 55 },
    { timestamp: "2025-04-07T09:00:00Z", value: 56 },
    { timestamp: "2025-04-07T10:00:00Z", value: 57 },
    { timestamp: "2025-04-07T11:00:00Z", value: 58 },
    { timestamp: "2025-04-07T12:00:00Z", value: 60 },
    { timestamp: "2025-04-07T13:00:00Z", value: 61 },
    { timestamp: "2025-04-07T14:00:00Z", value: 62 }
  ],
  network: [
    { name: "08:00", inbound: 45, outbound: 32 },
    { name: "09:00", inbound: 52, outbound: 41 },
    { name: "10:00", inbound: 68, outbound: 45 },
    { name: "11:00", inbound: 73, outbound: 52 },
    { name: "12:00", inbound: 65, outbound: 48 },
    { name: "13:00", inbound: 58, outbound: 39 },
    { name: "14:00", inbound: 63, outbound: 44 }
  ]
};

const InfrastructureOverviewPage: React.FC = () => {
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const selectedServer = selectedServerId 
    ? servers.find(s => s.id === selectedServerId) 
    : null;

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      toast({
        title: "Data Refreshed",
        description: "Infrastructure data has been updated"
      });
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <SidebarWithProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Infrastructure Overview</h1>
              <p className="text-muted-foreground">
                Monitor and manage your cloud resources and infrastructure
              </p>
            </div>
            <Button onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="sticky top-16">
                <ServerList 
                  servers={servers} 
                  selectedServerId={selectedServerId}
                  onSelectServer={(id) => setSelectedServerId(id)}
                />
              </div>
            </div>

            <div className="lg:col-span-3">
              {selectedServer ? (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center">
                    <ServerIcon className="mr-2 h-5 w-5 text-primary" />
                    {selectedServer.name}
                  </h2>
                  
                  <ServerPerformanceSummary 
                    serverName={selectedServer.name}
                    metrics={{
                      cpu: 65,
                      memory: 78,
                      disk: 56,
                      network: 42,
                      healthScore: 82,
                      issues: 1
                    }}
                  />
                  
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="performance">Performance</TabsTrigger>
                      <TabsTrigger value="storage">Storage</TabsTrigger>
                      <TabsTrigger value="network">Network</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-6 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ResourceUtilizationChart
                          title="CPU Utilization"
                          data={mockMetricsData.cpu}
                          resourceType="cpu"
                        />
                        <ResourceUtilizationChart
                          title="Memory Utilization"
                          data={mockMetricsData.memory}
                          resourceType="memory"
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="performance" className="space-y-6 pt-4">
                      <div className="grid grid-cols-1 gap-6">
                        <ResourceUtilizationChart
                          title="CPU Utilization (24h)"
                          data={mockMetricsData.cpu}
                          resourceType="cpu"
                        />
                        <ResourceUtilizationChart
                          title="Memory Utilization (24h)"
                          data={mockMetricsData.memory}
                          resourceType="memory"
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="storage" className="space-y-6 pt-4">
                      <div className="grid grid-cols-1 gap-6">
                        <ResourceUtilizationChart
                          title="Disk Utilization"
                          data={mockMetricsData.disk}
                          resourceType="disk"
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="network" className="space-y-6 pt-4">
                      <NetworkTrafficMonitor data={mockMetricsData.network} />
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <MonitoringOverview servers={servers} />
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarWithProvider>
  );
};

export default InfrastructureOverviewPage;
