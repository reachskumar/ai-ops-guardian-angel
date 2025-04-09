
import { useState, useCallback } from 'react';
import { CostDataPoint, ServiceCostData, CostTrendData } from './types';
import { getCostData, getServiceCostBreakdown, getCostTrend } from '@/services/cloud/costService';
import { useToast } from '@/hooks/use-toast';

export const useCostData = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [costData, setCostData] = useState<CostDataPoint[]>([]);
  const [serviceCostData, setServiceCostData] = useState<ServiceCostData[]>([]);
  const [costTrend, setCostTrend] = useState<CostTrendData | null>(null);
  const { toast } = useToast();

  // Load cost data
  const loadCostData = useCallback(async () => {
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
      
      // Fetch cost trend
      const trendResult = await getCostTrend();
      if (!trendResult.error) {
        setCostTrend(trendResult.trend);
      }
    } catch (error: any) {
      toast({
        title: "Error loading cost data",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
  }, [timeRange, toast]);

  return {
    timeRange,
    setTimeRange,
    costData,
    serviceCostData,
    costTrend,
    loadCostData
  };
};
