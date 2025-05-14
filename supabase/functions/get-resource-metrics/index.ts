
// Edge function to fetch metrics from cloud providers
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// For GCP, we'll use their monitoring API client
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { provider, resourceId, resourceType, timeRange, credentials } = await req.json();
    
    console.log(`Fetching ${provider} metrics for ${resourceType} resource: ${resourceId}`);
    console.log(`Time range: ${timeRange || '24h'}`);
    
    if (provider === 'gcp' && credentials) {
      try {
        // Parse the service account key or throw an error
        let serviceAccountKey;
        try {
          serviceAccountKey = JSON.parse(credentials.serviceAccountKey);
        } catch (parseError) {
          throw new Error("Invalid service account key format: must be valid JSON");
        }

        // Initialize the Google Cloud Monitoring client
        const monitoring = new MonitoringClient({
          projectId: credentials.projectId,
          credentials: serviceAccountKey
        });

        // Set up time range for metrics query
        const hours = parseInt(timeRange?.replace('h', '') || '24', 10);
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);
        
        // Format time objects into Timestamp objects as required by Google API
        const endTimeObj = {
          seconds: Math.floor(endTime.getTime() / 1000),
          nanos: (endTime.getTime() % 1000) * 1000000
        };
        
        const startTimeObj = {
          seconds: Math.floor(startTime.getTime() / 1000),
          nanos: (startTime.getTime() % 1000) * 1000000
        };
        
        // Determine metric types based on resource type
        const metricTypes = [];
        if (resourceType.toLowerCase().includes('vm') || resourceType.toLowerCase().includes('instance')) {
          // CPU utilization for VM instances
          metricTypes.push('compute.googleapis.com/instance/cpu/utilization');
          // Memory usage for VM instances (requires monitoring agent)
          metricTypes.push('agent.googleapis.com/memory/percent_used');
        } else {
          // Generic metrics for other resource types
          metricTypes.push('serviceruntime.googleapis.com/api/request_count');
        }
        
        const metrics = [];
        
        // For each metric type, fetch the time series data
        for (const metricType of metricTypes) {
          try {
            const filter = `metric.type="${metricType}" AND resource.labels.instance_id="${resourceId}"`;
            
            // Query the metrics
            const [timeSeries] = await monitoring.projectsTimeSeries.list({
              name: `projects/${credentials.projectId}`,
              filter,
              interval: {
                startTime: startTimeObj,
                endTime: endTimeObj,
              },
            });
            
            // Process the time series data
            if (timeSeries && timeSeries.length > 0) {
              const metricName = metricType.split('/').pop() || 'unknown';
              const metricData = timeSeries[0].points.map(point => ({
                timestamp: new Date(
                  point.interval.startTime.seconds * 1000 +
                  point.interval.startTime.nanos / 1000000
                ).toISOString(),
                value: parseFloat(point.value.doubleValue.toFixed(2))
              }));
              
              const unit = metricType.includes('cpu') ? '%' : 
                           metricType.includes('memory') ? '%' : 
                           'count';
              
              metrics.push({
                name: metricName,
                data: metricData,
                unit,
                status: 'normal'
              });
            }
          } catch (metricError) {
            console.error(`Error fetching metric ${metricType}:`, metricError);
            // Continue to next metric type
          }
        }
        
        console.log(`Found ${metrics.length} metrics for ${resourceId}`);
        
        // If we couldn't get any real metrics, return empty array rather than failing
        return new Response(
          JSON.stringify({
            success: true,
            metrics: metrics
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      } catch (gcpError) {
        return handleError(gcpError, "Failed to fetch GCP metrics");
      }
    } else if (provider === 'aws' && credentials) {
      // AWS implementation would go here
      // Return mock data for now until implemented
      return new Response(
        JSON.stringify({
          success: true,
          metrics: [],
          message: "AWS metrics integration not yet implemented"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    } else if (provider === 'azure' && credentials) {
      // Azure implementation would go here
      // Return mock data for now until implemented
      return new Response(
        JSON.stringify({
          success: true,
          metrics: [],
          message: "Azure metrics integration not yet implemented"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Unsupported provider: ${provider || "unknown"} or missing credentials`
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
  } catch (error) {
    return handleError(error, "Error processing metrics request");
  }
});
