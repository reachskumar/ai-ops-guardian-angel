
import { supabase } from "@/integrations/supabase/client";
import { OptimizationRecommendation } from "@/hooks/cost/types";

// Get cost optimization recommendations
export const getCostOptimizationRecommendations = async (): Promise<{ 
  recommendations: OptimizationRecommendation[];
  potentialSavings: number;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-cost-recommendations', {
      body: { 
        timestamp: new Date().toISOString() // For cache busting
      }
    });

    if (error) throw error;
    
    const potentialSavings = data.recommendations.reduce(
      (sum: number, rec: OptimizationRecommendation) => sum + rec.potentialSavings, 
      0
    );
    
    return { 
      recommendations: data.recommendations,
      potentialSavings
    };
  } catch (error: any) {
    console.error("Get cost recommendations error:", error);
    const recommendations = generateSimulatedOptimizationRecommendations();
    const potentialSavings = recommendations.reduce(
      (sum, rec) => sum + rec.potentialSavings, 
      0
    );
    
    return { 
      recommendations,
      potentialSavings,
      error: error.message || 'Failed to fetch optimization recommendations' 
    };
  }
};

// Apply a cost optimization recommendation
export const applyCostOptimization = async (
  recommendationId: string
): Promise<{ 
  success: boolean;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase.functions.invoke('apply-cost-optimization', {
      body: { 
        recommendationId,
        timestamp: new Date().toISOString()
      }
    });

    if (error) throw error;
    
    return { success: data.success };
  } catch (error: any) {
    console.error("Apply cost optimization error:", error);
    return { 
      success: false,
      error: error.message || 'Failed to apply cost optimization' 
    };
  }
};

// Generate simulated optimization recommendations
export const generateSimulatedOptimizationRecommendations = (): OptimizationRecommendation[] => {
  return [
    {
      id: "rec-1",
      title: "Right-size underutilized EC2 instances",
      description: "3 t2.large instances have <20% CPU utilization over the last week. Consider downgrading to t2.medium.",
      potentialSavings: 120,
      difficulty: 'easy',
      status: 'pending',
      resourceId: 'i-12345',
      resourceType: 'EC2'
    },
    {
      id: "rec-2",
      title: "Use Reserved Instances for stable workloads",
      description: "Convert 5 on-demand EC2 instances to reserved instances for 1-year term.",
      potentialSavings: 450,
      difficulty: 'medium',
      status: 'pending',
      resourceType: 'EC2'
    },
    {
      id: "rec-3",
      title: "Clean up unused EBS volumes",
      description: "3 EBS volumes (40GB each) are unattached and can be removed.",
      potentialSavings: 35,
      difficulty: 'easy',
      status: 'pending',
      resourceType: 'EBS'
    },
    {
      id: "rec-4",
      title: "Move cold data to cheaper storage tiers",
      description: "Transfer rarely accessed S3 data (approximately 500GB) to Glacier storage class.",
      potentialSavings: 85,
      difficulty: 'medium',
      status: 'pending',
      resourceType: 'S3'
    },
    {
      id: "rec-5",
      title: "Clean up unused Elastic IPs",
      description: "You have 2 unassociated Elastic IPs that are incurring charges.",
      potentialSavings: 8,
      difficulty: 'easy',
      status: 'pending',
      resourceType: 'VPC'
    },
  ];
};
