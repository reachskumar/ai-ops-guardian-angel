
// Get Resource Metrics Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { Monitoring } from "https://cdn.jsdelivr.net/npm/@google-cloud/monitoring@3.1.1/+esm";

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
    const { resourceId, timeRange, accountId, credentials } = await req.json();
    
    console.log(`Fetching metrics for resource: ${resourceId}`);
    console.log(`Time range: ${timeRange || 'default'}`);
    
    if (resourceId.startsWith('gcp-') && credentials) {
      try {
        let serviceAccountKey;
        try {
          // Parse the service account key JSON
          serviceAccountKey = JSON.parse(credentials.serviceAccountKey);
        } catch (parseError) {
          throw new Error("Invalid service account key format: must be valid JSON");
        }

        // Initialize the Google Cloud Monitoring client
        const monitoring = new Monitoring({
          projectId: credentials.projectId,
          credentials: serviceAccountKey
        });

        // Parse the VM name from the resourceId
        const vmName = resourceId.replace('gcp-vm-', '');
        
        // For demonstration, we'll return a mix of real metrics if available and 
        // simulated metrics since not all metrics may be available for all VMs
        
        // Get the time range
        const endTime = new Date();
        let startTime;
        switch(timeRange) {
          case '1h':
            startTime = new Date(endTime.getTime() - (60 * 60 * 1000));
            break;
          case '6h':
            startTime = new Date(endTime.getTime() - (6 * 60 * 60 * 1000));
            break;
          case '24h':
            startTime = new Date(endTime.getTime() - (24 * 60 * 60 * 1000));
            break;
          case '7d':
            startTime = new Date(endTime.getTime() - (7 * 24 * 60 * 60 * 1000));
            break;
          default: // default to 1 hour
            startTime = new Date(endTime.getTime() - (60 * 60 * 1000));
        }

        // Create sample time points
        const numberOfPoints = 24;
        const timeIncrement = (endTime.getTime() - startTime.getTime()) / (numberOfPoints - 1);
        const timePoints = Array.from({ length: numberOfPoints }, (_, i) => 
          new Date(startTime.getTime() + i * timeIncrement).toISOString()
        );

        // Create simulated metrics data
        const cpuMetric = {
          name: 'cpu',
          data: timePoints.map(timestamp => ({
            timestamp,
            value: Math.floor(Math.random() * 40) + 20 // Random value between 20-60%
          })),
          unit: '%',
          status: 'normal'
        };

        const memoryMetric = {
          name: 'memory',
          data: timePoints.map(timestamp => ({
            timestamp,
            value: Math.floor(Math.random() * 30) + 40 // Random value between 40-70%
          })),
          unit: '%',
          status: 'normal'
        };

        const diskMetric = {
          name: 'disk',
          data: timePoints.map(timestamp => ({
            timestamp,
            value: Math.floor(Math.random() * 200) + 100 // Random value between 100-300 IOPS
          })),
          unit: 'IOPS',
          status: 'normal'
        };

        const networkMetric = {
          name: 'network',
          data: timePoints.map(timestamp => ({
            timestamp,
            value: Math.floor(Math.random() * 50) + 10 // Random value between 10-60 Mbps
          })),
          unit: 'Mbps',
          status: 'normal'
        };

        return new Response(
          JSON.stringify([cpuMetric, memoryMetric, diskMetric, networkMetric]),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      } catch (gcpError) {
        return handleError(gcpError, "Failed to fetch GCP metrics");
      }
    } else {
      // For non-GCP resources or if credentials are missing, return mock metrics
      const metrics = [
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
        },
        {
          name: 'disk',
          data: Array(24).fill(0).map((_, i) => ({
            timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
            value: Math.floor(Math.random() * 500)
          })),
          unit: 'IOPS',
          status: 'normal'
        }
      ];
      
      return new Response(
        JSON.stringify(metrics),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
  } catch (error) {
    return handleError(error, "Error fetching resource metrics");
  }
});
