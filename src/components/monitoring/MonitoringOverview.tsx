
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServerSummaryCards } from "@/components/servers";
import { MonitoringWidget } from "@/components/dashboard";

interface ServerItem {
  id: string;
  name: string;
  status: string;
  type: string;
  ip: string;
  os: string;
  cpu: string;
  memory: string;
  region: string;
}

interface MonitoringOverviewProps {
  servers: ServerItem[];
}

const MonitoringOverview: React.FC<MonitoringOverviewProps> = ({ servers }) => {
  // Simulating CPU data aggregated across all servers
  const cpuData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    value: Math.floor(Math.random() * 40) + 30
  }));

  // Simulating memory data aggregated across all servers
  const memoryData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    value: Math.floor(Math.random() * 30) + 50
  }));

  // Simulating network traffic data
  const networkData = [
    { name: "Inbound", value: Math.floor(Math.random() * 500) + 100 },
    { name: "Outbound", value: Math.floor(Math.random() * 300) + 50 },
  ];

  // Simulating storage usage data
  const storageData = [
    { name: "Used", value: Math.floor(Math.random() * 700) + 300 },
    { name: "Free", value: Math.floor(Math.random() * 300) + 200 },
  ];

  return (
    <div className="space-y-6">
      <ServerSummaryCards servers={servers} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">CPU Utilization (Avg.)</CardTitle>
          </CardHeader>
          <CardContent>
            <MonitoringWidget
              title=""
              type="area"
              data={cpuData}
              height={220}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Memory Utilization (Avg.)</CardTitle>
          </CardHeader>
          <CardContent>
            <MonitoringWidget
              title=""
              type="area"
              data={memoryData}
              height={220}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Network Traffic</CardTitle>
          </CardHeader>
          <CardContent>
            <MonitoringWidget
              title=""
              type="bar"
              data={networkData}
              height={220}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Storage Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <MonitoringWidget
              title=""
              type="pie"
              data={storageData}
              height={220}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonitoringOverview;
