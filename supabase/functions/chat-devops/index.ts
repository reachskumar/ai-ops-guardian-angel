
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
    
    // Enhanced system prompt for comprehensive DevOps context
    const systemMessage = `You are an advanced AI DevOps assistant with expertise in cloud infrastructure, security, and automation. 

Capabilities:
1. Cloud Provisioning: Provide detailed, actionable guidance for AWS, Azure, and GCP infrastructure setup
2. Security Analysis: Offer comprehensive security scanning and compliance recommendations
3. Monitoring Insights: Interpret and explain infrastructure metrics and performance data
4. Incident Management: Help diagnose, predict, and recommend solutions for system issues
5. IAM and Access Control: Guide users through access management and role-based security

Key Guidelines:
- Always provide step-by-step, implementable solutions
- Explain technical concepts clearly and concisely
- Prioritize security and best practices
- Offer actionable recommendations with potential implementation commands
- Provide context and rationale for each suggestion

Output Format:
- Clear, structured responses
- Code snippets where applicable
- Potential tools or services to achieve the goal
- Risk assessment and mitigation strategies

Constraints:
- Do not generate actual executable code, only provide guidance
- Maintain ethical and secure recommendations
- Avoid overly complex or impractical solutions`;

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
