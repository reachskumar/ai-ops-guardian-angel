
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  getOptimizationRecommendations, 
  applyOptimization 
} from '@/services/cloud/costService';

export interface OptimizationRecommendation {
  id: string;
  resourceId: string;
  resourceName: string;
  resourceType: string;
  description: string;
  impact: number;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'pending' | 'applied' | 'rejected';
  details?: Record<string, any>;
}

export const useOptimizationRecommendations = () => {
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [appliedOptimizations, setAppliedOptimizations] = useState<OptimizationRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getOptimizationRecommendations();
      
      if (result.error) {
        setError(result.error);
        toast({
          title: "Error loading recommendations",
          description: result.error,
          variant: "destructive"
        });
      } else {
        setRecommendations(result.recommendations?.filter(r => r.status === 'pending') || []);
        setAppliedOptimizations(result.recommendations?.filter(r => r.status === 'applied') || []);
      }
    } catch (error: any) {
      const errorMessage = error.message || "An unexpected error occurred";
      setError(errorMessage);
      toast({
        title: "Error loading recommendations",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const applyRecommendation = useCallback(async (recommendationId: string) => {
    setIsApplying(true);
    
    try {
      const result = await applyOptimization(recommendationId);
      
      if (result.error) {
        toast({
          title: "Error applying optimization",
          description: result.error,
          variant: "destructive"
        });
        return false;
      }
      
      // Update local state
      setRecommendations(prev => prev.filter(r => r.id !== recommendationId));
      
      // Find the recommendation and update its status
      const appliedRec = recommendations.find(r => r.id === recommendationId);
      if (appliedRec) {
        const updatedRec = { ...appliedRec, status: 'applied' as const };
        setAppliedOptimizations(prev => [...prev, updatedRec]);
      }
      
      toast({
        title: "Optimization applied",
        description: "The cost optimization has been successfully applied",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error applying optimization",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsApplying(false);
    }
  }, [recommendations, toast]);

  // Load recommendations on component mount
  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  return {
    recommendations,
    appliedOptimizations,
    isLoading,
    isApplying,
    error,
    loadRecommendations,
    applyRecommendation,
    totalSavings: recommendations.reduce((acc, rec) => acc + rec.impact, 0),
    appliedSavings: appliedOptimizations.reduce((acc, rec) => acc + rec.impact, 0),
  };
};
