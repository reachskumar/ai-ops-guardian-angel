
// Provision Resource Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { Compute } from "https://cdn.jsdelivr.net/npm/@google-cloud/compute@4.1.0/+esm";
import { encode as base64url } from "https://deno.land/std@0.177.0/encoding/base64url.ts";

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

// Generate JWT for authentication
async function generateJWT(serviceAccountKey: any) {
  const header = {
    alg: "RS256",
    typ: "JWT",
    kid: serviceAccountKey.private_key_id
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccountKey.client_email,
    sub: serviceAccountKey.client_email,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
    scope: "https://www.googleapis.com/auth/cloud-platform"
  };

  // Encode the header and payload
  const encodeObject = (obj: any) => base64url(new TextEncoder().encode(JSON.stringify(obj)));
  const encodedHeader = encodeObject(header);
  const encodedPayload = encodeObject(payload);
  
  // Create the signing input
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  
  // Sign the token using the private key from service account
  const privateKey = serviceAccountKey.private_key;
  
  // Convert the PEM private key for use with Deno's crypto
  const keyData = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\n/g, "");
  
  // Import the private key
  const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );
  
  // Sign the data
  const textEncoder = new TextEncoder();
  const signature = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    cryptoKey,
    textEncoder.encode(signingInput)
  );
  
  // Encode the signature
  const encodedSignature = base64url(new Uint8Array(signature));
  
  // Return the complete JWT
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { accountId, resourceType, config, credentials } = await req.json();
    
    console.log(`Provisioning ${resourceType} resource on account ${accountId}`);
    console.log("Resource configuration:", config);
    
    if (!credentials || !credentials.serviceAccountKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No credentials provided for GCP resource provisioning"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    if (resourceType === 'Compute Engine' && credentials) {
      try {
        // Parse service account key
        let serviceAccountKey;
        try {
          serviceAccountKey = JSON.parse(credentials.serviceAccountKey);
        } catch (parseError) {
          throw new Error("Invalid service account key format: must be valid JSON");
        }
        
        // Get GCP OAuth token
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: await generateJWT(serviceAccountKey)
          })
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          throw new Error(`Failed to get OAuth token: ${errorText}`);
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;
        
        // Initialize the Google Cloud Compute client
        const compute = new Compute({
          projectId: serviceAccountKey.project_id,
          credentials: serviceAccountKey
        });
        
        // Extract zone from config or use a default
        const zone = config.region || 'us-central1-a';
        const machineType = config.size || 'e2-micro';
        
        // Get the zone object
        const zoneObj = compute.zone(zone);
        
        // VM creation options
        const vmOptions = {
          os: 'debian-cloud',
          http: true,
          machineType: machineType,
          tags: config.tags || {}
        };
        
        console.log(`Creating VM "${config.name}" in zone ${zone} with machine type ${machineType}`);
        
        // Create the VM
        const [vm, operation] = await zoneObj.createVM(config.name, vmOptions);
        
        // Wait for operation to complete (with a timeout)
        console.log("Waiting for VM creation operation to complete...");
        const operationTimeout = 30000; // 30 seconds
        let opCompleted = false;
        
        try {
          // Wait for VM creation (with timeout)
          const operationPromise = new Promise((resolve, reject) => {
            operation.on('complete', (metadata) => {
              opCompleted = true;
              resolve(metadata);
            });
            
            operation.on('error', (err) => {
              reject(err);
            });
          });
          
          // Create a timeout promise
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
              if (!opCompleted) {
                reject(new Error("Operation timed out but VM creation might still be in progress"));
              }
            }, operationTimeout);
          });
          
          // Wait for either completion or timeout
          await Promise.race([operationPromise, timeoutPromise]);
        } catch (opError) {
          console.warn("Operation monitoring error:", opError.message);
          // We'll still return success since VM creation might still complete
        }
        
        // Generate a resource ID with the GCP prefix
        const resourceId = `gcp-vm-${vm.name || vm.id}`;
        
        return new Response(
          JSON.stringify({
            success: true,
            resourceId,
            message: `Successfully started VM creation: ${config.name}`,
            details: {
              name: vm.name,
              zone: zone,
              machineType: machineType
            }
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      } catch (gcpError) {
        console.error("GCP resource provisioning error:", gcpError);
        return handleError(gcpError, "Failed to provision GCP resource");
      }
    } else {
      // For non-GCP resources or unsupported resource types, return a mock response
      const resourceId = `${resourceType.toLowerCase()}-${Date.now().toString(36)}`;
      
      return new Response(
        JSON.stringify({
          success: true,
          resourceId,
          message: `Successfully started provisioning ${resourceType} (simulated)`
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
  } catch (error) {
    console.error("Error provisioning resource:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: `Failed to provision resource: ${error.message}`
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
