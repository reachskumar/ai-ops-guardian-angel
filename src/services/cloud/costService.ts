
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
  const { getOptimizationRecommendations } = require('./cost/optimizationService');
  return getOptimizationRecommendations();
};

export const applyOptimization = (recommendationId: string) => {
  // Import from the proper module and call the function
  const { applyOptimization } = require('./cost/optimizationService');
  return applyOptimization(recommendationId);
};
