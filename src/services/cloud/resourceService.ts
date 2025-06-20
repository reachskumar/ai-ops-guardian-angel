import { supabase } from "@/integrations/supabase/client";
import { CloudResource, CloudAccount } from "./types";

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
      cloud_account_id: item.cloud_account_id,
      resource_id: item.resource_id,
      name: item.name,
      type: item.type,
      region: item.region,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at,
      tags: (item.tags as Record<string, string>) || {},
      metadata: (item.metadata as Record<string, any>) || {},
      cost_per_day: item.cost_per_day,
      users_cloud_accounts: {
        id: item.users_cloud_accounts.id,
        name: item.users_cloud_accounts.name,
        provider: item.users_cloud_accounts.provider as any,
        user_id: item.users_cloud_accounts.user_id,
        status: item.users_cloud_accounts.status,
        created_at: item.users_cloud_accounts.created_at,
        last_synced_at: item.users_cloud_accounts.last_synced_at,
        error_message: item.users_cloud_accounts.error_message,
        metadata: item.users_cloud_accounts.metadata as Record<string, any> || {}
      }
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
      cloud_account_id: data.cloud_account_id,
      resource_id: data.resource_id,
      name: data.name,
      type: data.type,
      region: data.region,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at,
      tags: (data.tags as Record<string, string>) || {},
      metadata: (data.metadata as Record<string, any>) || {},
      cost_per_day: data.cost_per_day,
      users_cloud_accounts: {
        id: data.users_cloud_accounts.id,
        name: data.users_cloud_accounts.name,
        provider: data.users_cloud_accounts.provider as any,
        user_id: data.users_cloud_accounts.user_id,
        status: data.users_cloud_accounts.status,
        created_at: data.users_cloud_accounts.created_at,
        last_synced_at: data.users_cloud_accounts.last_synced_at,
        error_message: data.users_cloud_accounts.error_message,
        metadata: data.users_cloud_accounts.metadata as Record<string, any> || {}
      }
    };

    console.log("Resource details fetched successfully");
    return resource;
  } catch (error) {
    console.error("Get resource details error:", error);
    return null;
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
