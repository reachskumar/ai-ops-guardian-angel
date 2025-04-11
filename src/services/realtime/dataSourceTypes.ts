
/**
 * Supported types of real-time data sources
 */
export type DataSourceType = 
  | 'websocket'
  | 'sse'
  | 'polling'
  | 'supabase';

/**
 * Base configuration for all data source types
 */
export interface DataSourceConfig {
  id: string;
  name: string;
  type: DataSourceType;
  enabled: boolean;
}

/**
 * Configuration for WebSocket data sources
 */
export interface WebSocketDataSource extends DataSourceConfig {
  type: 'websocket';
  url: string;
  protocols?: string | string[];
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

/**
 * Configuration for Server-Sent Events (SSE) data sources
 */
export interface SSEDataSource extends DataSourceConfig {
  type: 'sse';
  url: string;
  withCredentials?: boolean;
}

/**
 * Configuration for polling-based data sources
 */
export interface PollingDataSource extends DataSourceConfig {
  type: 'polling';
  url: string;
  method?: 'GET' | 'POST';
  body?: object;
  headers?: Record<string, string>;
  interval: number; // in milliseconds
}

/**
 * Configuration for Supabase real-time data sources
 */
export interface SupabaseDataSource extends DataSourceConfig {
  type: 'supabase';
  tableName: string;
  schema?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
}

/**
 * Union type for all data source configurations
 */
export type DataSource = 
  | WebSocketDataSource 
  | SSEDataSource 
  | PollingDataSource 
  | SupabaseDataSource;
