
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AreaChart, 
  LineChart 
} from "@/components/ui/charts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MetricsHistoryChartProps {
  title: string;
  metricType: string;
  data: Array<{ timestamp: string; value: number }>;
  className?: string;
}

const MetricsHistoryChart: React.FC<MetricsHistoryChartProps> = ({
  title,
  metricType,
  data,
  className
}) => {
  const [timeRange, setTimeRange] = React.useState("24h");
  
  // Format data for the chart
  const formattedData = data.map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString(),
    value: point.value
  }));

  const renderChart = () => {
    if (metricType === "cpu" || metricType === "memory") {
      return (
        <AreaChart
          data={formattedData}
          categories={["value"]}
          index="time"
          colors={[metricType === "cpu" ? "blue" : "green"]}
          valueFormatter={(value) => `${value}%`}
          className="h-64"
        />
      );
    } else {
      return (
        <LineChart
          data={formattedData}
          categories={["value"]}
          index="time"
          colors={["purple"]}
          valueFormatter={(value) => `${value}`}
          className="h-64"
        />
      );
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
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default MetricsHistoryChart;
