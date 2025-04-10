
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, AreaChart } from "@/components/ui/charts";
import { DatabaseMetric } from "@/services/databaseService";

interface DatabasePerformanceProps {
  cpuMetrics: DatabaseMetric[];
  memoryMetrics: DatabaseMetric[];
  connectionMetrics: DatabaseMetric[];
  diskMetrics: DatabaseMetric[];
  isLoading: boolean;
}

const DatabasePerformance: React.FC<DatabasePerformanceProps> = ({
  cpuMetrics,
  memoryMetrics,
  connectionMetrics,
  diskMetrics,
  isLoading
}) => {
  // Format metrics for charts
  const formatChartData = (metrics: DatabaseMetric[]) => {
    return metrics.map(m => ({
      date: new Date(m.timestamp).toLocaleTimeString([], { 
        hour: 'numeric', 
        minute: '2-digit' 
      }),
      value: m.value
    }));
  };

  const cpuData = formatChartData(cpuMetrics);
  const memoryData = formatChartData(memoryMetrics);
  const connectionData = formatChartData(connectionMetrics);
  const diskData = formatChartData(diskMetrics);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent className="animate-pulse">
          <div className="h-[300px] bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cpu">
          <TabsList className="mb-4">
            <TabsTrigger value="cpu">CPU</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="disk">Disk I/O</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cpu">
            <AreaChart
              data={cpuData}
              index="date"
              categories={["value"]}
              colors={["blue"]}
              valueFormatter={(value) => `${value}%`}
              className="h-64"
              yAxisWidth={40}
            />
          </TabsContent>
          
          <TabsContent value="memory">
            <AreaChart
              data={memoryData}
              index="date"
              categories={["value"]}
              colors={["green"]}
              valueFormatter={(value) => `${value}%`}
              className="h-64"
              yAxisWidth={40}
            />
          </TabsContent>
          
          <TabsContent value="connections">
            <BarChart
              data={connectionData}
              index="date"
              categories={["value"]}
              colors={["purple"]}
              valueFormatter={(value) => `${value}`}
              className="h-64"
              yAxisWidth={40}
            />
          </TabsContent>
          
          <TabsContent value="disk">
            <AreaChart
              data={diskData}
              index="date"
              categories={["value"]}
              colors={["amber"]}
              valueFormatter={(value) => `${value} MB/s`}
              className="h-64"
              yAxisWidth={40}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DatabasePerformance;
