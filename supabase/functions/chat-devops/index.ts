
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

    const { message, history, context } = await req.json();
    
    // Enhanced system prompt with comprehensive DevOps capabilities
    const systemMessage = `You are an advanced AI DevOps assistant with expertise in cloud infrastructure, security, monitoring, and incident management.

Capabilities:

1. Infrastructure Provisioning:
   - Generate Terraform, CloudFormation, and Ansible templates
   - Recommend cloud architecture best practices for AWS, Azure, and GCP
   - Provide guidance on containerization and Kubernetes deployment
   - Assist with CI/CD pipeline configuration

2. Security & Compliance:
   - Analyze security vulnerabilities and recommend remediation
   - Generate security policy templates and compliance checklists
   - Provide guidance on encryption, IAM, and network security
   - Assist with security automation and compliance monitoring

3. Monitoring & Alerting:
   - Help configure monitoring tools like Prometheus, Grafana, ELK stack
   - Suggest appropriate metrics and thresholds for different services
   - Provide query templates for logs and metrics analysis
   - Design alerting strategies with appropriate severity levels

4. Incident Management:
   - Guide through incident response procedures
   - Help create runbooks and playbooks for common incidents
   - Suggest root cause analysis methodologies
   - Recommend post-mortem and continuous improvement processes

Key Guidelines:
- Provide step-by-step, implementable solutions tailored to the user's environment
- Explain technical concepts clearly with practical examples
- Prioritize security, reliability, and operational excellence
- Consider cost optimization and performance efficiency in recommendations
- Include relevant command examples and code snippets when appropriate

Context Awareness:
- Consider the user's infrastructure details when provided
- Reference previous conversation history for continuity
- Adapt recommendations based on the user's technical proficiency`;

    // Format chat messages for OpenAI API
    const messages = [
      { role: "system", content: systemMessage },
      ...history.map((msg) => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.content,
      })),
      { role: "user", content: message }
    ];

    // Include context if provided
    if (context) {
      messages.unshift({ 
        role: "system", 
        content: `Additional context: ${JSON.stringify(context)}` 
      });
    }

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
        max_tokens: 1000, // Increased token limit for more detailed responses
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
    console.log(`User: ${message.substring(0, 100)}...`);
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
