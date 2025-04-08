
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScanRequest {
  scanType: string;
  targetType: string;
  targetIdentifier: string;
  scanEngine: string;
  parameters?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse the request body
    const { scanType, targetType, targetIdentifier, scanEngine, parameters } = await req.json() as ScanRequest;
    
    console.log(`Initiating ${scanType} scan on ${targetType} ${targetIdentifier} using ${scanEngine}`);

    // In a real implementation, we'd make API calls to the actual scanning tool
    // For this example, we'll simulate the scan with a delay and random findings

    // Create scan configuration if it doesn't exist
    const { data: configData, error: configError } = await supabase
      .from('security_scan_configurations')
      .insert({
        name: `${scanType} scan for ${targetIdentifier}`,
        description: `Automated ${scanType} scan initiated via API`,
        scan_type: scanType,
        target_type: targetType,
        target_identifier: targetIdentifier,
        scan_engine: scanEngine,
        scan_parameters: parameters || {},
      })
      .select()
      .single();

    if (configError) {
      console.error("Error creating scan configuration:", configError);
      throw configError;
    }

    // Create a new scan record
    const { data: scanData, error: scanError } = await supabase
      .from('security_scans')
      .insert({
        configuration_id: configData.id,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (scanError) {
      console.error("Error creating scan record:", scanError);
      throw scanError;
    }

    // Simulate the scan process (in reality, this would be a webhook or callback from the scanning tool)
    // For demo purposes, we'll update the scan status to completed after a short delay
    setTimeout(async () => {
      try {
        // Generate mock scan results
        const vulnerabilityCount = Math.floor(Math.random() * 10) + 1;
        const vulnerabilities = [];
        const severities = ['critical', 'high', 'medium', 'low'];
        const components = ['web-server', 'database', 'api', 'auth-service', 'load-balancer'];
        
        for (let i = 0; i < vulnerabilityCount; i++) {
          const severity = severities[Math.floor(Math.random() * severities.length)];
          const component = components[Math.floor(Math.random() * components.length)];
          
          vulnerabilities.push({
            scan_id: scanData.id,
            vulnerability_id: `CVE-2023-${Math.floor(1000 + Math.random() * 9000)}`,
            title: `Sample ${severity} vulnerability in ${component}`,
            description: `This is a simulated ${severity} vulnerability found in the ${component} component.`,
            severity,
            affected_component: component,
            cvss_score: severity === 'critical' ? 9.5 : 
                       severity === 'high' ? 7.5 : 
                       severity === 'medium' ? 5.5 : 3.5,
          });
        }

        // Insert vulnerabilities
        if (vulnerabilities.length > 0) {
          const { error: vulnError } = await supabase
            .from('vulnerabilities')
            .insert(vulnerabilities);

          if (vulnError) {
            console.error("Error inserting vulnerabilities:", vulnError);
          }
        }

        // Update scan status
        const scanSummary = {
          total: vulnerabilityCount,
          by_severity: {
            critical: vulnerabilities.filter(v => v.severity === 'critical').length,
            high: vulnerabilities.filter(v => v.severity === 'high').length,
            medium: vulnerabilities.filter(v => v.severity === 'medium').length,
            low: vulnerabilities.filter(v => v.severity === 'low').length
          }
        };

        const { error: updateError } = await supabase
          .from('security_scans')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            summary: scanSummary,
            raw_result: { vulnerabilities }
          })
          .eq('id', scanData.id);

        if (updateError) {
          console.error("Error updating scan status:", updateError);
        } else {
          console.log(`Scan ${scanData.id} completed with ${vulnerabilityCount} findings.`);
        }
      } catch (error) {
        console.error("Error in scan simulation:", error);
        
        // Update scan to failed status
        await supabase
          .from('security_scans')
          .update({
            status: 'failed',
            error_message: error.message,
            completed_at: new Date().toISOString()
          })
          .eq('id', scanData.id);
      }
    }, 5000); // Simulate a 5-second scan process

    // Return the initial scan data to the client
    return new Response(
      JSON.stringify({
        message: "Scan initiated successfully",
        scan_id: scanData.id,
        status: "in_progress"
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An error occurred while processing the scan request" 
      }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
