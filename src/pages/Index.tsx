
import React from "react";
import Header from "@/components/Header";
import { SidebarWithProvider } from "@/components/Sidebar";
import AIChat from "@/components/AIChat";
import StatusOverview from "@/components/dashboard/StatusOverview";
import MonitoringWidget from "@/components/dashboard/MonitoringWidget";
import SecurityPanel from "@/components/dashboard/SecurityPanel";
import IncidentPanel from "@/components/dashboard/IncidentPanel";
import ResourcesPanel from "@/components/dashboard/ResourcesPanel";

// Sample data for charts
const cpuData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  value: Math.floor(Math.random() * 30) + 40,
}));

const memoryData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  value: Math.floor(Math.random() * 25) + 60,
}));

const networkData = Array.from({ length: 5 }, (_, i) => ({
  name: ["Web", "API", "Auth", "Database", "Cache"][i],
  value: Math.floor(Math.random() * 400) + 100,
}));

const storageData = [
  { name: "Used", value: 320 },
  { name: "Available", value: 680 },
];

const Index: React.FC = () => {
  return (
    <SidebarWithProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Operations Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time overview of your infrastructure and cloud resources
            </p>
          </div>

          <div className="space-y-8">
            <StatusOverview />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-6">
                <MonitoringWidget
                  title="CPU Usage (Last 24 Hours)"
                  type="area"
                  data={cpuData}
                />
                <MonitoringWidget
                  title="Memory Usage (Last 24 Hours)"
                  type="area"
                  data={memoryData}
                />
              </div>
              <div className="space-y-6">
                <ResourcesPanel />
                <MonitoringWidget
                  title="Network Traffic (Mbps)"
                  type="bar"
                  data={networkData}
                />
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                  <MonitoringWidget
                    title="Storage Usage"
                    type="pie"
                    data={storageData}
                  />
                </div>
                <div className="hidden sm:block">
                  <AIChat />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SecurityPanel />
              <IncidentPanel />
            </div>
          </div>
        </div>
      </div>
    </SidebarWithProvider>
  );
};

export default Index;
