
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { LineChart } from "@/components/ui/charts";
import { ResourceMetric } from "@/services/cloudProviderService";

interface MetricDetailPanelProps {
  metricName: string;
  metrics: ResourceMetric[];
}

const MetricDetailPanel: React.FC<MetricDetailPanelProps> = ({
  metricName,
  metrics,
}) => {
  // Get the specific metric by name
  const metric = React.useMemo(() => {
    return metrics.find((m) => m.name.toLowerCase() === metricName.toLowerCase());
  }, [metrics, metricName]);

  // Transform metric data for charts
  const chartData = React.useMemo(() => {
    if (!metric) return [];
    return metric.data.map((point) => ({
      time: new Date(point.timestamp).toLocaleTimeString(),
      value: point.value,
    }));
  }, [metric]);

  // Get unit for a metric
  const getUnit = () => {
    switch (metricName.toLowerCase()) {
      case "cpu":
      case "memory":
        return "%";
      case "disk":
        return "IOPS";
      case "network":
        return "Mbps";
      default:
        return metric?.unit || "";
    }
  };

  // Get chart color based on metric type
  const getChartColor = () => {
    switch (metricName.toLowerCase()) {
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

  if (!metric) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          No {metricName} data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{metricName} Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <LineChart
          data={chartData}
          index="time"
          categories={["value"]}
          colors={[getChartColor()]}
          valueFormatter={(value) => `${value} ${getUnit()}`}
          className="h-80"
        />
      </CardContent>
    </Card>
  );
};

export default MetricDetailPanel;
