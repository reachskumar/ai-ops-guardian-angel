
// Edge function to provide detailed cost breakdown analysis
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
    const { timeRange = '30d', dimension = 'service' } = await req.json();
    
    console.log(`Fetching cost breakdown by ${dimension} for time range: ${timeRange}`);
    
    // Mock comprehensive cost breakdown data
    // In a real implementation, this would aggregate data from all connected cloud providers
    
    const byService = [
      { name: 'EC2/Virtual Machines', cost: 485.75, percentage: 42 },
      { name: 'Storage (S3/Blob/Cloud Storage)', cost: 280.50, percentage: 24 },
      { name: 'Database Services', cost: 195.25, percentage: 17 },
      { name: 'Networking & CDN', cost: 125.80, percentage: 11 },
      { name: 'Lambda/Functions', cost: 72.30, percentage: 6 }
    ];
    
    const byRegion = [
      { name: 'US East (N. Virginia)', cost: 420.25, percentage: 36 },
      { name: 'US West (Oregon)', cost: 315.80, percentage: 27 },
      { name: 'Europe (Ireland)', cost: 230.45, percentage: 20 },
      { name: 'Asia Pacific (Tokyo)', cost: 145.70, percentage: 13 },
      { name: 'Other Regions', cost: 47.40, percentage: 4 }
    ];
    
    const byAccount = [
      { name: 'Production Account', cost: 720.50, percentage: 62 },
      { name: 'Development Account', cost: 285.75, percentage: 25 },
      { name: 'Staging Account', cost: 153.35, percentage: 13 }
    ];

    const byTag = [
      { tagKey: 'Environment', tagValue: 'production', cost: 695.25, percentage: 60 },
      { tagKey: 'Environment', tagValue: 'development', cost: 285.80, percentage: 25 },
      { tagKey: 'Environment', tagValue: 'staging', cost: 178.55, percentage: 15 },
      
      { tagKey: 'Department', tagValue: 'engineering', cost: 580.40, percentage: 50 },
      { tagKey: 'Department', tagValue: 'data-science', cost: 347.25, percentage: 30 },
      { tagKey: 'Department', tagValue: 'marketing', cost: 231.95, percentage: 20 },
      
      { tagKey: 'Team', tagValue: 'platform', cost: 463.20, percentage: 40 },
      { tagKey: 'Team', tagValue: 'backend', cost: 347.40, percentage: 30 },
      { tagKey: 'Team', tagValue: 'frontend', cost: 231.60, percentage: 20 },
      { tagKey: 'Team', tagValue: 'mobile', cost: 115.80, percentage: 10 }
    ];

    const byProvider = [
      { name: 'AWS', cost: 580.75, percentage: 50 },
      { name: 'Azure', cost: 405.25, percentage: 35 },
      { name: 'Google Cloud', cost: 173.60, percentage: 15 }
    ];
    
    console.log('Successfully generated comprehensive cost breakdown');
    
    return new Response(
      JSON.stringify({
        success: true,
        byService,
        byRegion,
        byAccount,
        byTag,
        byProvider,
        timeRange,
        totalCost: 1159.60
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    return handleError(error, "Error fetching cost breakdown");
  }
});
