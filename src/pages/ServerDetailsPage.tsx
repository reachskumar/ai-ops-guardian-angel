
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import { SidebarWithProvider } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ServerMetricsPanel,
  ServerDetailsHeader,
  ServerPropertiesPanel
} from "@/components/dashboard";
import { ArrowLeft, Play, Pause, RefreshCw, Trash2, Download, Upload, Settings } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

type ServerDetailTab = "overview" | "logs" | "network" | "security" | "settings";

const ServerDetailsPage: React.FC = () => {
  const { serverId } = useParams<{ serverId: string }>();
  const [activeTab, setActiveTab] = useState<ServerDetailTab>("overview");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // In a real app, we would fetch this data from API
  const server = {
    id: serverId || "unknown",
    name: serverId === "srv-1" ? "prod-web-01" : 
          serverId === "srv-2" ? "prod-db-01" : 
          serverId === "srv-3" ? "staging-web-01" : 
          serverId === "srv-4" ? "dev-app-01" : 
          serverId === "srv-5" ? "prod-cache-01" : "Unknown Server",
    status: serverId === "srv-3" ? "stopped" : 
            serverId === "srv-5" ? "maintenance" : "running",
    type: serverId === "srv-1" || serverId === "srv-3" ? "web server" :
          serverId === "srv-2" ? "database" :
          serverId === "srv-4" ? "application" : 
          serverId === "srv-5" ? "cache" : "unknown",
    ip: "10.0.1." + (parseInt(serverId?.split("-")[1] || "0") + 3),
    os: serverId === "srv-1" || serverId === "srv-3" ? "Ubuntu 22.04" :
        serverId === "srv-2" ? "Debian 11" :
        serverId === "srv-4" ? "Amazon Linux 2" :
        serverId === "srv-5" ? "Redis OS" : "Unknown OS",
    cpu: serverId === "srv-2" ? "8 vCPUs" :
         serverId === "srv-1" ? "4 vCPUs" : "2 vCPUs",
    memory: serverId === "srv-2" ? "32 GB" :
            serverId === "srv-1" ? "16 GB" :
            serverId === "srv-3" || serverId === "srv-5" ? "8 GB" : "4 GB",
    region: serverId === "srv-3" ? "eu-west-1" :
            serverId === "srv-4" ? "us-west-2" : "us-east-1",
    lastUpdated: "5 minutes ago"
  };

  // Mock server metrics
  const serverMetrics = [
    {
      name: "CPU Usage",
      value: serverId === "srv-1" ? 65 : 
             serverId === "srv-2" ? 78 : 
             serverId === "srv-4" ? 42 : 30,
      max: 100,
      unit: "%",
      status: serverId === "srv-2" ? "warning" : "normal" as "normal" | "warning" | "critical"
    },
    {
      name: "Memory Usage",
      value: serverId === "srv-1" ? 75 : 
             serverId === "srv-2" ? 82 : 
             serverId === "srv-4" ? 58 : 45,
      max: 100,
      unit: "%",
      status: serverId === "srv-2" ? "warning" : "normal" as "normal" | "warning" | "critical"
    },
    {
      name: "Disk I/O",
      value: serverId === "srv-2" ? 580 : 
             serverId === "srv-5" ? 450 : 
             serverId === "srv-1" ? 320 : 150,
      max: 1000,
      unit: "IOPS",
      status: "normal" as "normal" | "warning" | "critical"
    },
    {
      name: "Network",
      value: serverId === "srv-1" ? 250 : 
             serverId === "srv-2" ? 320 : 
             serverId === "srv-5" ? 180 : 85,
      max: 1000,
      unit: "Mbps",
      status: "normal" as "normal" | "warning" | "critical"
    }
  ];

  // Server properties to display
  const serverProperties = [
    { label: "Instance Type", value: server.cpu.includes("8") ? "t3.2xlarge" : 
                                      server.cpu.includes("4") ? "t3.xlarge" : "t3.medium" },
    { label: "Operating System", value: server.os },
    { label: "IP Address", value: server.ip },
    { label: "Region", value: server.region },
    { label: "Uptime", value: server.status === "running" ? "15 days, 7 hours" : "0" },
    { label: "CPU Cores", value: server.cpu },
    { label: "Memory", value: server.memory },
    { label: "Storage", value: "100 GB SSD" },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "running":
        return "bg-green-500 hover:bg-green-600";
      case "warning":
        return "bg-amber-500 hover:bg-amber-600";
      case "stopped":
        return "bg-gray-500 hover:bg-gray-600";
      case "maintenance":
        return "bg-blue-500 hover:bg-blue-600";
      default:
        return "";
    }
  };

  return (
    <SidebarWithProvider>
      <Helmet>
        <title>{server.name} - Server Details - AI Ops Guardian</title>
      </Helmet>
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link to="/servers">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Servers
            </Link>
          </Button>
          <h1 className="text-2xl font-bold flex-1">{server.name}</h1>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(server.status)}>{server.status}</Badge>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-2/3 space-y-6">
            <ServerMetricsPanel
              serverName={server.name}
              serverStatus={server.status}
              lastUpdated={server.lastUpdated}
              metrics={serverMetrics}
              onRefresh={handleRefresh}
            />
            
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ServerDetailTab)} className="w-full">
              <TabsList className="grid grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
                <TabsTrigger value="network">Network</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4 pt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {serverProperties.map((prop, i) => (
                        <div key={i} className="flex flex-col space-y-1">
                          <span className="text-sm font-medium text-muted-foreground">{prop.label}</span>
                          <span>{prop.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="logs" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Server Logs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-black text-green-500 font-mono p-4 rounded-md h-64 overflow-y-auto">
                      {server.status === "running" ? (
                        <>
                          <p>[2025-04-07 08:15:23] INFO: System startup completed</p>
                          <p>[2025-04-07 08:16:05] INFO: Service nginx started</p>
                          <p>[2025-04-07 08:16:10] INFO: Service postgresql started</p>
                          <p>[2025-04-07 09:23:45] INFO: Backup process initialized</p>
                          <p>[2025-04-07 09:25:12] INFO: Backup completed successfully</p>
                          <p>[2025-04-07 10:45:32] WARN: High memory usage detected (82%)</p>
                          <p>[2025-04-07 11:02:18] INFO: Memory usage normalized (65%)</p>
                          <p>[2025-04-07 12:15:45] INFO: Scheduled maintenance check completed</p>
                          <p>[2025-04-07 14:30:12] INFO: Successfully rotated logs</p>
                        </>
                      ) : (
                        <p>[System] No logs available - server is not running</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="network" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Network Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm font-medium text-muted-foreground">Primary IP</span>
                          <span>{server.ip}</span>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm font-medium text-muted-foreground">Subnet</span>
                          <span>10.0.1.0/24</span>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm font-medium text-muted-foreground">Gateway</span>
                          <span>10.0.1.1</span>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm font-medium text-muted-foreground">DNS</span>
                          <span>8.8.8.8, 1.1.1.1</span>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-md font-medium mb-2">Security Groups</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-2 bg-muted rounded-md">
                            <div>
                              <p className="font-medium">{server.type === "web server" ? "web-server-sg" : 
                                                         server.type === "database" ? "database-sg" : 
                                                         "default-sg"}</p>
                              <p className="text-sm text-muted-foreground">
                                {server.type === "web server" ? "Allow HTTP, HTTPS, SSH" : 
                                 server.type === "database" ? "Allow PostgreSQL, SSH" : 
                                 "Basic connectivity"}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="security" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-md font-medium mb-2">SSH Access</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-2 bg-muted rounded-md">
                            <div>
                              <p className="font-medium">SSH Key: ops-team-key</p>
                              <p className="text-sm text-muted-foreground">Last used: 2 hours ago</p>
                            </div>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-md font-medium mb-2">Vulnerability Scan</h3>
                        <div className="p-2 rounded-md bg-green-100 dark:bg-green-900/20">
                          <p className="text-green-700 dark:text-green-300">Last scan: 12 hours ago - No vulnerabilities found</p>
                        </div>
                        <Button variant="outline" size="sm" className="mt-2">
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Run New Scan
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="settings" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Server Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-md font-medium">Power Options</h3>
                          <p className="text-sm text-muted-foreground">Control server power state</p>
                        </div>
                        <div className="flex gap-2">
                          {server.status !== "running" ? (
                            <Button size="sm" variant="outline" className="text-green-600">
                              <Play className="h-4 w-4 mr-1" />
                              Start
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="text-amber-600">
                              <Pause className="h-4 w-4 mr-1" />
                              Stop
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            Restart
                          </Button>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-md font-medium">Backup</h3>
                          <p className="text-sm text-muted-foreground">Last backup: 12 hours ago</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Upload className="h-4 w-4 mr-1" />
                            Create Backup
                          </Button>
                          <Button size="sm" variant="outline" disabled={server.status !== "running"}>
                            <Download className="h-4 w-4 mr-1" />
                            Restore
                          </Button>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-md font-medium">Danger Zone</h3>
                        <p className="text-sm text-muted-foreground mb-2">Permanently delete this server</p>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete Server
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="w-full md:w-1/3 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md font-medium">Server Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-muted-foreground w-32">Type:</span>
                    <span className="capitalize">{server.type}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-muted-foreground w-32">Region:</span>
                    <span>{server.region}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-muted-foreground w-32">OS:</span>
                    <span>{server.os}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-muted-foreground w-32">CPU:</span>
                    <span>{server.cpu}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-muted-foreground w-32">Memory:</span>
                    <span>{server.memory}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-muted-foreground w-32">Created:</span>
                    <span>April 1, 2025</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md font-medium">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                    Environment: {server.name.includes("prod") ? "Production" : 
                                 server.name.includes("dev") ? "Development" : "Staging"}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                    Service: {server.type}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                    Team: DevOps
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" className="mt-3 w-full">
                  <span className="text-xs">Manage Tags</span>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md font-medium">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-2 border-blue-500 pl-3">
                    <p className="text-sm">Configuration changed</p>
                    <p className="text-xs text-muted-foreground">1 hour ago by admin</p>
                  </div>
                  <div className="border-l-2 border-green-500 pl-3">
                    <p className="text-sm">Server restarted</p>
                    <p className="text-xs text-muted-foreground">6 hours ago by system</p>
                  </div>
                  <div className="border-l-2 border-amber-500 pl-3">
                    <p className="text-sm">Memory alert triggered</p>
                    <p className="text-xs text-muted-foreground">1 day ago by monitoring</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="mt-3 w-full">
                  <span className="text-xs">View All Activity</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarWithProvider>
  );
};

export default ServerDetailsPage;
