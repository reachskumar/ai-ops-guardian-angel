
import React, { useMemo, lazy, Suspense } from "react";
import Header from "@/components/Header";
import { SidebarWithProvider } from "@/components/Sidebar";
import StatusOverview from "@/components/dashboard/StatusOverview";

// Use lazy loading for components that aren't immediately visible
const AIChat = lazy(() => import("@/components/AIChat"));
const MonitoringWidget = lazy(() => import("@/components/dashboard/MonitoringWidget"));
const SecurityPanel = lazy(() => import("@/components/dashboard/SecurityPanel"));
const IncidentPanel = lazy(() => import("@/components/dashboard/IncidentPanel"));
const ResourcesPanel = lazy(() => import("@/components/dashboard/ResourcesPanel"));

// Loading spinner for lazy-loaded components
const LazyLoadingSpinner = () => (
  <div className="flex items-center justify-center w-full h-40">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Sample data for charts - memoize this data to prevent regeneration on each render
const Index: React.FC = () => {
  // Pre-generate data using more efficient methods
  const cpuData = useMemo(() => {
    const data = [];
    for (let i = 0; i < 24; i++) {
      data.push({
        time: `${i}:00`,
        value: Math.floor(Math.random() * 30) + 40,
      });
    }
    return data;
  }, []);

  const memoryData = useMemo(() => {
    const data = [];
    for (let i = 0; i < 24; i++) {
      data.push({
        time: `${i}:00`,
        value: Math.floor(Math.random() * 25) + 60,
      });
    }
    return data;
  }, []);

  const networkData = useMemo(() => 
    ["Web", "API", "Auth", "Database", "Cache"].map((name, i) => ({
      name,
      value: Math.floor(Math.random() * 400) + 100,
    })),
    []
  );

  const storageData = useMemo(() => [
    { name: "Used", value: 320 },
    { name: "Available", value: 680 },
  ], []);

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
                <Suspense fallback={<LazyLoadingSpinner />}>
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
                </Suspense>
              </div>
              <div className="space-y-6">
                <Suspense fallback={<LazyLoadingSpinner />}>
                  <ResourcesPanel />
                  <MonitoringWidget
                    title="Network Traffic (Mbps)"
                    type="bar"
                    data={networkData}
                  />
                </Suspense>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                  <Suspense fallback={<LazyLoadingSpinner />}>
                    <MonitoringWidget
                      title="Storage Usage"
                      type="pie"
                      data={storageData}
                    />
                  </Suspense>
                </div>
                <div className="hidden sm:block">
                  <Suspense fallback={<LazyLoadingSpinner />}>
                    <AIChat />
                  </Suspense>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Suspense fallback={<LazyLoadingSpinner />}>
                <SecurityPanel />
              </Suspense>
              <Suspense fallback={<LazyLoadingSpinner />}>
                <IncidentPanel />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </SidebarWithProvider>
  );
};

export default React.memo(Index);
