
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getBudgetData, updateBudget } from '@/services/cloud/costService';

export interface Budget {
  id: string;
  name: string;
  amount: number;
  period: 'monthly' | 'quarterly' | 'annual';
  startDate: string;
  endDate?: string;
  tags?: Record<string, string>;
  services?: string[];
  spent: number;
  remaining: number;
  percentUsed: number;
  status: 'under' | 'near' | 'over';
}

export interface BudgetAlert {
  threshold: number; // percentage
  type: 'email' | 'slack' | 'notification';
  recipients?: string[];
  enabled: boolean;
}

export const useBudget = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [activeBudget, setActiveBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [budgetAlerts, setBudgetAlerts] = useState<BudgetAlert[]>([
    { threshold: 50, type: 'notification', enabled: true },
    { threshold: 80, type: 'notification', enabled: true },
    { threshold: 100, type: 'notification', enabled: true }
  ]);
  const { toast } = useToast();

  const loadBudgets = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getBudgetData();
      if (result.error) {
        toast({
          title: "Error loading budgets",
          description: result.error,
          variant: "destructive"
        });
      } else {
        setBudgets(result.budgets);
        if (result.budgets.length > 0 && !activeBudget) {
          setActiveBudget(result.budgets[0]);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error loading budgets",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, activeBudget]);

  const saveOrUpdateBudget = async (budget: Partial<Budget>) => {
    setIsLoading(true);
    try {
      const result = await updateBudget(budget);
      if (result.success) {
        toast({
          title: budget.id ? "Budget updated" : "Budget created",
          description: `Successfully ${budget.id ? "updated" : "created"} the budget "${budget.name}"`,
        });
        loadBudgets();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save budget",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setAlertStatus = (index: number, enabled: boolean) => {
    setBudgetAlerts(alerts => {
      const newAlerts = [...alerts];
      newAlerts[index].enabled = enabled;
      return newAlerts;
    });

    // In a real app, would also save this to the backend
    toast({
      title: enabled ? "Alert enabled" : "Alert disabled",
      description: `${enabled ? "Enabled" : "Disabled"} alert at ${budgetAlerts[index].threshold}% threshold`
    });
  };

  return {
    budgets,
    activeBudget,
    setActiveBudget,
    isLoading,
    loadBudgets,
    saveOrUpdateBudget,
    budgetAlerts,
    setAlertStatus
  };
};
