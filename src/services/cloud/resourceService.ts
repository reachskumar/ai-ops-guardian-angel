
import { supabase } from "@/integrations/supabase/client";
import { CloudResource, CloudProvider, ResourceMetric } from "./types";
import { mockSelect } from "../mockDatabaseService";
import { getAccountCredentials } from "./accountService";

// Storage for locally created/fetched resources
const RESOURCES_STORAGE_KEY = 'cloud_resources';

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
      id: "r-gcp-vm1",
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
      id: "r-gcp-vm2",
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

    // Call the Supabase Edge Function for real provisioning
    try {
      const { data, error } = await supabase.functions.invoke('provision-resource', {
        body: { 
          accountId, 
          resourceType, 
          config,
          credentials 
        }
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(`Edge function error: ${error.message}`);
      }
      
      if (!data) {
        throw new Error("No data returned from edge function");
      }
      
      console.log("Provisioning response:", data);
      
      // If the provisioning was successful, add a mock resource for immediate feedback
      if (data.success && data.resourceId) {
        const newResource: CloudResource = {
          id: data.resourceId,
          name: config.name || `New ${resourceType}`,
          type: resourceType,
          cloud_account_id: accountId,
          resource_id: data.resourceId,
          region: config.region || 'us-east-1',
          status: 'provisioning',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tags: config.tags || {},
          metadata: data.details || (config.size ? { size: config.size } : {})
        };
        
        // Add to mock resources
        mockResources.push(newResource);
        console.log("Added new resource to mock storage:", newResource);
        saveResourcesToStorage(mockResources);
      }
      
      return { 
        success: data.success, 
        resourceId: data.resourceId,
        error: data.error
      };
    } catch (edgeError: any) {
      console.warn("Edge function unavailable, falling back to mock provisioning:", edgeError);
      
      // Fall back to mock provisioning for development
      const mockSuccess = Math.random() > 0.2; // 80% chance of success
      
      if (mockSuccess) {
        const resourceId = `${resourceType.toLowerCase()}-${Date.now().toString(36)}`;
        console.log(`Successfully provisioned mock resource with ID: ${resourceId}`);
        
        // Create a mock resource and add it to our local store
        const newResource: CloudResource = {
          id: resourceId,
          name: config.name || `New ${resourceType}`,
          type: resourceType,
          cloud_account_id: accountId,
          resource_id: resourceId,
          region: config.region || 'us-east-1',
          status: 'provisioning',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tags: config.tags || {},
          metadata: config.size ? { size: config.size } : {}
        };
        
        // Add to mock resources
        mockResources.push(newResource);
        console.log("Added new resource to mock storage:", newResource);
        saveResourcesToStorage(mockResources);
        
        // After a delay, update the status to "running"
        setTimeout(() => {
          const index = mockResources.findIndex(r => r.id === resourceId);
          if (index >= 0) {
            mockResources[index].status = 'running';
            console.log(`Updated resource ${resourceId} status to running`);
            saveResourcesToStorage(mockResources);
          }
        }, 5000);
        
        return { 
          success: true, 
          resourceId 
        };
      } else {
        console.error("Mock provisioning failure");
        return { 
          success: false, 
          error: 'Failed to provision resource (mock failure)' 
        };
      }
    }
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
    
    // If not found in mock resources, try edge function
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

// Get resource metrics
export const getResourceMetrics = async (
  resourceId: string,
  timeRange?: string
): Promise<ResourceMetric[]> => {
  try {
    console.log(`Fetching metrics for resource ${resourceId} with timeRange ${timeRange || 'default'}`);
    
    // Find the resource to get its account ID
    let resource: CloudResource | undefined;
    
    // Check if this is in our mock resources
    resource = mockResources.find(r => r.id === resourceId);
    
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
      const accountId = resource.cloud_account_id;
      // Get the credentials for this account
      const credentials = getAccountCredentials(accountId);
      
      // Try to get real metrics from the edge function with credentials
      try {
        const { data, error } = await supabase.functions.invoke('get-resource-metrics', {
          body: { 
            resourceId, 
            timeRange, 
            accountId,
            credentials 
          }
        });

        if (error) throw error;
        return data || [];
      } catch (edgeError) {
        console.warn("Edge function error getting metrics, falling back to mock data:", edgeError);
        return generateMockMetricsForResource(resource, timeRange);
      }
    } else {
      // If resource not found, generate basic mock metrics
      return generateMockMetrics(timeRange);
    }
  } catch (error) {
    console.error("Get resource metrics error:", error);
    return generateMockMetrics(timeRange);
  }
};

// Generate mock metrics based on resource type and status
const generateMockMetricsForResource = (resource: CloudResource, timeRange?: string): ResourceMetric[] => {
  let cpuUtilization = 0;
  let memoryUtilization = 0;
  
  // Adjust mock metrics based on resource status
  if (resource.status === 'running') {
    cpuUtilization = Math.floor(Math.random() * 80) + 10; // 10-90%
    memoryUtilization = Math.floor(Math.random() * 70) + 20; // 20-90%
  } else {
    cpuUtilization = 0;
    memoryUtilization = 0;
  }
  
  // For VMs, provide more realistic metrics
  if (resource.type === 'VM') {
    const cpuMetric: ResourceMetric = {
      name: 'cpu',
      data: Array(24).fill(0).map((_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
        value: resource.status === 'running' ? 
          Math.max(5, Math.min(95, cpuUtilization + (Math.random() * 20 - 10))) : 0
      })),
      unit: '%',
      status: cpuUtilization > 80 ? 'warning' : 'normal'
    };
    
    const memoryMetric: ResourceMetric = {
      name: 'memory',
      data: Array(24).fill(0).map((_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
        value: resource.status === 'running' ? 
          Math.max(10, Math.min(95, memoryUtilization + (Math.random() * 15 - 7.5))) : 0
      })),
      unit: '%',
      status: memoryUtilization > 85 ? 'warning' : 'normal'
    };
    
    const networkMetric: ResourceMetric = {
      name: 'network',
      data: Array(24).fill(0).map((_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
        value: resource.status === 'running' ? Math.floor(Math.random() * 100) : 0
      })),
      unit: 'Mbps',
      status: 'normal'
    };
    
    const diskMetric: ResourceMetric = {
      name: 'disk',
      data: Array(24).fill(0).map((_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
        value: resource.status === 'running' ? Math.floor(Math.random() * 500) : 0
      })),
      unit: 'IOPS',
      status: 'normal'
    };
    
    return [cpuMetric, memoryMetric, networkMetric, diskMetric];
  }
  
  // Default metrics for other resource types
  return generateMockMetrics(timeRange);
};

// Generate generic mock metrics
const generateMockMetrics = (timeRange?: string): ResourceMetric[] => {
  const cpuMetric: ResourceMetric = {
    name: 'cpu',
    data: Array(24).fill(0).map((_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
      value: Math.floor(Math.random() * 100)
    })),
    unit: '%',
    status: 'normal'
  };
  
  const memoryMetric: ResourceMetric = {
    name: 'memory',
    data: Array(24).fill(0).map((_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
      value: Math.floor(Math.random() * 100)
    })),
    unit: '%',
    status: 'normal'
  };
  
  return [cpuMetric, memoryMetric];
};

// Update a cloud resource (e.g., start/stop instance)
export const updateResource = async (
  resourceId: string,
  action: string,
  params?: Record<string, any>
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if resource exists in mock storage
    const resourceIndex = mockResources.findIndex(r => r.id === resourceId);
    if (resourceIndex >= 0) {
      // Handle mock update
      switch (action) {
        case 'start':
          mockResources[resourceIndex].status = 'starting';
          setTimeout(() => {
            mockResources[resourceIndex].status = 'running';
          }, 3000);
          return { success: true };
          
        case 'stop':
          mockResources[resourceIndex].status = 'stopping';
          setTimeout(() => {
            mockResources[resourceIndex].status = 'stopped';
          }, 3000);
          return { success: true };
          
        case 'restart':
          mockResources[resourceIndex].status = 'restarting';
          setTimeout(() => {
            mockResources[resourceIndex].status = 'running';
          }, 5000);
          return { success: true };
          
        case 'update-tags':
          if (params?.tags) {
            mockResources[resourceIndex].tags = params.tags;
          }
          return { success: true };
          
        default:
          return { success: false, error: `Unknown action: ${action}` };
      }
    }
    
    // Fall back to edge function
    try {
      const { data, error } = await supabase.functions.invoke('update-resource', {
        body: { resourceId, action, params }
      });

      if (error) {
        return {
          success: false,
          error: `Edge function error: ${error.message}`
        };
      }
    
      return { 
        success: data?.success || false, 
        error: data?.error
      };
    } catch (edgeError: any) {
      return {
        success: false,
        error: `Edge function unavailable: ${edgeError.message}`
      };
    }
  } catch (error: any) {
    console.error("Update resource error:", error);
    return { success: false, error: error.message || 'Failed to update resource' };
  }
};

// Delete a cloud resource
export const deleteResource = async (
  resourceId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if resource exists in mock storage
    const resourceIndex = mockResources.findIndex(r => r.id === resourceId);
    if (resourceIndex >= 0) {
      // Remove from mock storage
      mockResources.splice(resourceIndex, 1);
      return { success: true };
    }
    
    // Fall back to edge function
    try {
      const { data, error } = await supabase.functions.invoke('delete-resource', {
        body: { resourceId }
      });

      if (error) {
        return {
          success: false,
          error: `Edge function error: ${error.message}`
        };
      }
    
      return { 
        success: data?.success || false, 
        error: data?.error
      };
    } catch (edgeError: any) {
      return {
        success: false,
        error: `Edge function unavailable: ${edgeError.message}`
      };
    }
  } catch (error: any) {
    console.error("Delete resource error:", error);
    return { success: false, error: error.message || 'Failed to delete resource' };
  }
};
