
import { supabase } from "@/integrations/supabase/client";
import { 
  CostDataPoint, 
  ServiceCostData, 
  OptimizationRecommendation,
  CostTrendData
} from "@/hooks/cost/types";
import { Budget } from "@/hooks/cost/useBudget";
import { ForecastData, ForecastOptions } from "@/hooks/cost/useCostForecasting";
import { TagCost, TeamCost, HistoricalCostComparison } from "@/hooks/cost/useCostBreakdown";

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

// Get budget data
export const getBudgetData = async (): Promise<{
  budgets: Budget[];
  error?: string;
}> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-budgets', {
      body: { 
        timestamp: new Date().toISOString()
      }
    });

    if (error) throw error;
    
    return { budgets: data.budgets };
  } catch (error: any) {
    console.error("Get budget data error:", error);
    return { 
      budgets: generateSimulatedBudgets(),
      error: error.message || 'Failed to fetch budget data' 
    };
  }
};

// Update budget
export const updateBudget = async (
  budget: Partial<Budget>
): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase.functions.invoke('update-budget', {
      body: { 
        budget,
        timestamp: new Date().toISOString()
      }
    });

    if (error) throw error;
    
    return { success: data.success };
  } catch (error: any) {
    console.error("Update budget error:", error);
    return { 
      success: true, // For simulated response
      error: error.message || 'Failed to update budget' 
    };
  }
};

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

// Get costs by tag
export const getCostByTag = async (
  timeRange: string = '30d'
): Promise<{
  tagCosts: TagCost[];
  error?: string;
}> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-cost-by-tag', {
      body: { 
        timeRange,
        timestamp: new Date().toISOString()
      }
    });

    if (error) throw error;
    
    return { tagCosts: data.tagCosts };
  } catch (error: any) {
    console.error("Get costs by tag error:", error);
    return { 
      tagCosts: generateSimulatedTagCosts(),
      error: error.message || 'Failed to fetch tag costs' 
    };
  }
};

// Get costs by team
export const getCostByTeam = async (
  timeRange: string = '30d'
): Promise<{
  teamCosts: TeamCost[];
  error?: string;
}> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-cost-by-team', {
      body: { 
        timeRange,
        timestamp: new Date().toISOString()
      }
    });

    if (error) throw error;
    
    return { teamCosts: data.teamCosts };
  } catch (error: any) {
    console.error("Get costs by team error:", error);
    return { 
      teamCosts: generateSimulatedTeamCosts(),
      error: error.message || 'Failed to fetch team costs' 
    };
  }
};

// Get historical cost comparison
export const getCostHistory = async (
  timeRange: string = '30d'
): Promise<{
  historicalComparison: HistoricalCostComparison;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-cost-history', {
      body: { 
        timeRange,
        timestamp: new Date().toISOString()
      }
    });

    if (error) throw error;
    
    return { historicalComparison: data.historicalComparison };
  } catch (error: any) {
    console.error("Get historical cost comparison error:", error);
    return { 
      historicalComparison: generateSimulatedHistoricalComparison(timeRange),
      error: error.message || 'Failed to fetch historical cost comparison' 
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

// Generate simulated budget data
const generateSimulatedBudgets = (): Budget[] => {
  return [
    {
      id: "budget-1",
      name: "Q2 Cloud Infrastructure",
      amount: 15000,
      period: "quarterly",
      startDate: "2023-04-01",
      endDate: "2023-06-30",
      tags: { "env": "production", "department": "engineering" },
      services: ["EC2", "RDS", "S3"],
      spent: 9800,
      remaining: 5200,
      percentUsed: 65,
      status: "under"
    },
    {
      id: "budget-2",
      name: "DevOps Team Monthly",
      amount: 3000,
      period: "monthly",
      startDate: "2023-05-01",
      endDate: "2023-05-31",
      tags: { "team": "devops", "department": "engineering" },
      services: ["EC2", "ECS", "CloudWatch"],
      spent: 2850,
      remaining: 150,
      percentUsed: 95,
      status: "near"
    },
    {
      id: "budget-3",
      name: "Data Analytics Team",
      amount: 2500,
      period: "monthly",
      startDate: "2023-05-01",
      endDate: "2023-05-31",
      tags: { "team": "data-analytics", "department": "data-science" },
      services: ["Redshift", "EMR", "Athena"],
      spent: 2700,
      remaining: -200,
      percentUsed: 108,
      status: "over"
    }
  ];
};

// Generate simulated forecast data
const generateSimulatedForecast = (options: ForecastOptions): ForecastData => {
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

// Generate simulated tag costs
const generateSimulatedTagCosts = (): TagCost[] => {
  return [
    { tagKey: "environment", tagValue: "production", cost: 3500, percentage: 58 },
    { tagKey: "environment", tagValue: "staging", cost: 1200, percentage: 20 },
    { tagKey: "environment", tagValue: "development", cost: 800, percentage: 13 },
    { tagKey: "department", tagValue: "engineering", cost: 3800, percentage: 63 },
    { tagKey: "department", tagValue: "marketing", cost: 750, percentage: 13 },
    { tagKey: "department", tagValue: "finance", cost: 450, percentage: 8 },
    { tagKey: "project", tagValue: "website-redesign", cost: 950, percentage: 16 },
    { tagKey: "project", tagValue: "mobile-app", cost: 1100, percentage: 18 },
    { tagKey: "backup", tagValue: "true", cost: 680, percentage: 11 }
  ];
};

// Generate simulated team costs
const generateSimulatedTeamCosts = (): TeamCost[] => {
  return [
    { teamId: "team-1", teamName: "Backend Dev", cost: 1800, percentage: 30, resources: 42 },
    { teamId: "team-2", teamName: "Frontend Dev", cost: 1200, percentage: 20, resources: 28 },
    { teamId: "team-3", teamName: "Data Science", cost: 1600, percentage: 27, resources: 35 },
    { teamId: "team-4", teamName: "DevOps", cost: 900, percentage: 15, resources: 22 },
    { teamId: "team-5", teamName: "QA", cost: 500, percentage: 8, resources: 15 }
  ];
};

// Generate simulated historical comparison
const generateSimulatedHistoricalComparison = (timeRange: string): HistoricalCostComparison => {
  const days = timeRange === '90d' ? 90 : timeRange === '30d' ? 30 : 7;
  const now = new Date();
  
  // Calculate current period
  const currentPeriodEnd = new Date(now);
  const currentPeriodStart = new Date(now);
  currentPeriodStart.setDate(currentPeriodStart.getDate() - days);
  
  // Calculate previous period
  const previousPeriodEnd = new Date(currentPeriodStart);
  previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
  const previousPeriodStart = new Date(previousPeriodEnd);
  previousPeriodStart.setDate(previousPeriodStart.getDate() - days);
  
  // Generate some cost data
  const currentPeriodTotal = Math.round(days * 180 * (1 + Math.random() * 0.2));
  const previousPeriodTotal = Math.round(days * 180 * (0.8 + Math.random() * 0.2));
  
  const change = currentPeriodTotal - previousPeriodTotal;
  const changePercentage = Math.round((change / previousPeriodTotal) * 100 * 10) / 10;
  
  // Generate daily cost data
  const costByDay = Array.from({ length: days }, (_, i) => {
    const date = new Date(currentPeriodStart);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    return {
      date: dateStr,
      currentPeriodCost: Math.round(150 + Math.random() * 60),
      previousPeriodCost: Math.round(120 + Math.random() * 60)
    };
  });
  
  return {
    currentPeriod: {
      startDate: currentPeriodStart.toISOString().split('T')[0],
      endDate: currentPeriodEnd.toISOString().split('T')[0],
      totalCost: currentPeriodTotal
    },
    previousPeriod: {
      startDate: previousPeriodStart.toISOString().split('T')[0],
      endDate: previousPeriodEnd.toISOString().split('T')[0],
      totalCost: previousPeriodTotal
    },
    change,
    changePercentage,
    costByDay
  };
};
