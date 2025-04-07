import React, { useState, useEffect } from "react";
import { SidebarWithProvider } from "@/components/Sidebar";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Server as ServerIcon, Activity } from "lucide-react";
import { 
  MonitoringWidget,
  ServerMetricsPanel,
  LazyLoadingSpinner 
} from "@/components/dashboard";
import { getResourceMetrics } from "@/services/cloudProviderService";
import { 
  ServerList, 
  MonitoringOverview,
  AlertsPanel,
  DetailedMetricsPanel
} from "@/components/monitoring";

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
  },
  { 
    id: "srv-005", 
    name: "Worker Node 01", 
    status: "stopped", 
    type: "t2.micro", 
    ip: "192.168.1.105", 
    os: "Ubuntu 22.04 LTS",
    cpu: "1 vCPU",
    memory: "1 GB",
    region: "us-west-2"
  },
];

const ServerMonitoringPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<any[]>([]);
  const { toast } = useToast();

  const selectedServer = selectedServerId 
    ? servers.find(s => s.id === selectedServerId) 
    : null;

  useEffect(() => {
    if (selectedServerId) {
      fetchServerMetrics(selectedServerId);
    }
  }, [selectedServerId]);

  const fetchServerMetrics = async (serverId: string) => {
    setIsRefreshing(true);
    try {
      const metricsData = await getResourceMetrics(serverId);
      setMetrics(metricsData);
    } catch (error) {
      console.error("Error fetching server metrics:", error);
      toast({
        title: "Error",
        description: "Failed to fetch server metrics",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (selectedServerId) {
      fetchServerMetrics(selectedServerId);
    } else {
      setIsRefreshing(true);
      // Simulate refresh of all data
      setTimeout(() => {
        toast({
          title: "Refreshed",
          description: "Monitoring data has been updated"
        });
        setIsRefreshing(false);
      }, 1000);
    }
  };

  return (
    <SidebarWithProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Server Monitoring</h1>
              <p className="text-muted-foreground">
                Monitor performance and health of all servers in real-time
              </p>
            </div>
            <Button onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <ServerIcon className="h-5 w-5" />
                    Servers
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ServerList 
                    servers={servers} 
                    selectedServerId={selectedServerId}
                    onSelectServer={(id) => setSelectedServerId(id)}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              {selectedServer ? (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <div className="flex items-center justify-between mb-4">
                    <TabsList>
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
                      <TabsTrigger value="alerts">Alerts</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="overview" className="space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium">
                          {selectedServer.name} Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isRefreshing ? (
                          <LazyLoadingSpinner />
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ServerMetricsPanel 
                              serverName={selectedServer.name}
                              serverStatus={selectedServer.status}
                              lastUpdated="5 minutes ago"
                              metrics={[
                                { name: "CPU Usage", value: 45, max: 100, unit: "%", status: "normal" },
                                { name: "Memory Usage", value: 3.2, max: 4, unit: "GB", status: "warning" },
                                { name: "Disk Usage", value: 56, max: 100, unit: "%", status: "normal" },
                                { name: "Network In", value: 15.4, max: 100, unit: "Mbps", status: "normal" }
                              ]}
                              onRefresh={() => fetchServerMetrics(selectedServer.id)}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    {!isRefreshing && metrics.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MonitoringWidget
                          title="CPU Usage (Last Hour)"
                          type="area"
                          data={metrics.find(m => m.name === "CPU")?.data.map((d: any) => ({
                            time: new Date(d.timestamp).toLocaleTimeString(),
                            value: d.value
                          })) || []}
                          height={220}
                        />
                        <MonitoringWidget
                          title="Memory Usage (Last Hour)"
                          type="area"
                          data={metrics.find(m => m.name === "Memory")?.data.map((d: any) => ({
                            time: new Date(d.timestamp).toLocaleTimeString(),
                            value: d.value
                          })) || []}
                          height={220}
                        />
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="metrics">
                    {isRefreshing ? (
                      <div className="grid grid-cols-1 gap-4">
                        <LazyLoadingSpinner />
                      </div>
                    ) : (
                      <DetailedMetricsPanel
                        serverName={selectedServer.name}
                        serverId={selectedServer.id}
                      />
                    )}
                  </TabsContent>
                  
                  <TabsContent value="alerts">
                    <AlertsPanel 
                      serverId={selectedServer.id} 
                      isLoading={isRefreshing}
                    />
                  </TabsContent>
                </Tabs>
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

export default ServerMonitoringPage;
