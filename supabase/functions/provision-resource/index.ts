
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
  try {
    console.log("Generating JWT for Google Cloud authentication");
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
  } catch (error) {
    console.error("Error generating JWT:", error);
    throw new Error(`Failed to generate JWT: ${error.message}`);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log("Starting resource provisioning request processing");
    const { accountId, resourceType, config, credentials } = await req.json();
    
    if (!accountId || !resourceType || !config) {
      return handleError(
        new Error("Missing required parameters"),
        "Invalid request"
      );
    }
    
    console.log(`Provisioning ${resourceType} resource on account ${accountId}`);
    console.log("Resource configuration:", JSON.stringify(config));
    
    // Handle GCP Compute Engine provisioning
    if (resourceType === 'Compute Engine' || resourceType === 'VM') {
      if (!credentials || !credentials.serviceAccountKey) {
        return handleError(
          new Error("No service account key provided"),
          "GCP credentials missing"
        );
      }
      
      try {
        console.log("Starting GCP VM provisioning process");
        
        // Parse service account key
        let serviceAccountKey;
        try {
          serviceAccountKey = typeof credentials.serviceAccountKey === 'string' 
            ? JSON.parse(credentials.serviceAccountKey)
            : credentials.serviceAccountKey;
            
          console.log("Successfully parsed service account key");
        } catch (parseError) {
          console.error("Failed to parse service account key:", parseError);
          throw new Error("Invalid service account key format: must be valid JSON");
        }
        
        // Validate service account key has required fields
        if (!serviceAccountKey.project_id || !serviceAccountKey.private_key) {
          throw new Error("Invalid service account key: missing required fields");
        }
        
        // Get GCP OAuth token using JWT
        console.log("Requesting OAuth token from Google");
        const jwt = await generateJWT(serviceAccountKey);
        console.log("JWT generated successfully");
        
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: jwt
          })
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error("OAuth token response error:", errorText);
          throw new Error(`Failed to get OAuth token: ${errorText}`);
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;
        console.log("Successfully obtained OAuth access token");
        
        // Initialize the Google Cloud Compute client
        console.log("Initializing Google Cloud Compute client");
        const compute = new Compute({
          projectId: serviceAccountKey.project_id,
          credentials: serviceAccountKey,
          auth: {
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
            token: accessToken
          }
        });
        
        // Extract zone and machine type from config
        const zone = config.region || 'us-central1-a';
        const machineType = config.size || 'e2-micro';
        const vmName = config.name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
        
        console.log(`Creating VM "${vmName}" in zone ${zone} with machine type ${machineType}`);
        
        // Get the zone object
        const zoneObj = compute.zone(zone);
        
        // VM creation options
        const vmOptions = {
          os: 'debian-cloud',
          http: true,
          machineType: machineType,
          metadata: {
            items: [
              {
                key: 'startup-script',
                value: '#!/bin/bash\necho "Startup completed" > /tmp/startup-completed.txt'
              }
            ]
          }
        };
        
        if (config.tags && Object.keys(config.tags).length > 0) {
          vmOptions.tags = Object.keys(config.tags);
        }
        
        // Create the VM
        console.log("Calling GCP API to create VM");
        try {
          const [vm, operation] = await zoneObj.createVM(vmName, vmOptions);
          console.log("VM creation initiated successfully");
          
          // Generate a resource ID with the GCP prefix
          const resourceId = `gcp-vm-${vm.name || vm.id}`;
          
          return new Response(
            JSON.stringify({
              success: true,
              resourceId,
              message: `Successfully started VM creation: ${vmName}`,
              details: {
                name: vm.name,
                zone: zone,
                machineType: machineType,
                project: serviceAccountKey.project_id
              }
            }),
            { 
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
          );
        } catch (vmError) {
          console.error("VM creation error:", vmError);
          return handleError(vmError, "Failed to create VM");
        }
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
