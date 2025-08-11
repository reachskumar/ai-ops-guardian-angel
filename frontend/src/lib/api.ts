// API Configuration and Integration for InfraMind

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8001';
const API_GATEWAY_URL = (import.meta as any).env?.VITE_API_GATEWAY_URL || 'http://localhost:3001';
const CLOUD_INTEGRATIONS_URL = (import.meta as any).env?.VITE_CLOUD_INTEGRATIONS_URL || 'http://localhost:8002';
const DATA_SERVICES_URL = (import.meta as any).env?.VITE_DATA_SERVICES_URL || 'http://localhost:8003';

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  agentType?: string;
  metadata?: any;
}

export interface AIAgent {
  id: string;
  name: string;
  specialty: string;
  color: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
  organization: string;
  createdAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  domain: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'pending';
  createdAt: Date;
}

export interface CloudResource {
  id: string;
  name: string;
  type: string;
  provider: 'aws' | 'azure' | 'gcp';
  region: string;
  status: string;
  cost: number;
  tags: Record<string, string>;
}

export interface CostAnalysis {
  totalCost: number;
  breakdown: {
    compute: number;
    storage: number;
    network: number;
    database: number;
    other: number;
  };
  trends: {
    daily: number[];
    monthly: number[];
  };
  recommendations: string[];
}

export interface SecurityScan {
  vulnerabilities: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  recommendations: string[];
  lastScan: Date;
}

// API Client Class
class APIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Integrations API
  async listIntegrationConfigs(): Promise<APIResponse<any[]>> {
    return this.request('/integrations/configs');
  }

  async listIntegrationWebhooks(): Promise<APIResponse<any[]>> {
    return this.request('/integrations/webhooks');
  }

  async testIntegration(integration: string, config: Record<string, string>): Promise<APIResponse<any>> {
    return this.request('/integrations/test', {
      method: 'POST',
      body: JSON.stringify({ integration, config }),
    });
  }

  async saveIntegrationConfig(integration: string, config: Record<string, string>): Promise<APIResponse<any>> {
    return this.request('/integrations/configs', {
      method: 'POST',
      body: JSON.stringify({ integration, config }),
    });
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    console.log(`🌐 Making request to: ${url}`);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    console.log(`📡 Request config:`, { method: options.method || 'GET', headers });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`📡 Response status: ${response.status}`);

      if (!response.ok) {
        console.error(`❌ HTTP error: ${response.status}: ${response.statusText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`📡 Response data:`, data);
      
      // Check if the response is already in APIResponse format
      if (data && typeof data === 'object' && 'success' in data) {
        return data as APIResponse<T>;
      }
      
      // If not, wrap it in APIResponse format
      return {
        success: true,
        data: data as T
      };
    } catch (error) {
      console.error('❌ API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // AI Services API
  async sendChatMessage(message: string, agentType?: string): Promise<APIResponse<ChatMessage>> {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        agent_type: agentType,
        user_id: 'demo_user', // TODO: Get from auth context
      }),
    });
  }

  async getAvailableAgents(): Promise<APIResponse<AIAgent[]>> {
    return this.request('/agents/status');
  }

  async getWorkflows(): Promise<APIResponse<any[]>> {
    return this.request('/workflows/available');
  }

  async getSessionInsights(userId: string): Promise<APIResponse<any>> {
    return this.request(`/sessions/${userId}/insights`);
  }

  // Authentication API
  async login(email: string, password: string): Promise<APIResponse<{ token: string; user: User }>> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username_or_email: email, password }),
    });
    
    console.log('🔐 Login response:', response);
    
    // Handle backend response format
    if (response.success === false) {
      return {
        success: false,
        error: response.error || 'Login failed'
      };
    }
    
    // The backend returns the auth data directly, not wrapped in a data property
    const authData = (response.data || response) as any;
    
    if (authData?.access_token) {
      return {
        success: true,
        data: {
          token: authData.access_token,
          user: {
            id: authData.user?.user_id || '',
            email: authData.user?.email || '',
            name: authData.user?.username || '',
            role: authData.user?.roles?.includes('super_admin') ? 'admin' : 'user',
            organization: authData.user?.org_id || '',
            createdAt: new Date(),
          }
        }
      };
    } else {
      return {
        success: false,
        error: authData?.error || 'Login failed - no access token received'
      };
    }
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    organization: string;
  }): Promise<APIResponse<{ token: string; user: User }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: userData.email,
        email: userData.email,
        password: userData.password,
        confirm_password: userData.password,
        name: userData.name,
        organization: userData.organization,
      }),
    });
  }

  // OAuth Authentication
  async getOAuthUrl(provider: 'google' | 'microsoft' | 'github', redirectUri: string): Promise<APIResponse<{ authorization_url: string; state: string }>> {
    console.log(`🌐 Making OAuth request to: /auth/oauth/${provider}`);
    console.log(`🌐 Redirect URI: ${redirectUri}`);
    return this.request(`/auth/oauth/${provider}?redirect_uri=${encodeURIComponent(redirectUri)}`);
  }

  async handleOAuthCallback(provider: string, code: string, state: string): Promise<APIResponse<{ token: string; user: User }>> {
    return this.request('/auth/oauth/callback', {
      method: 'POST',
      body: JSON.stringify({ provider, code, state }),
    });
  }

  async getProfile(): Promise<APIResponse<User>> {
    return this.request('/auth/profile');
  }

  // Cloud Integrations API
  async getCloudProviders(): Promise<APIResponse<any[]>> {
    return this.request('/cloud/providers');
  }

  async getCloudResources(provider: string): Promise<APIResponse<CloudResource[]>> {
    return this.request(`/cloud/resources/${provider}`);
  }

  async connectCloudProvider(provider: string, credentials: any, accountName?: string): Promise<APIResponse<any>> {
    return this.request('/cloud/providers/connect', {
      method: 'POST',
      body: JSON.stringify({
        provider,
        credentials,
        account_name: accountName || `${provider}_account`
      }),
    });
  }

  async testCloudConnection(provider: string, credentials: any): Promise<APIResponse<any>> {
    return this.request('/cloud/providers/test', {
      method: 'POST',
      body: JSON.stringify({
        provider,
        credentials
      }),
    });
  }

  async getCostAnalysis(provider: string): Promise<APIResponse<CostAnalysis>> {
    return this.request(`/costs/${provider}/analysis`);
  }

  async getSecurityScan(provider: string): Promise<APIResponse<SecurityScan>> {
    return this.request(`/security/${provider}/scan`);
  }

  // Data Services API
  async getOrganizations(): Promise<APIResponse<Organization[]>> {
    return this.request('/organizations');
  }

  async getOrganization(id: string): Promise<APIResponse<Organization>> {
    return this.request(`/organizations/${id}`);
  }

  async createOrganization(orgData: {
    name: string;
    domain: string;
    plan: string;
  }): Promise<APIResponse<Organization>> {
    return this.request('/organizations', {
      method: 'POST',
      body: JSON.stringify(orgData),
    });
  }

  // Health Checks
  async healthCheck(): Promise<APIResponse<{ status: string; timestamp: string }>> {
    return this.request('/health');
  }

  // Dashboard API
  async getDashboardSummary(): Promise<APIResponse<any>> {
    return this.request('/dashboard/summary');
  }

  async getDashboardResources(params?: { provider?: string; region?: string; type?: string; page?: number; page_size?: number }): Promise<APIResponse<any>> {
    const qs = new URLSearchParams();
    if (params?.provider) qs.set('provider', params.provider);
    if (params?.region) qs.set('region', params.region);
    if (params?.type) qs.set('type', params.type);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.page_size) qs.set('page_size', String(params.page_size));
    const query = qs.toString();
    return this.request(`/dashboard/resources${query ? `?${query}` : ''}`);
  }
}

// Create API client instances
export const aiServicesAPI = new APIClient(API_BASE_URL);
export const apiGatewayAPI = new APIClient(API_GATEWAY_URL);
export const cloudIntegrationsAPI = new APIClient(CLOUD_INTEGRATIONS_URL);
export const dataServicesAPI = new APIClient(DATA_SERVICES_URL);

// Default export for convenience
export default aiServicesAPI; 