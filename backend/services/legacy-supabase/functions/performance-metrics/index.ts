
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface MetricsRequest {
  resourceIds?: string[];
  time_range?: string;
  metrics?: string[];
}

interface PerformanceMetric {
  timestamp: string;
  resource_id: string;
  metric_name: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
}

// Simulate real-time performance metrics
const generateMetrics = (resourceId: string, metricName: string): PerformanceMetric => {
  const baseValues: Record<string, () => number> = {
    'cpu_usage': () => Math.random() * 100,
    'memory_usage': () => Math.random() * 100,
    'disk_io': () => Math.random() * 1000,
    'network_throughput': () => Math.random() * 1000,
    'response_time': () => Math.random() * 2000 + 100,
    'error_rate': () => Math.random() * 5,
    'request_count': () => Math.random() * 10000,
    'connection_count': () => Math.random() * 500
  };

  const units: Record<string, string> = {
    'cpu_usage': '%',
    'memory_usage': '%',
    'disk_io': 'iops',
    'network_throughput': 'mbps',
    'response_time': 'ms',
    'error_rate': '%',
    'request_count': 'count',
    'connection_count': 'count'
  };

  return {
    timestamp: new Date().toISOString(),
    resource_id: resourceId,
    metric_name: metricName,
    value: Math.round((baseValues[metricName] || (() => 0))() * 100) / 100,
    unit: units[metricName] || 'unknown',
    tags: {
      environment: 'production',
      region: 'us-east-1'
    }
  };
};

const getAggregatedMetrics = (resourceIds: string[], timeRange: string, metrics: string[]) => {
  const timeRangeHours = parseInt(timeRange?.replace('h', '') || '24', 10);
  const dataPoints = Math.min(timeRangeHours * 4, 100); // 15-minute intervals, max 100 points
  
  const aggregatedData: PerformanceMetric[] = [];
  
  for (let i = 0; i < dataPoints; i++) {
    const timestamp = new Date(Date.now() - (dataPoints - i) * 15 * 60 * 1000).toISOString();
    
    for (const resourceId of resourceIds) {
      for (const metricName of metrics) {
        const metric = generateMetrics(resourceId, metricName);
        metric.timestamp = timestamp;
        aggregatedData.push(metric);
      }
    }
  }
  
  return aggregatedData;
};

const detectAnomalies = (metrics: PerformanceMetric[]) => {
  const anomalies = [];
  
  for (const metric of metrics) {
    let isAnomaly = false;
    let severity = 'normal';
    
    switch (metric.metric_name) {
      case 'cpu_usage':
        if (metric.value > 90) {
          isAnomaly = true;
          severity = 'critical';
        } else if (metric.value > 80) {
          isAnomaly = true;
          severity = 'warning';
        }
        break;
      case 'memory_usage':
        if (metric.value > 95) {
          isAnomaly = true;
          severity = 'critical';
        } else if (metric.value > 85) {
          isAnomaly = true;
          severity = 'warning';
        }
        break;
      case 'response_time':
        if (metric.value > 2000) {
          isAnomaly = true;
          severity = 'critical';
        } else if (metric.value > 1000) {
          isAnomaly = true;
          severity = 'warning';
        }
        break;
      case 'error_rate':
        if (metric.value > 5) {
          isAnomaly = true;
          severity = 'critical';
        } else if (metric.value > 2) {
          isAnomaly = true;
          severity = 'warning';
        }
        break;
    }
    
    if (isAnomaly) {
      anomalies.push({
        timestamp: metric.timestamp,
        resource_id: metric.resource_id,
        metric_name: metric.metric_name,
        value: metric.value,
        severity,
        message: `${metric.metric_name} is ${severity} at ${metric.value}${metric.unit}`
      });
    }
  }
  
  return anomalies;
};

const generateOptimizationSuggestions = (metrics: PerformanceMetric[]) => {
  const suggestions = [];
  
  // Group metrics by resource and metric name
  const metricGroups: Record<string, Record<string, PerformanceMetric[]>> = {};
  
  for (const metric of metrics) {
    if (!metricGroups[metric.resource_id]) {
      metricGroups[metric.resource_id] = {};
    }
    if (!metricGroups[metric.resource_id][metric.metric_name]) {
      metricGroups[metric.resource_id][metric.metric_name] = [];
    }
    metricGroups[metric.resource_id][metric.metric_name].push(metric);
  }
  
  // Analyze each resource's metrics
  for (const [resourceId, resourceMetrics] of Object.entries(metricGroups)) {
    for (const [metricName, metricData] of Object.entries(resourceMetrics)) {
      const avgValue = metricData.reduce((sum, m) => sum + m.value, 0) / metricData.length;
      
      if (metricName === 'cpu_usage' && avgValue > 75) {
        suggestions.push({
          id: `cpu-${resourceId}-${Date.now()}`,
          resource_id: resourceId,
          type: 'scaling',
          priority: 'high',
          title: 'Scale Up CPU Resources',
          description: `CPU usage averaging ${avgValue.toFixed(1)}% - consider upgrading CPU or adding auto-scaling`,
          estimated_impact: {
            performance: '+25%',
            cost: '+15%',
            reliability: '+20%'
          },
          implementation_effort: 'medium'
        });
      }
      
      if (metricName === 'memory_usage' && avgValue > 80) {
        suggestions.push({
          id: `memory-${resourceId}-${Date.now()}`,
          resource_id: resourceId,
          type: 'memory_optimization',
          priority: 'medium',
          title: 'Optimize Memory Usage',
          description: `Memory usage averaging ${avgValue.toFixed(1)}% - implement caching or increase RAM`,
          estimated_impact: {
            performance: '+15%',
            cost: '+10%',
            reliability: '+15%'
          },
          implementation_effort: 'low'
        });
      }
      
      if (metricName === 'response_time' && avgValue > 1000) {
        suggestions.push({
          id: `response-${resourceId}-${Date.now()}`,
          resource_id: resourceId,
          type: 'performance_tuning',
          priority: 'high',
          title: 'Optimize Response Time',
          description: `Average response time ${avgValue.toFixed(0)}ms - optimize database queries or add caching`,
          estimated_impact: {
            performance: '+40%',
            cost: '0%',
            reliability: '+10%'
          },
          implementation_effort: 'high'
        });
      }
    }
  }
  
  return suggestions;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resourceIds, time_range, metrics }: MetricsRequest = await req.json();
    
    console.log('Performance metrics request:', { resourceIds, time_range, metrics });
    
    const defaultResourceIds = resourceIds || ['server-1', 'server-2', 'database-1'];
    const defaultMetrics = metrics || ['cpu_usage', 'memory_usage', 'response_time', 'error_rate'];
    const timeRange = time_range || '24h';
    
    // Generate metrics data
    const metricsData = getAggregatedMetrics(defaultResourceIds, timeRange, defaultMetrics);
    
    // Detect anomalies
    const anomalies = detectAnomalies(metricsData);
    
    // Generate optimization suggestions
    const optimizations = generateOptimizationSuggestions(metricsData);
    
    // Calculate performance score
    const performanceScore = Math.max(0, Math.min(100, 
      95 - (anomalies.filter(a => a.severity === 'critical').length * 10) - 
      (anomalies.filter(a => a.severity === 'warning').length * 5)
    ));
    
    const response = {
      success: true,
      data: {
        metrics: metricsData,
        anomalies: anomalies,
        optimizations: optimizations,
        performance_score: performanceScore,
        summary: {
          total_metrics: metricsData.length,
          resources_monitored: defaultResourceIds.length,
          anomalies_detected: anomalies.length,
          critical_issues: anomalies.filter(a => a.severity === 'critical').length,
          optimization_opportunities: optimizations.length
        }
      }
    };
    
    console.log(`Generated ${metricsData.length} metrics, ${anomalies.length} anomalies, ${optimizations.length} optimizations`);
    
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("Performance metrics error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: `Failed to fetch performance metrics: ${error.message}`
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
