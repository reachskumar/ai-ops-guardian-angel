
// This file re-exports all cost-related services from the cost/ folder
// to maintain backwards compatibility with existing imports

export * from './cost';

// Define additional methods for backwards compatibility
export const getCostData = (timeRange: string) => {
  // Import from the proper module and call the function
  const { getCostData } = require('./cost/costDataService');
  return getCostData(timeRange);
};

export const getCostBreakdown = (timeRange: string) => {
  // Import from the proper module and call the function
  const { getCostBreakdown } = require('./cost/breakdownService');
  return getCostBreakdown(timeRange);
};

export const getCostAnalysisTrend = (timeRange: string) => {
  // Import from the proper module and call the function
  const { getCostTrend } = require('./cost/costDataService');
  return getCostTrend(timeRange);
};

export const getResourceTagCosts = (timeRange: string) => {
  // Import from the proper module and call the function
  const { getCostByTag } = require('./cost/breakdownService');
  return getCostByTag(timeRange);
};

export const getCostDistributionByTeam = (timeRange: string) => {
  // Import from the proper module and call the function
  const { getCostByTeam } = require('./cost/breakdownService');
  return getCostByTeam(timeRange);
};

export const getCostHistoryData = (timeRange: string) => {
  // Import from the proper module and call the function
  const { getCostHistory } = require('./cost/breakdownService');
  return getCostHistory(timeRange);
};

export const getOptimizationRecommendations = () => {
  // Import from the proper module and call the function
  const { getOptimizationSuggestions } = require('./cost/optimizationService');
  return getOptimizationSuggestions().then((result: any) => {
    if (result.error) return result;
    
    // Transform suggestions to recommendations format
    const recommendations = result.suggestions.map((suggestion: any) => ({
      id: suggestion.id,
      resourceId: suggestion.resourceIds?.[0] || '',
      resourceName: suggestion.resourceIds?.[0] || '',
      resourceType: suggestion.category || '',
      title: suggestion.title,
      description: suggestion.description,
      impact: suggestion.monthlySavings,
      potentialSavings: suggestion.monthlySavings,
      difficulty: suggestion.difficulty,
      status: 'pending'
    }));
    
    return { 
      recommendations,
      totalSavings: result.totalSavings,
      error: result.error
    };
  });
};

export const applyOptimization = (recommendationId: string) => {
  // Import from the proper module and call the function
  const { applyOptimization } = require('./cost/optimizationService');
  return applyOptimization(recommendationId);
};

export const getCostForecast = (timeRange: string) => {
  // Import from the proper module and call the function
  const { getForecast } = require('./cost/forecastService');
  return getForecast(timeRange);
};
