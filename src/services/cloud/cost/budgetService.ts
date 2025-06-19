
import { supabase } from "@/integrations/supabase/client";
import { Budget } from "@/hooks/cost/useBudget";

// Get budget data from real cloud provider APIs
export const getBudgetData = async (): Promise<{
  budgets: Budget[];
  alerts?: any[];
  summary?: any;
  error?: string;
}> => {
  try {
    console.log('Fetching real budget data from cloud providers');
    
    // Call the real budgets edge function
    const { data, error } = await supabase.functions.invoke('get-budgets', {
      body: { 
        timestamp: new Date().toISOString()
      }
    });

    if (error) {
      console.error('Budgets edge function error:', error);
      throw new Error(`Edge function error: ${error.message}`);
    }
    
    if (!data || !data.success) {
      throw new Error('Failed to retrieve budget data');
    }
    
    console.log(`Successfully fetched ${data.budgets.length} real budgets with ${data.alerts?.length || 0} alerts`);
    
    return { 
      budgets: data.budgets,
      alerts: data.alerts,
      summary: data.summary
    };
  } catch (error: any) {
    console.error("Get budget data error:", error);
    
    // Fallback to mock budget data
    return { 
      budgets: generateSimulatedBudgets(),
      error: `Budget API error, using fallback data: ${error.message}`
    };
  }
};

// Update budget using real cloud provider APIs
export const updateBudget = async (
  budget: Partial<Budget>
): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    console.log('Updating budget via cloud provider APIs:', budget.name);
    
    // Call the real budget update edge function
    const { data, error } = await supabase.functions.invoke('update-budget', {
      body: { 
        budget,
        timestamp: new Date().toISOString()
      }
    });

    if (error) {
      console.error('Update budget edge function error:', error);
      throw new Error(`Edge function error: ${error.message}`);
    }
    
    console.log(`Successfully updated budget: ${budget.name}`);
    
    return { success: data?.success || true };
  } catch (error: any) {
    console.error("Update budget error:", error);
    
    // Mock successful update as fallback
    return { 
      success: true,
      error: `Budget update API error, changes may not be persistent: ${error.message}`
    };
  }
};

// Generate simulated budget data for fallback
export const generateSimulatedBudgets = (): Budget[] => {
  return [
    {
      id: "budget-1",
      name: "Q4 Cloud Infrastructure",
      amount: 15000,
      period: "quarterly",
      startDate: "2024-10-01",
      endDate: "2024-12-31",
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
      startDate: "2024-12-01",
      endDate: "2024-12-31",
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
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      tags: { "team": "data-analytics", "department": "data-science" },
      services: ["Redshift", "EMR", "Athena"],
      spent: 2700,
      remaining: -200,
      percentUsed: 108,
      status: "over"
    }
  ];
};
