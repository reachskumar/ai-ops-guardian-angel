
/**
 * WebSocket Connection Service
 * Manages connections to real-time data sources
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// Connection states
export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

// Configuration for a WebSocket connection
export interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onMessage?: (event: MessageEvent) => void;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
}

/**
 * Hook for managing a WebSocket connection
 */
export const useWebSocket = (config: WebSocketConfig) => {
  const {
    url,
    protocols,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    onMessage,
    onOpen,
    onClose,
    onError,
  } = config;

  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const webSocketRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);

  // Send a message through the WebSocket
  const sendMessage = useCallback((data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
      webSocketRef.current.send(data);
      return true;
    }
    return false;
  }, []);

  // Connect to the WebSocket
  const connect = useCallback(() => {
    // Close any existing connection
    if (webSocketRef.current) {
      webSocketRef.current.close();
    }

    try {
      setConnectionState('connecting');
      
      // Create a new WebSocket connection
      const ws = protocols ? new WebSocket(url, protocols) : new WebSocket(url);
      
      ws.onopen = (event) => {
        console.log('WebSocket connected:', url);
        setConnectionState('connected');
        reconnectCountRef.current = 0;
        if (onOpen) onOpen(event);
      };
      
      ws.onmessage = (event) => {
        setLastMessage(event);
        if (onMessage) onMessage(event);
      };
      
      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', url);
        setConnectionState('disconnected');
        
        // Attempt to reconnect if not closed deliberately
        if (!event.wasClean && reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current += 1;
          
          if (reconnectTimerRef.current) {
            window.clearTimeout(reconnectTimerRef.current);
          }
          
          reconnectTimerRef.current = window.setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectCountRef.current}/${reconnectAttempts})...`);
            connect();
          }, reconnectInterval);
        }
        
        if (onClose) onClose(event);
      };
      
      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setConnectionState('error');
        setErrorMessage('Connection error. Please check your network and try again.');
        if (onError) onError(event);
      };
      
      webSocketRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setConnectionState('error');
      setErrorMessage(`Failed to create connection: ${error}`);
    }
  }, [url, protocols, reconnectAttempts, reconnectInterval, onMessage, onOpen, onClose, onError]);

  // Disconnect from the WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    
    if (webSocketRef.current) {
      webSocketRef.current.close();
      webSocketRef.current = null;
    }
    
    setConnectionState('disconnected');
  }, []);

  // Set up the connection
  useEffect(() => {
    connect();
    
    // Clean up the connection when the component unmounts
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connectionState,
    lastMessage,
    errorMessage,
    sendMessage,
    connect,
    disconnect
  };
};

/**
 * Creates a mock WebSocket for testing or development
 */
export const createMockWebSocket = (config: {
  url: string;
  interval?: number;
  data?: any[];
  simulateDisconnect?: boolean;
  disconnectAfter?: number;
}) => {
  const {
    url,
    interval = 2000,
    data = [],
    simulateDisconnect = false,
    disconnectAfter = 10000
  } = config;
  
  console.log(`Creating mock WebSocket for ${url}`);
  
  // Mock event listeners
  const eventListeners: Record<string, Function[]> = {
    open: [],
    message: [],
    close: [],
    error: []
  };
  
  // Create the mock WebSocket
  const mockWs = {
    url,
    readyState: WebSocket.CONNECTING,
    
    // Add an event listener
    addEventListener: (type: string, listener: Function) => {
      if (!eventListeners[type]) {
        eventListeners[type] = [];
      }
      eventListeners[type].push(listener);
    },
    
    // Remove an event listener
    removeEventListener: (type: string, listener: Function) => {
      if (eventListeners[type]) {
        eventListeners[type] = eventListeners[type].filter(l => l !== listener);
      }
    },
    
    // Dispatch an event
    dispatchEvent: (event: any) => {
      if (eventListeners[event.type]) {
        eventListeners[event.type].forEach(listener => listener(event));
      }
      return true;
    },
    
    // Send a message (no-op in mock)
    send: (data: any) => {
      console.log('Mock WebSocket send:', data);
    },
    
    // Close the connection
    close: () => {
      if (mockWs.readyState !== WebSocket.CLOSED) {
        mockWs.readyState = WebSocket.CLOSING;
        
        setTimeout(() => {
          mockWs.readyState = WebSocket.CLOSED;
          mockWs.dispatchEvent(new CloseEvent('close', { wasClean: true, code: 1000 }));
        }, 100);
      }
    },
    
    // Define event handler properties
    set onopen(handler: (event: Event) => void) {
      mockWs.addEventListener('open', handler);
    },
    
    set onmessage(handler: (event: MessageEvent) => void) {
      mockWs.addEventListener('message', handler);
    },
    
    set onclose(handler: (event: CloseEvent) => void) {
      mockWs.addEventListener('close', handler);
    },
    
    set onerror(handler: (event: Event) => void) {
      mockWs.addEventListener('error', handler);
    }
  };
  
  // Simulate connection establishment
  setTimeout(() => {
    if (mockWs.readyState !== WebSocket.CLOSED) {
      mockWs.readyState = WebSocket.OPEN;
      mockWs.dispatchEvent(new Event('open'));
      
      // Start sending mock data
      let dataIndex = 0;
      const dataInterval = setInterval(() => {
        if (mockWs.readyState === WebSocket.OPEN) {
          const mockData = data.length > 0 
            ? data[dataIndex % data.length] 
            : { timestamp: new Date().toISOString(), value: Math.random() * 100 };
          
          mockWs.dispatchEvent(new MessageEvent('message', {
            data: JSON.stringify(mockData)
          }));
          
          dataIndex++;
        } else {
          clearInterval(dataInterval);
        }
      }, interval);
      
      // Simulate disconnection if configured
      if (simulateDisconnect) {
        setTimeout(() => {
          if (mockWs.readyState === WebSocket.OPEN) {
            clearInterval(dataInterval);
            mockWs.readyState = WebSocket.CLOSING;
            
            setTimeout(() => {
              mockWs.readyState = WebSocket.CLOSED;
              mockWs.dispatchEvent(new CloseEvent('close', { wasClean: false, code: 1006 }));
            }, 100);
          }
        }, disconnectAfter);
      }
    }
  }, 500);
  
  return mockWs as unknown as WebSocket;
};

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
