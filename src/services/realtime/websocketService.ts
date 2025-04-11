
/**
 * WebSocket Connection Service
 * Manages connections to real-time data sources
 */

// Re-export all WebSocket functionality from modular files
export * from './websocketOperations';
export * from './websocketHandlers';
export * from './websocketTypes';
export * from './types';

// No need to re-export these as they are already exported in the index.ts
// export * from './useWebSocket';
// export * from './mockWebSocket';
// export * from './websocketFactory';
