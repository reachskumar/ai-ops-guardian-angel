
import { validateJWTToken, validateApiKey, checkRateLimit, hasPermission } from './securityService';
import { useAuth } from '@/providers/AuthProvider';

export interface AuthContext {
  user: any;
  permissions: string[];
  isAuthenticated: boolean;
  authMethod: 'jwt' | 'api_key';
}

export interface AuthOptions {
  requireAuth?: boolean;
  requiredPermissions?: string[];
  rateLimit?: number;
  endpoint?: string;
}

// Hook for protected routes and components
export const useAuthMiddleware = (options: AuthOptions = {}) => {
  const { user, loading } = useAuth();
  const {
    requireAuth = true,
    requiredPermissions = [],
    rateLimit = 60,
    endpoint = 'default'
  } = options;

  const checkAuthentication = async (): Promise<{ allowed: boolean; error?: string }> => {
    if (loading) {
      return { allowed: false, error: 'Authentication check in progress' };
    }

    if (requireAuth && !user) {
      return { allowed: false, error: 'Authentication required' };
    }

    if (user) {
      // Check rate limiting
      const rateLimitResult = await checkRateLimit(user.id, endpoint, rateLimit);
      if (!rateLimitResult.allowed) {
        return { allowed: false, error: 'Rate limit exceeded' };
      }

      // Check permissions if required
      if (requiredPermissions.length > 0) {
        // In a real implementation, you'd get user permissions from the database
        const userPermissions = user.user_metadata?.permissions || [];
        const hasRequiredPermissions = requiredPermissions.every(permission =>
          hasPermission(userPermissions, permission)
        );

        if (!hasRequiredPermissions) {
          return { allowed: false, error: 'Insufficient permissions' };
        }
      }
    }

    return { allowed: true };
  };

  return {
    user,
    loading,
    checkAuthentication,
    isAuthenticated: !!user
  };
};

// API request interceptor for authentication
export const createAuthenticatedRequest = async (
  url: string,
  options: RequestInit & { authToken?: string; apiKey?: string } = {}
) => {
  const { authToken, apiKey, ...fetchOptions } = options;
  
  const headers = new Headers(fetchOptions.headers);
  
  // Add authentication header
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  } else if (apiKey) {
    headers.set('X-API-Key', apiKey);
  }
  
  // Add security headers
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-XSS-Protection', '1; mode=block');
  
  return fetch(url, {
    ...fetchOptions,
    headers
  });
};
