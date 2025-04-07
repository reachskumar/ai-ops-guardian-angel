
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";

export const UsagePatternsTab: React.FC = () => {
  const regionData = [
    { name: "us-east-1", value: 42 },
    { name: "us-west-2", value: 28 },
    { name: "eu-west-1", value: 15 },
    { name: "ap-northeast-1", value: 10 },
    { name: "other", value: 5 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Instance Distribution */}
      <Card className="col-span-full md:col-span-1">
        <CardHeader>
          <CardTitle>Instance Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart
            data={[
              { type: "t2.micro", count: 42 },
              { type: "t2.small", count: 28 },
              { type: "t2.medium", count: 15 },
              { type: "m5.large", count: 8 },
              { type: "c5.large", count: 5 },
              { type: "other", count: 2 },
            ]}
            categories={["count"]}
            index="type"
            colors={["blue"]}
            className="h-[300px]"
          />
        </CardContent>
      </Card>

      {/* Region Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Region Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <PieChart
            data={regionData}
            category="value"
            index="name"
            colors={["blue", "green", "yellow", "purple", "slate"]}
            valueFormatter={(value) => `${value}%`}
            className="h-[300px]"
          />
        </CardContent>
      </Card>

      {/* Daily Usage Pattern */}
      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Daily Usage Pattern</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            data={Array.from({ length: 24 }, (_, i) => ({
              hour: `${i}:00`,
              usage: Math.floor(Math.random() * 50) + 50,
            }))}
            categories={["usage"]}
            index="hour"
            colors={["blue"]}
            valueFormatter={(value) => `${value}%`}
            className="h-[300px]"
          />
        </CardContent>
      </Card>

      {/* Resource Utilization */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Resource Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart
            data={[
              { resource: "EC2", allocated: 100, utilized: 72 },
              { resource: "RDS", allocated: 100, utilized: 85 },
              { resource: "ECS", allocated: 100, utilized: 68 },
              { resource: "ElastiCache", allocated: 100, utilized: 62 },
              { resource: "Lambda", allocated: 100, utilized: 45 },
            ]}
            categories={["allocated", "utilized"]}
            index="resource"
            colors={["blue", "green"]}
            valueFormatter={(value) => `${value}%`}
            className="h-[300px]"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default UsagePatternsTab;
