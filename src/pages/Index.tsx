
import React, { useMemo, useState, useEffect } from "react";
import { SidebarWithProvider } from "@/components/Sidebar";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { getAggregatedMetrics } from "@/services/cloud";

// Import refactored dashboard components
import { 
  StatusOverview,
  DashboardHeader,
  DashboardTabs,
  staticNetworkData,
  staticStorageData,
  infrastructureResources,
  securityFindings
} from "@/components/dashboard";

const Index = () => {
  // Use real-time data instead of static data
  const [cpuData, setCpuData] = useState([] as Array<{ time: string; value: number }>);
  const [memoryData, setMemoryData] = useState([] as Array<{ time: string; value: number }>);
  const [networkData, setNetworkData] = useState(staticNetworkData);
  const [storageData, setStorageData] = useState(staticStorageData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchMetricsData = async () => {
    setIsRefreshing(true);
    try {
      // Fetch CPU metrics
      const cpuResult = await getAggregatedMetrics(
        ['all'], // special 'all' token to get data for all resources
        'cpu',
        '24h'
      );
      
      if (!cpuResult.error && cpuResult.data) {
        setCpuData(cpuResult.data.map(item => ({
          time: new Date(item.timestamp).toLocaleTimeString(),
          value: item.value
        })));
      }

      // Fetch memory metrics
      const memoryResult = await getAggregatedMetrics(
        ['all'],
        'memory',
        '24h'
      );
      
      if (!memoryResult.error && memoryResult.data) {
        setMemoryData(memoryResult.data.map(item => ({
          time: new Date(item.timestamp).toLocaleTimeString(),
          value: item.value
        })));
      }
      
      toast({
        title: "Dashboard updated",
        description: "Latest metrics have been loaded"
      });
    } catch (error) {
      console.error("Error fetching metrics:", error);
      toast({
        title: "Error refreshing dashboard",
        description: "Could not fetch the latest metrics data",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial data fetch on page load
  useEffect(() => {
    fetchMetricsData();
    
    // Set up automatic refresh every 5 minutes
    const refreshInterval = setInterval(fetchMetricsData, 5 * 60 * 1000);
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  const refreshData = () => {
    fetchMetricsData();
  };

  return (
    <SidebarWithProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 p-6">
          <DashboardHeader refreshData={refreshData} isRefreshing={isRefreshing} />

          <div className="space-y-8">
            <StatusOverview />

            <DashboardTabs 
              cpuData={cpuData.length > 0 ? cpuData : generateFallbackData('cpu')}
              memoryData={memoryData.length > 0 ? memoryData : generateFallbackData('memory')}
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

// Generate fallback data if API calls fail
const generateFallbackData = (metric: string) => {
  const baseValue = metric === 'cpu' ? 45 : 60;
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    value: Math.min(100, Math.max(10, baseValue + Math.sin(i / 4) * 15 + Math.random() * 10))
  }));
};

export default Index;
