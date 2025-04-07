
import { supabase } from "@/integrations/supabase/client";
import { CloudResource, ResourceMetric } from "./types";

// Get resource metrics by resource ID
export const getResourceMetrics = async (
  resourceId: string,
  metricNames: string[] = [],
  timeRange: string = '1d'
): Promise<ResourceMetric[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-resource-metrics', {
      body: { 
        resourceId, 
        timeRange, 
        metricNames,
        timestamp: new Date().toISOString() // Include timestamp for cache busting
      }
    });

    if (error) throw error;
    
    return data.metrics;
  } catch (error: any) {
    console.error("Get resource metrics error:", error);
    // Return simulated metrics data if we can't connect to backend
    return generateSimulatedMetrics(resourceId, metricNames);
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
      body: { 
        resourceIds, 
        metricName, 
        timeRange, 
        interval,
        timestamp: new Date().toISOString() // Include timestamp for cache busting
      }
    });

    if (error) throw error;
    
    return { data: data.metrics };
  } catch (error: any) {
    console.error("Get aggregated metrics error:", error);
    return { 
      data: generateSimulatedAggregatedMetrics(metricName),
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
      body: { 
        resourceId, 
        timeRange, 
        interval,
        timestamp: new Date().toISOString() // Include timestamp for cache busting
      }
    });

    if (error) throw error;
    
    return { data: data.costs };
  } catch (error: any) {
    console.error("Get resource cost metrics error:", error);
    return { 
      data: generateSimulatedCostMetrics(),
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
      body: { 
        resourceId, 
        timeRange,
        timestamp: new Date().toISOString() // Include timestamp for cache busting
      }
    });

    if (error) throw error;
    
    return { alerts: data.alerts };
  } catch (error: any) {
    console.error("Get resource alerts error:", error);
    return { 
      alerts: generateSimulatedAlerts(),
      error: error.message || 'Failed to get resource alerts' 
    };
  }
};

// Generate simulated metrics for testing and fallback
const generateSimulatedMetrics = (resourceId: string, metricNames: string[]): ResourceMetric[] => {
  const metrics = ['cpu', 'memory', 'disk', 'network'];
  const now = new Date();
  
  return (metricNames.length > 0 ? metricNames : metrics).map(name => {
    // Generate slightly different pattern for each metric
    const baseValue = name === 'cpu' ? 60 : name === 'memory' ? 75 : name === 'disk' ? 45 : 30;
    const variance = name === 'cpu' ? 15 : name === 'memory' ? 10 : name === 'disk' ? 5 : 20;
    
    // Generate 60 data points with timestamps going back in time
    const data = Array.from({ length: 60 }, (_, i) => {
      const timestamp = new Date(now.getTime() - (60 - i) * 60000); // each point is 1 minute apart
      const value = baseValue + Math.sin(i / 10) * variance + Math.random() * (variance / 2);
      return {
        timestamp: timestamp.toISOString(),
        value: Math.max(0, Math.min(100, Math.round(value * 10) / 10)) // Ensure between 0-100, one decimal
      };
    });
    
    // Determine status based on latest value
    const latestValue = data[data.length - 1].value;
    let status = 'normal';
    if (name === 'cpu' && latestValue > 80) status = 'critical';
    else if (name === 'memory' && latestValue > 85) status = 'critical';
    else if ((name === 'cpu' || name === 'memory') && latestValue > 70) status = 'warning';
    
    return {
      name,
      data,
      status,
      unit: name === 'network' ? 'Mbps' : '%'
    };
  });
};

const generateSimulatedAggregatedMetrics = (metricName: string) => {
  const now = new Date();
  const baseValue = metricName === 'cpu' ? 65 : metricName === 'memory' ? 70 : 50;
  const variance = 15;
  
  return Array.from({ length: 24 }, (_, i) => {
    const timestamp = new Date(now.getTime() - (24 - i) * 3600000); // each point is 1 hour apart
    const value = baseValue + Math.sin(i / 4) * variance + Math.random() * (variance / 2);
    return {
      timestamp: timestamp.toISOString(),
      value: Math.round(Math.max(0, Math.min(100, value)))
    };
  });
};

const generateSimulatedCostMetrics = () => {
  const now = new Date();
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now.getTime() - (30 - i) * 86400000); // each point is 1 day apart
    return {
      date: date.toISOString().split('T')[0],
      cost: Math.round((20 + Math.random() * 15) * 100) / 100
    };
  });
};

const generateSimulatedAlerts = () => {
  const alertTypes = ['High CPU Usage', 'Memory Pressure', 'Disk Space Low', 'Network Latency'];
  const severities = ['low', 'medium', 'high', 'critical'];
  const now = new Date();
  
  return Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => {
    const timestamp = new Date(now.getTime() - Math.random() * 7 * 86400000); // within last 7 days
    return {
      id: `alert-${i}`,
      type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      message: `Alert: ${alertTypes[Math.floor(Math.random() * alertTypes.length)]} detected`,
      timestamp: timestamp.toISOString(),
      acknowledged: Math.random() > 0.5
    };
  });
};
