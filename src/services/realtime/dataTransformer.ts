
/**
 * Data transformation utilities for real-time messages
 */

import { DataSource } from './dataSourceTypes';

/**
 * Message format from WebSocket or other real-time sources
 */
export interface RawMessage {
  data: string;
  type?: string;
  timestamp?: string;
  [key: string]: any;
}

/**
 * Standardized message format after transformation
 */
export interface TransformedMessage<T = any> {
  timestamp: string;
  source: string;
  sourceType: string;
  data: T;
  raw: any;
}

/**
 * Transform a raw WebSocket message to a standardized format
 */
export const transformWebSocketMessage = <T = any>(
  message: MessageEvent, 
  source: string
): TransformedMessage<T> => {
  // Parse the message data
  let parsedData: any;
  let timestamp = new Date().toISOString();
  
  try {
    parsedData = JSON.parse(message.data);
    
    // Use timestamp from data if available
    if (parsedData.timestamp) {
      timestamp = parsedData.timestamp;
    }
  } catch (e) {
    // If not JSON, use as-is
    parsedData = message.data;
  }
  
  return {
    timestamp,
    source,
    sourceType: 'websocket',
    data: parsedData as T,
    raw: message
  };
};

/**
 * Transform a raw SSE message to a standardized format
 */
export const transformSSEMessage = <T = any>(
  message: MessageEvent, 
  source: string
): TransformedMessage<T> => {
  let parsedData: any;
  let timestamp = new Date().toISOString();
  
  try {
    parsedData = JSON.parse(message.data);
    
    if (parsedData.timestamp) {
      timestamp = parsedData.timestamp;
    }
  } catch (e) {
    parsedData = message.data;
  }
  
  return {
    timestamp,
    source,
    sourceType: 'sse',
    data: parsedData as T,
    raw: message
  };
};

/**
 * Create a transformer function based on the data source type
 */
export const createTransformer = (dataSource: DataSource) => {
  switch (dataSource.type) {
    case 'websocket':
      return (message: MessageEvent) => transformWebSocketMessage(message, dataSource.name);
    case 'sse':
      return (message: MessageEvent) => transformSSEMessage(message, dataSource.name);
    case 'polling':
      return (data: any) => ({
        timestamp: new Date().toISOString(),
        source: dataSource.name,
        sourceType: 'polling',
        data,
        raw: data
      });
    case 'supabase':
      return (payload: any) => ({
        timestamp: new Date().toISOString(),
        source: dataSource.name,
        sourceType: 'supabase',
        data: payload.new || payload,
        raw: payload
      });
    default:
      // Fix the type issue with a type assertion to tell TypeScript that dataSource has a name property
      return (data: any) => ({
        timestamp: new Date().toISOString(),
        source: (dataSource as { name: string }).name,
        sourceType: 'unknown',
        data,
        raw: data
      });
  }
};
