
import { supabase } from "@/integrations/supabase/client";

export const getForecast = async (
  timeRange: string = '90d',
  options = { confidenceInterval: 80, includeRecommendations: true }
): Promise<{
  forecast: Array<{ date: string; cost: number }>;
  forecastedTotal: number;
  confidenceInterval?: { upper: number; lower: number };
  potentialSavings?: number;
  error?: string;
}> => {
  try {
    console.log(`Fetching real cost forecast for ${timeRange} with options:`, options);
    
    // Call the real cost forecast edge function
    const { data, error } = await supabase.functions.invoke('get-cost-forecast', {
      body: { timeRange, options }
    });
    
    if (error) {
      console.error('Cost forecast edge function error:', error);
      throw new Error(`Edge function error: ${error.message}`);
    }
    
    if (!data || !data.success) {
      throw new Error('Failed to retrieve cost forecast');
    }
    
    console.log(`Successfully fetched real cost forecast: $${data.forecastedTotal} total forecast`);
    
    return {
      forecast: data.forecast,
      forecastedTotal: data.forecastedTotal,
      confidenceInterval: data.confidenceInterval,
      potentialSavings: data.potentialSavings
    };
  } catch (error: any) {
    console.error("Get forecast error:", error);
    
    // Fallback to mock forecast data
    const days = parseInt(timeRange.replace('d', ''));
    const months = Math.ceil(days / 30); // Approximate months
    
    // Generate mock forecast data
    const forecast = [];
    const today = new Date();
    const baseAmount = 150; // Base daily cost
    const monthlyGrowthRate = 0.05; // 5% growth per month
    let totalCost = 0;
    
    for (let i = 1; i <= days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Calculate cost with growth factor
      const growthFactor = 1 + (monthlyGrowthRate * (i / 30));
      const dayCost = baseAmount * growthFactor * (0.9 + Math.random() * 0.2); // Add some variance
      totalCost += dayCost;
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        cost: parseFloat(dayCost.toFixed(2))
      });
    }
    
    // Calculate confidence interval
    const confidenceMultiplier = options.confidenceInterval / 100 * 0.5; // Map 80% -> 0.4 range
    const lowerBound = totalCost * (1 - confidenceMultiplier);
    const upperBound = totalCost * (1 + confidenceMultiplier);
    
    // Calculate potential savings if recommendations are included
    const potentialSavings = options.includeRecommendations ? totalCost * 0.12 : 0;
    
    return {
      forecast,
      forecastedTotal: parseFloat(totalCost.toFixed(2)),
      confidenceInterval: {
        lower: parseFloat(lowerBound.toFixed(2)),
        upper: parseFloat(upperBound.toFixed(2))
      },
      potentialSavings: parseFloat(potentialSavings.toFixed(2)),
      error: `Forecast API error, using fallback data: ${error.message}`
    };
  }
};
