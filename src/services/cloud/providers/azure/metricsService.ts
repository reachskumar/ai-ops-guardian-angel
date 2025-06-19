
// Azure-specific metrics collection using real Azure Monitor API
import { ResourceMetric } from '../../../cloud/types';
import { supabase } from "@/integrations/supabase/client";

export const getAzureResourceMetrics = async (
  resourceId: string,
  resourceType: string,
  timeRange: string = '24h',
  credentials?: Record<string, any>
): Promise<{
  metrics: Array<ResourceMetric>;
  error?: string;
}> => {
  try {
    console.log(`Getting real Azure metrics for ${resourceType} resource ${resourceId}`);
    
    if (!credentials || !credentials.tenantId || !credentials.clientId || !credentials.clientSecret || !credentials.subscriptionId) {
      throw new Error('Missing required Azure credentials (tenantId, clientId, clientSecret, subscriptionId)');
    }
    
    // Call the updated metrics edge function with real Azure integration
    const { data, error } = await supabase.functions.invoke('get-resource-metrics', {
      body: { 
        provider: 'azure',
        resourceId,
        resourceType,
        timeRange,
        credentials: {
          tenantId: credentials.tenantId,
          clientId: credentials.clientId,
          clientSecret: credentials.clientSecret,
          subscriptionId: credentials.subscriptionId
        }
      }
    });

    if (error) {
      console.error(`Azure metrics edge function error: ${error.message}`);
      throw new Error(`Edge function error: ${error.message}`);
    }
    
    if (!data || !data.success) {
      throw new Error('No metrics data returned from edge function');
    }
    
    console.log(`Successfully fetched ${data.metrics.length} real Azure metrics`);
    return { 
      metrics: data.metrics as ResourceMetric[]
    };
  } catch (error: any) {
    console.error(`Azure metrics error for ${resourceId}:`, error);
    
    // Return error instead of fallback for real integration
    return {
      metrics: [],
      error: `Azure Monitor error: ${error.message || 'Failed to retrieve metrics'}`
    };
  }
};
