
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the Azure OpenAI API key and endpoint from environment variables
    const apiKey = Deno.env.get('AZURE_OPENAI_API_KEY');
    const endpoint = Deno.env.get('AZURE_OPENAI_ENDPOINT');
    const deploymentName = Deno.env.get('AZURE_OPENAI_DEPLOYMENT_NAME');

    if (!apiKey || !endpoint || !deploymentName) {
      throw new Error('Missing required Azure OpenAI configuration');
    }

    const { message, history } = await req.json();
    
    // Create system prompt for DevOps context
    const systemMessage = `You are an AI DevOps assistant specialized in cloud infrastructure, security, monitoring, and automation.
    You can help with:
    1. Cloud provisioning (AWS, Azure, GCP)
    2. Security scanning and compliance checks
    3. Monitoring metrics and alerts
    4. Incident management
    5. Infrastructure automation
    6. IAM and access control
    
    When asked to perform actions, respond with detailed steps on how you would execute them.
    For monitoring requests, provide sample commands or queries that would retrieve the requested information.
    For security scans, describe the process and tools that would be used.`;

    // Format chat messages for Azure OpenAI API
    const messages = [
      { role: "system", content: systemMessage },
      ...history.map((msg: any) => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.content,
      })),
      { role: "user", content: message }
    ];

    // API version and deployment/model name
    const apiVersion = '2023-05-15';
    const url = `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages: messages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Azure OpenAI API error:', errorData);
      throw new Error(`Azure OpenAI API returned ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Log the interaction for debugging
    console.log(`User: ${message}`);
    console.log(`AI: ${aiResponse.substring(0, 100)}...`);

    // Return the AI response with CORS headers
    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in chat-devops function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
