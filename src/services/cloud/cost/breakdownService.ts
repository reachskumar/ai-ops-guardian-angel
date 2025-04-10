
import { supabase } from "@/integrations/supabase/client";
import { TagCost, TeamCost, HistoricalCostComparison } from "@/hooks/cost/useCostBreakdown";

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

// Generate simulated tag costs
export const generateSimulatedTagCosts = (): TagCost[] => {
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
export const generateSimulatedTeamCosts = (): TeamCost[] => {
  return [
    { teamId: "team-1", teamName: "Backend Dev", cost: 1800, percentage: 30, resources: 42 },
    { teamId: "team-2", teamName: "Frontend Dev", cost: 1200, percentage: 20, resources: 28 },
    { teamId: "team-3", teamName: "Data Science", cost: 1600, percentage: 27, resources: 35 },
    { teamId: "team-4", teamName: "DevOps", cost: 900, percentage: 15, resources: 22 },
    { teamId: "team-5", teamName: "QA", cost: 500, percentage: 8, resources: 15 }
  ];
};

// Generate simulated historical comparison
export const generateSimulatedHistoricalComparison = (timeRange: string): HistoricalCostComparison => {
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
