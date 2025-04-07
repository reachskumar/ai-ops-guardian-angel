
import React, { useMemo } from "react";
import { SidebarWithProvider } from "@/components/Sidebar";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";

// Import refactored dashboard components
import { 
  StatusOverview,
  DashboardHeader,
  DashboardTabs,
  staticCpuData,
  staticMemoryData,
  staticNetworkData,
  staticStorageData,
  infrastructureResources,
  securityFindings
} from "@/components/dashboard";

const Index: React.FC = () => {
  // Use static data instead of generating on each render
  const cpuData = staticCpuData;
  const memoryData = staticMemoryData;
  const networkData = staticNetworkData;
  const storageData = staticStorageData;
  const { toast } = useToast();

  const refreshData = () => {
    toast({
      title: "Refreshing dashboard",
      description: "Fetching latest metrics and status updates"
    });
  };

  return (
    <SidebarWithProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 p-6">
          <DashboardHeader refreshData={refreshData} />

          <div className="space-y-8">
            <StatusOverview />

            <DashboardTabs 
              cpuData={cpuData}
              memoryData={memoryData}
              networkData={networkData}
              storageData={storageData}
              infrastructureResources={infrastructureResources}
              securityFindings={securityFindings}
              refreshData={refreshData}
            />
          </div>
        </div>
      </div>
    </SidebarWithProvider>
  );
};

export default React.memo(Index);
