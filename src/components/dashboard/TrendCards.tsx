
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SparklineChart } from "@/components/ui/charts";

interface TrendCardProps {
  title: string;
  value: string | number;
  trend: number;
  data: Array<{ value: number; timestamp?: string | number }>;
  color?: string;
  prefix?: string;
  suffix?: string;
}

export const TrendCard = ({ 
  title, 
  value, 
  trend, 
  data,
  color = "#3b82f6",
  prefix = "",
  suffix = "",
}: TrendCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-col gap-1">
          <div className="text-2xl font-bold">
            {prefix}{value}{suffix}
          </div>
          <SparklineChart 
            data={data} 
            color={color} 
            height={32} 
            showTrend={true}
          />
        </div>
      </CardContent>
    </Card>
  );
};

interface MetricTrendsProps {
  metrics: {
    title: string;
    value: string | number;
    trend: number;
    data: Array<{ value: number; timestamp?: string | number }>;
    color?: string;
    prefix?: string;
    suffix?: string;
  }[];
}

export const MetricTrends: React.FC<MetricTrendsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <TrendCard key={index} {...metric} />
      ))}
    </div>
  );
};

export default MetricTrends;
