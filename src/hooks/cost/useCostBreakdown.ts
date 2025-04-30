
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  getCostBreakdown, 
  getResourceTagCosts, 
  getCostDistributionByTeam, 
  getCostHistoryData
} from '@/services/cloud/costService';

export const useCostBreakdown = (initialTimeRange: '7d' | '30d' | '90d' = '30d') => {
  const [timeRange, setTimeRange] = useState(initialTimeRange);
  const [breakdownType, setBreakdownType] = useState<'service' | 'region' | 'account'>('service');
  const [isLoading, setIsLoading] = useState(false);
  const [breakdownData, setBreakdownData] = useState<any[]>([]);
  const [tagCosts, setTagCosts] = useState<any[]>([]);
  const [teamCosts, setTeamCosts] = useState<any[]>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const { toast } = useToast();

  const loadBreakdownData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getCostBreakdown(timeRange);
      if (result.error) {
        toast({
          title: "Error loading cost breakdown",
          description: result.error,
          variant: "destructive"
        });
      } else {
        switch (breakdownType) {
          case 'service':
            setBreakdownData(result.byService || []);
            break;
          case 'region':
            setBreakdownData(result.byRegion || []);
            break;
          case 'account':
            setBreakdownData(result.byAccount || []);
            break;
        }
      }
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, breakdownType, toast]);

  // Load tag costs separately
  const loadTagCosts = useCallback(async () => {
    try {
      const result = await getResourceTagCosts(timeRange);
      if (!result.error) {
        setTagCosts(result.tagCosts || []);
      }
    } catch (error) {
      console.error("Error loading tag costs:", error);
    }
  }, [timeRange]);

  // Load team costs separately
  const loadTeamCosts = useCallback(async () => {
    try {
      const result = await getCostDistributionByTeam(timeRange);
      if (!result.error) {
        setTeamCosts(result.teamCosts || []);
      }
    } catch (error) {
      console.error("Error loading team costs:", error);
    }
  }, [timeRange]);

  // Load historical data separately
  const loadHistoricalData = useCallback(async () => {
    try {
      const result = await getCostHistoryData(timeRange);
      if (!result.error) {
        setHistoricalData(result.history || []);
      }
    } catch (error) {
      console.error("Error loading historical data:", error);
    }
  }, [timeRange]);

  useEffect(() => {
    loadBreakdownData();
    loadTagCosts();
    loadTeamCosts();
    loadHistoricalData();
  }, [loadBreakdownData, loadTagCosts, loadTeamCosts, loadHistoricalData]);

  return {
    timeRange,
    setTimeRange,
    breakdownType,
    setBreakdownType,
    breakdownData,
    isLoading,
    tagCosts,
    teamCosts,
    historicalData
  };
};
