
/**
 * Mock WebSocket implementation for testing and development
 */

import { MockWebSocketConfig } from './types';

/**
 * Creates a mock WebSocket for testing or development
 */
export const createMockWebSocket = (config: MockWebSocketConfig) => {
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
