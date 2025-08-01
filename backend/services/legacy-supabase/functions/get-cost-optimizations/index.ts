
// Edge function to fetch cost optimization recommendations from cloud providers
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// Import AWS SDK for Cost Explorer and CloudWatch
import { CostExplorerClient, GetCostAndUsageCommand, GetRightsizingRecommendationCommand } from "https://esm.sh/@aws-sdk/client-cost-explorer@3.462.0";
import { CloudWatchClient, GetMetricStatisticsCommand } from "https://esm.sh/@aws-sdk/client-cloudwatch@3.462.0";
import { EC2Client, DescribeInstancesCommand } from "https://esm.sh/@aws-sdk/client-ec2@3.462.0";

const handleError = (error: any, message: string) => {
  console.error(message, error);
  return new Response(
    JSON.stringify({
      success: false,
      error: `${message}: ${error.message || 'Unknown error'}`,
      timestamp: new Date().toISOString()
    }),
    {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
};

// Analyze AWS cost optimization opportunities
const analyzeAwsCostOptimizations = async (credentials: any, resources: any[]) => {
  const config = {
    region: credentials.region || 'us-east-1',
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      ...(credentials.sessionToken && { sessionToken: credentials.sessionToken })
    }
  };

  const optimizations: any[] = [];

  try {
    // 1. Get AWS Cost Explorer rightsizing recommendations
    const costExplorer = new CostExplorerClient({ ...config, region: 'us-east-1' }); // Cost Explorer only in us-east-1
    
    try {
      const rightsizingCommand = new GetRightsizingRecommendationCommand({
        Service: 'AmazonEC2',
        PageSize: 50
      });
      const rightsizingResult = await costExplorer.send(rightsizingCommand);

      if (rightsizingResult.RightsizingRecommendations) {
        for (const rec of rightsizingResult.RightsizingRecommendations) {
          if (rec.ModifyRecommendationDetail) {
            optimizations.push({
              id: `aws-rightsize-${rec.AccountId}-${Date.now()}`,
              type: 'rightsizing',
              title: `Rightsize ${rec.CurrentInstance?.ResourceId}`,
              description: `Reduce instance size from ${rec.CurrentInstance?.InstanceDetails?.EC2InstanceDetails?.InstanceType} to ${rec.ModifyRecommendationDetail.TargetInstances?.[0]?.InstanceDetails?.EC2InstanceDetails?.InstanceType}`,
              provider: 'aws',
              resource_id: rec.CurrentInstance?.ResourceId,
              resource_type: 'ec2-instance',
              current_cost: parseFloat(rec.CurrentInstance?.MonthlyCost || '0'),
              optimized_cost: parseFloat(rec.ModifyRecommendationDetail?.TargetInstances?.[0]?.EstimatedMonthlySavings || '0'),
              monthly_savings: parseFloat(rec.ModifyRecommendationDetail?.TargetInstances?.[0]?.EstimatedMonthlySavings || '0'),
              confidence: 'high',
              effort: 'medium',
              details: {
                currentInstanceType: rec.CurrentInstance?.InstanceDetails?.EC2InstanceDetails?.InstanceType,
                recommendedInstanceType: rec.ModifyRecommendationDetail.TargetInstances?.[0]?.InstanceDetails?.EC2InstanceDetails?.InstanceType,
                utilizationMetrics: rec.CurrentInstance?.UtilizationMetrics
              },
              automated: true,
              created_at: new Date().toISOString()
            });
          }
        }
      }
    } catch (rightsizingError) {
      console.log('Rightsizing recommendations not available or insufficient permissions:', rightsizingError.message);
    }

    // 2. Analyze underutilized resources based on CloudWatch metrics
    const cloudwatch = new CloudWatchClient(config);
    const ec2Client = new EC2Client(config);

    // Get EC2 instances for analysis
    const ec2Instances = resources.filter(r => r.subtype === 'ec2-instance' && r.status === 'running');
    
    for (const instance of ec2Instances.slice(0, 10)) { // Limit to avoid API throttling
      try {
        // Get CPU utilization for the past 14 days
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - 14 * 24 * 60 * 60 * 1000);

        const metricsCommand = new GetMetricStatisticsCommand({
          Namespace: 'AWS/EC2',
          MetricName: 'CPUUtilization',
          Dimensions: [
            {
              Name: 'InstanceId',
              Value: instance.id
            }
          ],
          StartTime: startTime,
          EndTime: endTime,
          Period: 3600, // 1 hour periods
          Statistics: ['Average', 'Maximum']
        });

        const metricsResult = await cloudwatch.send(metricsCommand);
        
        if (metricsResult.Datapoints && metricsResult.Datapoints.length > 0) {
          const avgCpu = metricsResult.Datapoints.reduce((sum, dp) => sum + (dp.Average || 0), 0) / metricsResult.Datapoints.length;
          const maxCpu = Math.max(...metricsResult.Datapoints.map(dp => dp.Maximum || 0));

          // Identify underutilized instances (avg < 10% and max < 50%)
          if (avgCpu < 10 && maxCpu < 50) {
            optimizations.push({
              id: `aws-underutilized-${instance.id}`,
              type: 'underutilized',
              title: `Underutilized Instance: ${instance.name}`,
              description: `Instance has low CPU utilization (avg: ${avgCpu.toFixed(1)}%, max: ${maxCpu.toFixed(1)}%). Consider stopping, rightsizing, or terminating.`,
              provider: 'aws',
              resource_id: instance.id,
              resource_type: 'ec2-instance',
              current_cost: instance.cost_monthly || 0,
              optimized_cost: 0,
              monthly_savings: instance.cost_monthly || 0,
              confidence: avgCpu < 5 ? 'high' : 'medium',
              effort: 'low',
              details: {
                avgCpuUtilization: avgCpu,
                maxCpuUtilization: maxCpu,
                instanceType: instance.details?.instanceType,
                analysisWindow: '14 days'
              },
              automated: false,
              created_at: new Date().toISOString()
            });
          }

          // Identify over-provisioned instances (consistently high utilization)
          if (avgCpu > 80 && maxCpu > 95) {
            optimizations.push({
              id: `aws-overprovisioned-${instance.id}`,
              type: 'scaling',
              title: `High Utilization: ${instance.name}`,
              description: `Instance shows consistently high CPU utilization (avg: ${avgCpu.toFixed(1)}%). Consider upgrading to larger instance type.`,
              provider: 'aws',
              resource_id: instance.id,
              resource_type: 'ec2-instance',
              current_cost: instance.cost_monthly || 0,
              optimized_cost: (instance.cost_monthly || 0) * 1.5, // Estimate larger instance cost
              monthly_savings: -(instance.cost_monthly || 0) * 0.5, // Negative savings (additional cost)
              confidence: 'high',
              effort: 'medium',
              details: {
                avgCpuUtilization: avgCpu,
                maxCpuUtilization: maxCpu,
                recommendedAction: 'upgrade_instance_type'
              },
              automated: false,
              created_at: new Date().toISOString()
            });
          }
        }
      } catch (metricsError) {
        console.log(`Could not get metrics for instance ${instance.id}:`, metricsError.message);
      }
    }

    // 3. Identify unattached EBS volumes
    const unattachedVolumes = resources.filter(r => 
      r.subtype === 'ebs-volume' && 
      r.status === 'available' && 
      (!r.details?.attachments || r.details.attachments.length === 0)
    );

    for (const volume of unattachedVolumes) {
      optimizations.push({
        id: `aws-unattached-volume-${volume.id}`,
        type: 'unused_resource',
        title: `Unattached EBS Volume: ${volume.name}`,
        description: `EBS volume is not attached to any instance and is incurring storage costs.`,
        provider: 'aws',
        resource_id: volume.id,
        resource_type: 'ebs-volume',
        current_cost: volume.cost_monthly || 0,
        optimized_cost: 0,
        monthly_savings: volume.cost_monthly || 0,
        confidence: 'high',
        effort: 'low',
        details: {
          volumeSize: volume.details?.size,
          volumeType: volume.details?.volumeType,
          encrypted: volume.details?.encrypted
        },
        automated: true,
        created_at: new Date().toISOString()
      });
    }

    // 4. Reserved Instance recommendations (simplified)
    const runningInstances = resources.filter(r => 
      r.subtype === 'ec2-instance' && 
      r.status === 'running'
    );

    if (runningInstances.length >= 3) {
      // Group by instance type
      const instanceTypes = runningInstances.reduce((acc, instance) => {
        const type = instance.details?.instanceType || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

             for (const [instanceType, count] of Object.entries(instanceTypes)) {
         if ((count as number) >= 2) { // At least 2 instances of same type
           const estimatedMonthlyCost = (count as number) * getInstanceTypeCost(instanceType);
          const reservedInstanceSavings = estimatedMonthlyCost * 0.3; // ~30% savings

          optimizations.push({
            id: `aws-reserved-instance-${instanceType}`,
            type: 'reserved_instance',
            title: `Reserved Instance Opportunity: ${instanceType}`,
            description: `You have ${count} running ${instanceType} instances. Purchase Reserved Instances for ~30% savings.`,
            provider: 'aws',
            resource_id: `multiple-${instanceType}`,
            resource_type: 'ec2-instance',
            current_cost: estimatedMonthlyCost,
            optimized_cost: estimatedMonthlyCost - reservedInstanceSavings,
            monthly_savings: reservedInstanceSavings,
            confidence: 'high',
            effort: 'low',
            details: {
              instanceType,
              instanceCount: count,
              recommendedTerm: '1-year',
              paymentOption: 'partial-upfront'
            },
            automated: false,
            created_at: new Date().toISOString()
          });
        }
      }
    }

    console.log(`Generated ${optimizations.length} AWS cost optimizations`);
    return optimizations;

  } catch (error) {
    console.error('Error analyzing AWS cost optimizations:', error);
    throw error;
  }
};

// Get EC2 instance type estimated cost (simplified)
const getInstanceTypeCost = (instanceType: string): number => {
  const costs: any = {
    't3.micro': 8.4,
    't3.small': 16.8,
    't3.medium': 33.6,
    't3.large': 67.2,
    't3.xlarge': 134.4,
    't3.2xlarge': 268.8,
    'm5.large': 70.08,
    'm5.xlarge': 140.16,
    'm5.2xlarge': 280.32,
    'c5.large': 61.92,
    'c5.xlarge': 123.84,
    'r5.large': 91.20,
    'r5.xlarge': 182.40
  };
  
  return costs[instanceType] || 50; // Default fallback
};

// Store optimization recommendations in database
const storeOptimizations = async (supabase: any, optimizations: any[], userId: string) => {
  try {
    for (const optimization of optimizations) {
      const { error } = await supabase
        .from('cost_optimizations')
        .upsert({
          id: optimization.id,
          user_id: userId,
          type: optimization.type,
          title: optimization.title,
          description: optimization.description,
          provider: optimization.provider,
          resource_id: optimization.resource_id,
          resource_type: optimization.resource_type,
          current_cost: optimization.current_cost,
          optimized_cost: optimization.optimized_cost,
          monthly_savings: optimization.monthly_savings,
          confidence: optimization.confidence,
          effort: optimization.effort,
          details: optimization.details,
          automated: optimization.automated,
          status: 'pending',
          created_at: optimization.created_at
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error(`Error storing optimization ${optimization.id}:`, error);
      }
    }

    console.log(`Stored ${optimizations.length} cost optimizations`);
  } catch (error) {
    console.error('Error storing optimizations:', error);
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { provider, credentials, userId, accountId } = await req.json();

    if (!provider || !credentials || !userId) {
      throw new Error('Provider, credentials, and user ID are required');
    }

    console.log(`Analyzing cost optimizations for ${provider}...`);

    // Get resources for this account from database
    const { data: resources, error: resourcesError } = await supabase
      .from('cloud_resources')
      .select('*')
      .eq('account_id', accountId)
      .eq('user_id', userId);

    if (resourcesError) {
      throw new Error(`Failed to fetch resources: ${resourcesError.message}`);
    }

    let optimizations: any[] = [];

    switch (provider.toLowerCase()) {
      case 'aws':
        optimizations = await analyzeAwsCostOptimizations(credentials, resources || []);
        break;
      case 'azure':
        // Azure optimization analysis would go here
        console.log('Azure cost optimization analysis not yet implemented');
        break;
      case 'gcp':
        // GCP optimization analysis would go here
        console.log('GCP cost optimization analysis not yet implemented');
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    // Store optimizations in database
    if (optimizations.length > 0) {
      await storeOptimizations(supabase, optimizations, userId);
    }

    // Calculate summary statistics
    const totalMonthlySavings = optimizations.reduce((sum, opt) => sum + (opt.monthly_savings || 0), 0);
    const highConfidenceOptimizations = optimizations.filter(opt => opt.confidence === 'high');
    const automatedOptimizations = optimizations.filter(opt => opt.automated);

    console.log(`✅ Cost optimization analysis completed - found ${optimizations.length} opportunities`);

    return new Response(
      JSON.stringify({
        success: true,
        optimizations: optimizations.slice(0, 20), // Return top 20
        summary: {
          total_optimizations: optimizations.length,
          total_monthly_savings: Math.round(totalMonthlySavings * 100) / 100,
          high_confidence_count: highConfidenceOptimizations.length,
          automated_count: automatedOptimizations.length,
          categories: {
            rightsizing: optimizations.filter(o => o.type === 'rightsizing').length,
            underutilized: optimizations.filter(o => o.type === 'underutilized').length,
            unused_resources: optimizations.filter(o => o.type === 'unused_resource').length,
            reserved_instances: optimizations.filter(o => o.type === 'reserved_instance').length,
            scaling: optimizations.filter(o => o.type === 'scaling').length
          }
        },
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error('Cost optimization analysis error:', error);
    return handleError(error, "Cost optimization analysis failed");
  }
});
