
// AWS-specific cost analysis using real Cost Explorer API
export const getAwsCostData = async (
  accountId: string,
  timeRange: string = '30d',
  credentials?: Record<string, any>
): Promise<{
  costs: Array<{ date: string; amount: number; service?: string }>;
  total: number;
  error?: string;
}> => {
  try {
    console.log(`Getting real AWS cost data for account ${accountId} over ${timeRange}`);
    
    if (!credentials || !credentials.accessKeyId || !credentials.secretAccessKey) {
      throw new Error('Missing required AWS credentials (accessKeyId and/or secretAccessKey)');
    }

    // Use the Supabase edge function for real AWS Cost Explorer integration
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.functions.invoke('get-cloud-costs', {
      body: { 
        provider: 'aws',
        accountId,
        timeRange,
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
          region: credentials.region || 'us-east-1',
          ...(credentials.sessionToken && { sessionToken: credentials.sessionToken })
        }
      }
    });

    if (error) {
      console.error(`AWS cost data edge function error: ${error.message}`);
      throw new Error(`Edge function error: ${error.message}`);
    }
    
    if (!data || !data.success) {
      throw new Error('No cost data returned from edge function');
    }
    
    console.log(`Successfully fetched real AWS cost data: $${data.totalCost}`);
    return { 
      costs: data.dailyCosts.map((d: any) => ({
        date: d.date,
        amount: d.cost,
        service: d.service || 'Unknown'
      })),
      total: data.totalCost
    };
  } catch (error: any) {
    console.error(`AWS cost data error for ${accountId}:`, error);
    
    // Return error instead of fallback for real integration
    return {
      costs: [],
      total: 0,
      error: `AWS Cost Explorer error: ${error.message || 'Failed to retrieve cost data'}`
    };
  }
};

// AWS-specific cost optimization recommendations using real AWS APIs
export const getAwsOptimizations = async (
  accountId: string,
  credentials?: Record<string, any>
): Promise<{
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    resourceId?: string;
    resourceType?: string;
    savings: number;
  }>;
  error?: string;
}> => {
  try {
    console.log(`Getting real AWS optimization recommendations for account ${accountId}`);
    
    if (!credentials || !credentials.accessKeyId || !credentials.secretAccessKey) {
      throw new Error('Missing required AWS credentials (accessKeyId and/or secretAccessKey)');
    }

    // Use the Supabase edge function for real AWS optimization recommendations
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.functions.invoke('get-cost-optimizations', {
      body: { 
        provider: 'aws',
        accountId,
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
          region: credentials.region || 'us-east-1',
          ...(credentials.sessionToken && { sessionToken: credentials.sessionToken })
        }
      }
    });

    if (error) {
      console.error(`AWS optimization recommendations edge function error: ${error.message}`);
      throw new Error(`Edge function error: ${error.message}`);
    }
    
    if (!data || !data.success) {
      throw new Error('No optimization data returned from edge function');
    }
    
    console.log(`Successfully fetched ${data.recommendations.length} real AWS optimization recommendations`);
    return { 
      recommendations: data.recommendations.map((rec: any) => ({
        id: rec.id,
        title: rec.title,
        description: rec.description,
        resourceId: rec.resourceId,
        resourceType: rec.resourceType,
        savings: rec.savings || rec.potentialSavings || 0
      }))
    };
  } catch (error: any) {
    console.error(`AWS optimization recommendations error for ${accountId}:`, error);
    
    // Return error instead of fallback for real integration
    return {
      recommendations: [],
      error: `AWS recommendation error: ${error.message || 'Failed to retrieve recommendations'}`
    };
  }
};
