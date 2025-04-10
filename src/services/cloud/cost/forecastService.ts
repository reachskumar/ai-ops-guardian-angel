
import { supabase } from "@/integrations/supabase/client";
import { ForecastData, ForecastOptions } from "@/hooks/cost/useCostForecasting";
import { CostDataPoint } from "@/hooks/cost/types";

// Get cost forecast
export const getCostForecast = async (
  options: ForecastOptions
): Promise<{
  forecastData: ForecastData;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-cost-forecast', {
      body: { 
        options,
        timestamp: new Date().toISOString()
      }
    });

    if (error) throw error;
    
    return { forecastData: data.forecastData };
  } catch (error: any) {
    console.error("Get cost forecast error:", error);
    return { 
      forecastData: generateSimulatedForecast(options),
      error: error.message || 'Failed to fetch forecast data' 
    };
  }
};

// Generate simulated forecast data
export const generateSimulatedForecast = (options: ForecastOptions): ForecastData => {
  const months = options.months;
  const now = new Date();
  const confidenceInterval = options.confidenceInterval;
  const forecastedCosts: CostDataPoint[] = [];
  let totalForecast = 0;
  
  const baseMonthly = 5500; // Base monthly cost
  const variationFactor = options.includeRecommendations ? 0.9 : 1.05; // Growth factor
  
  for (let i = 0; i < months; i++) {
    const month = new Date(now);
    month.setMonth(now.getMonth() + i + 1);
    month.setDate(1);
    
    const monthStr = month.toISOString().split('T')[0].substring(0, 7);
    const cost = Math.round(baseMonthly * Math.pow(variationFactor, i));
    
    forecastedCosts.push({
      date: monthStr,
      amount: cost
    });
    
    totalForecast += cost;
  }
  
  const averageMonthly = Math.round(totalForecast / months);
  const minEstimate = Math.round(totalForecast * (1 - ((100 - confidenceInterval) / 100)));
  const maxEstimate = Math.round(totalForecast * (1 + ((100 - confidenceInterval) / 100)));

  return {
    forecastedCosts,
    totalForecast,
    averageMonthly,
    minEstimate,
    maxEstimate,
    confidenceInterval
  };
};
