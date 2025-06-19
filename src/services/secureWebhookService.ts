
import { supabase } from '@/integrations/supabase/client';
import { sanitizeUrl, generateWebhookSecret, validateWebhookUrl } from './securityService';

export interface SecureWebhookConfig {
  id?: string;
  url: string;
  secretKey: string;
  isVerified: boolean;
  events: string[];
}

export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
  signature?: string;
}

// Create secure webhook signature
const createWebhookSignature = (payload: string, secret: string): string => {
  // Note: crypto.createHmac is not available in browsers, using Web Crypto API instead
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);
  
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  ).then(key => 
    crypto.subtle.sign('HMAC', key, messageData)
  ).then(signature => 
    Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  ).catch(() => 'signature-generation-failed');
};

// Send secure webhook with proper authentication
export const sendSecureWebhook = async (
  config: SecureWebhookConfig,
  payload: WebhookPayload
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Validate and sanitize URL
    const sanitizedUrl = sanitizeUrl(config.url);
    
    // Add timestamp and create signature
    const timestampedPayload = {
      ...payload,
      timestamp: new Date().toISOString()
    };
    
    const payloadString = JSON.stringify(timestampedPayload);
    const signature = await createWebhookSignature(payloadString, config.secretKey);
    
    const response = await fetch(sanitizedUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DevOps-Provisioning-System/1.0',
        'X-Webhook-Signature': `sha256=${signature}`,
        'X-Webhook-Timestamp': timestampedPayload.timestamp,
        'X-Webhook-Event': payload.event
      },
      body: payloadString,
      // Timeout after 30 seconds
      signal: AbortSignal.timeout(30000)
    });
    
    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Secure webhook failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Store webhook configuration securely
export const storeWebhookConfig = async (
  url: string,
  events: string[] = []
): Promise<{ success: boolean; config?: SecureWebhookConfig; error?: string }> => {
  try {
    const sanitizedUrl = sanitizeUrl(url);
    const secretKey = generateWebhookSecret();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User authentication required' };
    }
    
    // Validate webhook URL
    const validation = await validateWebhookUrl(sanitizedUrl, secretKey);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }
    
    // Store in database
    const { data, error } = await supabase
      .from('webhook_configs')
      .insert({
        user_id: user.id,
        webhook_url: sanitizedUrl,
        secret_key: secretKey,
        is_verified: true,
        last_verified_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return {
      success: true,
      config: {
        id: data.id,
        url: sanitizedUrl,
        secretKey,
        isVerified: true,
        events
      }
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to store webhook configuration'
    };
  }
};

// Get user's webhook configurations
export const getUserWebhookConfigs = async (): Promise<SecureWebhookConfig[]> => {
  try {
    const { data, error } = await supabase
      .from('webhook_configs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Failed to fetch webhook configs:', error);
      return [];
    }
    
    return data.map(config => ({
      id: config.id,
      url: config.webhook_url,
      secretKey: config.secret_key,
      isVerified: config.is_verified,
      events: [] // Would be stored in a separate table in production
    }));
  } catch (error) {
    console.error('Failed to fetch webhook configs:', error);
    return [];
  }
};
