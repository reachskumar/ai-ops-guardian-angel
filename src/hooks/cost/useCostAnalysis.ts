
import { useState, useEffect } from 'react';
import { useCostData } from './useCostData';
import { useOptimizationRecommendations } from './useOptimizationRecommendations';
import { useRealTimeUpdates } from './useRealTimeUpdates';
import { useToast } from '@/hooks/use-toast';

export const useCostAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const {
    timeRange,
    setTimeRange,
    costData,
    serviceCostData,
    costTrend,
    loadCostData,
    error: costDataError
  } = useCostData();

  const {
    recommendations,
    optimizationRecommendations, // Use the alias property
    isApplying,
    isApplyingRecommendation, // Use the alias property
    totalSavings,
    totalPotentialSavings, // Use the alias property
    loadRecommendations,
    applyRecommendation,
    dismissRecommendation,
    error: recommendationsError
  } = useOptimizationRecommendations();

  // Combined refresh function
  const refreshData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadCostData(),
        loadRecommendations()
      ]);
      
      // Check for errors from the individual hooks
      if (costDataError || recommendationsError) {
        setError(costDataError || recommendationsError);
      }
    } catch (error: any) {
      console.error("Error refreshing data:", error);
      setError(error.message || "An unexpected error occurred");
      toast({
        title: "Error refreshing data",
        description: "Some data may not be up-to-date",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const {
    enableRealTimeUpdates,
    disableRealTimeUpdates,
    isRealTimeEnabled
  } = useRealTimeUpdates({ refreshCallback: refreshData });

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [timeRange]);

  return {
    isLoading,
    isApplyingRecommendation,
    error,
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
  };
};
