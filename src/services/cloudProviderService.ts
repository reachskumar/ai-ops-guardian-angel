
// Legacy service file for backward compatibility
export { getResourceMetrics, type ResourceMetric } from './cloud';

// Re-export types that components are expecting
export type { CloudProvider, CloudResource } from './cloud/types';
