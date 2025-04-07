
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  OverviewTab,
  InfrastructureTab,
  SecurityTab,
  MonitoringTab
} from "./tabs";

interface DashboardTabsProps {
  cpuData: Array<{ time: string; value: number }>;
  memoryData: Array<{ time: string; value: number }>;
  networkData: Array<{ name: string; value: number }>;
  storageData: Array<{ name: string; value: number }>;
  infrastructureResources: Array<{
    id: string;
    type: string;
    status: string;
    region: string;
    provider: string;
  }>;
  securityFindings: Array<{
    id: string;
    severity: string;
    description: string;
    asset: string;
    date: string;
  }>;
  refreshData: () => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({
  cpuData,
  memoryData,
  networkData,
  storageData,
  infrastructureResources,
  securityFindings,
  refreshData
}) => {
  return (
    <Tabs defaultValue="overview">
      <TabsList className="grid w-full max-w-2xl grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-4">
        <OverviewTab 
          cpuData={cpuData}
          memoryData={memoryData}
          networkData={networkData}
          storageData={storageData}
        />
      </TabsContent>
      
      <TabsContent value="infrastructure" className="mt-4">
        <InfrastructureTab 
          infrastructureResources={infrastructureResources}
        />
      </TabsContent>
      
      <TabsContent value="security" className="mt-4">
        <SecurityTab 
          securityFindings={securityFindings}
        />
      </TabsContent>
      
      <TabsContent value="monitoring" className="mt-4">
        <MonitoringTab
          cpuData={cpuData}
          memoryData={memoryData}
          networkData={networkData}
          storageData={storageData}
        />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
