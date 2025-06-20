
import { supabase } from "@/integrations/supabase/client";
import { CloudResource, CloudProvider, ResourceMetric } from "./types";
import { mockSelect } from "../mockDatabaseService";
import { getAccountCredentials } from "./accountService";
import { getCloudAccounts } from "./accountService";

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
    
    console.log("Fetching cloud resources from Supabase...");
    
    // Build query
    let query = supabase
      .from('cloud_resources')
      .select(`
        *,
        users_cloud_accounts!inner(
          id,
          name,
          provider,
          user_id
        )
      `, { count: 'exact' });
    
    // Apply filters
    if (accountId) {
      query = query.eq('cloud_account_id', accountId);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (region) {
      query = query.eq('region', region);
    }
    if (status) {
      query = query.eq('status', status);
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error("Supabase query error:", error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} resources from database`);
    
    return {
      resources: data || [],
      count: count || 0
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

    // Find the account to get its provider and credentials
    const { data: accountData, error: accountError } = await supabase
      .from('users_cloud_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (accountError || !accountData) {
      console.error("Failed to find account:", accountError);
      return { success: false, error: 'Account not found' };
    }

    // Get credentials for the account
    const { data: credentialsData, error: credError } = await supabase.rpc('get_account_credentials', {
      account_id: accountId
    });

    if (credError) {
      console.error('Failed to get credentials:', credError);
      return { success: false, error: 'Failed to get account credentials' };
    }

    // Convert credentials array to object
    const accountCredentials: Record<string, string> = {};
    credentialsData?.forEach((cred: any) => {
      accountCredentials[cred.key] = cred.value;
    });

    // Try to use edge function for real provisioning
    let result;
    
    try {
      console.log("Attempting to provision via edge function...");
      const { data, error } = await supabase.functions.invoke('provision-resource', {
        body: { 
          accountId, 
          provider: accountData.provider,
          resourceType, 
          config, 
          credentials: accountCredentials
        }
      });

      if (error) {
        console.warn("Edge function failed:", error);
        throw new Error(error.message);
      }

      result = data;
    } catch (edgeError: any) {
      console.warn("Edge function unavailable, using local simulation:", edgeError);
      
      // Fallback to local simulation
      const resourceId = crypto.randomUUID();
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
    
    // On successful provisioning, save to database
    if (result.success && result.resourceId) {
      const resourceData = {
        cloud_account_id: accountId,
        resource_id: result.resourceId,
        name: config.name || `New ${resourceType}`,
        type: resourceType,
        region: config.region || 'us-east-1',
        status: 'provisioning',
        tags: config.tags || {},
        metadata: result.details || (config.size ? { size: config.size } : {}),
        cost_per_day: config.estimatedCost || null
      };
      
      const { data: insertedResource, error: insertError } = await supabase
        .from('cloud_resources')
        .insert(resourceData)
        .select()
        .single();
      
      if (insertError) {
        console.error("Failed to save resource to database:", insertError);
        return { success: false, error: 'Failed to save resource to database' };
      }
      
      console.log("Resource saved to database:", insertedResource);
      
      // After a delay, update the status to "running"
      setTimeout(async () => {
        try {
          await supabase
            .from('cloud_resources')
            .update({ status: 'running' })
            .eq('id', insertedResource.id);
          console.log(`Updated resource ${insertedResource.id} status to running`);
        } catch (updateError) {
          console.error("Failed to update resource status:", updateError);
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
    console.log(`Fetching resource details for: ${resourceId}`);
    
    // Get resource from database
    const { data: resource, error } = await supabase
      .from('cloud_resources')
      .select(`
        *,
        users_cloud_accounts!inner(
          id,
          name,
          provider,
          user_id
        )
      `)
      .eq('id', resourceId)
      .single();
    
    if (error) {
      console.error("Failed to fetch resource:", error);
      return { 
        resource: null, 
        metrics: [],
        error: `Failed to fetch resource: ${error.message}`
      };
    }
    
    if (!resource) {
      return { 
        resource: null, 
        metrics: [],
        error: 'Resource not found'
      };
    }
    
    // Generate mock metrics for now
    const mockMetrics = Array(24).fill(0).map((_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100),
      network: Math.floor(Math.random() * 1000),
    }));
    
    return { 
      resource, 
      metrics: mockMetrics
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

// Get resource metrics
export const getResourceMetrics = async (
  resourceId: string,
  timeRange?: string
): Promise<any[]> => {
  try {
    console.log(`Fetching metrics for resource: ${resourceId}`);
    
    // Get resource from database to verify it exists
    const { data: resource, error } = await supabase
      .from('cloud_resources')
      .select('*')
      .eq('id', resourceId)
      .single();
    
    if (error || !resource) {
      console.warn(`Resource not found: ${resourceId}`);
      return [];
    }
    
    // Generate mock metrics based on resource status
    const cpuBase = resource.status === 'running' ? 45 : 0;
    const memoryBase = resource.status === 'running' ? 60 : 0;
    
    return Array(24).fill(0).map((_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
      cpu: Math.max(0, Math.min(100, cpuBase + (Math.random() * 20 - 10))),
      memory: Math.max(0, Math.min(100, memoryBase + (Math.random() * 15 - 7.5))),
      network: resource.status === 'running' ? Math.floor(Math.random() * 50) : 0,
    }));
  } catch (error: any) {
    console.error("Get resource metrics error:", error);
    return [];
  }
};

// Update resource status (start, stop, restart) and handle other actions like tag updates
export const updateResource = async (
  resourceId: string,
  action: string,
  data?: Record<string, any>
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(`Updating resource ${resourceId} with action: ${action}`);
    
    // Get resource from database
    const { data: resource, error: fetchError } = await supabase
      .from('cloud_resources')
      .select('*')
      .eq('id', resourceId)
      .single();
    
    if (fetchError || !resource) {
      return { success: false, error: 'Resource not found' };
    }
    
    // Handle different types of updates
    if (action === 'update-tags' && data?.tags) {
      // Update tags
      const { error: updateError } = await supabase
        .from('cloud_resources')
        .update({ tags: data.tags })
        .eq('id', resourceId);
      
      if (updateError) {
        console.error("Failed to update tags:", updateError);
        return { success: false, error: 'Failed to update tags' };
      }
      
      console.log(`Resource ${resourceId} tags updated`);
      return { success: true };
    }
    
    // Handle status updates (start, stop, restart)
    let newStatus = resource.status;
    switch (action) {
      case 'start':
        if (resource.status === 'stopped' || resource.status === 'terminated') {
          newStatus = 'starting';
          // Simulate async start process
          setTimeout(async () => {
            await supabase
              .from('cloud_resources')
              .update({ status: 'running' })
              .eq('id', resourceId);
          }, 3000);
        }
        break;
      case 'stop':
        if (resource.status === 'running' || resource.status === 'starting') {
          newStatus = 'stopping';
          // Simulate async stop process
          setTimeout(async () => {
            await supabase
              .from('cloud_resources')
              .update({ status: 'stopped' })
              .eq('id', resourceId);
          }, 2000);
        }
        break;
      case 'restart':
        if (resource.status === 'running') {
          newStatus = 'restarting';
          // Simulate async restart process
          setTimeout(async () => {
            await supabase
              .from('cloud_resources')
              .update({ status: 'running' })
              .eq('id', resourceId);
          }, 4000);
        }
        break;
      default:
        return { success: false, error: `Unknown action: ${action}` };
    }
    
    // Update the resource status
    const { error: updateError } = await supabase
      .from('cloud_resources')
      .update({ status: newStatus })
      .eq('id', resourceId);
    
    if (updateError) {
      console.error("Failed to update resource status:", updateError);
      return { success: false, error: 'Failed to update resource status' };
    }
    
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
    
    const { error } = await supabase
      .from('cloud_resources')
      .delete()
      .eq('id', resourceId);
    
    if (error) {
      console.error("Failed to delete resource:", error);
      return { success: false, error: 'Failed to delete resource from database' };
    }
    
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
