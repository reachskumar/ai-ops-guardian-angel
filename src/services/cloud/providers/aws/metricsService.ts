
// AWS-specific metrics collection using real CloudWatch API
import { ResourceMetric } from '../../../cloud/types';
import { supabase } from "@/integrations/supabase/client";

export const getAwsResourceMetrics = async (
  resourceId: string,
  resourceType: string,
  timeRange: string = '24h',
  credentials?: Record<string, any>
): Promise<{
  metrics: Array<ResourceMetric>;
  error?: string;
}> => {
  try {
    console.log(`Getting real AWS metrics for ${resourceType} resource ${resourceId}`);
    
    if (!credentials || !credentials.accessKeyId || !credentials.secretAccessKey) {
      throw new Error('Missing required AWS credentials (accessKeyId and/or secretAccessKey)');
    }
    
    // Call the updated metrics edge function with real AWS integration
    const { data, error } = await supabase.functions.invoke('get-resource-metrics', {
      body: { 
        provider: 'aws',
        resourceId,
        resourceType,
        timeRange,
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
          region: credentials.region || 'us-east-1',
          ...(credentials.sessionToken && { sessionToken: credentials.sessionToken })
        }
      }
    });

    if (error) {
      console.error(`AWS metrics edge function error: ${error.message}`);
      throw new Error(`Edge function error: ${error.message}`);
    }
    
    if (!data || !data.success) {
      throw new Error('No metrics data returned from edge function');
    }
    
    console.log(`Successfully fetched ${data.metrics.length} real AWS metrics`);
    return { 
      metrics: data.metrics as ResourceMetric[]
    };
  } catch (error: any) {
    console.error(`AWS metrics error for ${resourceId}:`, error);
    
    // Return error instead of fallback for real integration
    return {
      metrics: [],
      error: `AWS CloudWatch error: ${error.message || 'Failed to retrieve metrics'}`
    };
  }
};
