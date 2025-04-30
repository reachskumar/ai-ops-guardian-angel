
import { CloudProvider } from './types';
import * as awsProvider from './providers/aws';
import * as azureProvider from './providers/azure';
import * as gcpProvider from './providers/gcp';

// Provider factory to get the correct provider implementation
export const getProviderImplementation = (provider: CloudProvider) => {
  switch (provider) {
    case 'aws':
      return awsProvider;
    case 'azure':
      return azureProvider;
    case 'gcp':
      return gcpProvider;
    default:
      throw new Error(`Unsupported cloud provider: ${provider}`);
  }
};

// Get provider-specific resource types
export const getResourceTypes = (provider: CloudProvider, category?: string) => {
  const implementation = getProviderImplementation(provider);
  
  let resourceTypes: { category: string; types: string[] }[] = [];
  
  if (provider === 'aws' && implementation.getAwsResourceTypes) {
    resourceTypes = implementation.getAwsResourceTypes();
  } else if (provider === 'azure' && implementation.getAzureResourceTypes) {
    resourceTypes = implementation.getAzureResourceTypes();
  } else if (provider === 'gcp' && implementation.getGcpResourceTypes) {
    resourceTypes = implementation.getGcpResourceTypes();
  }
  
  if (category) {
    return resourceTypes.filter(rt => rt.category === category);
  }
  
  return resourceTypes;
};

// Get provider-specific instance sizes
export const getInstanceSizes = (provider: CloudProvider, resourceType: string) => {
  const implementation = getProviderImplementation(provider);
  
  if (provider === 'aws' && implementation.getAwsInstanceSizes) {
    return implementation.getAwsInstanceSizes(resourceType);
  } else if (provider === 'azure' && implementation.getAzureInstanceSizes) {
    return implementation.getAzureInstanceSizes(resourceType);
  } else if (provider === 'gcp' && implementation.getGcpInstanceSizes) {
    return implementation.getGcpInstanceSizes(resourceType);
  }
  
  return ['small', 'medium', 'large']; // Default
};

// Get provider-specific regions
export const getRegions = (provider: CloudProvider) => {
  const implementation = getProviderImplementation(provider);
  
  if (provider === 'aws' && implementation.getAwsRegions) {
    return implementation.getAwsRegions();
  } else if (provider === 'azure' && implementation.getAzureRegions) {
    return implementation.getAzureRegions();
  } else if (provider === 'gcp' && implementation.getGcpRegions) {
    return implementation.getGcpRegions();
  }
  
  return []; // Empty list if not found
};

// Get provider-specific cost data
export const getProviderCostData = async (
  provider: CloudProvider,
  accountId: string,
  timeRange: string = '30d',
  credentials?: Record<string, any>
) => {
  const implementation = getProviderImplementation(provider);
  
  if (provider === 'aws' && implementation.getAwsCostData) {
    return implementation.getAwsCostData(accountId, timeRange, credentials);
  } else if (provider === 'azure' && implementation.getAzureCostData) {
    return implementation.getAzureCostData(accountId, timeRange, credentials);
  } else if (provider === 'gcp' && implementation.getGcpCostData) {
    return implementation.getGcpCostData(accountId, timeRange, credentials);
  }
  
  return {
    costs: [],
    total: 0,
    error: `Cost data not available for provider: ${provider}`
  };
};

// Get provider-specific optimizations
export const getProviderOptimizations = async (
  provider: CloudProvider,
  accountId: string,
  credentials?: Record<string, any>
) => {
  const implementation = getProviderImplementation(provider);
  
  if (provider === 'aws' && implementation.getAwsOptimizations) {
    return implementation.getAwsOptimizations(accountId, credentials);
  } else if (provider === 'azure' && implementation.getAzureOptimizations) {
    return implementation.getAzureOptimizations(accountId, credentials);
  } else if (provider === 'gcp' && implementation.getGcpOptimizations) {
    return implementation.getGcpOptimizations(accountId, credentials);
  }
  
  return {
    recommendations: [],
    error: `Optimizations not available for provider: ${provider}`
  };
};

// Get provider-specific resource metrics
export const getProviderResourceMetrics = async (
  provider: CloudProvider,
  resourceId: string,
  resourceType: string,
  timeRange: string = '24h',
  credentials?: Record<string, any>
) => {
  const implementation = getProviderImplementation(provider);
  
  if (provider === 'aws' && implementation.getAwsResourceMetrics) {
    return implementation.getAwsResourceMetrics(resourceId, resourceType, timeRange, credentials);
  } else if (provider === 'azure' && implementation.getAzureResourceMetrics) {
    return implementation.getAzureResourceMetrics(resourceId, resourceType, timeRange, credentials);
  } else if (provider === 'gcp' && implementation.getGcpResourceMetrics) {
    return implementation.getGcpResourceMetrics(resourceId, resourceType, timeRange, credentials);
  }
  
  return {
    metrics: [],
    error: `Metrics not available for provider: ${provider}`
  };
};
