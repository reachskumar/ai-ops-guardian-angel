
// Edge function to fetch metrics from cloud providers
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Import AWS SDK for CloudWatch
import { CloudWatchClient, GetMetricStatisticsCommand } from "https://esm.sh/@aws-sdk/client-cloudwatch@3.462.0";

// Import GCP Monitoring
import { MonitoringClient } from "https://esm.sh/@google-cloud/monitoring@3.0.0/build/src/v3";

// Common error handler
const handleError = (error: any, message: string) => {
  console.error(message, error);
  return new Response(
    JSON.stringify({
      success: false,
      error: `${message}: ${error.message || 'Unknown error'}`
    }),
    {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
};

// AWS CloudWatch metrics fetching
const getAwsMetrics = async (resourceId: string, resourceType: string, timeRange: string, credentials: any) => {
  const cloudwatch = new CloudWatchClient({
    region: credentials.region || 'us-east-1',
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      ...(credentials.sessionToken && { sessionToken: credentials.sessionToken })
    }
  });

  const hours = parseInt(timeRange?.replace('h', '') || '24', 10);
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);

  const metrics = [];

  try {
    // Define metrics based on resource type
    let metricQueries = [];
    
    if (resourceType.toLowerCase().includes('ec2') || resourceType.toLowerCase().includes('instance')) {
      metricQueries = [
        { MetricName: 'CPUUtilization', Namespace: 'AWS/EC2', Unit: 'Percent' },
        { MetricName: 'NetworkIn', Namespace: 'AWS/EC2', Unit: 'Bytes' },
        { MetricName: 'NetworkOut', Namespace: 'AWS/EC2', Unit: 'Bytes' },
        { MetricName: 'DiskReadOps', Namespace: 'AWS/EC2', Unit: 'Count' }
      ];
    } else if (resourceType.toLowerCase().includes('rds')) {
      metricQueries = [
        { MetricName: 'CPUUtilization', Namespace: 'AWS/RDS', Unit: 'Percent' },
        { MetricName: 'DatabaseConnections', Namespace: 'AWS/RDS', Unit: 'Count' },
        { MetricName: 'FreeableMemory', Namespace: 'AWS/RDS', Unit: 'Bytes' },
        { MetricName: 'ReadLatency', Namespace: 'AWS/RDS', Unit: 'Seconds' }
      ];
    } else if (resourceType.toLowerCase().includes('lambda')) {
      metricQueries = [
        { MetricName: 'Invocations', Namespace: 'AWS/Lambda', Unit: 'Count' },
        { MetricName: 'Duration', Namespace: 'AWS/Lambda', Unit: 'Milliseconds' },
        { MetricName: 'Errors', Namespace: 'AWS/Lambda', Unit: 'Count' },
        { MetricName: 'Throttles', Namespace: 'AWS/Lambda', Unit: 'Count' }
      ];
    }

    // Fetch metrics for each query
    for (const query of metricQueries) {
      const command = new GetMetricStatisticsCommand({
        Namespace: query.Namespace,
        MetricName: query.MetricName,
        Dimensions: [
          {
            Name: resourceType.toLowerCase().includes('ec2') ? 'InstanceId' : 
                  resourceType.toLowerCase().includes('rds') ? 'DBInstanceIdentifier' :
                  resourceType.toLowerCase().includes('lambda') ? 'FunctionName' : 'ResourceId',
            Value: resourceId
          }
        ],
        StartTime: startTime,
        EndTime: endTime,
        Period: 3600, // 1 hour intervals
        Statistics: ['Average']
      });

      const response = await cloudwatch.send(command);
      
      if (response.Datapoints && response.Datapoints.length > 0) {
        const data = response.Datapoints
          .sort((a, b) => new Date(a.Timestamp!).getTime() - new Date(b.Timestamp!).getTime())
          .map(point => ({
            timestamp: point.Timestamp!.toISOString(),
            value: Math.round((point.Average || 0) * 100) / 100
          }));

        metrics.push({
          name: query.MetricName.toLowerCase(),
          data,
          unit: query.Unit === 'Percent' ? '%' : 
                query.Unit === 'Bytes' ? 'bytes' : 
                query.Unit === 'Count' ? 'count' :
                query.Unit === 'Seconds' ? 's' :
                query.Unit === 'Milliseconds' ? 'ms' : '',
          status: 'normal'
        });
      }
    }
  } catch (error) {
    console.error('AWS CloudWatch error:', error);
    throw error;
  }

  return metrics;
};

// Azure Monitor metrics fetching using REST API
const getAzureMetrics = async (resourceId: string, resourceType: string, timeRange: string, credentials: any) => {
  const hours = parseInt(timeRange?.replace('h', '') || '24', 10);
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);

  const metrics = [];

  try {
    // Get Azure access token
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${credentials.tenantId}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'client_id': credentials.clientId,
        'client_secret': credentials.clientSecret,
        'scope': 'https://management.azure.com/.default',
        'grant_type': 'client_credentials'
      })
    });

    if (!tokenResponse.ok) {
      throw new Error(`Failed to get Azure access token: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Define metrics based on resource type
    let metricNames = [];
    
    if (resourceType.toLowerCase().includes('vm') || resourceType.toLowerCase().includes('virtualmachine')) {
      metricNames = [
        'Percentage CPU',
        'Network In Total',
        'Network Out Total',
        'Disk Read Operations/Sec'
      ];
    } else if (resourceType.toLowerCase().includes('sql') || resourceType.toLowerCase().includes('database')) {
      metricNames = [
        'cpu_percent',
        'dtu_consumption_percent',
        'connection_successful',
        'storage_percent'
      ];
    } else if (resourceType.toLowerCase().includes('storage')) {
      metricNames = [
        'UsedCapacity',
        'Transactions',
        'Ingress',
        'Egress'
      ];
    }

    // Fetch metrics for each metric name
    for (const metricName of metricNames) {
      try {
        const metricsUrl = `https://management.azure.com${resourceId}/providers/Microsoft.Insights/metrics?api-version=2018-01-01&metricnames=${encodeURIComponent(metricName)}&timespan=${startTime.toISOString()}/${endTime.toISOString()}&interval=PT1H&aggregation=Average`;
        
        const metricsResponse = await fetch(metricsUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json();
          
          if (metricsData.value && metricsData.value.length > 0) {
            const metric = metricsData.value[0];
            if (metric.timeseries && metric.timeseries.length > 0) {
              const data = metric.timeseries[0].data
                ?.filter((point: any) => point.average !== undefined)
                .map((point: any) => ({
                  timestamp: point.timeStamp,
                  value: Math.round((point.average || 0) * 100) / 100
                })) || [];

              if (data.length > 0) {
                metrics.push({
                  name: metricName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                  data,
                  unit: metricName.includes('CPU') || metricName.includes('percent') ? '%' : 
                        metricName.includes('Bytes') || metricName.includes('Capacity') ? 'bytes' : 
                        metricName.includes('Operations') ? 'ops' : 'count',
                  status: 'normal'
                });
              }
            }
          }
        }
      } catch (metricError) {
        console.error(`Error fetching Azure metric ${metricName}:`, metricError);
        // Continue with other metrics
      }
    }
  } catch (error) {
    console.error('Azure Monitor error:', error);
    throw error;
  }

  return metrics;
};

// GCP Monitoring metrics fetching
const getGcpMetrics = async (resourceId: string, resourceType: string, timeRange: string, credentials: any) => {
  const serviceAccountKey = JSON.parse(credentials.serviceAccountKey);
  
  const monitoring = new MonitoringClient({
    projectId: credentials.projectId,
    credentials: serviceAccountKey
  });

  const hours = parseInt(timeRange?.replace('h', '') || '24', 10);
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);

  const metrics = [];

  try {
    // Define metrics based on resource type
    let metricTypes = [];
    
    if (resourceType.toLowerCase().includes('vm') || resourceType.toLowerCase().includes('instance')) {
      metricTypes = [
        'compute.googleapis.com/instance/cpu/utilization',
        'compute.googleapis.com/instance/network/received_bytes_count',
        'compute.googleapis.com/instance/network/sent_bytes_count',
        'compute.googleapis.com/instance/disk/read_ops_count'
      ];
    } else if (resourceType.toLowerCase().includes('sql') || resourceType.toLowerCase().includes('database')) {
      metricTypes = [
        'cloudsql.googleapis.com/database/cpu/utilization',
        'cloudsql.googleapis.com/database/memory/utilization',
        'cloudsql.googleapis.com/database/network/connections'
      ];
    } else if (resourceType.toLowerCase().includes('storage') || resourceType.toLowerCase().includes('bucket')) {
      metricTypes = [
        'storage.googleapis.com/storage/total_bytes',
        'storage.googleapis.com/api/request_count'
      ];
    }

    // Format time objects for Google API
    const endTimeObj = {
      seconds: Math.floor(endTime.getTime() / 1000),
      nanos: (endTime.getTime() % 1000) * 1000000
    };
    
    const startTimeObj = {
      seconds: Math.floor(startTime.getTime() / 1000),
      nanos: (startTime.getTime() % 1000) * 1000000
    };

    // Fetch metrics for each metric type
    for (const metricType of metricTypes) {
      try {
        const filter = `metric.type="${metricType}" AND resource.labels.instance_id="${resourceId}"`;
        
        const [timeSeries] = await monitoring.projectsTimeSeries.list({
          name: `projects/${credentials.projectId}`,
          filter,
          interval: {
            startTime: startTimeObj,
            endTime: endTimeObj,
          },
        });
        
        if (timeSeries && timeSeries.length > 0 && timeSeries[0].points) {
          const metricName = metricType.split('/').pop() || 'unknown';
          const data = timeSeries[0].points
            .map(point => ({
              timestamp: new Date(
                point.interval.startTime.seconds * 1000 +
                point.interval.startTime.nanos / 1000000
              ).toISOString(),
              value: Math.round((point.value.doubleValue || 0) * 100) / 100
            }))
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          
          const unit = metricType.includes('cpu') || metricType.includes('utilization') ? '%' : 
                       metricType.includes('bytes') ? 'bytes' : 
                       metricType.includes('count') ? 'count' : '';
          
          metrics.push({
            name: metricName,
            data,
            unit,
            status: 'normal'
          });
        }
      } catch (metricError) {
        console.error(`Error fetching GCP metric ${metricType}:`, metricError);
        // Continue with other metrics
      }
    }
  } catch (error) {
    console.error('GCP Monitoring error:', error);
    throw error;
  }

  return metrics;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { provider, resourceId, resourceType, timeRange, credentials } = await req.json();
    
    console.log(`Fetching real ${provider} metrics for ${resourceType} resource: ${resourceId}`);
    console.log(`Time range: ${timeRange || '24h'}`);
    
    if (!credentials) {
      throw new Error('Missing credentials for metrics fetching');
    }

    let metrics = [];

    if (provider === 'aws') {
      metrics = await getAwsMetrics(resourceId, resourceType, timeRange, credentials);
    } else if (provider === 'azure') {
      metrics = await getAzureMetrics(resourceId, resourceType, timeRange, credentials);
    } else if (provider === 'gcp') {
      metrics = await getGcpMetrics(resourceId, resourceType, timeRange, credentials);
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }
    
    console.log(`Successfully fetched ${metrics.length} metrics for ${resourceId}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        metrics: metrics
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    return handleError(error, "Error fetching metrics");
  }
});
