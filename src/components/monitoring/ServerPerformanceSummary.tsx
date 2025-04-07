
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, HardDrive, Memory, Network } from "lucide-react";
import { ServerHealthIndicator } from "@/components/monitoring";

interface ServerMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  healthScore: number;
  issues: number;
}

interface ServerPerformanceSummaryProps {
  serverName: string;
  metrics: ServerMetrics;
}

const ServerPerformanceSummary: React.FC<ServerPerformanceSummaryProps> = ({
  serverName,
  metrics
}) => {
  const getStatusColor = (value: number, threshold: number) => {
    if (value >= threshold) return "text-red-500";
    if (value >= threshold * 0.7) return "text-amber-500";
    return "text-green-500";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium">Server Health</CardTitle>
        </CardHeader>
        <CardContent>
          <ServerHealthIndicator score={metrics.healthScore} issues={metrics.issues} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Cpu className="h-4 w-4 mr-2 text-blue-500" />
            CPU Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-center mb-2 mt-4">
            <span className={getStatusColor(metrics.cpu, 80)}>{metrics.cpu}%</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Memory className="h-4 w-4 mr-2 text-green-500" />
            Memory Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-center mb-2 mt-4">
            <span className={getStatusColor(metrics.memory, 85)}>{metrics.memory}%</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <HardDrive className="h-4 w-4 mr-2 text-amber-500" />
            Disk Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-center mb-2 mt-4">
            <span className={getStatusColor(metrics.disk, 90)}>{metrics.disk}%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServerPerformanceSummary;
