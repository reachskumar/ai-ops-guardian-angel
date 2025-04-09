
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useCostAnalysis } from "@/hooks/cost";
import {
  CostMetricCards,
  CostTrendChart,
  ServiceCostChart,
  CostErrorAlert,
  OptimizationRecommendationsPanel
} from "./cost-analysis";

const CostAnalysisPanel: React.FC = () => {
  const {
    isLoading,
    isApplyingRecommendation,
    timeRange,
    setTimeRange,
    costData,
    serviceCostData,
    optimizationRecommendations,
    totalPotentialSavings,
    costTrend,
    refreshData,
    applyRecommendation,
    dismissRecommendation,
    enableRealTimeUpdates,
    disableRealTimeUpdates,
    isRealTimeEnabled
  } = useCostAnalysis();

  const [errorShown, setErrorShown] = React.useState(false);
  
  useEffect(() => {
    if (serviceCostData?.length && !errorShown) {
      setErrorShown(true);
    }
  }, [serviceCostData, errorShown]);

  const totalCost = costData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Cost Analysis & Optimization</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="real-time-updates" className="cursor-pointer">
              Real-time updates
            </Label>
            <Switch
              id="real-time-updates"
              checked={isRealTimeEnabled}
              onCheckedChange={(checked) => {
                if (checked) enableRealTimeUpdates();
                else disableRealTimeUpdates();
              }}
            />
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
          >
            <Loader2 className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      <CostErrorAlert isVisible={errorShown} onRefresh={refreshData} />

      {costTrend && (
        <CostMetricCards
          totalCost={totalCost}
          timeRange={timeRange}
          costTrend={costTrend}
          totalPotentialSavings={totalPotentialSavings}
        />
      )}
      
      <div className="flex flex-col lg:flex-row gap-6">
        <CostTrendChart
          isLoading={isLoading}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          costData={costData}
          totalCost={totalCost}
        />
        
        <ServiceCostChart
          isLoading={isLoading}
          serviceCostData={serviceCostData}
        />
      </div>
      
      <OptimizationRecommendationsPanel
        isLoading={isLoading}
        optimizationRecommendations={optimizationRecommendations}
        totalPotentialSavings={totalPotentialSavings}
        isApplyingRecommendation={isApplyingRecommendation}
        dismissRecommendation={dismissRecommendation}
        applyRecommendation={applyRecommendation}
      />
    </div>
  );
};

export default CostAnalysisPanel;
