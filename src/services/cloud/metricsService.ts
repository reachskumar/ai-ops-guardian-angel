
import { ResourceMetric } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { getAccountCredentials } from "./accountService";

// Get resource metrics from the edge function
export const getResourceMetrics = async (
  resourceId: string,
  timeRange?: string
): Promise<ResourceMetric[]> => {
  try {
    console.log(`Fetching metrics for resource ${resourceId} with timeRange ${timeRange || 'default'}`);
    
    // Find which account this resource belongs to
    // For simplicity, we're using a naming convention: gcp-vm-{vmId}
    // In a real app, you'd look this up from a database
    let accountId = null;
    
    // If it's a GCP resource, extract the account ID
    if (resourceId.startsWith('gcp-')) {
      try {
        const resources = JSON.parse(localStorage.getItem('cloud_resources') || '[]');
        const resource = resources.find((r: any) => r.id === resourceId);
        if (resource) {
          accountId = resource.cloud_account_id;
        }
      } catch (e) {
        console.error("Error looking up resource account:", e);
      }
    }
    
    // Get credentials if we have an account ID
    const credentials = accountId ? getAccountCredentials(accountId) : null;
    
    const { data, error } = await supabase.functions.invoke('get-resource-metrics', {
      body: { 
        resourceId, 
        timeRange,
        accountId,
        credentials 
      }
    });

    if (error) {
      console.error("Get resource metrics error:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Get resource metrics error:", error);
    
    // Return fallback mock data that conforms to the ResourceMetric interface
    return [
      {
        name: 'cpu',
        data: Array(24).fill(0).map((_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
          value: Math.floor(Math.random() * 100)
        })),
        unit: '%',
        status: 'normal'
      },
      {
        name: 'memory',
        data: Array(24).fill(0).map((_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
          value: Math.floor(Math.random() * 100)
        })),
        unit: '%',
        status: 'normal'
      }
    ];
  }
};

// Aggregate metrics across multiple resources
export const getAggregatedMetrics = async (
  resourceIds: string[],
  metricName: string,
  timeRange?: string
): Promise<{ data?: any[], error?: Error }> => {
  try {
    console.log(`Aggregating ${metricName} metrics for ${resourceIds.length} resources with timeRange ${timeRange || 'default'}`);
    
    // For the 'all' special case, we'd fetch from all resources
    if (resourceIds.includes('all')) {
      // Here we would normally make an API call to get data for all resources
      // For now, return mock data
      return {
        data: Array(24).fill(0).map((_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
          value: Math.floor(Math.random() * 100)
        }))
      };
    }
    
    // If specific resourceIds are provided, aggregate their metrics
    const allMetrics = await Promise.all(
      resourceIds.map(id => getResourceMetrics(id, timeRange))
    );
    
    // Find the metric with the specified name in each resource's metrics
    const specificMetrics = allMetrics.map(metrics => {
      const metric = metrics.find(m => m.name === metricName);
      return metric ? metric.data : [];
    }).flat();
    
    // Aggregate by timestamp (simple average in this example)
    const timestampMap = new Map();
    specificMetrics.forEach(dataPoint => {
      const timestamp = dataPoint.timestamp;
      if (!timestampMap.has(timestamp)) {
        timestampMap.set(timestamp, [dataPoint.value]);
      } else {
        timestampMap.get(timestamp).push(dataPoint.value);
      }
    });
    
    const aggregated = Array.from(timestampMap.entries()).map(([timestamp, values]) => ({
      timestamp,
      value: values.reduce((sum: number, value: number) => sum + value, 0) / values.length
    }));
    
    return { data: aggregated };
  } catch (error) {
    console.error("Aggregate metrics error:", error);
    return { error: error as Error };
  }
};
