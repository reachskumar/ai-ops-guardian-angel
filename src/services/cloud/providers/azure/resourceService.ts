
import { CloudResource } from "../../types";

export const getAzureResources = async (credentials: Record<string, string>): Promise<CloudResource[]> => {
  console.log("Fetching Azure resources with credentials (simulated)");
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Mock Azure resources
  const mockResources: CloudResource[] = [
    {
      id: 'azure-vm-1',
      account_id: 'azure-account-1',
      resource_id: '/subscriptions/12345678-1234-1234-1234-123456789012/resourceGroups/prod-rg/providers/Microsoft.Compute/virtualMachines/prod-web-vm',
      name: 'Production Web VM',
      type: 'Virtual Machine',
      region: 'East US',
      provider: 'azure',
      status: 'running',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cost_per_day: 15.30,
      tags: {
        environment: 'production',
        team: 'frontend',
        application: 'web-app'
      },
      metadata: {
        vmSize: 'Standard_B2s',
        imageReference: 'Ubuntu 20.04 LTS',
        osDiskType: 'Premium_LRS',
        networkInterfaces: ['prod-web-nic'],
        publicIP: true
      }
    },
    {
      id: 'azure-storage-1',
      account_id: 'azure-account-1',
      resource_id: '/subscriptions/12345678-1234-1234-1234-123456789012/resourceGroups/prod-rg/providers/Microsoft.Storage/storageAccounts/prodappstorage',
      name: 'Application Storage',
      type: 'Storage Account',
      region: 'East US',
      provider: 'azure',
      status: 'available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cost_per_day: 8.90,
      tags: {
        environment: 'production',
        purpose: 'app-storage'
      },
      metadata: {
        accountType: 'Standard_LRS',
        tier: 'Hot',
        encryption: 'Microsoft.Storage',
        httpsOnly: true,
        containers: ['images', 'documents', 'backups']
      }
    },
    {
      id: 'azure-sql-1',
      account_id: 'azure-account-1',
      resource_id: '/subscriptions/12345678-1234-1234-1234-123456789012/resourceGroups/prod-rg/providers/Microsoft.Sql/servers/prod-sql-server/databases/maindb',
      name: 'Main SQL Database',
      type: 'SQL Database',
      region: 'East US',
      provider: 'azure',
      status: 'online',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cost_per_day: 22.40,
      tags: {
        environment: 'production',
        database: 'sql',
        team: 'backend'
      },
      metadata: {
        tier: 'Standard',
        serviceObjective: 'S2',
        maxSizeBytes: 268435456000,
        collation: 'SQL_Latin1_General_CP1_CI_AS',
        readScale: 'Disabled'
      }
    },
    {
      id: 'azure-function-1',
      account_id: 'azure-account-1',
      resource_id: '/subscriptions/12345678-1234-1234-1234-123456789012/resourceGroups/prod-rg/providers/Microsoft.Web/sites/prod-function-app',
      name: 'Data Processing Function',
      type: 'Function App',
      region: 'East US',
      provider: 'azure',
      status: 'running',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cost_per_day: 3.75,
      tags: {
        environment: 'production',
        application: 'data-processing'
      },
      metadata: {
        runtime: 'dotnet',
        version: '6.0',
        tier: 'Dynamic',
        functions: ['ProcessData', 'ValidateInput', 'GenerateReport']
      }
    }
  ];

  console.log(`Retrieved ${mockResources.length} Azure resources`);
  return mockResources;
};

export const createAzureResource = async (
  credentials: Record<string, string>,
  resourceConfig: any
): Promise<{ success: boolean; resourceId?: string; error?: string }> => {
  console.log("Creating Azure resource:", resourceConfig);
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Mock resource creation
    const resourceId = `azure-${resourceConfig.type}-${Date.now()}`;
    
    console.log(`Azure resource created successfully: ${resourceId}`);
    return { success: true, resourceId };
  } catch (error: any) {
    console.error("Create Azure resource error:", error);
    return { success: false, error: error.message || 'Failed to create Azure resource' };
  }
};

export const deleteAzureResource = async (
  credentials: Record<string, string>,
  resourceId: string
): Promise<{ success: boolean; error?: string }> => {
  console.log("Deleting Azure resource:", resourceId);
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`Azure resource deleted successfully: ${resourceId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Delete Azure resource error:", error);
    return { success: false, error: error.message || 'Failed to delete Azure resource' };
  }
};
