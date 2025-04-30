
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

// Re-export all cost-related functions from sub-modules
export * from './cost';
