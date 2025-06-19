
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface ApiKeyValidation {
  isValid: boolean;
  userId?: string;
  permissions?: string[];
  rateLimit?: number;
  error?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingRequests?: number;
  resetTime?: Date;
}

// JWT Token validation
export const validateJWTToken = async (token: string): Promise<{ user: User | null; error: string | null }> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      return { user: null, error: error.message };
    }
    
    if (!user) {
      return { user: null, error: 'Invalid token' };
    }
    
    return { user, error: null };
  } catch (error) {
    return { user: null, error: 'Token validation failed' };
  }
};

// Input sanitization functions
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .slice(0, 1000); // Limit length
};

export const sanitizeEmail = (email: string): string => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitized = sanitizeInput(email);
  return emailRegex.test(sanitized) ? sanitized : '';
};

export const sanitizeUrl = (url: string): string => {
  try {
    const sanitized = sanitizeInput(url);
    const parsed = new URL(sanitized);
    
    // Only allow HTTPS URLs for webhooks
    if (parsed.protocol !== 'https:') {
      throw new Error('Only HTTPS URLs are allowed');
    }
    
    // Block localhost and private IPs for webhooks
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.match(/^172\.(1[6-9]|2[0-9]|3[01])\./)
    ) {
      throw new Error('Private network URLs are not allowed');
    }
    
    return parsed.toString();
  } catch (error) {
    throw new Error('Invalid URL format');
  }
};

// Validate API key
export const validateApiKey = async (apiKey: string): Promise<ApiKeyValidation> => {
  try {
    const { data, error } = await supabase.rpc('validate_api_key', {
      p_api_key: apiKey
    });
    
    if (error) {
      return { isValid: false, error: error.message };
    }
    
    if (!data || data.length === 0) {
      return { isValid: false, error: 'Invalid API key' };
    }
    
    const keyData = data[0];
    
    // Safely handle permissions JSONB field
    let permissions: string[] = [];
    if (keyData.permissions) {
      if (Array.isArray(keyData.permissions)) {
        permissions = keyData.permissions as string[];
      } else if (typeof keyData.permissions === 'string') {
        try {
          const parsed = JSON.parse(keyData.permissions);
          permissions = Array.isArray(parsed) ? parsed : [];
        } catch {
          permissions = [];
        }
      }
    }
    
    return {
      isValid: true,
      userId: keyData.user_id,
      permissions,
      rateLimit: keyData.rate_limit || 60
    };
  } catch (error) {
    return { isValid: false, error: 'API key validation failed' };
  }
};

// Rate limiting check
export const checkRateLimit = async (
  identifier: string,
  endpoint: string,
  limit: number = 60
): Promise<RateLimitResult> => {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_endpoint: endpoint,
      p_limit: limit
    });
    
    if (error) {
      return { allowed: false };
    }
    
    return { allowed: data === true };
  } catch (error) {
    // In case of error, allow the request but log it
    console.error('Rate limit check failed:', error);
    return { allowed: true };
  }
};

// Webhook URL validation and verification
export const validateWebhookUrl = async (url: string, secretKey?: string): Promise<{ isValid: boolean; error?: string }> => {
  try {
    const sanitizedUrl = sanitizeUrl(url);
    
    // Test webhook connectivity
    const response = await fetch(sanitizedUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DevOps-Provisioning-System/1.0',
        ...(secretKey && { 'X-Webhook-Secret': secretKey })
      },
      body: JSON.stringify({
        test: true,
        timestamp: new Date().toISOString(),
        event: 'webhook_validation'
      })
    });
    
    if (!response.ok) {
      return { isValid: false, error: `Webhook validation failed: ${response.status}` };
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: `Webhook validation error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};

// Generate secure API key
export const generateApiKey = (): string => {
  const prefix = 'pk_';
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  const key = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return prefix + key;
};

// Permission checking
export const hasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
  return userPermissions.includes(requiredPermission) || userPermissions.includes('*');
};

// Secure webhook secret generation
export const generateWebhookSecret = (): string => {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
};
