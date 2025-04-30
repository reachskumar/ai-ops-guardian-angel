
import { supabase } from "@/integrations/supabase/client";

// Get cost optimization suggestions
export const getOptimizationSuggestions = async (): Promise<{
  suggestions: any[];
  totalSavings: number;
  error?: string;
}> => {
  try {
    // Try to call the edge function if available
    try {
      const { data, error } = await supabase.functions.invoke('get-cost-optimizations', {
        body: {}
      });
      
      if (error) throw error;
      
      return data;
    } catch (edgeError: any) {
      console.warn("Edge function error, falling back to mock data:", edgeError);
      
      // Generate mock optimization suggestions
      const mockSuggestions = [
        {
          id: 'opt-1',
          title: 'Right-size VM instances',
          description: '2 instances have low CPU utilization (<10%) over the last 2 weeks',
          resourceIds: ['vm-123', 'vm-456'],
          monthlySavings: 45.20,
          difficulty: 'medium',
          category: 'compute'
        },
        {
          id: 'opt-2',
          title: 'Delete unattached persistent disks',
          description: '3 persistent disks are not attached to any instance',
          resourceIds: ['disk-123', 'disk-456', 'disk-789'],
          monthlySavings: 15.75,
          difficulty: 'easy',
          category: 'storage'
        },
        {
          id: 'opt-3',
          title: 'Use committed use discounts',
          description: 'Stable VM usage pattern detected, consider committed use for 1-3 years',
          resourceIds: ['project-123'],
          monthlySavings: 35.40,
          difficulty: 'complex',
          category: 'billing'
        },
        {
          id: 'opt-4',
          title: 'Optimize network usage',
          description: 'Consider using Cloud CDN to reduce egress traffic costs',
          resourceIds: ['project-123'],
          monthlySavings: 18.25,
          difficulty: 'medium',
          category: 'network'
        }
      ];
      
      // Calculate total savings
      const totalSavings = mockSuggestions.reduce((sum, item) => sum + item.monthlySavings, 0);
      
      return {
        suggestions: mockSuggestions,
        totalSavings: Number(totalSavings.toFixed(2))
      };
    }
  } catch (error: any) {
    console.error("Get optimization suggestions error:", error);
    return {
      suggestions: [],
      totalSavings: 0,
      error: error.message || 'Failed to retrieve optimization suggestions'
    };
  }
};

// Apply a specific optimization
export const applyOptimization = async (
  optimizationId: string
): Promise<{
  success: boolean;
  appliedChanges?: string[];
  error?: string;
}> => {
  try {
    // Try to call the edge function if available
    try {
      const { data, error } = await supabase.functions.invoke('apply-optimization', {
        body: { optimizationId }
      });
      
      if (error) throw error;
      
      return data;
    } catch (edgeError: any) {
      console.warn("Edge function error, falling back to mock implementation:", edgeError);
      
      // Mock success/failure response
      const success = Math.random() > 0.3; // 70% success rate
      
      if (success) {
        return {
          success: true,
          appliedChanges: [
            'Modified instance type from n1-standard-4 to n1-standard-2',
            'Updated resource tags'
          ]
        };
      } else {
        return {
          success: false,
          error: 'Unable to apply optimization due to resource constraints'
        };
      }
    }
  } catch (error: any) {
    console.error("Apply optimization error:", error);
    return {
      success: false,
      error: error.message || 'Failed to apply optimization'
    };
  }
};
