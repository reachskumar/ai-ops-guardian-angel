
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { BarChart } from "@/components/ui/charts";
import { ServiceCostData } from "@/hooks/cost/types";

interface ServiceCostChartProps {
  isLoading: boolean;
  serviceCostData: ServiceCostData[];
}

export const ServiceCostChart: React.FC<ServiceCostChartProps> = ({
  isLoading,
  serviceCostData
}) => {
  return (
    <Card className="flex-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Cost by Service</CardTitle>
        <CardDescription>
          Service cost breakdown
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <BarChart
            data={serviceCostData}
            index="name"
            categories={["value"]}
            colors={["blue"]}
            valueFormatter={(value) => `$${value}`}
            className="h-64"
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceCostChart;
