
/**
 * Core WebSocket connection operations
 */

import { ConnectionState, WebSocketConfig } from './types';
import { WebSocketRegistry } from './websocketTypes';
import { connections, setupSocketEventHandlers } from './websocketHandlers';
import { createWebSocket } from './websocketFactory';

/**
 * Create and register a new WebSocket connection
 */
export const createConnection = (
  id: string,
  config: WebSocketConfig
): WebSocket => {
  // Close existing connection if it exists
  if (connections[id]) {
    closeConnection(id);
  }
  
  // Create new WebSocket
  const socket = createWebSocket(config.url, {
    mock: config.mock || false,
    mockConfig: config.mockConfig
  });
  
  // Register the connection
  connections[id] = {
    socket,
    config,
    state: 'connecting',
    reconnectTimer: null,
    reconnectCount: 0,
    lastActivity: new Date()
  };
  
  // Set up event listeners
  setupSocketEventHandlers(id, socket, config);
  
  return socket;
};

/**
 * Get an existing WebSocket connection by ID
 */
export const getConnection = (id: string): WebSocket | null => {
  return connections[id]?.socket || null;
};

/**
 * Get the state of a WebSocket connection
 */
export const getConnectionState = (id: string): ConnectionState => {
  return connections[id]?.state || 'disconnected';
};

/**
 * Close a WebSocket connection
 */
export const closeConnection = (id: string): boolean => {
  const connection = connections[id];
  
  if (!connection) {
    return false;
  }
  
  // Clear any reconnect timer
  if (connection.reconnectTimer !== null) {
    window.clearTimeout(connection.reconnectTimer);
    connection.reconnectTimer = null;
  }
  
  // Close the socket if it's not already closed
  if (connection.socket.readyState !== 3) { // WebSocket.CLOSED
    connection.socket.close();
  }
  
  // Remove from registry
  delete connections[id];
  
  return true;
};

/**
 * Send a message through a WebSocket connection
 */
export const sendMessage = (
  id: string, 
  data: string | ArrayBufferLike | Blob | ArrayBufferView
): boolean => {
  const connection = connections[id];
  
  if (!connection || connection.socket.readyState !== 1) { // WebSocket.OPEN
    return false;
  }
  
  try {
    connection.socket.send(data);
    connection.lastActivity = new Date();
    return true;
  } catch (error) {
    console.error(`Error sending message through WebSocket ${id}:`, error);
    return false;
  }
};

/**
 * Close all active WebSocket connections
 */
export const closeAllConnections = (): void => {
  Object.keys(connections).forEach(id => {
    closeConnection(id);
  });
};
