
export type CloudProvider = 'aws' | 'azure' | 'gcp';

export interface CloudAccount {
  id: string;
  name: string;
  provider: CloudProvider;
  status: string;
  user_id: string;
  created_at: string;
  last_synced_at: string | null;
  error_message: string | null;
  metadata: Record<string, any> | null;
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
  tags: Record<string, string>;
  metadata: Record<string, any>;
  cost_per_day: number | null;
  users_cloud_accounts?: CloudAccount;
}

export interface ResourceMetric {
  name: string;
  data: Array<{
    timestamp: string;
    value: number;
  }>;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  resource_type: string;
  metric: string;
  operator: 'gt' | 'lt' | 'eq';
  threshold: number;
  duration: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  created_at: string;
  user_id: string;
}

export interface Alert {
  id: string;
  rule_id: string;
  resource_id: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'acknowledged';
  triggered_at: string;
  resolved_at: string | null;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
}
