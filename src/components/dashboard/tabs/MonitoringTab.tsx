
import React, { Suspense, lazy } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Clock,
  AlertTriangle,
  PlusCircle,
  Terminal,
} from "lucide-react";
import { LazyLoadingSpinner } from "@/components/dashboard/DashboardComponents";

// Lazy-loaded components
const MonitoringWidget = lazy(() => import("@/components/dashboard/MonitoringWidget"));

interface MonitoringTabProps {
  cpuData: Array<{ time: string; value: number }>;
  memoryData: Array<{ time: string; value: number }>;
  networkData: Array<{ name: string; value: number }>;
  storageData: Array<{ name: string; value: number }>;
}

const MonitoringTab: React.FC<MonitoringTabProps> = ({
  cpuData,
  memoryData,
  networkData,
  storageData,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 grid grid-cols-1 gap-6">
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
        <Suspense fallback={<LazyLoadingSpinner />}>
          <MonitoringWidget
            title="Network Traffic (Mbps)"
            type="bar"
            data={networkData}
          />
        </Suspense>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Alerts Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BarChart className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">High CPU Usage</span>
              </div>
              <span className="text-xs inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                &gt; 85%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BarChart className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">Low Memory</span>
              </div>
              <span className="text-xs inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                &lt; 15%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">API Response Time</span>
              </div>
              <span className="text-xs inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                &gt; 2s
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">Error Rate</span>
              </div>
              <span className="text-xs inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                &gt; 5%
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Monitoring Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Prometheus</span>
              </div>
              <span className="text-xs text-green-500">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Grafana</span>
              </div>
              <span className="text-xs text-green-500">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">ELK Stack</span>
              </div>
              <span className="text-xs text-yellow-500">Partial</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">New Relic</span>
              </div>
              <span className="text-xs text-muted-foreground">Not Connected</span>
            </div>
            <Button variant="outline" className="w-full mt-2">
              <PlusCircle className="mr-2 h-4 w-4" />
              Connect Tool
            </Button>
          </CardContent>
        </Card>
        
        <Suspense fallback={<LazyLoadingSpinner />}>
          <MonitoringWidget
            title="Storage Usage"
            type="pie"
            data={storageData}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default MonitoringTab;
