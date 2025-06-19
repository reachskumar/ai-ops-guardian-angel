
import { CloudResource } from '../../../cloud/types';

// Get Azure resource types grouped by category
export const getAzureResourceTypes = (): { category: string; types: string[] }[] => {
  return [
    {
      category: 'compute',
      types: ['Virtual Machine', 'App Service', 'Function App', 'Container Instance']
    },
    {
      category: 'storage',
      types: ['Storage Account', 'Managed Disk', 'File Share', 'Blob Container']
    },
    {
      category: 'database',
      types: ['SQL Database', 'CosmosDB', 'MySQL Database', 'PostgreSQL Database']
    },
    {
      category: 'network',
      types: ['Virtual Network', 'Network Security Group', 'Application Gateway', 'Load Balancer']
    }
  ];
};

// Get Azure instance sizes for a resource type
export const getAzureInstanceSizes = (resourceType: string): string[] => {
  switch (resourceType) {
    case 'Virtual Machine':
      return ['B1s', 'B2s', 'D2s v3', 'D4s v3', 'E2s v3', 'F2s v2', 'Standard_DS1_v2', 'Standard_DS2_v2'];
    case 'SQL Database':
      return ['Basic', 'S0', 'S1', 'S2', 'P1', 'P2'];
    case 'App Service':
      return ['F1', 'B1', 'B2', 'S1', 'S2', 'P1v2', 'P2v2'];
    default:
      return ['small', 'medium', 'large'];
  }
};

// Get Azure regions
export const getAzureRegions = (): string[] => {
  return [
    'eastus', 'eastus2', 'westus', 'westus2', 'centralus',
    'northeurope', 'westeurope', 'uksouth', 'ukwest',
    'southeastasia', 'eastasia', 'japaneast', 'japanwest',
    'australiaeast', 'australiasoutheast', 'brazilsouth'
  ];
};

// Provision Azure resource
export const provisionAzureResource = async (
  accountId: string,
  resourceType: string,
  config: Record<string, any>,
  credentials?: Record<string, any>
): Promise<{ success: boolean; resourceId?: string; error?: string; details?: Record<string, any> }> => {
  try {
    console.log(`Provisioning Azure ${resourceType} with config:`, config);
    
    // This would use Azure SDK in a real implementation
    // For now, return a mock success response with realistic data
    const resourceId = `azure-${resourceType.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    // Simulate realistic Azure resource creation
    await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate API call delay
    
    return {
      success: true,
      resourceId,
      details: {
        provider: 'azure',
        type: resourceType,
        region: config.region || 'eastus',
        resourceGroup: config.resourceGroup || 'rg-default',
        ...config
      }
    };
  } catch (error: any) {
    console.error(`Error provisioning Azure ${resourceType}:`, error);
    return {
      success: false,
      error: `Failed to provision Azure ${resourceType}: ${error.message}`
    };
  }
};

// Get mock Azure resources for testing
export const getMockAzureResources = (accountId: string): CloudResource[] => {
  return [
    {
      id: `azure-vm-${accountId}-1`,
      cloud_account_id: accountId,
      resource_id: '/subscriptions/sub-123/resourceGroups/rg-prod/providers/Microsoft.Compute/virtualMachines/vm-web-01',
      name: 'vm-web-01',
      type: 'VM',
      region: 'eastus',
      status: 'running',
      created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      updated_at: new Date().toISOString(),
      tags: { environment: 'production', team: 'platform' },
      metadata: {
        vm_size: 'Standard_B2s',
        os_type: 'Linux',
        resource_group: 'rg-prod',
        subscription_id: 'sub-123'
      }
    },
    {
      id: `azure-storage-${accountId}-2`,
      cloud_account_id: accountId,
      resource_id: '/subscriptions/sub-123/resourceGroups/rg-prod/providers/Microsoft.Storage/storageAccounts/storageacct01',
      name: 'storageacct01',
      type: 'Storage Account',
      region: 'eastus',
      status: 'available',
      created_at: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
      updated_at: new Date().toISOString(),
      tags: { environment: 'production' },
      metadata: {
        sku: 'Standard_LRS',
        kind: 'StorageV2',
        resource_group: 'rg-prod',
        subscription_id: 'sub-123'
      }
    }
  ];
};
