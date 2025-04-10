
import { supabase } from "@/integrations/supabase/client";
import { CostDataPoint, ServiceCostData, CostTrendData } from "@/hooks/cost/types";

// Get cost data for a specific period
export const getCostData = async (
  timeRange: string = '7d',
  groupBy: 'day' | 'week' | 'month' = 'day'
): Promise<{ 
  costData: CostDataPoint[];
  error?: string;
}> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-cost-data', {
      body: { 
        timeRange,
        groupBy,
        timestamp: new Date().toISOString() // For cache busting
      }
    });

    if (error) throw error;
    
    return { costData: data.costs };
  } catch (error: any) {
    console.error("Get cost data error:", error);
    return { 
      costData: generateSimulatedCostData(timeRange),
      error: error.message || 'Failed to fetch cost data' 
    };
  }
};

// Get service cost breakdown
export const getServiceCostBreakdown = async (
  timeRange: string = '7d'
): Promise<{ 
  serviceCosts: ServiceCostData[];
  error?: string;
}> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-service-cost-breakdown', {
      body: { 
        timeRange,
        timestamp: new Date().toISOString() // For cache busting
      }
    });

    if (error) throw error;
    
    return { serviceCosts: data.serviceCosts };
  } catch (error: any) {
    console.error("Get service cost breakdown error:", error);
    return { 
      serviceCosts: generateSimulatedServiceCosts(),
      error: error.message || 'Failed to fetch service cost breakdown' 
    };
  }
};

// Get cost trend summary
export const getCostTrend = async (
  timeRange: string = '30d'
): Promise<{ 
  trend: CostTrendData;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-cost-trend', {
      body: { 
        timeRange,
        timestamp: new Date().toISOString()
      }
    });

    if (error) throw error;
    
    return { trend: data.trend };
  } catch (error: any) {
    console.error("Get cost trend error:", error);
    return { 
      trend: generateSimulatedCostTrend(),
      error: error.message || 'Failed to fetch cost trend' 
    };
  }
};

// Generate simulated cost data for testing and fallback
export const generateSimulatedCostData = (timeRange: string): CostDataPoint[] => {
  const now = new Date();
  const days = timeRange === '90d' ? 90 : timeRange === '30d' ? 30 : 7;
  
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - i - 1));
    const day = date.toISOString().split('T')[0];
    
    // Create some variation in the data
    const randomFactor = 0.8 + (Math.random() * 0.4); // Between 0.8 and 1.2
    const baseAmount = 230 + (i * 2); // Slight upward trend
    
    return {
      date: day,
      amount: Math.round(baseAmount * randomFactor)
    };
  });
};

// Generate simulated service cost data
export const generateSimulatedServiceCosts = (): ServiceCostData[] => {
  return [
    { name: "EC2", value: 540, percentage: 42 },
    { name: "RDS", value: 320, percentage: 25 },
    { name: "S3", value: 180, percentage: 14 },
    { name: "Lambda", value: 90, percentage: 7 },
    { name: "Other", value: 150, percentage: 12 },
  ];
};

// Generate simulated cost trend data
export const generateSimulatedCostTrend = (): CostTrendData => {
  const currentTotal = 5890;
  const previousTotal = 5340;
  const change = currentTotal - previousTotal;
  const changePercentage = Math.round((change / previousTotal) * 100);
  
  return {
    period: 'Current month',
    total: currentTotal,
    previousPeriod: previousTotal,
    change,
    changePercentage
  };
};
