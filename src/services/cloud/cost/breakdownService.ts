
import { supabase } from "@/integrations/supabase/client";

// Get detailed cost breakdown for specific resources
export const getResourceCostBreakdown = async (
  resourceIds: string[],
  timeRange: string = '30d'
): Promise<{
  resources: any[];
  totalCost: number;
  error?: string;
}> => {
  try {
    // Try to call the edge function if available
    try {
      const { data, error } = await supabase.functions.invoke('get-resource-costs', {
        body: { resourceIds, timeRange }
      });
      
      if (error) throw error;
      
      return data;
    } catch (edgeError: any) {
      console.warn("Edge function error, falling back to mock data:", edgeError);
      
      // Generate mock resource cost data
      const mockResources = resourceIds.map(id => {
        // Generate random cost based on resource ID (but consistent for the same ID)
        const hashCode = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const baseCost = (hashCode % 40) + 10; // Cost between 10-50
        
        return {
          resourceId: id,
          name: `Resource-${id.substring(0, 6)}`,
          totalCost: Number(baseCost.toFixed(2)),
          breakdown: [
            {
              category: 'Compute',
              cost: Number((baseCost * 0.7).toFixed(2))
            },
            {
              category: 'Storage',
              cost: Number((baseCost * 0.2).toFixed(2)) 
            },
            {
              category: 'Network',
              cost: Number((baseCost * 0.1).toFixed(2))
            }
          ]
        };
      });
      
      // Calculate total cost
      const totalCost = mockResources.reduce((sum, res) => sum + res.totalCost, 0);
      
      return {
        resources: mockResources,
        totalCost: Number(totalCost.toFixed(2))
      };
    }
  } catch (error: any) {
    console.error("Get resource cost breakdown error:", error);
    return {
      resources: [],
      totalCost: 0,
      error: error.message || 'Failed to retrieve resource cost breakdown'
    };
  }
};

// Get cost anomalies detected in the specified time range
export const getCostAnomalies = async (
  timeRange: string = '30d'
): Promise<{
  anomalies: any[];
  error?: string;
}> => {
  try {
    // Try to call the edge function if available
    try {
      const { data, error } = await supabase.functions.invoke('get-cost-anomalies', {
        body: { timeRange }
      });
      
      if (error) throw error;
      
      return data;
    } catch (edgeError: any) {
      console.warn("Edge function error, falling back to mock data:", edgeError);
      
      // Generate mock anomalies data
      const mockAnomalies = [
        {
          id: 'anom-1',
          resourceId: 'vm-123456',
          resourceName: 'web-server-prod',
          date: '2023-04-20',
          expectedCost: 12.50,
          actualCost: 28.75,
          percentIncrease: 130,
          reason: 'Unexpected spike in network egress traffic'
        },
        {
          id: 'anom-2',
          resourceId: 'storage-789012',
          resourceName: 'app-storage-bucket',
          date: '2023-04-25',
          expectedCost: 8.20,
          actualCost: 16.45,
          percentIncrease: 100,
          reason: 'Increased storage operations'
        }
      ];
      
      return {
        anomalies: mockAnomalies
      };
    }
  } catch (error: any) {
    console.error("Get cost anomalies error:", error);
    return {
      anomalies: [],
      error: error.message || 'Failed to retrieve cost anomalies'
    };
  }
};

// Add the compatibility methods for getCostByTag, getCostByTeam, and getCostHistory
export const getCostByTag = async (timeRange: string = '30d') => {
  try {
    // Mock implementation
    const tagCosts = [
      { tagKey: "environment", tagValue: "production", cost: 1250.75, percentage: 62 },
      { tagKey: "environment", tagValue: "staging", cost: 480.25, percentage: 24 },
      { tagKey: "environment", tagValue: "development", cost: 280.50, percentage: 14 },
      
      { tagKey: "department", tagValue: "engineering", cost: 980.25, percentage: 49 },
      { tagKey: "department", tagValue: "marketing", cost: 620.50, percentage: 31 },
      { tagKey: "department", tagValue: "finance", cost: 410.75, percentage: 20 },
      
      { tagKey: "project", tagValue: "main-app", cost: 850.25, percentage: 42 },
      { tagKey: "project", tagValue: "api-service", cost: 520.75, percentage: 26 },
      { tagKey: "project", tagValue: "data-pipeline", cost: 380.50, percentage: 19 },
      { tagKey: "project", tagValue: "website", cost: 260.00, percentage: 13 }
    ];
    
    return { tagCosts };
  } catch (error) {
    console.error("Error getting cost by tag:", error);
    return { tagCosts: [], error: "Failed to retrieve tag costs" };
  }
};

export const getCostByTeam = async (timeRange: string = '30d') => {
  try {
    // Mock implementation
    const teamCosts = [
      { teamName: "Platform", cost: 1250.75, resources: 45, percentage: 35 },
      { teamName: "Frontend", cost: 850.50, resources: 28, percentage: 24 },
      { teamName: "Backend", cost: 720.25, resources: 32, percentage: 20 },
      { teamName: "Data Science", cost: 480.75, resources: 15, percentage: 13 },
      { teamName: "QA", cost: 280.25, resources: 10, percentage: 8 }
    ];
    
    return { teamCosts };
  } catch (error) {
    console.error("Error getting cost by team:", error);
    return { teamCosts: [], error: "Failed to retrieve team costs" };
  }
};

export const getCostHistory = async (timeRange: string = '30d') => {
  try {
    // Mock implementation - generate daily costs for current and previous period
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const history = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      const currentCost = 100 + Math.random() * 50;
      const previousCost = currentCost * (0.8 + Math.random() * 0.3); // 80-110% of current
      
      history.push({
        date: date.toISOString().split('T')[0],
        currentCost: parseFloat(currentCost.toFixed(2)),
        previousCost: parseFloat(previousCost.toFixed(2))
      });
    }
    
    return { history };
  } catch (error) {
    console.error("Error getting cost history:", error);
    return { history: [], error: "Failed to retrieve cost history" };
  }
};
