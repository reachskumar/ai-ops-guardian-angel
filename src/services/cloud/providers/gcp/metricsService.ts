
// GCP-specific metrics collection
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
    console.log(`Getting GCP metrics for ${resourceType} resource ${resourceId}`);
    
    if (!credentials || !credentials.serviceAccountKey || !credentials.projectId) {
      throw new Error('Missing required GCP credentials (serviceAccountKey and/or projectId)');
    }
    
    // Call the metrics edge function with the resource info and credentials
    const { data, error } = await supabase.functions.invoke('get-resource-metrics', {
      body: { 
        provider: 'gcp',
        resourceId,
        resourceType,
        timeRange,
        credentials
      }
    });

    if (error) {
      throw new Error(`Edge function error: ${error.message}`);
    }
    
    if (!data || !data.metrics) {
      throw new Error('No metrics data returned from edge function');
    }
    
    return { 
      metrics: data.metrics as ResourceMetric[]
    };
  } catch (error: any) {
    console.error(`GCP metrics error for ${resourceId}:`, error);
    
    // If edge function fails, fall back to mock data temporarily to avoid breaking the UI
    // This allows for graceful degradation during the transition to real data
    const fallbackMetrics = generateMockMetricsForResource(resourceId, resourceType, timeRange);
    console.log('Using fallback mock metrics due to error');
    
    return {
      metrics: fallbackMetrics,
      error: `GCP Monitoring error: ${error.message || 'Failed to retrieve metrics'}`
    };
  }
};

// Helper function to generate mock metrics during transition period
const generateMockMetricsForResource = (
  resourceId: string, 
  resourceType: string, 
  timeRange?: string
): ResourceMetric[] => {
  const hours = parseInt(timeRange?.replace('h', '') || '24', 10);
  const now = new Date();
  
  if (resourceType.toLowerCase().includes('vm') || resourceType.toLowerCase().includes('instance')) {
    return [
      {
        name: 'cpu',
        data: Array(hours).fill(0).map((_, i) => ({
          timestamp: new Date(now.getTime() - (hours - i) * 3600000).toISOString(),
          value: Math.random() * 95
        })),
        unit: '%',
        status: 'normal'
      },
      {
        name: 'memory',
        data: Array(hours).fill(0).map((_, i) => ({
          timestamp: new Date(now.getTime() - (hours - i) * 3600000).toISOString(),
          value: Math.random() * 85 + 10
        })),
        unit: '%',
        status: 'normal'
      }
    ];
  }
  
  // Default metrics
  return [
    {
      name: 'usage',
      data: Array(hours).fill(0).map((_, i) => ({
        timestamp: new Date(now.getTime() - (hours - i) * 3600000).toISOString(),
        value: Math.random() * 100
      })),
      unit: '%',
      status: 'normal'
    }
  ];
};
