
/**
 * Type definitions specific to WebSocket connection management
 */

import { ConnectionState, WebSocketConfig } from './types';

/**
 * Internal registry entry for a WebSocket connection
 */
export interface WebSocketRegistryEntry {
  socket: WebSocket;
  config: WebSocketConfig;
  state: ConnectionState;
  reconnectTimer: number | null;
  reconnectCount: number;
  lastActivity: Date;
}

/**
 * Registry to track active WebSocket connections
 */
export type WebSocketRegistry = {
  [key: string]: WebSocketRegistryEntry;
};
