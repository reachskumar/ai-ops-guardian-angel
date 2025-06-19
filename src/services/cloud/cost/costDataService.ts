
import { supabase } from "@/integrations/supabase/client";
import { getAccountCredentials } from "../accountService";

// Get cost data for a given time range
export const getCostData = async (
  timeRange: string = '30d'
): Promise<{ 
  dailyCosts: any[]; 
  totalCost: number;
  previousPeriodCost?: number;
  percentChange?: number;
  error?: string;
}> => {
  try {
    console.log(`Fetching real cost data for time range: ${timeRange}`);
    
    // Call the real cost data edge function
    const { data, error } = await supabase.functions.invoke('get-cloud-costs', {
      body: { timeRange }
    });
    
    if (error) {
      console.error('Cost data edge function error:', error);
      throw new Error(`Edge function error: ${error.message}`);
    }
    
    if (!data || !data.success) {
      throw new Error('Failed to retrieve cost data from edge function');
    }
    
    console.log(`Successfully fetched real cost data: $${data.totalCost} total`);
    
    return {
      dailyCosts: data.dailyCosts || [],
      totalCost: data.totalCost || 0,
      previousPeriodCost: data.previousPeriodCost,
      percentChange: data.percentChange
    };
  } catch (error: any) {
    console.error("Get cost data error:", error);
    
    // Fallback to mock data if real API fails
    const endDate = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);
    
    const dailyCosts = [];
    let totalCost = 0;
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Generate some cost variation with a slight upward trend
      const baseCost = 5 + (Math.random() * 5); // Random cost between 5-10
      const trendFactor = 1 + (i / days) * 0.2; // Increase by up to 20% over the period
      const dayCost = baseCost * trendFactor;
      
      dailyCosts.push({
        date: date.toISOString().split('T')[0],
        cost: Number(dayCost.toFixed(2))
      });
      
      totalCost += dayCost;
    }
    
    // Calculate a mock previous period cost
    const previousPeriodCost = totalCost * 0.9; // 10% less than current
    const percentChange = ((totalCost - previousPeriodCost) / previousPeriodCost) * 100;
    
    return {
      dailyCosts,
      totalCost: Number(totalCost.toFixed(2)),
      previousPeriodCost: Number(previousPeriodCost.toFixed(2)),
      percentChange: Number(percentChange.toFixed(1)),
      error: `Billing API error, using fallback data: ${error.message}`
    };
  }
};

// Get cost breakdown by various dimensions (service, region, etc.)
export const getCostBreakdown = async (
  timeRange: string = '30d',
  dimension: string = 'service'
): Promise<{
  byService?: any[];
  byRegion?: any[];
  byAccount?: any[];
  byTag?: any[];
  byProvider?: any[];
  error?: string;
}> => {
  try {
    console.log(`Fetching real cost breakdown by ${dimension} for ${timeRange}`);
    
    // Call the real cost breakdown edge function
    const { data, error } = await supabase.functions.invoke('get-cost-breakdown', {
      body: { timeRange, dimension }
    });
    
    if (error) {
      console.error('Cost breakdown edge function error:', error);
      throw new Error(`Edge function error: ${error.message}`);
    }
    
    if (!data || !data.success) {
      throw new Error('Failed to retrieve cost breakdown from edge function');
    }
    
    console.log('Successfully fetched real cost breakdown data');
    
    return {
      byService: data.byService,
      byRegion: data.byRegion,
      byAccount: data.byAccount,
      byTag: data.byTag,
      byProvider: data.byProvider
    };
  } catch (error: any) {
    console.error("Get cost breakdown error:", error);
    
    // Fallback to mock breakdown data
    const mockServiceBreakdown = [
      { name: 'Compute Engine', cost: 125.45 },
      { name: 'Cloud Storage', cost: 45.20 },
      { name: 'Cloud SQL', cost: 32.80 },
      { name: 'Networking', cost: 18.80 },
      { name: 'Other Services', cost: 7.30 }
    ];
    
    const mockRegionBreakdown = [
      { name: 'us-central1', cost: 85.45 },
      { name: 'us-east1', cost: 65.20 },
      { name: 'europe-west1', cost: 38.80 },
      { name: 'asia-east1', cost: 28.30 },
      { name: 'australia-southeast1', cost: 11.80 }
    ];
    
    return {
      byService: mockServiceBreakdown,
      byRegion: mockRegionBreakdown,
      error: `Cost breakdown API error, using fallback data: ${error.message}`
    };
  }
};
