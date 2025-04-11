
/**
 * WebSocket Connection Service
 * Manages connections to real-time data sources
 */

import { createWebSocket } from './websocketFactory';
import { ConnectionState, WebSocketConfig } from './types';

// Registry to track active WebSocket connections
type WebSocketRegistry = {
  [key: string]: {
    socket: WebSocket;
    config: WebSocketConfig;
    state: ConnectionState;
    reconnectTimer: number | null;
    reconnectCount: number;
    lastActivity: Date;
  };
};

// Singleton registry for all WebSocket connections
const connections: WebSocketRegistry = {};

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
 * Set up event handlers for a WebSocket
 */
const setupSocketEventHandlers = (
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

// Export other WebSocket related utilities
export * from './types';
export * from './useWebSocket';
export * from './mockWebSocket';
export * from './websocketFactory';

