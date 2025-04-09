
import { useState, useCallback } from 'react';
import { OptimizationRecommendation } from './types';
import { getCostOptimizationRecommendations, applyCostOptimization } from '@/services/cloud/costService';
import { useToast } from '@/hooks/use-toast';

export const useOptimizationRecommendations = () => {
  const [isApplyingRecommendation, setIsApplyingRecommendation] = useState(false);
  const [optimizationRecommendations, setOptimizationRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [totalPotentialSavings, setTotalPotentialSavings] = useState(0);
  const { toast } = useToast();

  const loadRecommendations = useCallback(async () => {
    try {
      // Fetch optimization recommendations
      const recommendationsResult = await getCostOptimizationRecommendations();
      if (recommendationsResult.error) {
        toast({
          title: "Error fetching optimization recommendations",
          description: recommendationsResult.error,
          variant: "destructive"
        });
      } else {
        setOptimizationRecommendations(recommendationsResult.recommendations);
        setTotalPotentialSavings(recommendationsResult.potentialSavings);
      }
    } catch (error: any) {
      toast({
        title: "Error loading recommendations",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Apply a recommendation
  const applyRecommendation = async (recommendationId: string) => {
    setIsApplyingRecommendation(true);
    
    try {
      const result = await applyCostOptimization(recommendationId);
      
      if (result.success) {
        toast({
          title: "Recommendation applied",
          description: "The cost optimization has been successfully applied",
        });
        
        // Update the recommendation status locally
        setOptimizationRecommendations(prev => 
          prev.map(rec => 
            rec.id === recommendationId 
              ? { ...rec, status: 'applied' } 
              : rec
          )
        );
        
        // Recalculate total potential savings
        const newSavings = optimizationRecommendations
          .filter(rec => rec.id !== recommendationId)
          .reduce((sum, rec) => sum + rec.potentialSavings, 0);
          
        setTotalPotentialSavings(newSavings);
      } else {
        toast({
          title: "Failed to apply recommendation",
          description: result.error || "Unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsApplyingRecommendation(false);
    }
  };

  // Dismiss a recommendation
  const dismissRecommendation = (recommendationId: string) => {
    // Update recommendation status locally
    setOptimizationRecommendations(prev => 
      prev.map(rec => 
        rec.id === recommendationId 
          ? { ...rec, status: 'dismissed' } 
          : rec
      )
    );
    
    // Recalculate total potential savings
    const newSavings = optimizationRecommendations
      .filter(rec => rec.id !== recommendationId)
      .reduce((sum, rec) => sum + rec.potentialSavings, 0);
      
    setTotalPotentialSavings(newSavings);
    
    toast({
      title: "Recommendation dismissed",
      description: "The recommendation has been dismissed from your list",
    });
  };

  return {
    isApplyingRecommendation,
    optimizationRecommendations,
    totalPotentialSavings,
    loadRecommendations,
    applyRecommendation,
    dismissRecommendation
  };
};
