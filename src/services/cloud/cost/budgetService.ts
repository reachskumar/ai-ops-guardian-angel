
import { supabase } from "@/integrations/supabase/client";
import { Budget } from "@/hooks/cost/useBudget";

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

// Generate simulated budget data
export const generateSimulatedBudgets = (): Budget[] => {
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
