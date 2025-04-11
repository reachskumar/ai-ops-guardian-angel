
// Get Resource Metrics Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface MetricDataPoint {
  timestamp: string;
  value: number;
}

interface ResourceMetric {
  name: string;
  data: MetricDataPoint[];
  unit: string;
  status?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { resourceId } = await req.json();
    
    console.log(`Fetching metrics for resource: ${resourceId}`);
    
    // Here you would:
    // 1. Determine the cloud provider and account for this resource
    // 2. Fetch credentials for the account
    // 3. Connect to the cloud provider's metrics API
    // 4. Get and format metrics data
    
    // For now, we'll return mock metrics that match the ResourceMetric interface
    const metrics: ResourceMetric[] = [
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
      },
      {
        name: 'network',
        data: Array(24).fill(0).map((_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
          value: Math.floor(Math.random() * 100)
        })),
        unit: 'Mbps',
        status: 'normal'
      }
    ];
    
    return new Response(
      JSON.stringify(metrics),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error fetching resource metrics:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: `Failed to fetch metrics: ${error.message}`
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
