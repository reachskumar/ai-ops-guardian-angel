
/**
 * Hook for easily using the WebSocket Connection Service
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  createConnection, 
  closeConnection, 
  sendMessage, 
  getConnectionState
} from './websocketService';
import { ConnectionState, WebSocketConfig } from './types';

/**
 * Custom hook for managing a WebSocket connection using the connection service
 */
export const useWebSocketConnection = (config: WebSocketConfig) => {
  // Generate a unique ID for this connection instance
  const connectionId = useRef<string>(uuidv4());
  
  const [state, setState] = useState<ConnectionState>('disconnected');
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Connect to the WebSocket
  const connect = useCallback(() => {
    try {
      const enhancedConfig = {
        ...config,
        onOpen: (event: Event) => {
          setState('connected');
          setErrorMessage(null);
          if (config.onOpen) config.onOpen(event);
        },
        onMessage: (event: MessageEvent) => {
          setLastMessage(event);
          if (config.onMessage) config.onMessage(event);
        },
        onClose: (event: CloseEvent) => {
          setState('disconnected');
          if (config.onClose) config.onClose(event);
        },
        onError: (event: Event) => {
          setState('error');
          setErrorMessage('Connection error. Please check your network and try again.');
          if (config.onError) config.onError(event);
        }
      };
      
      createConnection(connectionId.current, enhancedConfig);
      setState('connecting');
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setState('error');
      setErrorMessage(`Failed to create connection: ${error}`);
    }
  }, [config]);

  // Disconnect from the WebSocket
  const disconnect = useCallback(() => {
    closeConnection(connectionId.current);
    setState('disconnected');
  }, []);

  // Send a message through the WebSocket
  const send = useCallback((data: string | ArrayBufferLike | Blob | ArrayBufferView): boolean => {
    return sendMessage(connectionId.current, data);
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    if (config.url) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect, config.url]);

  // Sync state with the connection service
  useEffect(() => {
    const syncState = () => {
      const currentState = getConnectionState(connectionId.current);
      if (currentState !== state) {
        setState(currentState);
      }
    };
    
    const interval = setInterval(syncState, 1000);
    return () => clearInterval(interval);
  }, [state]);

  return {
    state,
    lastMessage,
    errorMessage,
    send,
    connect,
    disconnect,
    isConnected: state === 'connected'
  };
};

