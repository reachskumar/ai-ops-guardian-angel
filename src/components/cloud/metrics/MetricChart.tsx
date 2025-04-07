
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { AreaChart, LineChart } from "@/components/ui/charts";
import { ResourceMetric } from "@/services/cloudProviderService";

interface MetricChartProps {
  title: string;
  metricData: any[];
  chartType: "area" | "line";
  color?: string;
  valueFormatter?: (value: number) => string;
  className?: string;
}

const MetricChart: React.FC<MetricChartProps> = ({
  title,
  metricData,
  chartType = "area",
  color = "blue",
  valueFormatter = (value) => `${value}`,
  className,
}) => {
  // Transform metric data for charts if needed
  const chartData = React.useMemo(() => {
    return metricData.map((point) => ({
      time: new Date(point.timestamp).toLocaleTimeString(),
      value: point.value,
    }));
  }, [metricData]);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {chartType === "area" ? (
          <AreaChart
            data={chartData}
            index="time"
            categories={["value"]}
            colors={[color]}
            valueFormatter={valueFormatter}
            className="h-48"
          />
        ) : (
          <LineChart
            data={chartData}
            index="time"
            categories={["value"]}
            colors={[color]}
            valueFormatter={valueFormatter}
            className="h-48"
          />
        )}
      </CardContent>
    </Card>
  );
};

export default MetricChart;
