
import { supabase } from "@/integrations/supabase/client";

export interface CostDataPoint {
  date: string;
  amount: number;
  service?: string;
}

export interface ServiceCostData {
  name: string;
  value: number;
  percentage?: number;
}

export interface OptimizationRecommendation {
  id: string;
  title: string;
  description: string;
  potentialSavings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'pending' | 'applied' | 'dismissed';
  resourceId?: string;
  resourceType?: string;
}

export interface CostTrendData {
  period: string;
  total: number;
  previousPeriod: number;
  change: number;
  changePercentage: number;
}

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

// Get cost optimization recommendations
export const getCostOptimizationRecommendations = async (): Promise<{ 
  recommendations: OptimizationRecommendation[];
  potentialSavings: number;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-cost-recommendations', {
      body: { 
        timestamp: new Date().toISOString() // For cache busting
      }
    });

    if (error) throw error;
    
    const potentialSavings = data.recommendations.reduce(
      (sum: number, rec: OptimizationRecommendation) => sum + rec.potentialSavings, 
      0
    );
    
    return { 
      recommendations: data.recommendations,
      potentialSavings
    };
  } catch (error: any) {
    console.error("Get cost recommendations error:", error);
    const recommendations = generateSimulatedOptimizationRecommendations();
    const potentialSavings = recommendations.reduce(
      (sum, rec) => sum + rec.potentialSavings, 
      0
    );
    
    return { 
      recommendations,
      potentialSavings,
      error: error.message || 'Failed to fetch optimization recommendations' 
    };
  }
};

// Apply a cost optimization recommendation
export const applyCostOptimization = async (
  recommendationId: string
): Promise<{ 
  success: boolean;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase.functions.invoke('apply-cost-optimization', {
      body: { 
        recommendationId,
        timestamp: new Date().toISOString()
      }
    });

    if (error) throw error;
    
    return { success: data.success };
  } catch (error: any) {
    console.error("Apply cost optimization error:", error);
    return { 
      success: false,
      error: error.message || 'Failed to apply cost optimization' 
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
const generateSimulatedCostData = (timeRange: string): CostDataPoint[] => {
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
const generateSimulatedServiceCosts = (): ServiceCostData[] => {
  return [
    { name: "EC2", value: 540, percentage: 42 },
    { name: "RDS", value: 320, percentage: 25 },
    { name: "S3", value: 180, percentage: 14 },
    { name: "Lambda", value: 90, percentage: 7 },
    { name: "Other", value: 150, percentage: 12 },
  ];
};

// Generate simulated optimization recommendations
const generateSimulatedOptimizationRecommendations = (): OptimizationRecommendation[] => {
  return [
    {
      id: "rec-1",
      title: "Right-size underutilized EC2 instances",
      description: "3 t2.large instances have <20% CPU utilization over the last week. Consider downgrading to t2.medium.",
      potentialSavings: 120,
      difficulty: 'easy',
      status: 'pending',
      resourceId: 'i-12345',
      resourceType: 'EC2'
    },
    {
      id: "rec-2",
      title: "Use Reserved Instances for stable workloads",
      description: "Convert 5 on-demand EC2 instances to reserved instances for 1-year term.",
      potentialSavings: 450,
      difficulty: 'medium',
      status: 'pending',
      resourceType: 'EC2'
    },
    {
      id: "rec-3",
      title: "Clean up unused EBS volumes",
      description: "3 EBS volumes (40GB each) are unattached and can be removed.",
      potentialSavings: 35,
      difficulty: 'easy',
      status: 'pending',
      resourceType: 'EBS'
    },
    {
      id: "rec-4",
      title: "Move cold data to cheaper storage tiers",
      description: "Transfer rarely accessed S3 data (approximately 500GB) to Glacier storage class.",
      potentialSavings: 85,
      difficulty: 'medium',
      status: 'pending',
      resourceType: 'S3'
    },
    {
      id: "rec-5",
      title: "Clean up unused Elastic IPs",
      description: "You have 2 unassociated Elastic IPs that are incurring charges.",
      potentialSavings: 8,
      difficulty: 'easy',
      status: 'pending',
      resourceType: 'VPC'
    },
  ];
};

// Generate simulated cost trend data
const generateSimulatedCostTrend = (): CostTrendData => {
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
