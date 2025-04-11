
/**
 * Factory for creating WebSocket connections
 */

import { createMockWebSocket } from './mockWebSocket';

/**
 * Factory function to create a WebSocket (real or mock)
 */
export const createWebSocket = (
  url: string, 
  options: { 
    mock?: boolean;
    mockConfig?: {
      interval?: number;
      data?: any[];
      simulateDisconnect?: boolean;
      disconnectAfter?: number;
    }
  } = {}
): WebSocket => {
  const { mock = false, mockConfig = {} } = options;
  
  if (mock) {
    return createMockWebSocket({
      url,
      ...mockConfig
    });
  }
  
  return new WebSocket(url);
};
