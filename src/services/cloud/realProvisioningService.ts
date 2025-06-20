
import { CloudProvider } from './types';
import { getAccountCredentials } from './accountService';
import { supabase } from '@/integrations/supabase/client';

export interface ProvisioningConfig {
  name: string;
  resourceType: string;
  region: string;
  size: string;
  tags?: Record<string, string>;
  description?: string;
  businessJustification?: string;
  // Provider-specific configurations
  vpc?: string;
  subnet?: string;
  securityGroups?: string[];
  storageSize?: number;
  encryption?: boolean;
  ttl?: number;
  autoDeprovision?: boolean;
}

export interface ProvisioningResult {
  success: boolean;
  resourceId?: string;
  resourceArn?: string;
  publicIp?: string;
  privateIp?: string;
  endpoint?: string;
  error?: string;
  details?: Record<string, any>;
}

// Real cloud provisioning service
export const provisionCloudResource = async (
  accountId: string,
  provider: CloudProvider,
  config: ProvisioningConfig
): Promise<ProvisioningResult> => {
  try {
    console.log(`Starting real provisioning for ${provider} resource: ${config.resourceType}`);
    
    // Get account credentials
    const credentials = await getAccountCredentials(accountId);
    if (!credentials) {
      return {
        success: false,
        error: 'No credentials found for this account'
      };
    }

    // Call the provision-resource edge function with real credentials
    const { data, error } = await supabase.functions.invoke('provision-resource', {
      body: {
        accountId,
        provider,
        resourceType: config.resourceType,
        config: {
          name: config.name,
          region: config.region,
          size: config.size,
          tags: config.tags,
          description: config.description,
          businessJustification: config.businessJustification,
          vpc: config.vpc,
          subnet: config.subnet,
          securityGroups: config.securityGroups,
          storageSize: config.storageSize,
          encryption: config.encryption,
          ttl: config.ttl,
          autoDeprovision: config.autoDeprovision
        },
        credentials
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      return {
        success: false,
        error: `Failed to provision resource: ${error.message}`
      };
    }

    if (!data.success) {
      return {
        success: false,
        error: data.error || 'Unknown provisioning error'
      };
    }

    console.log('Resource provisioned successfully:', data);
    
    return {
      success: true,
      resourceId: data.resourceId,
      resourceArn: data.details?.arn,
      publicIp: data.details?.publicIp,
      privateIp: data.details?.privateIp,
      endpoint: data.details?.endpoint,
      details: data.details
    };
  } catch (error: any) {
    console.error('Provisioning error:', error);
    return {
      success: false,
      error: error.message || 'Failed to provision cloud resource'
    };
  }
};

// Get real resource status
export const getResourceStatus = async (
  accountId: string,
  provider: CloudProvider,
  resourceId: string
): Promise<{ status: string; details?: Record<string, any>; error?: string }> => {
  try {
    const credentials = await getAccountCredentials(accountId);
    if (!credentials) {
      return { status: 'unknown', error: 'No credentials found' };
    }

    const { data, error } = await supabase.functions.invoke('get-resource-status', {
      body: {
        accountId,
        provider,
        resourceId,
        credentials
      }
    });

    if (error) {
      return { status: 'unknown', error: error.message };
    }

    return {
      status: data.status || 'unknown',
      details: data.details
    };
  } catch (error: any) {
    return { status: 'unknown', error: error.message };
  }
};

// Terminate/delete resource
export const terminateResource = async (
  accountId: string,
  provider: CloudProvider,
  resourceId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const credentials = await getAccountCredentials(accountId);
    if (!credentials) {
      return { success: false, error: 'No credentials found' };
    }

    const { data, error } = await supabase.functions.invoke('terminate-resource', {
      body: {
        accountId,
        provider,
        resourceId,
        credentials
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: data.success,
      error: data.error
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
