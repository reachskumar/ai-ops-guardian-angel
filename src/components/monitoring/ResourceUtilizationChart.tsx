
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart } from "@/components/ui/charts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ResourceData {
  timestamp: string;
  value: number;
}

interface ResourceUtilizationChartProps {
  title: string;
  data: ResourceData[];
  resourceType: "cpu" | "memory" | "disk" | "network";
  className?: string;
}

const ResourceUtilizationChart: React.FC<ResourceUtilizationChartProps> = ({
  title,
  data,
  resourceType,
  className
}) => {
  const [timeRange, setTimeRange] = useState("24h");
  
  // Format data for the chart
  const chartData = data.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString(),
    value: point.value
  }));

  // Get color based on resource type
  const getChartColor = () => {
    switch (resourceType) {
      case "cpu":
        return "blue";
      case "memory":
        return "green";
      case "disk":
        return "amber";
      case "network":
        return "purple";
      default:
        return "blue";
    }
  };

  // Get unit based on resource type
  const getValueUnit = () => {
    switch (resourceType) {
      case "cpu":
        return "%";
      case "memory":
        return "%";
      case "disk":
        return "GB";
      case "network":
        return "Mbps";
      default:
        return "";
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">{title}</CardTitle>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[120px] h-8">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last hour</SelectItem>
            <SelectItem value="6h">Last 6 hours</SelectItem>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <AreaChart
          data={chartData}
          index="time"
          categories={["value"]}
          colors={[getChartColor()]}
          valueFormatter={(value) => `${value}${getValueUnit()}`}
          className="h-64"
        />
      </CardContent>
    </Card>
  );
};

export default ResourceUtilizationChart;
