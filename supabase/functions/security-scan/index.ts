
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
  action?: string;
  scanner?: {
    name: string;
    type: string;
    url: string;
  };
}

const SCANNER_ADAPTERS = {
  // These adapters would make actual API calls to the respective scanner APIs in production
  trivy: {
    scan: async (target: string, options: Record<string, any>) => {
      console.log(`Connecting to Trivy to scan ${target} with options:`, options);
      // In production: actual HTTP call to Trivy API
      return mockScanResults("trivy");
    },
    connect: async (url: string) => {
      console.log(`Testing connection to Trivy at ${url}`);
      // In production: actual HTTP call to test Trivy API connection
      return { success: true, version: "0.38.1" };
    }
  },
  "owasp-zap": {
    scan: async (target: string, options: Record<string, any>) => {
      console.log(`Connecting to OWASP ZAP to scan ${target} with options:`, options);
      // In production: actual HTTP call to ZAP API
      return mockScanResults("owasp-zap");
    },
    connect: async (url: string) => {
      console.log(`Testing connection to OWASP ZAP at ${url}`);
      // In production: actual HTTP call to test ZAP API connection
      return { success: true, version: "2.14.0" };
    }
  },
  openvas: {
    scan: async (target: string, options: Record<string, any>) => {
      console.log(`Connecting to OpenVAS to scan ${target} with options:`, options);
      // In production: actual HTTP call to OpenVAS API
      return mockScanResults("openvas");
    },
    connect: async (url: string) => {
      console.log(`Testing connection to OpenVAS at ${url}`);
      // In production: actual HTTP call to test OpenVAS API connection
      return { success: true, version: "22.4.0" };
    }
  }
};

function mockScanResults(engine: string) {
  // Generate mock vulnerabilities based on the scanning engine
  const engineSpecificVulns = {
    "trivy": ["CVE-2023-4567", "CVE-2023-5678", "CVE-2023-6789"],
    "owasp-zap": ["XSS-2023-001", "SQLI-2023-002", "CSRF-2023-003"],
    "openvas": ["OV-2023-1234", "OV-2023-5678", "OV-2023-9012"]
  };

  const vulnCount = Math.floor(Math.random() * 10) + 1;
  const vulnerabilities = [];
  const severities = ['critical', 'high', 'medium', 'low'];
  const components = ['web-server', 'database', 'api', 'auth-service', 'load-balancer', 'container-runtime'];
  
  const engineVulns = engineSpecificVulns[engine as keyof typeof engineSpecificVulns] || [];
  
  for (let i = 0; i < vulnCount; i++) {
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const component = components[Math.floor(Math.random() * components.length)];
    const vulnId = engineVulns[Math.floor(Math.random() * engineVulns.length)] || `CVE-2023-${Math.floor(1000 + Math.random() * 9000)}`;
    
    vulnerabilities.push({
      vulnerability_id: vulnId,
      title: `${engine} found ${severity} vulnerability in ${component}`,
      description: `This is a simulated ${severity} vulnerability found in the ${component} component by ${engine}.`,
      severity,
      affected_component: component,
      cvss_score: severity === 'critical' ? 9.5 : 
                 severity === 'high' ? 7.5 : 
                 severity === 'medium' ? 5.5 : 3.5,
      remediation_steps: `Update the affected component or apply the security patch from the vendor.`
    });
  }

  return {
    scan_id: `${engine}-${Date.now()}`,
    vulnerabilities,
    summary: {
      total: vulnerabilities.length,
      by_severity: {
        critical: vulnerabilities.filter(v => v.severity === 'critical').length,
        high: vulnerabilities.filter(v => v.severity === 'high').length,
        medium: vulnerabilities.filter(v => v.severity === 'medium').length,
        low: vulnerabilities.filter(v => v.severity === 'low').length
      }
    }
  };
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
    const requestData = await req.json() as ScanRequest;
    
    // Handle special actions
    if (requestData.action === "connect-scanner") {
      console.log(`Received connection test request for scanner: ${requestData.scanner?.type}`);
      
      if (!requestData.scanner || !requestData.scanner.type || !requestData.scanner.url) {
        throw new Error("Missing scanner information");
      }

      const scannerType = requestData.scanner.type;
      const adapter = SCANNER_ADAPTERS[scannerType as keyof typeof SCANNER_ADAPTERS];
      
      if (!adapter) {
        throw new Error(`Unsupported scanner type: ${scannerType}`);
      }
      
      try {
        // Test connection to the scanner
        const connectionResult = await adapter.connect(requestData.scanner.url);
        
        return new Response(
          JSON.stringify({
            message: "Scanner connection successful",
            scanner: requestData.scanner.name,
            version: connectionResult.version
          }),
          { 
            headers: { 
              ...corsHeaders,
              "Content-Type": "application/json" 
            } 
          }
        );
      } catch (error) {
        throw new Error(`Failed to connect to ${requestData.scanner.name}: ${error.message}`);
      }
    }

    // Standard scan request
    const { scanType, targetType, targetIdentifier, scanEngine, parameters } = requestData;
    
    console.log(`Initiating ${scanType} scan on ${targetType} ${targetIdentifier} using ${scanEngine}`);

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

    // For integrated scanners, try to call the appropriate adapter
    if (Object.keys(SCANNER_ADAPTERS).includes(scanEngine)) {
      console.log(`Using ${scanEngine} adapter for scanning ${targetIdentifier}`);
      
      // In a real implementation, we'd call the scanner API
      // For demo purposes, we'll use the mock adapter
      try {
        const adapter = SCANNER_ADAPTERS[scanEngine as keyof typeof SCANNER_ADAPTERS];
        const target = targetIdentifier;
        const scanParams = parameters || {};
        
        // Start the scan asynchronously
        EdgeRuntime.waitUntil((async () => {
          try {
            console.log(`Starting async scan with ${scanEngine} adapter`);
            const scanResults = await adapter.scan(target, scanParams);
            
            // Process vulnerabilities from the scanner
            const vulnerabilities = scanResults.vulnerabilities.map((v: any) => ({
              scan_id: scanData.id,
              vulnerability_id: v.vulnerability_id,
              title: v.title,
              description: v.description,
              severity: v.severity,
              cvss_score: v.cvss_score,
              affected_component: v.affected_component,
              remediation_steps: v.remediation_steps,
              status: 'open',
            }));
            
            // Insert vulnerabilities into database
            if (vulnerabilities.length > 0) {
              const { error } = await supabase
                .from('vulnerabilities')
                .insert(vulnerabilities);
              
              if (error) {
                console.error("Error inserting vulnerabilities:", error);
                throw error;
              }
            }
            
            // Update scan status
            await supabase
              .from('security_scans')
              .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                summary: scanResults.summary,
                raw_result: { vulnerabilities: scanResults.vulnerabilities }
              })
              .eq('id', scanData.id);
              
            console.log(`Scanner ${scanEngine} completed scan with ${vulnerabilities.length} findings`);
          } catch (error) {
            console.error(`Error in ${scanEngine} scan:`, error);
            
            // Update scan to failed status
            await supabase
              .from('security_scans')
              .update({
                status: 'failed',
                error_message: `Scanner error: ${error.message}`,
                completed_at: new Date().toISOString()
              })
              .eq('id', scanData.id);
          }
        })());
        
      } catch (error) {
        console.error(`Error initializing ${scanEngine} scan:`, error);
        throw error;
      }
    } else {
      // Fallback to simulated scan for unsupported engines
      console.log("Using simulated scan for unsupported engine:", scanEngine);
      
      // Simulate the scan process (in reality, this would be a webhook or callback from the scanning tool)
      EdgeRuntime.waitUntil((async () => {
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
              remediation_steps: "Update affected component to the latest version."
            });
          }

          // Insert vulnerabilities
          if (vulnerabilities.length > 0) {
            const { error: vulnError } = await supabase
              .from('vulnerabilities')
              .insert(vulnerabilities);

            if (vulnError) {
              console.error("Error inserting vulnerabilities:", vulnError);
              throw vulnError;
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
            throw updateError;
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
      })());
    }

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
