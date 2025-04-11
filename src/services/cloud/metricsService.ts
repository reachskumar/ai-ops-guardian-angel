
import { ResourceMetric } from "./types";
import { supabase } from "@/integrations/supabase/client";

// Get resource metrics from the edge function
export const getResourceMetrics = async (
  resourceId: string,
  timeRange?: string
): Promise<ResourceMetric[]> => {
  try {
    console.log(`Fetching metrics for resource ${resourceId} with timeRange ${timeRange || 'default'}`);
    
    const { data, error } = await supabase.functions.invoke('get-resource-metrics', {
      body: { resourceId, timeRange }
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
