import { supabase } from "@/integrations/supabase/client";
import { CloudResource, CloudAccount } from "./types";
import { getAccountCredentials } from "./accountService";

export const getCloudResources = async (): Promise<{ 
  resources: CloudResource[]; 
  count: number 
}> => {
  try {
    console.log("Fetching cloud resources from Supabase...");

    const { data, error, count } = await supabase
      .from('cloud_resources')
      .select(`
        *,
        users_cloud_accounts!inner(
          id,
          name,
          provider,
          user_id,
          status,
          created_at,
          last_synced_at,
          error_message,
          metadata
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Failed to fetch cloud resources:", error);
      throw error;
    }

    console.log(`Retrieved ${data?.length || 0} resources from database`);

    // Transform data to match CloudResource interface
    const resources: CloudResource[] = (data || []).map(item => ({
      id: item.id,
      account_id: item.cloud_account_id,
      resource_id: item.resource_id,
      name: item.name,
      type: item.type,
      region: item.region,
      provider: item.users_cloud_accounts.provider as any,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at,
      tags: (item.tags as Record<string, string>) || {},
      metadata: (item.metadata as Record<string, any>) || {},
      cost_per_day: item.cost_per_day
    }));

    return {
      resources,
      count: count || 0
    };
  } catch (error) {
    console.error("Get cloud resources error:", error);
    return {
      resources: [],
      count: 0
    };
  }
};

export const getResourceDetails = async (resourceId: string): Promise<CloudResource | null> => {
  try {
    console.log(`Fetching details for resource: ${resourceId}`);

    const { data, error } = await supabase
      .from('cloud_resources')
      .select(`
        *,
        users_cloud_accounts!inner(
          id,
          name,
          provider,
          user_id,
          status,
          created_at,
          last_synced_at,
          error_message,
          metadata
        )
      `)
      .eq('id', resourceId)
      .single();

    if (error) {
      console.error("Failed to fetch resource details:", error);
      return null;
    }

    if (!data) {
      console.log("No resource found with ID:", resourceId);
      return null;
    }

    // Transform data to match CloudResource interface
    const resource: CloudResource = {
      id: data.id,
      account_id: data.cloud_account_id,
      resource_id: data.resource_id,
      name: data.name,
      type: data.type,
      region: data.region,
      provider: data.users_cloud_accounts.provider as any,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at,
      tags: (data.tags as Record<string, string>) || {},
      metadata: (data.metadata as Record<string, any>) || {},
      cost_per_day: data.cost_per_day
    };

    console.log("Resource details fetched successfully");
    return resource;
  } catch (error) {
    console.error("Get resource details error:", error);
    return null;
  }
};

export const updateResource = async (
  resourceId: string, 
  updates: Partial<CloudResource>
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(`Updating resource: ${resourceId}`, updates);
    
    const { error } = await supabase
      .from('cloud_resources')
      .update(updates)
      .eq('id', resourceId);
    
    if (error) {
      console.error("Failed to update resource:", error);
      return { success: false, error: 'Failed to update resource' };
    }
    
    console.log(`Resource updated successfully: ${resourceId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Update resource error:", error);
    return { success: false, error: error.message || 'Failed to update resource' };
  }
};

export const updateResourceTags = async (
  resourceId: string, 
  tags: Record<string, string>
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(`Updating tags for resource: ${resourceId}`, tags);
    
    const { error } = await supabase
      .from('cloud_resources')
      .update({ tags })
      .eq('id', resourceId);
    
    if (error) {
      console.error("Failed to update resource tags:", error);
      return { success: false, error: 'Failed to update resource tags' };
    }
    
    console.log(`Resource tags updated successfully: ${resourceId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Update resource tags error:", error);
    return { success: false, error: error.message || 'Failed to update resource tags' };
  }
};

export const deleteResource = async (resourceId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(`Deleting resource: ${resourceId}`);
    
    const { error } = await supabase
      .from('cloud_resources')
      .delete()
      .eq('id', resourceId);
    
    if (error) {
      console.error("Failed to delete resource:", error);
      return { success: false, error: 'Failed to delete resource' };
    }
    
    console.log(`Resource deleted successfully: ${resourceId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Delete resource error:", error);
    return { success: false, error: error.message || 'Failed to delete resource' };
  }
};

// Resource Metrics
export interface ResourceMetric {
  name: string;
  unit: string;
  data: Array<{ timestamp: string; value: number }>;
  status: 'normal' | 'warning' | 'critical';
}

export const getResourceMetrics = async (resourceId: string, timeRange: string = '1h'): Promise<ResourceMetric[]> => {
  try {
    console.log(`Fetching metrics for resource: ${resourceId}, timeRange: ${timeRange}`);
    
    // Mock metrics data
    const mockMetrics: ResourceMetric[] = [
      {
        name: 'cpu',
        unit: '%',
        status: 'normal',
        data: Array.from({ length: 20 }, (_, i) => ({
          timestamp: new Date(Date.now() - (19 - i) * 5 * 60 * 1000).toISOString(),
          value: Math.random() * 100
        }))
      },
      {
        name: 'memory',
        unit: '%',
        status: 'warning',
        data: Array.from({ length: 20 }, (_, i) => ({
          timestamp: new Date(Date.now() - (19 - i) * 5 * 60 * 1000).toISOString(),
          value: Math.random() * 100
        }))
      },
      {
        name: 'disk',
        unit: '%',
        status: 'normal',
        data: Array.from({ length: 20 }, (_, i) => ({
          timestamp: new Date(Date.now() - (19 - i) * 5 * 60 * 1000).toISOString(),
          value: Math.random() * 100
        }))
      }
    ];
    
    return mockMetrics;
  } catch (error) {
    console.error("Get resource metrics error:", error);
    return [];
  }
};

export const provisionResource = async (
  accountId: string,
  resourceConfig: any
): Promise<{ success: boolean; resourceId?: string; error?: string; details?: any }> => {
  try {
    console.log("Starting real AWS resource provisioning for account:", accountId);
    console.log("Resource configuration:", resourceConfig);
    
    // Get account details to determine provider
    const { data: accountData, error: accountError } = await supabase
      .from('users_cloud_accounts')
      .select('provider')
      .eq('id', accountId)
      .single();
    
    if (accountError || !accountData) {
      return { success: false, error: 'Failed to get account information' };
    }
    
    // Get account credentials
    const credentials = await getAccountCredentials(accountId);
    if (!credentials) {
      return { success: false, error: 'No credentials found for this account' };
    }
    
    // Call the provision-resource edge function with real credentials
    const { data, error } = await supabase.functions.invoke('provision-resource', {
      body: {
        accountId,
        provider: accountData.provider,
        resourceType: resourceConfig.type || resourceConfig.resourceType,
        config: {
          name: resourceConfig.name,
          region: resourceConfig.region,
          size: resourceConfig.size,
          tags: resourceConfig.tags,
          description: resourceConfig.description,
          businessJustification: resourceConfig.businessJustification,
          vpc: resourceConfig.vpc,
          subnet: resourceConfig.subnet,
          securityGroups: resourceConfig.securityGroups,
          storageSize: resourceConfig.storageSize,
          encryption: resourceConfig.encryption,
          ttl: resourceConfig.ttl,
          autoDeprovision: resourceConfig.autoDeprovision
        },
        credentials
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      return {
        success: false,
        error: `Failed to provision resource: ${error.message}`
      };
    }

    if (!data || !data.success) {
      return {
        success: false,
        error: data?.error || 'Unknown provisioning error'
      };
    }

    console.log('AWS resource provisioned successfully:', data);
    
    return {
      success: true,
      resourceId: data.resourceId,
      details: data.details
    };
  } catch (error: any) {
    console.error("Provision resource error:", error);
    return { success: false, error: error.message || 'Failed to provision resource' };
  }
};
