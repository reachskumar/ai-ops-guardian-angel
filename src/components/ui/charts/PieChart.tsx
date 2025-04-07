
import React from "react";
import {
  Pie,
  PieChart as RechartsPieChart,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { ChartContainer, ChartConfig } from "./ChartContainer";

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
              fill={colors[i % colors.length]}
            />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => [valueFormatter(value)]} />
        <Legend />
      </RechartsPieChart>
    </ChartContainer>
  );
};

export default PieChart;
