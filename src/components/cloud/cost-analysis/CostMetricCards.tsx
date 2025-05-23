
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";
import { CostTrendData, CostDataPoint } from "@/hooks/cost/types";

interface CostMetricCardsProps {
  totalCost?: number;
  costData?: CostDataPoint[];
  isLoading?: boolean;
  timeRange: "7d" | "30d" | "90d";
  onTimeRangeChange?: (value: "7d" | "30d" | "90d") => void;
  costTrend: CostTrendData | null;
  totalSavings?: number;
  appliedSavings?: number;
}

export const CostMetricCards: React.FC<CostMetricCardsProps> = ({
  totalCost = 0,
  costData = [],
  isLoading = false,
  timeRange,
  onTimeRangeChange,
  costTrend,
  totalSavings = 0,
  appliedSavings = 0
}) => {
  if (!costTrend) return null;

  const calculatedTotalCost = totalCost || costData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Total Cost</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">${calculatedTotalCost.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground ml-2">
              Last {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : '90 days'}
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Month-to-Date</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">${costTrend.total.toLocaleString()}</span>
            <span className={`ml-2 flex items-center text-sm ${costTrend.changePercentage > 0 ? 'text-destructive' : 'text-green-600'}`}>
              {costTrend.changePercentage > 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {Math.abs(costTrend.changePercentage)}% vs last month
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Potential Savings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-green-600">${totalSavings.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground ml-2">
              /month
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostMetricCards;
