
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
  impact?: number;  // Added impact property
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'pending' | 'applied' | 'dismissed';
  resourceId?: string;
  resourceType?: string;
  resourceName?: string;  // Added this property
  details?: Record<string, any>;
}

export interface CostTrendData {
  period: string;
  total: number;
  previousPeriod: number;
  change: number;
  changePercentage: number;
}
