
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
