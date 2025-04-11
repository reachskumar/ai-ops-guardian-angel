
// Get Resource Metrics Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

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

        console.log("Successfully parsed service account key");
        
        // Instead of using the Google Cloud Monitoring client directly,
        // we'll generate simulated metrics for now, with realistic values
        // based on the resourceId, timeRange, and other parameters.
        
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

        // Extract VM name from resourceId for more targeted simulations
        const vmName = resourceId.replace('gcp-vm-', '');
        
        // Get a deterministic but seemingly random value based on resourceId and timestamp
        const getResourceValue = (base: number, variance: number, timestamp: string, seed: string) => {
          // Create a simple hash from the seed and timestamp
          const hash = [...seed, ...timestamp].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 1000, 0) / 1000;
          return Math.floor(base + (hash * variance * 2) - variance);
        };

        // Create realistic metrics data based on VM name
        const cpuMetric = {
          name: 'cpu',
          data: timePoints.map(timestamp => ({
            timestamp,
            value: getResourceValue(40, 20, timestamp, vmName) // Base 40%, variance ±20%
          })),
          unit: '%',
          status: 'normal'
        };

        const memoryMetric = {
          name: 'memory',
          data: timePoints.map(timestamp => ({
            timestamp,
            value: getResourceValue(55, 15, timestamp, vmName + '1') // Base 55%, variance ±15%
          })),
          unit: '%',
          status: 'normal'
        };

        const diskMetric = {
          name: 'disk',
          data: timePoints.map(timestamp => ({
            timestamp,
            value: getResourceValue(200, 100, timestamp, vmName + '2') // Base 200, variance ±100 IOPS
          })),
          unit: 'IOPS',
          status: 'normal'
        };

        const networkMetric = {
          name: 'network',
          data: timePoints.map(timestamp => ({
            timestamp,
            value: getResourceValue(30, 20, timestamp, vmName + '3') // Base 30, variance ±20 Mbps
          })),
          unit: 'Mbps',
          status: 'normal'
        };

        // Determine status based on highest values
        cpuMetric.status = Math.max(...cpuMetric.data.map(d => d.value)) > 80 ? 'warning' : 'normal';
        memoryMetric.status = Math.max(...memoryMetric.data.map(d => d.value)) > 85 ? 'warning' : 'normal';

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
