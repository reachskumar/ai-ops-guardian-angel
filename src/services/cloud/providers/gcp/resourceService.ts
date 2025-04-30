
import { CloudResource } from '../../../cloud/types';

// Get GCP resource types grouped by category
export const getGcpResourceTypes = (): { category: string; types: string[] }[] => {
  return [
    {
      category: 'compute',
      types: ['VM Instance', 'Cloud Function', 'Cloud Run', 'App Engine']
    },
    {
      category: 'storage',
      types: ['Cloud Storage', 'Persistent Disk', 'Filestore']
    },
    {
      category: 'database',
      types: ['Cloud SQL', 'Cloud Bigtable', 'Cloud Spanner', 'Firestore']
    },
    {
      category: 'network',
      types: ['VPC Network', 'Cloud Load Balancing', 'Cloud DNS', 'Cloud CDN', 'Cloud NAT']
    }
  ];
};

// Get GCP instance sizes for a resource type
export const getGcpInstanceSizes = (resourceType: string): string[] => {
  switch (resourceType) {
    case 'VM Instance':
      return ['e2-micro', 'e2-small', 'e2-medium', 'n1-standard-1', 'n1-standard-2', 'n1-standard-4', 'n2-standard-2', 'n2-standard-4'];
    case 'Cloud SQL':
      return ['db-f1-micro', 'db-g1-small', 'db-custom-1-3840', 'db-custom-2-7680'];
    case 'Persistent Disk':
      return ['10GB', '50GB', '100GB', '500GB', '1TB', '2TB'];
    default:
      return ['small', 'medium', 'large'];
  }
};

// Get GCP regions
export const getGcpRegions = (): string[] => {
  return [
    'us-central1', 'us-east1', 'us-east4', 'us-west1', 'us-west2', 'us-west3', 'us-west4',
    'northamerica-northeast1', 'southamerica-east1', 'europe-west1', 'europe-west2',
    'europe-west3', 'europe-west4', 'europe-west6', 'asia-east1', 'asia-east2',
    'asia-northeast1', 'asia-northeast2', 'asia-southeast1', 'australia-southeast1'
  ];
};

// Provision GCP resource
export const provisionGcpResource = async (
  accountId: string,
  resourceType: string,
  config: Record<string, any>,
  credentials?: Record<string, any>
): Promise<{ success: boolean; resourceId?: string; error?: string; details?: Record<string, any> }> => {
  try {
    console.log(`Provisioning GCP ${resourceType} with config:`, config);
    
    // Validate if we have the required credentials
    if (!credentials || !credentials.serviceAccountKey) {
      return {
        success: false,
        error: 'GCP service account key is required for provisioning'
      };
    }
    
    // This would use GCP API in a real implementation
    // For now, return a mock success response
    const resourceId = `gcp-${resourceType.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    return {
      success: true,
      resourceId,
      details: {
        provider: 'gcp',
        type: resourceType,
        ...config
      }
    };
  } catch (error: any) {
    console.error(`Error provisioning GCP ${resourceType}:`, error);
    return {
      success: false,
      error: `Failed to provision GCP ${resourceType}: ${error.message}`
    };
  }
};
