
import React from "react";
import { ResourceMetric } from "@/services/cloudProviderService";
import MetricStatusCard from "./MetricStatusCard";
import MetricChart from "./MetricChart";

interface MetricsOverviewPanelProps {
  metrics: ResourceMetric[];
}

const MetricsOverviewPanel: React.FC<MetricsOverviewPanelProps> = ({ metrics }) => {
  // Get a specific metric by name
  const getMetric = (name: string) => {
    return metrics.find((m) => m.name.toLowerCase() === name.toLowerCase());
  };

  // Get the status of a specific metric
  const getMetricStatus = (metricName: string) => {
    const metric = getMetric(metricName);
    return metric?.status || "normal";
  };

  // Get latest value for a metric
  const getLatestValue = (metricName: string) => {
    const metric = getMetric(metricName);
    if (!metric || !metric.data.length) return undefined;
    return metric.data[metric.data.length - 1].value;
  };

  // Get unit for a metric
  const getMetricUnit = (metricName: string) => {
    const metric = getMetric(metricName);
    switch (metricName.toLowerCase()) {
      case "cpu":
      case "memory":
        return "%";
      case "disk":
        return " IOPS";
      case "network":
        return " Mbps";
      default:
        return metric?.unit || "";
    }
  };

  // Transform metric data for charts
  const getMetricData = (metricName: string) => {
    const metric = getMetric(metricName);
    if (!metric) return [];
    return metric.data;
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricStatusCard
          title="CPU"
          value={getLatestValue("cpu")}
          unit={getMetricUnit("cpu")}
          status={getMetricStatus("cpu")}
          icon="cpu"
        />
        <MetricStatusCard
          title="Memory"
          value={getLatestValue("memory")}
          unit={getMetricUnit("memory")}
          status={getMetricStatus("memory")}
          icon="memory"
        />
        <MetricStatusCard
          title="Disk"
          value={getLatestValue("disk")}
          unit={getMetricUnit("disk")}
          status={getMetricStatus("disk")}
          icon="disk"
        />
        <MetricStatusCard
          title="Network"
          value={getLatestValue("network")}
          unit={getMetricUnit("network")}
          status={getMetricStatus("network")}
          icon="network"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <MetricChart
          title="CPU Utilization"
          metricData={getMetricData("cpu")}
          chartType="area"
          color="blue"
          valueFormatter={(value) => `${value}%`}
        />
        <MetricChart
          title="Memory Utilization"
          metricData={getMetricData("memory")}
          chartType="area"
          color="green"
          valueFormatter={(value) => `${value}%`}
        />
      </div>
    </>
  );
};

export default MetricsOverviewPanel;
