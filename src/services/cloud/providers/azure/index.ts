
export * from './resourceService';

// Azure-specific functions for provider factory
export const getAzureResourceTypes = () => [
  'Virtual Machine',
  'Storage Account',
  'SQL Database',
  'Function App'
];

export const getAzureInstanceSizes = () => [
  { id: 'Standard_B1s', name: 'Standard_B1s', vcpus: 1, memory: 1 },
  { id: 'Standard_B1ms', name: 'Standard_B1ms', vcpus: 1, memory: 2 },
  { id: 'Standard_B2s', name: 'Standard_B2s', vcpus: 2, memory: 4 },
  { id: 'Standard_B2ms', name: 'Standard_B2ms', vcpus: 2, memory: 8 }
];

export const getAzureRegions = () => [
  { id: 'eastus', name: 'East US' },
  { id: 'westus2', name: 'West US 2' },
  { id: 'westeurope', name: 'West Europe' },
  { id: 'southeastasia', name: 'Southeast Asia' }
];
