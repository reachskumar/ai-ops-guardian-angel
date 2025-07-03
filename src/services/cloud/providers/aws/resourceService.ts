
import { CloudResource } from "../../types";

export const getAWSResources = async (credentials: Record<string, string>): Promise<CloudResource[]> => {
  console.log("Fetching real AWS resources with credentials");
  
  try {
    if (!credentials.accessKeyId || !credentials.secretAccessKey) {
      throw new Error('Missing required AWS credentials (accessKeyId and/or secretAccessKey)');
    }

    // Use the Supabase edge function for real AWS resource discovery
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.functions.invoke('sync-cloud-resources', {
      body: { 
        provider: 'aws',
        accountId: credentials.accountId || 'default-account',
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
          region: credentials.region || 'us-east-1',
          ...(credentials.sessionToken && { sessionToken: credentials.sessionToken })
        }
      }
    });

    if (error) {
      console.error(`AWS resource sync edge function error: ${error.message}`);
      throw new Error(`Edge function error: ${error.message}`);
    }
    
    if (!data || !data.success) {
      throw new Error('No resources returned from edge function');
    }
    
    console.log(`Retrieved ${data.resources.length} real AWS resources`);
    return data.resources as CloudResource[];
  } catch (error: any) {
    console.error("AWS resource fetch error:", error);
    
    // Return error instead of fallback for real integration
    throw new Error(`AWS resource fetch error: ${error.message || 'Failed to retrieve AWS resources'}`);
  }
};

export const createAWSResource = async (
  credentials: Record<string, string>,
  resourceConfig: any
): Promise<{ success: boolean; resourceId?: string; error?: string }> => {
  console.log("Creating AWS resource:", resourceConfig);
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock resource creation
    const resourceId = `aws-${resourceConfig.type}-${Date.now()}`;
    
    console.log(`AWS resource created successfully: ${resourceId}`);
    return { success: true, resourceId };
  } catch (error: any) {
    console.error("Create AWS resource error:", error);
    return { success: false, error: error.message || 'Failed to create AWS resource' };
  }
};

export const deleteAWSResource = async (
  credentials: Record<string, string>,
  resourceId: string
): Promise<{ success: boolean; error?: string }> => {
  console.log("Deleting AWS resource:", resourceId);
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log(`AWS resource deleted successfully: ${resourceId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Delete AWS resource error:", error);
    return { success: false, error: error.message || 'Failed to delete AWS resource' };
  }
};
