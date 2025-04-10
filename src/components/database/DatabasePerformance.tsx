
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, AreaChart } from "@/components/ui/charts";
import { DatabaseMetric } from "@/services/databaseService";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface DatabasePerformanceProps {
  cpuMetrics: DatabaseMetric[];
  memoryMetrics: DatabaseMetric[];
  connectionMetrics: DatabaseMetric[];
  diskMetrics: DatabaseMetric[];
  isLoading: boolean;
  onTimeRangeChange?: (timeRange: string) => void;
  selectedTimeRange?: string;
}

const DatabasePerformance: React.FC<DatabasePerformanceProps> = ({
  cpuMetrics,
  memoryMetrics,
  connectionMetrics,
  diskMetrics,
  isLoading,
  onTimeRangeChange,
  selectedTimeRange = "24h"
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Performance Metrics</CardTitle>
        {onTimeRangeChange && (
          <ToggleGroup 
            type="single" 
            value={selectedTimeRange}
            onValueChange={(value) => {
              if (value) onTimeRangeChange(value);
            }}
            className="border rounded-md"
          >
            <ToggleGroupItem value="1h" size="sm">1h</ToggleGroupItem>
            <ToggleGroupItem value="24h" size="sm">24h</ToggleGroupItem>
            <ToggleGroupItem value="7d" size="sm">7d</ToggleGroupItem>
            <ToggleGroupItem value="30d" size="sm">30d</ToggleGroupItem>
          </ToggleGroup>
        )}
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
