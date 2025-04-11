
import { supabase } from "@/integrations/supabase/client";
import { CloudResource, CloudProvider, ResourceMetric } from "./types";
import { mockSelect } from "../mockDatabaseService";

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
    
    let filters: Record<string, any> = {};
    if (accountId) filters.cloud_account_id = accountId;
    if (type) filters.type = type;
    if (region) filters.region = region;
    if (status) filters.status = status;
    
    const { data, count, error } = mockSelect('cloud_resources', filters);
    
    if (error) throw error;
    
    const paginatedData = data.slice(offset, offset + limit);
    
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
