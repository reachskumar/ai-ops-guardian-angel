
import { CloudProvider } from './types';
import * as awsProvider from './providers/aws';
import * as azureProvider from './providers/azure';
// import * as gcpProvider from './providers/gcp';

// Provider factory to get the correct provider implementation
export const getProviderImplementation = (provider: CloudProvider) => {
  switch (provider) {
    case 'aws':
      return awsProvider;
    case 'azure':
      return azureProvider;
    case 'gcp':
      // return gcpProvider;
      throw new Error('GCP provider not implemented yet');
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
      const awsTypes = (implementation as typeof awsProvider).getAwsResourceTypes();
      resourceTypes = [{ category: 'compute', types: awsTypes }];
      break;
    case 'azure':
      const azureTypes = (implementation as typeof azureProvider).getAzureResourceTypes();
      resourceTypes = [{ category: 'compute', types: azureTypes }];
      break;
    case 'gcp':
      resourceTypes = [{ category: 'compute', types: ['Compute Engine'] }];
      break;
  }
  
  if (category) {
    return resourceTypes.filter(rt => rt.category === category);
  }
  
  return resourceTypes;
};

// Get provider-specific instance sizes
export const getInstanceSizes = (provider: CloudProvider, resourceType?: string) => {
  const implementation = getProviderImplementation(provider);
  
  switch (provider) {
    case 'aws':
      return (implementation as typeof awsProvider).getAwsInstanceSizes();
    case 'azure':
      return (implementation as typeof azureProvider).getAzureInstanceSizes();
    case 'gcp':
      return [{ id: 'e2-micro', name: 'e2-micro', vcpus: 1, memory: 1 }];
    default:
      return [{ id: 'small', name: 'Small', vcpus: 1, memory: 1 }];
  }
};

// Get provider-specific regions
export const getRegions = (provider: CloudProvider) => {
  const implementation = getProviderImplementation(provider);
  
  switch (provider) {
    case 'aws':
      const awsRegions = (implementation as typeof awsProvider).getAwsRegions();
      return awsRegions.map(r => r.name);
    case 'azure':
      const azureRegions = (implementation as typeof azureProvider).getAzureRegions();
      return azureRegions.map(r => r.name);
    case 'gcp':
      return ['us-central1', 'europe-west1', 'asia-southeast1'];
    default:
      return [];
  }
};

// Mock implementations for missing functions
export const getProviderCostData = async (
  provider: CloudProvider,
  accountId: string,
  timeRange: string = '30d',
  credentials?: Record<string, any>
) => {
  console.log(`Getting cost data for ${provider} account ${accountId}`);
  
  return {
    costs: [
      { date: '2024-01-01', amount: 100 },
      { date: '2024-01-02', amount: 120 },
    ],
    total: 220,
    error: null
  };
};

export const getProviderOptimizations = async (
  provider: CloudProvider,
  accountId: string,
  credentials?: Record<string, any>
) => {
  console.log(`Getting optimizations for ${provider} account ${accountId}`);
  
  return {
    recommendations: [
      { type: 'rightsizing', description: 'Resize underutilized instances', savings: 50 }
    ],
    error: null
  };
};

export const getProviderResourceMetrics = async (
  provider: CloudProvider,
  resourceId: string,
  resourceType: string,
  timeRange: string = '24h',
  credentials?: Record<string, any>
) => {
  console.log(`Getting metrics for ${provider} resource ${resourceId}`);
  
  return {
    metrics: [
      { name: 'CPU', unit: '%', data: [{ timestamp: new Date().toISOString(), value: 75 }] }
    ],
    error: null
  };
};
