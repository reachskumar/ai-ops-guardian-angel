
import { supabase } from "@/integrations/supabase/client";
import { CloudResource, CloudProvider, ResourceMetric } from "./types";
import { mockSelect } from "../mockDatabaseService";

// Mock resources storage for development
const mockResources: CloudResource[] = [];

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
  config: Record<string, any>
): Promise<{ success: boolean; resourceId?: string; error?: string }> => {
  try {
    console.log(`Starting resource provisioning for account ${accountId}`);
    console.log(`Resource type: ${resourceType}`);
    console.log(`Configuration:`, config);
    
    // Mock implementation for development without an edge function
    // In a real implementation, we would call the edge function
    const mockSuccess = Math.random() > 0.2; // 80% chance of success
    
    if (mockSuccess) {
      const resourceId = `resource-${Math.random().toString(36).substring(2, 10)}`;
      console.log(`Successfully provisioned resource with ID: ${resourceId}`);
      
      // Create a mock resource and add it to our local store
      const newResource: CloudResource = {
        id: resourceId,
        name: config.name || `New ${resourceType}`,
        type: resourceType,
        cloud_account_id: accountId,
        // Use the cloud_account_id field instead of provider which doesn't exist in the type
        resource_id: resourceId,
        region: config.region || 'us-east-1',
        status: 'provisioning', // Initial status
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: config.tags || {},
        details: config.size ? { size: config.size } : {}
      };
      
      // Add to mock resources
      mockResources.push(newResource);
      console.log("Added new resource to mock storage:", newResource);
      
      // After a delay, update the status to "running"
      setTimeout(() => {
        const index = mockResources.findIndex(r => r.id === resourceId);
        if (index >= 0) {
          mockResources[index].status = 'running';
          console.log(`Updated resource ${resourceId} status to running`);
        }
      }, 5000); // 5 second delay
      
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
    
    /* Commented out for development - use this in production
    const { data, error } = await supabase.functions.invoke('provision-resource', {
      body: { accountId, resourceType, config }
    });

    if (error) {
      console.error("Edge function error:", error);
      throw new Error(`Edge function error: ${error.message}`);
    }
    
    if (!data) {
      throw new Error("No data returned from edge function");
    }
    
    return { 
      success: data.success, 
      resourceId: data.resourceId,
      error: data.error
    };
    */
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
    const { data, error } = await supabase.functions.invoke('get-resource-details', {
      body: { resourceId }
    });

    if (error) throw error;
    
    return { 
      resource: data.resource, 
      metrics: data.metrics
    };
  } catch (error: any) {
    console.error("Get resource details error:", error);
    return { 
      resource: null, 
      metrics: [],
      error: error.message || 'Failed to get resource details' 
    };
  }
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
    const { data, error } = await supabase.functions.invoke('update-resource', {
      body: { resourceId, action, params }
    });

    if (error) throw error;
    
    return { 
      success: data.success, 
      error: data.error
    };
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
    const { data, error } = await supabase.functions.invoke('delete-resource', {
      body: { resourceId }
    });

    if (error) throw error;
    
    return { 
      success: data.success, 
      error: data.error
    };
  } catch (error: any) {
    console.error("Delete resource error:", error);
    return { success: false, error: error.message || 'Failed to delete resource' };
  }
};
