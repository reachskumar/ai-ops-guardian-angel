
/**
 * Type definitions for the realtime services
 */

// Connection states
export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

// Configuration for a WebSocket connection
export interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  reconnectAttempts?: number;
  reconnectInterval?: number;
  mock?: boolean;
  mockConfig?: {
    interval?: number;
    data?: any[];
    simulateDisconnect?: boolean;
    disconnectAfter?: number;
  };
  onMessage?: (event: MessageEvent) => void;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
}

// Mock WebSocket configuration
export interface MockWebSocketConfig {
  url: string;
  interval?: number;
  data?: any[];
  simulateDisconnect?: boolean;
  disconnectAfter?: number;
}

