
import { ResourceMetric } from "./types";

// Add a new function to get resource metrics
export const getResourceMetrics = async (
  resourceId: string,
  metricNames: string[] = ['cpu', 'memory', 'network', 'disk'],
  timeRange: string = '1h'
): Promise<ResourceMetric[]> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
  
  const now = new Date();
  const metrics: ResourceMetric[] = [];
  
  for (const metricName of metricNames) {
    const dataPoints = Array.from({ length: 12 }, (_, i) => {
      const timestamp = new Date(now.getTime() - ((11 - i) * 5 * 60 * 1000)); // 5 min intervals
      
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
    
    const unit = metricName === 'cpu' || metricName === 'memory' ? 
                  '%' : 
                  metricName === 'network' ? 
                  'Mbps' : 'IOPS';
    
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
