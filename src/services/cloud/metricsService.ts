
import { supabase } from "@/integrations/supabase/client";
import { CloudResource, ResourceMetric } from "./types";

// Get resource metrics by resource ID
export const getResourceMetrics = async (
  resourceId: string,
  timeRange: string = '1d',
  metricNames: string[] = []
): Promise<ResourceMetric[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-resource-metrics', {
      body: { resourceId, timeRange, metricNames }
    });

    if (error) throw error;
    
    return data.metrics;
  } catch (error: any) {
    console.error("Get resource metrics error:", error);
    return [];
  }
};

// Get aggregated metrics for multiple resources
export const getAggregatedMetrics = async (
  resourceIds: string[],
  metricName: string,
  timeRange: string = '1d',
  interval: string = '1h'
): Promise<{ 
  data: Array<{ timestamp: string; value: number }>; 
  error?: string 
}> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-aggregated-metrics', {
      body: { resourceIds, metricName, timeRange, interval }
    });

    if (error) throw error;
    
    return { data: data.metrics };
  } catch (error: any) {
    console.error("Get aggregated metrics error:", error);
    return { 
      data: [],
      error: error.message || 'Failed to get aggregated metrics' 
    };
  }
};

// Get resource cost metrics
export const getResourceCostMetrics = async (
  resourceId: string,
  timeRange: string = '30d',
  interval: string = '1d'
): Promise<{ 
  data: Array<{ date: string; cost: number }>; 
  error?: string 
}> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-resource-cost-metrics', {
      body: { resourceId, timeRange, interval }
    });

    if (error) throw error;
    
    return { data: data.costs };
  } catch (error: any) {
    console.error("Get resource cost metrics error:", error);
    return { 
      data: [],
      error: error.message || 'Failed to get resource cost metrics' 
    };
  }
};

// Get resource alerts/events
export const getResourceAlerts = async (
  resourceId: string,
  timeRange: string = '7d'
): Promise<{ 
  alerts: Array<any>; 
  error?: string 
}> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-resource-alerts', {
      body: { resourceId, timeRange }
    });

    if (error) throw error;
    
    return { alerts: data.alerts };
  } catch (error: any) {
    console.error("Get resource alerts error:", error);
    return { 
      alerts: [],
      error: error.message || 'Failed to get resource alerts' 
    };
  }
};
