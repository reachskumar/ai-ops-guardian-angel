
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  getOptimizationRecommendations, 
  applyOptimization 
} from '@/services/cloud/costService';
import { OptimizationRecommendation } from './types';

export const useOptimizationRecommendations = () => {
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [appliedOptimizations, setAppliedOptimizations] = useState<OptimizationRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Add aliases for property compatibility
  const optimizationRecommendations = recommendations;
  const isApplyingRecommendation = isApplying;
  const totalPotentialSavings = recommendations.reduce((acc, rec) => acc + (rec.potentialSavings || rec.impact || 0), 0);
  const totalSavings = totalPotentialSavings;
  const appliedSavings = appliedOptimizations.reduce((acc, rec) => acc + (rec.potentialSavings || rec.impact || 0), 0);

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

  // Add dismissRecommendation function
  const dismissRecommendation = useCallback((recommendationId: string) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === recommendationId 
          ? { ...rec, status: 'dismissed' as const } 
          : rec
      ).filter(rec => rec.status === 'pending')
    );
    
    toast({
      title: "Recommendation dismissed",
      description: "The optimization suggestion has been dismissed",
    });
  }, [toast]);

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
    dismissRecommendation,
    totalSavings,
    appliedSavings,
    // Aliases for compatibility
    optimizationRecommendations,
    isApplyingRecommendation,
    totalPotentialSavings
  };
};
