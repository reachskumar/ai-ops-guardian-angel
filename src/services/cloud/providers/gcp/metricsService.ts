
// GCP-specific metrics collection using real Google Cloud Monitoring API
import { ResourceMetric } from '../../../cloud/types';
import { supabase } from "@/integrations/supabase/client";

export const getGcpResourceMetrics = async (
  resourceId: string,
  resourceType: string,
  timeRange: string = '24h',
  credentials?: Record<string, any>
): Promise<{
  metrics: Array<ResourceMetric>;
  error?: string;
}> => {
  try {
    console.log(`Getting real GCP metrics for ${resourceType} resource ${resourceId}`);
    
    if (!credentials || !credentials.serviceAccountKey || !credentials.projectId) {
      throw new Error('Missing required GCP credentials (serviceAccountKey and/or projectId)');
    }
    
    // Call the updated metrics edge function with real GCP integration
    const { data, error } = await supabase.functions.invoke('get-resource-metrics', {
      body: { 
        provider: 'gcp',
        resourceId,
        resourceType,
        timeRange,
        credentials: {
          serviceAccountKey: credentials.serviceAccountKey,
          projectId: credentials.projectId
        }
      }
    });

    if (error) {
      console.error(`GCP metrics edge function error: ${error.message}`);
      throw new Error(`Edge function error: ${error.message}`);
    }
    
    if (!data || !data.success) {
      throw new Error('No metrics data returned from edge function');
    }
    
    console.log(`Successfully fetched ${data.metrics.length} real GCP metrics`);
    return { 
      metrics: data.metrics as ResourceMetric[]
    };
  } catch (error: any) {
    console.error(`GCP metrics error for ${resourceId}:`, error);
    
    // Return error instead of fallback for real integration
    return {
      metrics: [],
      error: `GCP Monitoring error: ${error.message || 'Failed to retrieve metrics'}`
    };
  }
};
