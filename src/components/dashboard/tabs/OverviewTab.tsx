
import React, { Suspense, lazy } from "react";
import { LazyLoadingSpinner } from "@/components/dashboard/DashboardComponents";
import AIChat from "@/components/AIChat";

// Lazy-loaded components
const MonitoringWidget = lazy(() => import("@/components/dashboard/MonitoringWidget"));
const ResourcesPanel = lazy(() => import("@/components/dashboard/ResourcesPanel"));
const SecurityPanel = lazy(() => import("@/components/dashboard/SecurityPanel"));
const IncidentPanel = lazy(() => import("@/components/dashboard/IncidentPanel"));

interface OverviewTabProps {
  cpuData: Array<{ time: string; value: number }>;
  memoryData: Array<{ time: string; value: number }>;
  networkData: Array<{ name: string; value: number }>;
  storageData: Array<{ name: string; value: number }>;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  cpuData,
  memoryData,
  networkData,
  storageData,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Suspense fallback={<LazyLoadingSpinner />}>
            <MonitoringWidget
              title="CPU Usage (Last 24 Hours)"
              type="area"
              data={cpuData}
            />
          </Suspense>
          <Suspense fallback={<LazyLoadingSpinner />}>
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
          </Suspense>
          <Suspense fallback={<LazyLoadingSpinner />}>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Suspense fallback={<LazyLoadingSpinner />}>
          <SecurityPanel />
        </Suspense>
        <Suspense fallback={<LazyLoadingSpinner />}>
          <IncidentPanel />
        </Suspense>
      </div>
    </>
  );
};

export default OverviewTab;
