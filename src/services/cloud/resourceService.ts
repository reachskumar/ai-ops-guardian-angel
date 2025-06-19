import { supabase } from "@/integrations/supabase/client";
import { CloudResource, CloudProvider, ResourceMetric } from "./types";
import { mockSelect } from "../mockDatabaseService";
import { getAccountCredentials } from "./accountService";
import { getCloudAccounts } from "./accountService";

// Storage for locally created/fetched resources
const RESOURCES_STORAGE_KEY = 'cloud_resources';

// Helper to generate proper UUID v4
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Helper to load resources from localStorage
const loadResourcesFromStorage = (): CloudResource[] => {
  try {
    const storedResources = localStorage.getItem(RESOURCES_STORAGE_KEY);
    return storedResources ? JSON.parse(storedResources) : [];
  } catch (error) {
    console.error("Error loading resources from localStorage:", error);
    return [];
  }
};

// Helper to save resources to localStorage
const saveResourcesToStorage = (resources: CloudResource[]): void => {
  try {
    localStorage.setItem(RESOURCES_STORAGE_KEY, JSON.stringify(resources));
  } catch (error) {
    console.error("Error saving resources to localStorage:", error);
  }
};

// Mock resources storage for development - now loaded from localStorage for persistence
let mockResources: CloudResource[] = loadResourcesFromStorage();

// Create some hardcoded GCP VM resources for testing if none exist
if (mockResources.length === 0) {
  const gcpVms = [
    {
      id: generateUUID(),
      cloud_account_id: "gcp-account-1",
      resource_id: "vm-1234567890",
      name: "gcp-instance-1",
      type: "VM",
      region: "us-central1",
      status: "running",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: { environment: "production", service: "api" },
      metadata: { machine_type: "e2-medium", zone: "us-central1-a" }
    },
    {
      id: generateUUID(),
      cloud_account_id: "gcp-account-1", 
      resource_id: "vm-0987654321",
      name: "gcp-instance-2",
      type: "VM",
      region: "us-central1",
      status: "stopped",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: { environment: "staging", service: "web" },
      metadata: { machine_type: "e2-small", zone: "us-central1-b" }
    }
  ];
  
  mockResources.push(...gcpVms as CloudResource[]);
  saveResourcesToStorage(mockResources);
  console.log("Added initial GCP VM resources for testing:", gcpVms);
}

// Get cloud resources with filtering options
export const getCloudResources = async (
  options?: {
    accountId?: string;
    provider?: CloudProvider;
    type?: string;
    region?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ resources: CloudResource[]; count: number }> => {
  try {
    const { accountId, type, region, status, limit = 100, offset = 0 } = options || {};
    
    // If we have mock resources, use them along with mock database data
    let data = [...mockResources];
    
    // Also get data from mock database
    const mockResult = mockSelect('cloud_resources');
    if (!mockResult.error && mockResult.data) {
      data = [...data, ...mockResult.data];
    }
    
    // Apply filters
    let filteredData = data;
    if (accountId) {
      filteredData = filteredData.filter(r => r.cloud_account_id === accountId);
    }
    if (type) {
      filteredData = filteredData.filter(r => r.type === type);
    }
    if (region) {
      filteredData = filteredData.filter(r => r.region === region);
    }
    if (status) {
      filteredData = filteredData.filter(r => r.status === status);
    }
    
    const count = filteredData.length;
    const paginatedData = filteredData.slice(offset, offset + limit);
    
    console.log(`Returning ${paginatedData.length} resources out of ${count} total`);
    
    return {
      resources: paginatedData as CloudResource[],
      count: count
    };
  } catch (error) {
    console.error("Get cloud resources error:", error);
    return { resources: [], count: 0 };
  }
};

// Provision a new cloud resource
export const provisionResource = async (
  accountId: string,
  resourceType: string,
  config: Record<string, any>,
  credentials?: Record<string, any>
): Promise<{ success: boolean; resourceId?: string; error?: string }> => {
  try {
    console.log(`Starting resource provisioning for account ${accountId}`);
    console.log(`Resource type: ${resourceType}`);
    console.log(`Configuration:`, config);

    // Find the account to get its provider
    const account = (await getCloudAccounts()).find(a => a.id === accountId);
    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    const { provider } = account;
    
    // Try to use edge function first, but have a fallback
    let result;
    
    try {
      console.log("Attempting to provision via edge function...");
      const { data, error } = await supabase.functions.invoke('provision-resource', {
        body: { 
          accountId, 
          resourceType, 
          config, 
          credentials 
        }
      });

      if (error) {
        console.warn("Edge function failed, using fallback:", error);
        throw new Error(error.message);
      }

      result = data;
    } catch (edgeError: any) {
      console.warn("Edge function unavailable, using local fallback:", edgeError);
      
      // Fallback to local simulation
      const resourceId = generateUUID();
      result = {
        success: true,
        resourceId,
        message: `Successfully started ${resourceType} provisioning (simulated)`,
        details: {
          name: config.name,
          region: config.region,
          size: config.size
        }
      };
    }
    
    // On successful provisioning, add a mock resource for immediate feedback
    if (result.success && result.resourceId) {
      const newResource = {
        id: result.resourceId,
        name: config.name || `New ${resourceType}`,
        type: resourceType,
        cloud_account_id: accountId,
        resource_id: result.resourceId,
        region: config.region || 'us-east-1',
        status: 'provisioning',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: config.tags || {},
        metadata: result.details || (config.size ? { size: config.size } : {})
      };
      
      // Add to mock resources
      mockResources.push(newResource);
      console.log("Added new resource to mock storage:", newResource);
      saveResourcesToStorage(mockResources);
      
      // After a delay, update the status to "running"
      setTimeout(() => {
        const index = mockResources.findIndex(r => r.id === result.resourceId);
        if (index >= 0) {
          mockResources[index].status = 'running';
          console.log(`Updated resource ${result.resourceId} status to running`);
          saveResourcesToStorage(mockResources);
        }
      }, 5000);
    }
    
    return result;
  } catch (error: any) {
    console.error("Provision resource error:", error);
    return { 
      success: false, 
      error: error.message || 'Failed to provision resource' 
    };
  }
};

// Get resource details including metrics
export const getResourceDetails = async (
  resourceId: string
): Promise<{ resource: CloudResource | null; metrics: any[]; error?: string }> => {
  try {
    // First check our mock resources
    const mockResource = mockResources.find(r => r.id === resourceId);
    if (mockResource) {
      // Generate mock metrics for testing
      const mockMetrics = Array(24).fill(0).map((_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        network: Math.floor(Math.random() * 1000),
      }));
      
      return { 
        resource: mockResource, 
        metrics: mockMetrics
      };
    }
    
    // If not found in mock resources, try edge function with fallback
    try {
      const { data, error } = await supabase.functions.invoke('get-resource-details', {
        body: { resourceId }
      });

      if (error) {
        return { 
          resource: null, 
          metrics: [],
          error: `Edge function error: ${error.message}`
        };
      }
    
      return { 
        resource: data.resource, 
        metrics: data.metrics
      };
    } catch (edgeError: any) {
      return {
        resource: null,
        metrics: [],
        error: `Edge function unavailable: ${edgeError.message}`
      };
    }
  } catch (error: any) {
    console.error("Get resource details error:", error);
    return { 
      resource: null, 
      metrics: [],
      error: error.message || 'Failed to get resource details' 
    };
  }
};

// Get resource metrics with proper UUID handling
export const getResourceMetrics = async (
  resourceId: string,
  timeRange?: string
): Promise<any[]> => {
  try {
    // Validate resourceId is a proper UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(resourceId)) {
      console.warn(`Invalid UUID format for resourceId: ${resourceId}, generating mock metrics`);
      // Return mock metrics for invalid UUIDs
      return Array(24).fill(0).map((_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        network: Math.floor(Math.random() * 1000),
      }));
    }
    
    // Find the resource to get its account ID and type
    let resource = mockResources.find(r => r.id === resourceId);
    
    if (!resource) {
      // Try to load from localStorage in case it was added since last load
      const freshResources = loadResourcesFromStorage();
      resource = freshResources.find(r => r.id === resourceId);
      
      if (resource) {
        // Update our in-memory resources
        mockResources = freshResources;
      }
    }
    
    if (resource) {
      // Generate mock metrics based on resource status
      const cpuBase = resource.status === 'running' ? 45 : 0;
      const memoryBase = resource.status === 'running' ? 60 : 0;
      
      return Array(24).fill(0).map((_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
        cpu: Math.max(0, Math.min(100, cpuBase + (Math.random() * 20 - 10))),
        memory: Math.max(0, Math.min(100, memoryBase + (Math.random() * 15 - 7.5))),
        network: resource.status === 'running' ? Math.floor(Math.random() * 50) : 0,
      }));
    }
    
    // Return empty metrics if resource not found
    console.warn(`Resource not found: ${resourceId}`);
    return [];
  } catch (error: any) {
    console.error("Get resource metrics error:", error);
    return [];
  }
};

// Update resource status (start, stop, restart)
export const updateResource = async (
  resourceId: string,
  action: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(`Updating resource ${resourceId} with action: ${action}`);
    
    // Find the resource in mock storage
    const resourceIndex = mockResources.findIndex(r => r.id === resourceId);
    if (resourceIndex === -1) {
      return { success: false, error: 'Resource not found' };
    }
    
    const resource = mockResources[resourceIndex];
    
    // Update status based on action
    let newStatus = resource.status;
    switch (action) {
      case 'start':
        if (resource.status === 'stopped' || resource.status === 'terminated') {
          newStatus = 'starting';
          // Simulate async start process
          setTimeout(() => {
            const currentResource = mockResources.find(r => r.id === resourceId);
            if (currentResource) {
              currentResource.status = 'running';
              currentResource.updated_at = new Date().toISOString();
              saveResourcesToStorage(mockResources);
            }
          }, 3000);
        }
        break;
      case 'stop':
        if (resource.status === 'running' || resource.status === 'starting') {
          newStatus = 'stopping';
          // Simulate async stop process
          setTimeout(() => {
            const currentResource = mockResources.find(r => r.id === resourceId);
            if (currentResource) {
              currentResource.status = 'stopped';
              currentResource.updated_at = new Date().toISOString();
              saveResourcesToStorage(mockResources);
            }
          }, 2000);
        }
        break;
      case 'restart':
        if (resource.status === 'running') {
          newStatus = 'restarting';
          // Simulate async restart process
          setTimeout(() => {
            const currentResource = mockResources.find(r => r.id === resourceId);
            if (currentResource) {
              currentResource.status = 'running';
              currentResource.updated_at = new Date().toISOString();
              saveResourcesToStorage(mockResources);
            }
          }, 4000);
        }
        break;
      default:
        return { success: false, error: `Unknown action: ${action}` };
    }
    
    // Update the resource
    mockResources[resourceIndex] = {
      ...resource,
      status: newStatus,
      updated_at: new Date().toISOString()
    };
    
    saveResourcesToStorage(mockResources);
    console.log(`Resource ${resourceId} status updated to: ${newStatus}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("Update resource error:", error);
    return { 
      success: false, 
      error: error.message || 'Failed to update resource' 
    };
  }
};

// Delete a resource
export const deleteResource = async (
  resourceId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(`Deleting resource ${resourceId}`);
    
    // Find the resource in mock storage
    const resourceIndex = mockResources.findIndex(r => r.id === resourceId);
    if (resourceIndex === -1) {
      return { success: false, error: 'Resource not found' };
    }
    
    // Remove the resource
    mockResources.splice(resourceIndex, 1);
    saveResourcesToStorage(mockResources);
    
    console.log(`Resource ${resourceId} deleted successfully`);
    return { success: true };
  } catch (error: any) {
    console.error("Delete resource error:", error);
    return { 
      success: false, 
      error: error.message || 'Failed to delete resource' 
    };
  }
};
