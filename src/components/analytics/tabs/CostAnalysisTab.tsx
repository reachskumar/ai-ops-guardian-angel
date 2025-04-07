
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";

export const CostAnalysisTab: React.FC = () => {
  const costData = [
    { date: "Jan", EC2: 2400, RDS: 1200, S3: 800, ECS: 500 },
    { date: "Feb", EC2: 1982, RDS: 1228, S3: 795, ECS: 510 },
    { date: "Mar", EC2: 2190, RDS: 1100, S3: 950, ECS: 520 },
    { date: "Apr", EC2: 2390, RDS: 1298, S3: 910, ECS: 530 },
    { date: "May", EC2: 2480, RDS: 1280, S3: 880, ECS: 540 },
    { date: "Jun", EC2: 2590, RDS: 1190, S3: 920, ECS: 550 },
  ];

  const regionData = [
    { name: "us-east-1", value: 42 },
    { name: "us-west-2", value: 28 },
    { name: "eu-west-1", value: 15 },
    { name: "ap-northeast-1", value: 10 },
    { name: "other", value: 5 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Monthly Cost Breakdown */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Monthly Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart
            data={costData}
            categories={["EC2", "RDS", "S3", "ECS"]}
            index="date"
            colors={["blue", "green", "yellow", "purple"]}
            valueFormatter={(value) => `$${value}`}
            className="h-[400px]"
          />
        </CardContent>
      </Card>

      {/* Cost by Service */}
      <Card>
        <CardHeader>
          <CardTitle>Cost by Service</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <PieChart
            data={[
              { name: "EC2", value: 2590 },
              { name: "RDS", value: 1190 },
              { name: "S3", value: 920 },
              { name: "ECS", value: 550 },
              { name: "Other", value: 340 },
            ]}
            category="value"
            index="name"
            colors={["blue", "green", "yellow", "purple", "slate"]}
            valueFormatter={(value) => `$${value}`}
            className="h-[300px]"
          />
        </CardContent>
      </Card>

      {/* Cost by Region */}
      <Card>
        <CardHeader>
          <CardTitle>Cost by Region</CardTitle>
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

      {/* Cost Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            data={[
              { date: "Jan", value: 4400 },
              { date: "Feb", value: 4515 },
              { date: "Mar", value: 4760 },
              { date: "Apr", value: 5128 },
              { date: "May", value: 5180 },
              { date: "Jun", value: 5250 },
            ]}
            categories={["value"]}
            index="date"
            colors={["blue"]}
            valueFormatter={(value) => `$${value}`}
            className="h-[300px]"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CostAnalysisTab;
