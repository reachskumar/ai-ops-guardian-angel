
/**
 * Factory for creating WebSocket connections
 */

import { createMockWebSocket } from './mockWebSocket';

/**
 * Configuration options for WebSocket creation
 */
export interface WebSocketFactoryOptions {
  mock?: boolean;
  protocols?: string | string[];
  mockConfig?: {
    interval?: number;
    data?: any[];
    simulateDisconnect?: boolean;
    disconnectAfter?: number;
  };
}

/**
 * Factory function to create a WebSocket (real or mock)
 */
export const createWebSocket = (
  url: string, 
  options: WebSocketFactoryOptions = {}
): WebSocket => {
  const { mock = false, protocols, mockConfig = {} } = options;
  
  if (mock) {
    return createMockWebSocket({
      url,
      ...mockConfig
    });
  }
  
  return protocols ? new WebSocket(url, protocols) : new WebSocket(url);
};

