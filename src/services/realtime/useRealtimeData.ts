
/**
 * Hook for consuming real-time data from various sources
 */

import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { createTransformer, TransformedMessage } from './dataTransformer';
import { DataSource, WebSocketDataSource } from './dataSourceTypes';
import { createWebSocket } from './websocketFactory';

/**
 * Options for the useRealtimeData hook
 */
interface UseRealtimeDataOptions {
  bufferSize?: number;
  autoConnect?: boolean;
  mockData?: boolean;
  transform?: boolean;
  onMessage?: (message: TransformedMessage) => void;
  onError?: (error: any) => void;
}

/**
 * Hook for consuming real-time data from a data source
 */
export const useRealtimeData = <T = any>(
  dataSource: DataSource,
  options: UseRealtimeDataOptions = {}
) => {
  const {
    bufferSize = 100,
    autoConnect = true,
    mockData = false,
    transform = true,
    onMessage,
    onError
  } = options;

  const [messages, setMessages] = useState<TransformedMessage<T>[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a transformer function based on the data source type
  const transformer = createTransformer(dataSource);

  // Handle WebSocket data sources
  const handleWebSocketDataSource = useCallback((dataSource: WebSocketDataSource) => {
    const { url, protocols } = dataSource;

    // Create WebSocket config
    const webSocketConfig = {
      url,
      protocols,
      reconnectAttempts: dataSource.reconnectAttempts,
      reconnectInterval: dataSource.reconnectInterval,
      onMessage: (event: MessageEvent) => {
        try {
          const transformedMessage = transform 
            ? transformer(event) 
            : { timestamp: new Date().toISOString(), source: dataSource.name, data: event.data, sourceType: 'websocket', raw: event };
          
          setMessages(prev => [transformedMessage, ...prev].slice(0, bufferSize));
          
          if (onMessage) {
            onMessage(transformedMessage);
          }
        } catch (err) {
          console.error('Error processing WebSocket message:', err);
          if (onError) {
            onError(err);
          }
        }
      },
      onOpen: () => setIsConnected(true),
      onClose: () => setIsConnected(false),
      onError: (event) => {
        console.error('WebSocket error:', event);
        setError('Connection error. Please check your network and try again.');
        if (onError) {
          onError(event);
        }
      }
    };

    // Use the WebSocket hook
    const { 
      connectionState, 
      errorMessage,
      sendMessage,
      connect,
      disconnect
    } = useWebSocket(webSocketConfig);

    // Set state based on WebSocket hook's state
    setIsConnected(connectionState === 'connected');
    if (errorMessage) {
      setError(errorMessage);
    }

    return {
      connectionState,
      errorMessage,
      sendMessage,
      connect,
      disconnect
    };
  }, [bufferSize, onError, onMessage, transform, transformer]);

  // Connect to the data source when the hook mounts
  useEffect(() => {
    if (!dataSource.enabled || !autoConnect) {
      return;
    }

    // Handle different types of data sources
    switch (dataSource.type) {
      case 'websocket':
        // WebSocket handling is done by the useWebSocket hook
        break;
      
      // Additional data source types can be implemented here
      default:
        console.warn(`Data source type '${dataSource.type}' not yet implemented`);
    }

  }, [autoConnect, dataSource]);

  // Support for WebSocket data sources
  const webSocketControls = dataSource.type === 'websocket'
    ? handleWebSocketDataSource(dataSource as WebSocketDataSource)
    : null;

  return {
    messages,
    isConnected,
    error,
    clearMessages: () => setMessages([]),
    // Return controls specific to the data source type
    ...(webSocketControls || {})
  };
};
