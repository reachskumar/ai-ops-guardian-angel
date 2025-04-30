
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Loader2 } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { AreaChart } from "@/components/ui/charts";
import { CostDataPoint } from "@/hooks/cost/types";

interface CostTrendChartProps {
  isLoading: boolean;
  timeRange: "7d" | "30d" | "90d";
  setTimeRange?: (value: "7d" | "30d" | "90d") => void; // Make optional
  costData: CostDataPoint[];
  totalCost?: number; // Make optional
}

export const CostTrendChart: React.FC<CostTrendChartProps> = ({
  isLoading,
  timeRange,
  setTimeRange,
  costData,
  totalCost = 0
}) => {
  // Calculate total cost from data if not provided
  const calculatedTotalCost = totalCost || costData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card className="flex-1">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Cost Trend
          </CardTitle>
          {setTimeRange && (
            <Select 
              value={timeRange} 
              onValueChange={(value: "7d" | "30d" | "90d") => setTimeRange(value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        <CardDescription>
          Total spend: ${calculatedTotalCost.toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <AreaChart
            data={costData}
            index="date"
            categories={["amount"]}
            colors={["blue"]}
            valueFormatter={(value) => `$${value}`}
            className="h-64"
          />
        )}
      </CardContent>
    </Card>
  );
};

export default CostTrendChart;
