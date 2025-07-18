
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CostMetricCards,
  CostTrendChart,
  ServiceCostChart,
  OptimizationRecommendationsPanel,
  AppliedOptimizations,
  CostErrorAlert,
  RightSizingPanel
} from '@/components/cloud/cost-analysis';
import { CostBreakdownPanel, CostBudgetPanel, CostForecastPanel } from '@/components/cloud';
import { useCostData, useCostForecasting, useOptimizationRecommendations } from '@/hooks/cost';
import { useCostAnalysis } from '@/hooks/cost';
import { OptimizationRecommendation } from '@/hooks/cost/types';

const CostAnalysisTab: React.FC = () => {
  const { 
    costData, 
    serviceCostData,
    costTrend,
    timeRange, 
    setTimeRange, 
    isLoading, 
    error 
  } = useCostData();
  
  const { 
    recommendations, 
    appliedOptimizations,
    isLoading: isLoadingRecommendations, 
    applyRecommendation,
    totalSavings,
    appliedSavings 
  } = useOptimizationRecommendations();

  const {
    forecastData,
    isLoading: isLoadingForecast,
    loadForecast,
    forecastOptions,
    updateForecastOptions
  } = useCostForecasting();

  // Load forecast data when timeRange changes
  React.useEffect(() => {
    loadForecast();
  }, [timeRange, loadForecast]);
  
  return (
    <div className="space-y-6">
      {error && <CostErrorAlert isVisible={true} error={error} />}
      
      <CostMetricCards 
        costData={costData}
        isLoading={isLoading}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        costTrend={costTrend}
        totalSavings={totalSavings}
        appliedSavings={appliedSavings}
      />
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
          <TabsTrigger value="forecast">Cost Forecast</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="optimize">Optimize</TabsTrigger>
          <TabsTrigger value="rightsizing">Right-Sizing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <CostTrendChart 
              costData={costData}
              isLoading={isLoading}
              timeRange={timeRange}
              setTimeRange={setTimeRange}
              totalCost={costData.reduce((sum, item) => sum + item.amount, 0)}
            />
            <ServiceCostChart 
              serviceCostData={serviceCostData}
              isLoading={isLoading}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="breakdown">
          <CostBreakdownPanel />
        </TabsContent>
        
        <TabsContent value="forecast">
          <CostForecastPanel />
        </TabsContent>
        
        <TabsContent value="budget">
          <CostBudgetPanel />
        </TabsContent>
        
        <TabsContent value="optimize" className="space-y-4">
          <OptimizationRecommendationsPanel
            optimizationRecommendations={recommendations as OptimizationRecommendation[]}
            recommendations={recommendations as OptimizationRecommendation[]}
            isLoading={isLoadingRecommendations}
            totalPotentialSavings={totalSavings}
            onApply={applyRecommendation}
          />
          
          <AppliedOptimizations
            recommendations={appliedOptimizations as OptimizationRecommendation[]}
            optimizations={appliedOptimizations as OptimizationRecommendation[]}
          />
        </TabsContent>

        <TabsContent value="rightsizing">
          <RightSizingPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CostAnalysisTab;
