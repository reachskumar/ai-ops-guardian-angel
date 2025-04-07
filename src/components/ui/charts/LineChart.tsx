
import React from "react";
import {
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { ChartContainer, ChartConfig } from "./ChartContainer";

export interface LineChartProps {
  data: any[];
  categories: string[];
  index: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  yAxisWidth?: number;
  className?: string;
}

export const LineChart = ({
  data,
  categories,
  index,
  colors = ["blue", "green", "yellow", "purple", "red"],
  valueFormatter = (value) => String(value),
  yAxisWidth = 50,
  className,
}: LineChartProps) => {
  const config: ChartConfig = categories.reduce((acc, category, i) => {
    acc[category] = { color: colors[i % colors.length] };
    return acc;
  }, {} as ChartConfig);

  return (
    <ChartContainer config={config} className={className}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={index} />
        <YAxis width={yAxisWidth} tickFormatter={valueFormatter} />
        <Tooltip
          formatter={(value: number) => [valueFormatter(value)]}
          labelFormatter={(label) => `${index}: ${label}`}
        />
        <Legend />
        {categories.map((category, i) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={`var(--color-${category}, ${colors[i % colors.length]})`}
          />
        ))}
      </RechartsLineChart>
    </ChartContainer>
  );
};

export default LineChart;
