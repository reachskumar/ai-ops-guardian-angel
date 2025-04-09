
import { useState, useEffect, useCallback } from 'react';
import { CostDataPoint, ServiceCostData, CostTrendData } from './types';
import { getCostData, getServiceCostBreakdown, getCostTrend } from '@/services/cloud/costService';
import { useToast } from '@/hooks/use-toast';

export const useCostData = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [costData, setCostData] = useState<CostDataPoint[]>([]);
  const [serviceCostData, setServiceCostData] = useState<ServiceCostData[]>([]);
  const [costTrend, setCostTrend] = useState<CostTrendData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadCostData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch cost data
      const costResult = await getCostData(timeRange);
      if (costResult.error) {
        console.error("Error fetching cost data:", costResult.error);
        toast({
          title: "Error fetching cost data",
          description: "Using simulated data instead",
          variant: "destructive"
        });
        setError(costResult.error);
      }
      setCostData(costResult.costData);
      
      // Fetch service cost breakdown
      const serviceResult = await getServiceCostBreakdown(timeRange);
      if (serviceResult.error) {
        console.error("Error fetching service cost breakdown:", serviceResult.error);
        setError(prevError => prevError || serviceResult.error);
      }
      setServiceCostData(serviceResult.serviceCosts);
      
      // Fetch cost trend
      const trendResult = await getCostTrend(timeRange);
      if (trendResult.error) {
        console.error("Error fetching cost trend:", trendResult.error);
        setError(prevError => prevError || trendResult.error);
      }
      setCostTrend(trendResult.trend);
      
    } catch (error: any) {
      console.error("Error loading cost data:", error);
      toast({
        title: "Error loading cost data",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      setError(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, toast]);
  
  // Initial data load
  useEffect(() => {
    loadCostData();
  }, [timeRange, loadCostData]);
  
  return {
    timeRange,
    setTimeRange,
    costData,
    serviceCostData,
    costTrend,
    loadCostData,
    isLoading,
    error
  };
};
