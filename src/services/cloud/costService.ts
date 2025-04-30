
import { OptimizationRecommendation } from '@/hooks/cost/types';

// Add getOptimizationRecommendations function for compatibility 
export const getOptimizationRecommendations = async (): Promise<{
  recommendations: OptimizationRecommendation[];
  error?: string;
}> => {
  try {
    const data = await import('./cost/optimizationService').then(module => {
      return module.getOptimizationSuggestions();
    });

    // Convert suggestions to recommendations
    const recommendations: OptimizationRecommendation[] = (data.suggestions || []).map(suggestion => ({
      id: suggestion.id,
      title: suggestion.title,
      description: suggestion.description,
      potentialSavings: suggestion.monthlySavings || 0,
      impact: suggestion.monthlySavings || 0,
      difficulty: suggestion.difficulty || 'medium',
      status: 'pending',
      resourceId: suggestion.resourceIds?.[0] || undefined,
      resourceType: suggestion.category || undefined
    }));

    return {
      recommendations,
      error: data.error
    };
  } catch (error: any) {
    console.error("Error in getOptimizationRecommendations:", error);
    return {
      recommendations: [],
      error: error.message || 'Failed to retrieve optimization recommendations'
    };
  }
};

// Add applyOptimization function for compatibility
export const applyOptimization = async (optimizationId: string): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const result = await import('./cost/optimizationService').then(module => {
      return module.applyOptimization(optimizationId);
    });

    return result;
  } catch (error: any) {
    console.error("Error in applyOptimization:", error);
    return {
      success: false,
      error: error.message || 'Failed to apply optimization'
    };
  }
};

// Add getCostAnalysisTrend function for compatibility
export const getCostAnalysisTrend = async (timeRange: string = '30d'): Promise<{
  trend?: {
    period: string;
    total: number;
    previousPeriod: number;
    change: number;
    changePercentage: number;
  };
  error?: string;
}> => {
  try {
    const data = await import('./cost/costDataService').then(module => {
      return module.getCostData(timeRange);
    });

    if (data.error) {
      return { error: data.error };
    }

    // Calculate trend data from cost data
    return {
      trend: {
        period: timeRange,
        total: data.totalCost || 0,
        previousPeriod: data.previousPeriodCost || 0,
        change: (data.totalCost || 0) - (data.previousPeriodCost || 0),
        changePercentage: data.percentChange || 0
      }
    };
  } catch (error: any) {
    console.error("Error in getCostAnalysisTrend:", error);
    return {
      error: error.message || 'Failed to retrieve cost trend data'
    };
  }
};

// Add getCostForecast function for compatibility
export const getCostForecast = async (timeRange: string = '90d'): Promise<{
  forecast: Array<{ date: string; cost: number }>;
  forecastedTotal: number;
  confidenceInterval?: { upper: number; lower: number };
  error?: string;
}> => {
  try {
    const data = await import('./cost/forecastService').then(module => {
      return module.getForecast(timeRange);
    });

    return data;
  } catch (error: any) {
    console.error("Error in getCostForecast:", error);
    return {
      forecast: [],
      forecastedTotal: 0,
      error: error.message || 'Failed to retrieve forecast data'
    };
  }
};

// Add functions for tag costs, team distribution and history data
export const getResourceTagCosts = async (timeRange: string = '30d'): Promise<{
  tagCosts: any[];
  error?: string;
}> => {
  try {
    const data = await import('./cost/breakdownService').then(module => {
      return module.getCostByTag(timeRange);
    });

    return data;
  } catch (error: any) {
    console.error("Error in getResourceTagCosts:", error);
    return {
      tagCosts: [],
      error: error.message || 'Failed to retrieve tag costs'
    };
  }
};

export const getCostDistributionByTeam = async (timeRange: string = '30d'): Promise<{
  teamCosts: any[];
  error?: string;
}> => {
  try {
    const data = await import('./cost/breakdownService').then(module => {
      return module.getCostByTeam(timeRange);
    });

    return data;
  } catch (error: any) {
    console.error("Error in getCostDistributionByTeam:", error);
    return {
      teamCosts: [],
      error: error.message || 'Failed to retrieve team costs'
    };
  }
};

export const getCostHistoryData = async (timeRange: string = '30d'): Promise<{
  history: any[];
  error?: string;
}> => {
  try {
    const data = await import('./cost/breakdownService').then(module => {
      return module.getCostHistory(timeRange);
    });

    return data;
  } catch (error: any) {
    console.error("Error in getCostHistoryData:", error);
    return {
      history: [],
      error: error.message || 'Failed to retrieve cost history'
    };
  }
};

// Re-export all cost-related functions from sub-modules
export * from './cost';
