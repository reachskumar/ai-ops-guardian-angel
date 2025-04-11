
/**
 * Hook for managing WebSocket connections
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { ConnectionState, WebSocketConfig } from './types';

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
