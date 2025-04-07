
import React from "react";
import {
  Area,
  AreaChart as RechartsAreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { ChartContainer, ChartConfig } from "./ChartContainer";

export interface AreaChartProps {
  data: any[];
  categories: string[];
  index: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  yAxisWidth?: number;
  className?: string;
}

export const AreaChart = ({
  data,
  categories,
  index,
  colors = ["blue", "green", "yellow", "purple", "red"],
  valueFormatter = (value) => String(value),
  yAxisWidth = 50,
  className,
}: AreaChartProps) => {
  const config: ChartConfig = categories.reduce((acc, category, i) => {
    acc[category] = { color: colors[i % colors.length] };
    return acc;
  }, {} as ChartConfig);

  return (
    <ChartContainer config={config} className={className}>
      <RechartsAreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={index} />
        <YAxis width={yAxisWidth} tickFormatter={valueFormatter} />
        <Tooltip
          formatter={(value: number) => [valueFormatter(value)]}
          labelFormatter={(label) => `${index}: ${label}`}
        />
        <Legend />
        {categories.map((category, i) => (
          <Area
            key={category}
            type="monotone"
            dataKey={category}
            fill={`var(--color-${category}, ${colors[i % colors.length]})`}
            stroke={`var(--color-${category}, ${colors[i % colors.length]})`}
            stackId="1"
          />
        ))}
      </RechartsAreaChart>
    </ChartContainer>
  );
};

export default AreaChart;
