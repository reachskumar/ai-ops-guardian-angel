import { supabase } from "@/integrations/supabase/client";
import { mockInsert, mockSelect, mockUpdate, mockDelete } from "./mockDatabaseService";

export type CloudProvider = 'aws' | 'azure' | 'gcp';

export interface CloudAccount {
  id: string;
  name: string;
  provider: CloudProvider;
  status: 'connected' | 'disconnected' | 'error';
  created_at: string;
  last_synced_at?: string;
  error_message?: string;
  metadata?: Record<string, any>;
}

export interface CloudResource {
  id: string;
  cloud_account_id: string;
  resource_id: string;
  name: string;
  type: string;
  region: string;
  status: string;
  created_at: string;
  updated_at: string;
  tags?: Record<string, string>;
  cost_per_day?: number;
  metadata?: Record<string, any>;
}

export interface ResourceMetric {
  name: string;
  data: Array<{
    timestamp: string;
    value: number;
  }>;
  unit: string;
  status?: string;
}

// Connect to cloud providers via Edge Function
export const connectCloudProvider = async (
  provider: CloudProvider,
  credentials: Record<string, string>,
  name: string
): Promise<{ success: boolean; accountId?: string; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('connect-cloud-provider', {
      body: { provider, credentials, name }
    });

    if (error) throw error;
    
    return { 
      success: data.success, 
      accountId: data.accountId,
      error: data.error
    };
  } catch (error: any) {
    console.error(`Connect to ${provider} error:`, error);
    return { success: false, error: error.message || 'Failed to connect cloud provider' };
  }
};

// Get cloud accounts
export const getCloudAccounts = async (): Promise<CloudAccount[]> => {
  try {
    // Use mock service
    const { data, error } = mockSelect('cloud_accounts');

    if (error) throw error;
    
    return data as CloudAccount[];
  } catch (error) {
    console.error("Get cloud accounts error:", error);
    return [];
  }
};

// Sync cloud resources for an account
export const syncCloudResources = async (
  accountId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('sync-cloud-resources', {
      body: { accountId }
    });

    if (error) throw error;
    
    return { 
      success: data.success, 
      error: data.error
    };
  } catch (error: any) {
    console.error("Sync cloud resources error:", error);
    return { success: false, error: error.message || 'Failed to sync cloud resources' };
  }
};

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
    
    // Create filters for mock select
    let filters: Record<string, any> = {};
    if (accountId) filters.cloud_account_id = accountId;
    if (type) filters.type = type;
    if (region) filters.region = region;
    if (status) filters.status = status;
    
    // Use mock service
    const { data, count, error } = mockSelect('cloud_resources', filters);
    
    if (error) throw error;
    
    // Apply pagination manually
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
    const { data, error } = await supabase.functions.invoke('provision-resource', {
      body: { accountId, resourceType, config }
    });

    if (error) throw error;
    
    return { 
      success: data.success, 
      resourceId: data.resourceId,
      error: data.error
    };
  } catch (error: any) {
    console.error("Provision resource error:", error);
    return { success: false, error: error.message || 'Failed to provision resource' };
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

// Get cost analysis for cloud resources
export const getResourceCosts = async (
  filters: {
    accountId?: string;
    resourceIds?: string[];
    startDate: string;
    endDate: string;
    groupBy?: 'day' | 'week' | 'month' | 'service' | 'region';
  }
): Promise<{ costs: any[]; totalCost: number; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-resource-costs', {
      body: filters
    });

    if (error) throw error;
    
    return { 
      costs: data.costs,
      totalCost: data.totalCost
    };
  } catch (error: any) {
    console.error("Get resource costs error:", error);
    return { 
      costs: [], 
      totalCost: 0,
      error: error.message || 'Failed to get resource costs' 
    };
  }
};

// Add a new function to get resource metrics
export const getResourceMetrics = async (
  resourceId: string,
  metricNames: string[] = ['cpu', 'memory', 'network', 'disk'],
  timeRange: string = '1h'
): Promise<ResourceMetric[]> => {
  // Mock data for now - would connect to cloud provider APIs in production
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
  
  const now = new Date();
  const metrics: ResourceMetric[] = [];
  
  for (const metricName of metricNames) {
    // Generate random data points for the past hour (or specified time range)
    const dataPoints = Array.from({ length: 12 }, (_, i) => {
      const timestamp = new Date(now.getTime() - ((11 - i) * 5 * 60 * 1000)); // 5 min intervals
      
      // Different patterns for different metrics
      let value = 0;
      switch (metricName) {
        case 'cpu':
          value = Math.floor(Math.random() * 40) + 30; // 30-70%
          break;
        case 'memory':
          value = Math.floor(Math.random() * 30) + 50; // 50-80%
          break;
        case 'network':
          value = Math.floor(Math.random() * 100) + 20; // 20-120 Mbps
          break;
        case 'disk':
          value = Math.floor(Math.random() * 20) + 10; // 10-30 IOPS
          break;
        default:
          value = Math.floor(Math.random() * 100);
      }
      
      return {
        timestamp: timestamp.toISOString(),
        value
      };
    });
    
    // Define unit based on metric type
    const unit = metricName === 'cpu' || metricName === 'memory' ? 
                  '%' : 
                  metricName === 'network' ? 
                  'Mbps' : 'IOPS';
    
    // Calculate status based on latest value
    let status = 'normal';
    const latestValue = dataPoints[dataPoints.length - 1].value;
    if (metricName === 'cpu' && latestValue > 80) status = 'warning';
    if (metricName === 'memory' && latestValue > 85) status = 'warning';
    if (metricName === 'disk' && latestValue > 25) status = 'warning';
    
    metrics.push({
      name: metricName.charAt(0).toUpperCase() + metricName.slice(1),
      data: dataPoints,
      unit,
      status
    });
  }
  
  return metrics;
};
