
import { useState, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getCostForecast } from '@/services/cloud/costService';
import { CostDataPoint } from './types';

export interface ForecastOptions {
  months: number;
  includeRecommendations: boolean;
  confidenceInterval: number; // 0-100
}

export interface ForecastData {
  forecastedCosts: CostDataPoint[];
  totalForecast: number;
  averageMonthly: number;
  minEstimate: number;
  maxEstimate: number;
  confidenceInterval: number;
}

export const useCostForecasting = () => {
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [forecastOptions, setForecastOptions] = useState<ForecastOptions>({
    months: 3,
    includeRecommendations: true,
    confidenceInterval: 80
  });
  const { toast } = useToast();

  const loadForecast = useCallback(async () => {
    setIsLoading(true);
    try {
      // Convert options to timeRange string for API compatibility
      const timeRange = `${forecastOptions.months * 30}d`;
      const result = await getCostForecast(timeRange);
      
      if (result.error) {
        toast({
          title: "Error generating forecast",
          description: result.error,
          variant: "destructive"
        });
      } else {
        // Transform the response to match our ForecastData interface
        const forecastDataObj: ForecastData = {
          forecastedCosts: result.forecast.map(item => ({
            date: item.date,
            amount: item.cost,
            category: 'forecast'
          })),
          totalForecast: result.forecastedTotal,
          averageMonthly: result.forecastedTotal / forecastOptions.months,
          minEstimate: result.confidenceInterval?.lower || result.forecastedTotal * 0.9,
          maxEstimate: result.confidenceInterval?.upper || result.forecastedTotal * 1.1,
          confidenceInterval: forecastOptions.confidenceInterval
        };
        setForecastData(forecastDataObj);
      }
    } catch (error: any) {
      toast({
        title: "Error generating forecast",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [forecastOptions, toast]);

  const updateForecastOptions = (options: Partial<ForecastOptions>) => {
    setForecastOptions(prev => ({
      ...prev,
      ...options
    }));
  };

  // Calculate trend percentage (simulated)
  const trendPercentage = useMemo(() => {
    if (!forecastData) return 0;
    return forecastData.forecastedCosts.length > 1 ? 
      ((forecastData.forecastedCosts[forecastData.forecastedCosts.length - 1].amount - 
        forecastData.forecastedCosts[0].amount) / forecastData.forecastedCosts[0].amount) * 100 : 0;
  }, [forecastData]);

  return {
    forecastData,
    isLoading,
    forecastOptions,
    updateForecastOptions,
    loadForecast,
    trendPercentage
  };
};
