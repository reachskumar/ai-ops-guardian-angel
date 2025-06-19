
import React, { useState } from "react";
import { SidebarWithProvider } from "@/components/Sidebar";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonitoringOverview, RealTimeMonitoring, PerformanceOptimizer, RightSizingAnalyzer } from "@/components/monitoring";

const MonitoringPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Mock server data
  const servers = [
    {
      id: "1",
      name: "Web Server 01",
      status: "running",
      type: "web-server",
      ip: "192.168.1.10",
      os: "Ubuntu 22.04",
      cpu: "Intel Xeon",
      memory: "16GB",
      region: "us-east-1"
    },
    {
      id: "2", 
      name: "Database Server",
      status: "running",
      type: "database",
      ip: "192.168.1.11",
      os: "CentOS 8",
      cpu: "AMD EPYC",
      memory: "32GB", 
      region: "us-west-2"
    }
  ];

  return (
    <SidebarWithProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Infrastructure Monitoring</h1>
            <p className="text-muted-foreground">
              Real-time monitoring, performance optimization, and intelligent right-sizing
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="realtime">Real-Time</TabsTrigger>
              <TabsTrigger value="optimization">Optimization</TabsTrigger>
              <TabsTrigger value="rightsizing">Right-Sizing</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <MonitoringOverview servers={servers} />
            </TabsContent>

            <TabsContent value="realtime">
              <RealTimeMonitoring />
            </TabsContent>

            <TabsContent value="optimization">
              <PerformanceOptimizer />
            </TabsContent>

            <TabsContent value="rightsizing">
              <RightSizingAnalyzer />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SidebarWithProvider>
  );
};

export default MonitoringPage;
