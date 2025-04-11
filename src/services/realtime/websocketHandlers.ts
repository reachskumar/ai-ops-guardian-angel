
/**
 * WebSocket event handlers and setup utilities
 */

import { WebSocketConfig } from './types';
import { WebSocketRegistry } from './websocketTypes';
import { createWebSocket } from './websocketFactory';

// Singleton registry for all WebSocket connections
export const connections: WebSocketRegistry = {};

/**
 * Set up event handlers for a WebSocket
 */
export const setupSocketEventHandlers = (
  id: string, 
  socket: WebSocket, 
  config: WebSocketConfig
) => {
  const connection = connections[id];
  if (!connection) return;

  socket.onopen = (event) => {
    console.log(`WebSocket connected: ${config.url}`);
    connection.state = 'connected';
    connection.reconnectCount = 0;
    connection.lastActivity = new Date();
    if (config.onOpen) config.onOpen(event);
  };

  socket.onmessage = (event) => {
    connection.lastActivity = new Date();
    if (config.onMessage) config.onMessage(event);
  };

  socket.onclose = (event) => {
    console.log(`WebSocket disconnected: ${config.url}`);
    connection.state = 'disconnected';
    
    // Attempt reconnection if needed
    if (
      config.reconnectAttempts &&
      config.reconnectAttempts > 0 &&
      connection.reconnectCount < config.reconnectAttempts &&
      !event.wasClean
    ) {
      const reconnectInterval = config.reconnectInterval || 3000;
      
      // Clear any existing reconnect timer
      if (connection.reconnectTimer !== null) {
        window.clearTimeout(connection.reconnectTimer);
      }
      
      connection.reconnectTimer = window.setTimeout(() => {
        if (connections[id]) {
          connection.reconnectCount += 1;
          console.log(`Attempting reconnection ${connection.reconnectCount}/${config.reconnectAttempts}`);
          
          // Create a new socket with the same config
          const newSocket = createWebSocket(config.url, {
            mock: config.mock || false,
            mockConfig: config.mockConfig
          });
          
          // Replace socket in registry
          connection.socket = newSocket;
          connection.state = 'connecting';
          
          // Set up event handlers for the new socket
          setupSocketEventHandlers(id, newSocket, config);
        }
      }, reconnectInterval);
    }
    
    if (config.onClose) config.onClose(event);
  };

  socket.onerror = (event) => {
    console.error(`WebSocket error: ${config.url}`, event);
    connection.state = 'error';
    if (config.onError) config.onError(event);
  };
};
