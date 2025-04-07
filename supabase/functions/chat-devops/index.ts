
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
    // Get the OpenAI API key from environment variables
    const apiKey = Deno.env.get('OPENAI_API_KEY');

    if (!apiKey) {
      throw new Error('Missing required OpenAI API key');
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

    // Format chat messages for OpenAI API
    const messages = [
      { role: "system", content: systemMessage },
      ...history.map((msg) => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.content,
      })),
      { role: "user", content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API returned ${response.status}: ${errorData}`);
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
