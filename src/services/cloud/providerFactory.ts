
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
  
  switch (provider) {
    case 'aws':
      resourceTypes = (implementation as typeof awsProvider).getAwsResourceTypes();
      break;
    case 'azure':
      resourceTypes = (implementation as typeof azureProvider).getAzureResourceTypes();
      break;
    case 'gcp':
      resourceTypes = (implementation as typeof gcpProvider).getGcpResourceTypes();
      break;
  }
  
  if (category) {
    return resourceTypes.filter(rt => rt.category === category);
  }
  
  return resourceTypes;
};

// Get provider-specific instance sizes
export const getInstanceSizes = (provider: CloudProvider, resourceType: string) => {
  const implementation = getProviderImplementation(provider);
  
  switch (provider) {
    case 'aws':
      return (implementation as typeof awsProvider).getAwsInstanceSizes(resourceType);
    case 'azure':
      return (implementation as typeof azureProvider).getAzureInstanceSizes(resourceType);
    case 'gcp':
      return (implementation as typeof gcpProvider).getGcpInstanceSizes(resourceType);
    default:
      return ['small', 'medium', 'large']; // Default
  }
};

// Get provider-specific regions
export const getRegions = (provider: CloudProvider) => {
  const implementation = getProviderImplementation(provider);
  
  switch (provider) {
    case 'aws':
      return (implementation as typeof awsProvider).getAwsRegions();
    case 'azure':
      return (implementation as typeof azureProvider).getAzureRegions();
    case 'gcp':
      return (implementation as typeof gcpProvider).getGcpRegions();
    default:
      return []; // Empty list if not found
  }
};

// Get provider-specific cost data
export const getProviderCostData = async (
  provider: CloudProvider,
  accountId: string,
  timeRange: string = '30d',
  credentials?: Record<string, any>
) => {
  const implementation = getProviderImplementation(provider);
  
  switch (provider) {
    case 'aws':
      return (implementation as typeof awsProvider).getAwsCostData(accountId, timeRange, credentials);
    case 'azure':
      return (implementation as typeof azureProvider).getAzureCostData(accountId, timeRange, credentials);
    case 'gcp':
      return (implementation as typeof gcpProvider).getGcpCostData(accountId, timeRange, credentials);
    default:
      return {
        costs: [],
        total: 0,
        error: `Cost data not available for provider: ${provider}`
      };
  }
};

// Get provider-specific optimizations
export const getProviderOptimizations = async (
  provider: CloudProvider,
  accountId: string,
  credentials?: Record<string, any>
) => {
  const implementation = getProviderImplementation(provider);
  
  switch (provider) {
    case 'aws':
      return (implementation as typeof awsProvider).getAwsOptimizations(accountId, credentials);
    case 'azure':
      return (implementation as typeof azureProvider).getAzureOptimizations(accountId, credentials);
    case 'gcp':
      return (implementation as typeof gcpProvider).getGcpOptimizations(accountId, credentials);
    default:
      return {
        recommendations: [],
        error: `Optimizations not available for provider: ${provider}`
      };
  }
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
  
  switch (provider) {
    case 'aws':
      return (implementation as typeof awsProvider).getAwsResourceMetrics(resourceId, resourceType, timeRange, credentials);
    case 'azure':
      return (implementation as typeof azureProvider).getAzureResourceMetrics(resourceId, resourceType, timeRange, credentials);
    case 'gcp':
      return (implementation as typeof gcpProvider).getGcpResourceMetrics(resourceId, resourceType, timeRange, credentials);
    default:
      return {
        metrics: [],
        error: `Metrics not available for provider: ${provider}`
      };
  }
};
