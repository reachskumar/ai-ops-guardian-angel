
import React from "react";
import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import {
  Area,
  AreaChart as RechartsAreaChart,
  Bar,
  BarChart as RechartsBarChart,
  Line,
  LineChart as RechartsLineChart,
  Pie, 
  PieChart as RechartsPieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Area Chart
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

// Bar Chart
export interface BarChartProps {
  data: any[];
  categories: string[];
  index: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  yAxisWidth?: number;
  className?: string;
}

export const BarChart = ({
  data,
  categories,
  index,
  colors = ["blue", "green", "yellow", "purple", "red"],
  valueFormatter = (value) => String(value),
  yAxisWidth = 50,
  className,
}: BarChartProps) => {
  const config: ChartConfig = categories.reduce((acc, category, i) => {
    acc[category] = { color: colors[i % colors.length] };
    return acc;
  }, {} as ChartConfig);

  return (
    <ChartContainer config={config} className={className}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={index} />
        <YAxis width={yAxisWidth} tickFormatter={valueFormatter} />
        <Tooltip
          formatter={(value: number) => [valueFormatter(value)]}
          labelFormatter={(label) => `${index}: ${label}`}
        />
        <Legend />
        {categories.map((category, i) => (
          <Bar
            key={category}
            dataKey={category}
            fill={`var(--color-${category}, ${colors[i % colors.length]})`}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  );
};

// Line Chart
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

// Pie Chart
export interface PieChartProps {
  data: any[];
  category: string;
  index: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  className?: string;
}

export const PieChart = ({
  data,
  category,
  index,
  colors = ["blue", "green", "yellow", "purple", "red"],
  valueFormatter = (value) => String(value),
  className,
}: PieChartProps) => {
  const config: ChartConfig = data.reduce((acc, item, i) => {
    const key = item[index];
    acc[key] = { color: colors[i % colors.length] };
    return acc;
  }, {} as ChartConfig);

  return (
    <ChartContainer config={config} className={className}>
      <RechartsPieChart>
        <Pie
          data={data}
          dataKey={category}
          nameKey={index}
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={(entry) => entry[index]}
        >
          {data.map((entry, i) => (
            <Cell
              key={`cell-${i}`}
              fill={`var(--color-${entry[index]}, ${colors[i % colors.length]})`}
            />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => [valueFormatter(value)]} />
        <Legend />
      </RechartsPieChart>
    </ChartContainer>
  );
};
