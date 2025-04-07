
// Define shared types for cloud provider services

export type CloudProvider = 'aws' | 'azure' | 'gcp';

export interface CloudAccount {
  id: string;
  name: string;
  provider: CloudProvider;
  status: 'connected' | 'disconnected' | 'error';
  created_at: string;
  last_synced_at?: string;
  error_message?: string;
  metadata?: Record<string, any>;
}

export interface CloudResource {
  id: string;
  cloud_account_id: string;
  resource_id: string;
  name: string;
  type: string;
  region: string;
  status: string;
  created_at: string;
  updated_at: string;
  tags?: Record<string, string>;
  cost_per_day?: number;
  metadata?: Record<string, any>;
}

export interface ResourceMetric {
  name: string;
  data: Array<{
    timestamp: string;
    value: number;
  }>;
  unit: string;
  status?: string;
}
