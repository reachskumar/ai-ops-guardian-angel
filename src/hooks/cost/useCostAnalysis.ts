
import { useState, useEffect } from 'react';
import { useCostData } from './useCostData';
import { useOptimizationRecommendations } from './useOptimizationRecommendations';
import { useRealTimeUpdates } from './useRealTimeUpdates';

export const useCostAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    timeRange,
    setTimeRange,
    costData,
    serviceCostData,
    costTrend,
    loadCostData
  } = useCostData();

  const {
    isApplyingRecommendation,
    optimizationRecommendations,
    totalPotentialSavings,
    loadRecommendations,
    applyRecommendation,
    dismissRecommendation
  } = useOptimizationRecommendations();

  // Combined refresh function
  const refreshData = async () => {
    setIsLoading(true);
    await loadCostData();
    await loadRecommendations();
    setIsLoading(false);
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
