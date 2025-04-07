
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, LineChart, PieChart } from "@/components/ui/charts";

export const PerformanceTab: React.FC = () => {
  // Sample data for charts
  const cpuData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    value: Math.floor(Math.random() * 30) + 40,
  }));

  const storageData = [
    { name: "Used", value: 320 },
    { name: "Available", value: 680 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* CPU Usage Card */}
      <Card>
        <CardHeader>
          <CardTitle>CPU Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <AreaChart
            data={cpuData}
            categories={["value"]}
            index="time"
            colors={["blue"]}
            valueFormatter={(value) => `${value}%`}
            className="h-[300px]"
          />
        </CardContent>
      </Card>

      {/* Memory Usage Card */}
      <Card>
        <CardHeader>
          <CardTitle>Memory Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            data={cpuData.map(item => ({ ...item, value: item.value - 10 + Math.floor(Math.random() * 20) }))}
            categories={["value"]}
            index="time"
            colors={["green"]}
            valueFormatter={(value) => `${value}%`}
            className="h-[300px]"
          />
        </CardContent>
      </Card>

      {/* Disk Usage Card */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Usage</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <PieChart
            data={storageData}
            category="value"
            index="name"
            colors={["slate", "blue"]}
            valueFormatter={(value) => `${value}GB`}
            className="h-[300px]"
          />
        </CardContent>
      </Card>

      {/* Network Throughput Card */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Network Throughput</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            data={[
              { time: "00:00", ingress: 235, egress: 120 },
              { time: "04:00", ingress: 187, egress: 95 },
              { time: "08:00", ingress: 452, egress: 230 },
              { time: "12:00", ingress: 560, egress: 280 },
              { time: "16:00", ingress: 480, egress: 240 },
              { time: "20:00", ingress: 380, egress: 190 },
              { time: "24:00", ingress: 210, egress: 105 },
            ]}
            categories={["ingress", "egress"]}
            index="time"
            colors={["blue", "red"]}
            valueFormatter={(value) => `${value} Mbps`}
            className="h-[300px]"
          />
        </CardContent>
      </Card>

      {/* Response Time Card */}
      <Card>
        <CardHeader>
          <CardTitle>API Response Time</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            data={[
              { time: "00:00", value: 235 },
              { time: "04:00", value: 187 },
              { time: "08:00", value: 452 },
              { time: "12:00", value: 560 },
              { time: "16:00", value: 480 },
              { time: "20:00", value: 380 },
              { time: "24:00", value: 210 },
            ]}
            categories={["value"]}
            index="time"
            colors={["purple"]}
            valueFormatter={(value) => `${value}ms`}
            className="h-[300px]"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceTab;
