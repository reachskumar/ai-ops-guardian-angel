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
  async sendChatMessage(params: { message: string; tenantId?: string; sessionId?: string; context?: string; }): Promise<APIResponse<any>> {
    const { message, tenantId, sessionId, context } = params;
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        user_id: 'demo_user',
        session_id: sessionId,
        tenant_id: tenantId,
        context,
      }),
    });
  }

  async approveChat(params: { tenantId?: string; sessionId?: string; userId?: string; reason?: string; }): Promise<APIResponse<any>> {
    const { tenantId, sessionId, userId, reason } = params;
    return this.request('/chat/approve', {
      method: 'POST',
      body: JSON.stringify({ tenant_id: tenantId, session_id: sessionId, user_id: userId || 'demo_user', reason })
    });
  }

  async cancelChat(params: { tenantId?: string; sessionId?: string; userId?: string; reason?: string; }): Promise<APIResponse<any>> {
    const { tenantId, sessionId, userId, reason } = params;
    return this.request('/chat/cancel', {
      method: 'POST',
      body: JSON.stringify({ tenant_id: tenantId, session_id: sessionId, user_id: userId || 'demo_user', reason })
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

  // Cloud & Infra APIs
  async auditNetworkPolicy(tenantId: string): Promise<APIResponse<any>> {
    return this.request('/api/v1/cloud/infra/network/policy/audit', {
      method: 'POST',
      body: JSON.stringify({ tenant_id: tenantId })
    });
  }

  async backupDR(req: { tenant_id: string; action?: 'plan' | 'drill' | 'validate_restore'; env?: string; }): Promise<APIResponse<any>> {
    return this.request('/api/v1/cloud/infra/backup/dr', {
      method: 'POST',
      body: JSON.stringify(req)
    });
  }

  async cutoverExecute(req: { tenant_id: string; name: string; strategy?: string; source_env?: string; target_env?: string; steps: any[]; }): Promise<APIResponse<any>> {
    return this.request('/api/v1/cloud/infra/cutover/execute', {
      method: 'POST',
      body: JSON.stringify(req)
    });
  }

  async cleanupScanExecute(req: { tenant_id: string; provider?: string; policy_id?: string; execute?: boolean; dry_run?: boolean; }): Promise<APIResponse<any>> {
    return this.request('/api/v1/cloud/infra/cleanup/scan_execute', {
      method: 'POST',
      body: JSON.stringify(req)
    });
  }

  async multiRegionPlan(req: { regions: string[]; strategy?: string; batch_size?: number; }): Promise<APIResponse<any>> {
    return this.request('/api/v1/cloud/infra/multi-region/plan', {
      method: 'POST',
      body: JSON.stringify(req)
    });
  }

  // SRE APIs
  async sreIncidentManage(req: { tenant_id?: string; service?: string; alerts: any[] }): Promise<APIResponse<any>> {
    return this.request('/api/v1/sre/incident/manage', {
      method: 'POST',
      body: JSON.stringify(req)
    });
  }

  async sreSLOEvaluate(slo: any): Promise<APIResponse<any>> {
    return this.request('/api/v1/sre/slo/evaluate', {
      method: 'POST',
      body: JSON.stringify({ slo })
    });
  }

  async sreChangeCorrelate(req: { incident_id: string; service?: string }): Promise<APIResponse<any>> {
    return this.request('/api/v1/sre/change/correlate', {
      method: 'POST',
      body: JSON.stringify(req)
    });
  }

  async sreRunbookGenerate(req: { tenant_id?: string; incident: any }): Promise<APIResponse<any>> {
    return this.request('/api/v1/sre/runbook/generate', {
      method: 'POST',
      body: JSON.stringify(req)
    });
  }

  // FinOps APIs
  async finopsCostAnomalyDetect(req?: { window?: string; granularity?: string }): Promise<APIResponse<any>> {
    return this.request('/api/v1/finops/cost/anomaly/detect', {
      method: 'POST',
      body: JSON.stringify(req || {})
    });
  }

  async finopsCostAnomalyExplain(anomaly_id: string): Promise<APIResponse<any>> {
    return this.request('/api/v1/finops/cost/anomaly/explain', {
      method: 'POST',
      body: JSON.stringify({ anomaly_id })
    });
  }

  async finopsDataTieringPlan(req: { bucket?: string; after_days?: number }): Promise<APIResponse<any>> {
    return this.request('/api/v1/finops/data/tiering/plan', {
      method: 'POST',
      body: JSON.stringify(req)
    });
  }

  async finopsRetentionPolicy(req: { dataset?: string; retain_days?: number }): Promise<APIResponse<any>> {
    return this.request('/api/v1/finops/data/retention/policy', {
      method: 'POST',
      body: JSON.stringify(req)
    });
  }

  async finopsCleanupScan(req: { path_prefix?: string; min_size_gb?: number }): Promise<APIResponse<any>> {
    return this.request('/api/v1/finops/data/cleanup/scan', {
      method: 'POST',
      body: JSON.stringify(req)
    });
  }

  async finopsEgressHotspots(req?: { window?: string }): Promise<APIResponse<any>> {
    return this.request('/api/v1/finops/egress/hotspots', {
      method: 'POST',
      body: JSON.stringify(req || {})
    });
  }

  async finopsEgressSuggest(req?: { service?: string }): Promise<APIResponse<any>> {
    return this.request('/api/v1/finops/egress/suggest', {
      method: 'POST',
      body: JSON.stringify(req || {})
    });
  }

  async finopsUnitMap(req?: { basis?: string }): Promise<APIResponse<any>> {
    return this.request('/api/v1/finops/unit/map', {
      method: 'POST',
      body: JSON.stringify(req || {})
    });
  }

  async finopsUnitRegressions(req?: { window?: string }): Promise<APIResponse<any>> {
    return this.request('/api/v1/finops/unit/regressions', {
      method: 'POST',
      body: JSON.stringify(req || {})
    });
  }

  // Security & Compliance APIs
  async secCosignSign(image: string): Promise<APIResponse<any>> {
    return this.request('/api/v1/sec/supply/sign', { method: 'POST', body: JSON.stringify({ image }) });
  }

  async secCosignVerify(image: string): Promise<APIResponse<any>> {
    return this.request('/api/v1/sec/supply/verify', { method: 'POST', body: JSON.stringify({ image }) });
  }

  async secSlsaProvenance(): Promise<APIResponse<any>> {
    return this.request('/api/v1/sec/supply/provenance', { method: 'POST' });
  }

  async secSbomGenerate(req?: { image?: string }): Promise<APIResponse<any>> {
    return this.request('/api/v1/sec/sbom/generate', { method: 'POST', body: JSON.stringify(req || {}) });
  }

  async secSbomScanCorrelate(): Promise<APIResponse<any>> {
    return this.request('/api/v1/sec/sbom/scan/correlate', { method: 'POST' });
  }

  async secDataPiiDetect(source?: string): Promise<APIResponse<any>> {
    return this.request('/api/v1/sec/data/pii_detect', { method: 'POST', body: JSON.stringify({ source }) });
  }

  async secDataSecretDetect(source?: string): Promise<APIResponse<any>> {
    return this.request('/api/v1/sec/data/secret_detect', { method: 'POST', body: JSON.stringify({ source }) });
  }

  async secDataResidencyEnforce(scope?: string): Promise<APIResponse<any>> {
    return this.request('/api/v1/sec/data/residency_enforce', { method: 'POST', body: JSON.stringify({ scope }) });
  }

  async secOpaBundle(target?: string): Promise<APIResponse<any>> {
    return this.request('/api/v1/sec/opa/bundle', { method: 'POST', body: JSON.stringify({ target }) });
  }

  async secOpaSimulate(): Promise<APIResponse<any>> {
    return this.request('/api/v1/sec/opa/simulate', { method: 'POST' });
  }

  async secAllowlistEnforce(scope?: string): Promise<APIResponse<any>> {
    return this.request('/api/v1/sec/opa/allowlist_enforce', { method: 'POST', body: JSON.stringify({ scope }) });
  }

  async secAuditorSessionStart(): Promise<APIResponse<any>> {
    return this.request('/api/v1/sec/auditor/session/start', { method: 'POST' });
  }

  async secAuditorSessionEnd(session_id: string): Promise<APIResponse<any>> {
    return this.request('/api/v1/sec/auditor/session/end', { method: 'POST', body: JSON.stringify({ session_id }) });
  }

  async secAuditorTrailExport(): Promise<APIResponse<any>> {
    return this.request('/api/v1/sec/auditor/trail/export', { method: 'POST' });
  }

  // MLOps APIs
  async mlFeatureLineage(dataset?: string): Promise<APIResponse<any>> {
    return this.request('/api/v1/mlops/feature/lineage', { method: 'POST', body: JSON.stringify({ dataset }) });
  }
  async mlFeatureDrift(feature?: string): Promise<APIResponse<any>> {
    return this.request('/api/v1/mlops/feature/drift', { method: 'POST', body: JSON.stringify({ feature }) });
    }
  async mlFeatureACL(principal: string, role: string): Promise<APIResponse<any>> {
    return this.request('/api/v1/mlops/feature/acl', { method: 'POST', body: JSON.stringify({ principal, role }) });
  }
  async mlModelCanary(): Promise<APIResponse<any>> {
    return this.request('/api/v1/mlops/model/canary', { method: 'POST' });
  }
  async mlModelRollback(previous_version?: string): Promise<APIResponse<any>> {
    return this.request('/api/v1/mlops/model/rollback', { method: 'POST', body: JSON.stringify({ previous_version }) });
  }
  async mlModelSafetyGate(): Promise<APIResponse<any>> {
    return this.request('/api/v1/mlops/model/safety_gate', { method: 'POST' });
  }
  async mlDataDriftDetect(feature?: string): Promise<APIResponse<any>> {
    return this.request('/api/v1/mlops/data/drift/detect', { method: 'POST', body: JSON.stringify({ feature }) });
  }
  async mlDataRetrain(pipeline?: string): Promise<APIResponse<any>> {
    return this.request('/api/v1/mlops/data/retrain', { method: 'POST', body: JSON.stringify({ pipeline }) });
  }

  // Integrations & RAG APIs
  async irInstall(provider: string, config?: Record<string, any>): Promise<APIResponse<any>> {
    return this.request('/api/v1/integrations_rag/install', { method: 'POST', body: JSON.stringify({ provider, config }) });
  }
  async irOAuthAuthorize(provider: string): Promise<APIResponse<any>> {
    return this.request('/api/v1/integrations_rag/oauth/authorize', { method: 'POST', body: JSON.stringify({ provider }) });
  }
  async irConfigApply(provider: string, config: Record<string, any>): Promise<APIResponse<any>> {
    return this.request('/api/v1/integrations_rag/config/apply', { method: 'POST', body: JSON.stringify({ provider, config }) });
  }
  async irHealthCheck(provider: string): Promise<APIResponse<any>> {
    return this.request('/api/v1/integrations_rag/health/check', { method: 'POST', body: JSON.stringify({ provider }) });
  }
  async irWebhookNormalize(provider: string, event: Record<string, any>): Promise<APIResponse<any>> {
    return this.request('/api/v1/integrations_rag/webhook/normalize', { method: 'POST', body: JSON.stringify({ provider, event }) });
  }
  async irKnowledgeIngest(sources: string[], collection?: string): Promise<APIResponse<any>> {
    return this.request('/api/v1/integrations_rag/knowledge/ingest', { method: 'POST', body: JSON.stringify({ sources, collection }) });
  }
  async irKnowledgeChunkEmbed(collection?: string): Promise<APIResponse<any>> {
    return this.request('/api/v1/integrations_rag/knowledge/chunk_embed', { method: 'POST', body: JSON.stringify({ collection }) });
  }
  async irFreshnessScan(): Promise<APIResponse<any>> {
    return this.request('/api/v1/integrations_rag/freshness/scan', { method: 'POST' });
  }
  async irFreshnessPrioritize(): Promise<APIResponse<any>> {
    return this.request('/api/v1/integrations_rag/freshness/prioritize', { method: 'POST' });
  }
}

// Create API client instances
export const aiServicesAPI = new APIClient(API_BASE_URL);
export const apiGatewayAPI = new APIClient(API_GATEWAY_URL);
export const cloudIntegrationsAPI = new APIClient(CLOUD_INTEGRATIONS_URL);
export const dataServicesAPI = new APIClient(DATA_SERVICES_URL);

// Default export for convenience
export default aiServicesAPI; 