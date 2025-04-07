
import React from "react";
import {
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

export interface SparklineChartProps {
  data: { value: number; timestamp?: string | number }[];
  color?: string;
  width?: number | string;
  height?: number;
  showTrend?: boolean;
  className?: string;
  strokeWidth?: number;
  valueKey?: string;
  id?: string;
}

export const SparklineChart = ({
  data,
  color = "#3b82f6", // Default blue color
  width = "100%",
  height = 24,
  showTrend = true,
  className,
  strokeWidth = 1.5,
  valueKey = "value",
  id,
}: SparklineChartProps) => {
  if (!data || data.length < 2) {
    return <div className="h-6 flex items-center text-xs text-muted-foreground">Insufficient data</div>;
  }

  // Calculate if the trend is positive or negative
  const firstValue = data[0][valueKey as keyof typeof data[0]] as number;
  const lastValue = data[data.length - 1][valueKey as keyof typeof data[0]] as number;
  const trendIsPositive = lastValue >= firstValue;
  const trendColor = trendIsPositive ? "text-success" : "text-destructive";
  const TrendIcon = trendIsPositive ? ArrowUp : ArrowDown;
  
  return (
    <div className={cn("flex items-center gap-2", className)} id={id}>
      <div style={{ width, height: `${height}px` }} className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={data}>
            <Line
              type="monotone"
              dataKey={valueKey}
              stroke={color}
              strokeWidth={strokeWidth}
              dot={false}
              isAnimationActive={false}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
      
      {showTrend && (
        <div className={cn("flex items-center text-xs font-medium", trendColor)}>
          <TrendIcon className="h-3 w-3 mr-0.5" />
          {Math.abs(((lastValue - firstValue) / firstValue) * 100).toFixed(1)}%
        </div>
      )}
    </div>
  );
};

export default SparklineChart;
