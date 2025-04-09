
import { useState, useEffect, useCallback } from 'react';
import { 
  getCostData, 
  getServiceCostBreakdown, 
  getCostOptimizationRecommendations,
  applyCostOptimization,
  getCostTrend,
  CostDataPoint,
  ServiceCostData,
  OptimizationRecommendation,
  CostTrendData
} from '@/services/cloud/costService';
import { useToast } from '@/hooks/use-toast';

export const useCostAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isApplyingRecommendation, setIsApplyingRecommendation] = useState(false);
  const [timeRange, setTimeRange] = useState("7d");
  const [costData, setCostData] = useState<CostDataPoint[]>([]);
  const [serviceCostData, setServiceCostData] = useState<ServiceCostData[]>([]);
  const [optimizationRecommendations, setOptimizationRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [totalPotentialSavings, setTotalPotentialSavings] = useState(0);
  const [costTrend, setCostTrend] = useState<CostTrendData | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Load all cost data
  const loadCostData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Fetch cost data
      const costResult = await getCostData(timeRange);
      if (costResult.error) {
        toast({
          title: "Error fetching cost data",
          description: costResult.error,
          variant: "destructive"
        });
      } else {
        setCostData(costResult.costData);
      }
      
      // Fetch service breakdown
      const serviceResult = await getServiceCostBreakdown(timeRange);
      if (serviceResult.error) {
        toast({
          title: "Error fetching service cost breakdown",
          description: serviceResult.error,
          variant: "destructive"
        });
      } else {
        setServiceCostData(serviceResult.serviceCosts);
      }
      
      // Fetch optimization recommendations
      const recommendationsResult = await getCostOptimizationRecommendations();
      if (recommendationsResult.error) {
        toast({
          title: "Error fetching optimization recommendations",
          description: recommendationsResult.error,
          variant: "destructive"
        });
      } else {
        setOptimizationRecommendations(recommendationsResult.recommendations);
        setTotalPotentialSavings(recommendationsResult.potentialSavings);
      }
      
      // Fetch cost trend
      const trendResult = await getCostTrend();
      if (!trendResult.error) {
        setCostTrend(trendResult.trend);
      }
    } catch (error) {
      toast({
        title: "Error loading cost data",
        description: "An unexpected error occurred while loading cost data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, toast]);

  // Apply a recommendation
  const applyRecommendation = async (recommendationId: string) => {
    setIsApplyingRecommendation(true);
    
    try {
      const result = await applyCostOptimization(recommendationId);
      
      if (result.success) {
        toast({
          title: "Recommendation applied",
          description: "The cost optimization has been successfully applied",
        });
        
        // Update the recommendation status locally
        setOptimizationRecommendations(prev => 
          prev.map(rec => 
            rec.id === recommendationId 
              ? { ...rec, status: 'applied' } 
              : rec
          )
        );
        
        // Recalculate total potential savings
        const newSavings = optimizationRecommendations
          .filter(rec => rec.id !== recommendationId)
          .reduce((sum, rec) => sum + rec.potentialSavings, 0);
          
        setTotalPotentialSavings(newSavings);
      } else {
        toast({
          title: "Failed to apply recommendation",
          description: result.error || "Unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsApplyingRecommendation(false);
    }
  };

  // Dismiss a recommendation
  const dismissRecommendation = (recommendationId: string) => {
    // Update recommendation status locally
    setOptimizationRecommendations(prev => 
      prev.map(rec => 
        rec.id === recommendationId 
          ? { ...rec, status: 'dismissed' } 
          : rec
      )
    );
    
    // Recalculate total potential savings
    const newSavings = optimizationRecommendations
      .filter(rec => rec.id !== recommendationId)
      .reduce((sum, rec) => sum + rec.potentialSavings, 0);
      
    setTotalPotentialSavings(newSavings);
    
    toast({
      title: "Recommendation dismissed",
      description: "The recommendation has been dismissed from your list",
    });
  };

  // Enable real-time updates
  const enableRealTimeUpdates = useCallback(() => {
    // Clear any existing interval
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
    
    // Set up a new interval - refresh every 30 seconds
    const interval = setInterval(() => {
      loadCostData();
    }, 30000);
    
    setRefreshInterval(interval);
    
    toast({
      title: "Real-time updates enabled",
      description: "Cost data will refresh automatically every 30 seconds",
    });
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loadCostData, refreshInterval, toast]);

  // Disable real-time updates
  const disableRealTimeUpdates = useCallback(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
      
      toast({
        title: "Real-time updates disabled",
        description: "Cost data will only update when manually refreshed",
      });
    }
  }, [refreshInterval, toast]);

  // Initial data load
  useEffect(() => {
    loadCostData();
  }, [timeRange, loadCostData]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

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
    refreshData: loadCostData,
    applyRecommendation,
    dismissRecommendation,
    enableRealTimeUpdates,
    disableRealTimeUpdates,
    isRealTimeEnabled: !!refreshInterval
  };
};
