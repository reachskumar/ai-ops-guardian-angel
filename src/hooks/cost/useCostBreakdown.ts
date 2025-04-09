
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getCostByTag, getCostByTeam, getCostHistory } from '@/services/cloud/costService';
import { CostDataPoint } from './types';

export interface TagCost {
  tagKey: string;
  tagValue: string;
  cost: number;
  percentage: number;
}

export interface TeamCost {
  teamId: string;
  teamName: string;
  cost: number;
  percentage: number;
  resources: number;
}

export interface HistoricalCostComparison {
  currentPeriod: {
    startDate: string;
    endDate: string;
    totalCost: number;
  };
  previousPeriod: {
    startDate: string;
    endDate: string;
    totalCost: number;
  };
  change: number;
  changePercentage: number;
  costByDay: Array<{
    date: string;
    currentPeriodCost: number;
    previousPeriodCost: number;
  }>;
}

export const useCostBreakdown = () => {
  const [tagCosts, setTagCosts] = useState<TagCost[]>([]);
  const [teamCosts, setTeamCosts] = useState<TeamCost[]>([]);
  const [historicalComparison, setHistoricalComparison] = useState<HistoricalCostComparison | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d");
  const { toast } = useToast();

  const loadTagCosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getCostByTag(selectedTimeRange);
      if (result.error) {
        toast({
          title: "Error loading tag costs",
          description: result.error,
          variant: "destructive"
        });
      } else {
        setTagCosts(result.tagCosts);
      }
    } catch (error: any) {
      toast({
        title: "Error loading tag costs",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedTimeRange, toast]);

  const loadTeamCosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getCostByTeam(selectedTimeRange);
      if (result.error) {
        toast({
          title: "Error loading team costs",
          description: result.error,
          variant: "destructive"
        });
      } else {
        setTeamCosts(result.teamCosts);
      }
    } catch (error: any) {
      toast({
        title: "Error loading team costs",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedTimeRange, toast]);

  const loadHistoricalComparison = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getCostHistory(selectedTimeRange);
      if (result.error) {
        toast({
          title: "Error loading historical comparison",
          description: result.error,
          variant: "destructive"
        });
      } else {
        setHistoricalComparison(result.historicalComparison);
      }
    } catch (error: any) {
      toast({
        title: "Error loading historical comparison",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedTimeRange, toast]);

  const loadAllBreakdowns = async () => {
    setIsLoading(true);
    await Promise.all([
      loadTagCosts(),
      loadTeamCosts(),
      loadHistoricalComparison()
    ]);
    setIsLoading(false);
  };

  return {
    tagCosts,
    teamCosts,
    historicalComparison,
    isLoading,
    selectedTimeRange,
    setSelectedTimeRange,
    loadTagCosts,
    loadTeamCosts,
    loadHistoricalComparison,
    loadAllBreakdowns
  };
};
