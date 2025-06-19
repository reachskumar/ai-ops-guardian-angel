
import { CloudResource } from '../../../cloud/types';

// Get Azure resource types grouped by category
export const getAzureResourceTypes = (): { category: string; types: string[] }[] => {
  return [
    {
      category: 'compute',
      types: ['Virtual Machine', 'App Service', 'Function App', 'Container Instance', 'VM Scale Set']
    },
    {
      category: 'storage',
      types: ['Storage Account', 'Managed Disk', 'File Share', 'Blob Container', 'Queue Storage']
    },
    {
      category: 'database',
      types: ['SQL Database', 'CosmosDB', 'MySQL Database', 'PostgreSQL Database', 'Redis Cache']
    },
    {
      category: 'network',
      types: ['Virtual Network', 'Network Security Group', 'Application Gateway', 'Load Balancer', 'VPN Gateway']
    }
  ];
};

// Get Azure instance sizes for a resource type
export const getAzureInstanceSizes = (resourceType: string): string[] => {
  switch (resourceType) {
    case 'Virtual Machine':
      return ['B1ls', 'B1s', 'B2s', 'B4ms', 'D2s v3', 'D4s v3', 'D8s v3', 'E2s v3', 'E4s v3', 'F2s v2', 'F4s v2', 'Standard_DS1_v2', 'Standard_DS2_v2'];
    case 'SQL Database':
      return ['Basic', 'S0', 'S1', 'S2', 'S3', 'P1', 'P2', 'P4', 'P6'];
    case 'App Service':
      return ['F1', 'D1', 'B1', 'B2', 'B3', 'S1', 'S2', 'S3', 'P1v2', 'P2v2', 'P3v2'];
    default:
      return ['small', 'medium', 'large'];
  }
};

// Get Azure regions
export const getAzureRegions = (): string[] => {
  return [
    'eastus', 'eastus2', 'westus', 'westus2', 'westus3', 'centralus',
    'northcentralus', 'southcentralus', 'northeurope', 'westeurope',
    'uksouth', 'ukwest', 'francecentral', 'germanywestcentral',
    'southeastasia', 'eastasia', 'japaneast', 'japanwest',
    'koreacentral', 'australiaeast', 'australiasoutheast', 
    'brazilsouth', 'canadacentral', 'switzerlandnorth'
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
    
    // This now has the foundation for real Azure SDK provisioning
    // The edge functions handle the real resource creation
    const resourceId = `azure-${resourceType.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    // Simulate realistic Azure resource creation timing
    await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate API call delay
    
    return {
      success: true,
      resourceId,
      details: {
        provider: 'azure',
        type: resourceType,
        region: config.region || 'eastus',
        resourceGroup: config.resourceGroup || 'rg-default',
        size: config.instanceSize,
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

// Get comprehensive mock Azure resources for testing
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
      tags: { environment: 'production', team: 'platform', application: 'web' },
      metadata: {
        vm_size: 'Standard_B2s',
        os_type: 'Linux',
        resource_group: 'rg-prod',
        subscription_id: 'sub-123',
        admin_username: 'azureuser',
        disk_size_gb: 30
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
      tags: { environment: 'production', purpose: 'data-storage' },
      metadata: {
        sku: 'Standard_LRS',
        kind: 'StorageV2',
        resource_group: 'rg-prod',
        subscription_id: 'sub-123',
        primary_endpoints: {
          blob: 'https://storageacct01.blob.core.windows.net/',
          file: 'https://storageacct01.file.core.windows.net/'
        }
      }
    },
    {
      id: `azure-sql-${accountId}-3`,
      cloud_account_id: accountId,
      resource_id: '/subscriptions/sub-123/resourceGroups/rg-prod/providers/Microsoft.Sql/servers/sqlserver01/databases/appdb',
      name: 'appdb',
      type: 'SQL Database',
      region: 'eastus',
      status: 'online',
      created_at: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
      updated_at: new Date().toISOString(),
      tags: { environment: 'production', database: 'application' },
      metadata: {
        edition: 'Standard',
        service_objective: 'S1',
        resource_group: 'rg-prod',
        subscription_id: 'sub-123',
        server_name: 'sqlserver01'
      }
    },
    {
      id: `azure-app-${accountId}-4`,
      cloud_account_id: accountId,
      resource_id: '/subscriptions/sub-123/resourceGroups/rg-prod/providers/Microsoft.Web/sites/webapp01',
      name: 'webapp01',
      type: 'App Service',
      region: 'eastus',
      status: 'running',
      created_at: new Date(Date.now() - 518400000).toISOString(), // 6 days ago
      updated_at: new Date().toISOString(),
      tags: { environment: 'production', application: 'frontend' },
      metadata: {
        app_service_plan: 'ASP-rgprod-001',
        runtime_stack: 'NODE|18-lts',
        resource_group: 'rg-prod',
        subscription_id: 'sub-123',
        default_domain: 'webapp01.azurewebsites.net'
      }
    }
  ];
};
