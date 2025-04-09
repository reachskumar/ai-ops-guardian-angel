
import { useState, useEffect, useCallback } from 'react';
import { OptimizationRecommendation } from './types';
import { getCostOptimizationRecommendations, applyCostOptimization } from '@/services/cloud/costService';
import { useToast } from '@/hooks/use-toast';

export const useOptimizationRecommendations = () => {
  const [isApplyingRecommendation, setIsApplyingRecommendation] = useState(false);
  const [optimizationRecommendations, setOptimizationRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [totalPotentialSavings, setTotalPotentialSavings] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch optimization recommendations
      const recommendationsResult = await getCostOptimizationRecommendations();
      
      if (recommendationsResult.error) {
        console.error("Error fetching recommendations:", recommendationsResult.error);
        setError(recommendationsResult.error);
        toast({
          title: "Error fetching optimization recommendations",
          description: "Using simulated data instead",
          variant: "destructive"
        });
      }
      
      // Set the recommendations data - even if there was an error, we'll use the simulated data
      setOptimizationRecommendations(recommendationsResult.recommendations);
      setTotalPotentialSavings(recommendationsResult.potentialSavings);
      
    } catch (error: any) {
      console.error("Error loading recommendations:", error);
      setError(error.message || "An unexpected error occurred");
      toast({
        title: "Error loading recommendations",
        description: "Using simulated data instead",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Load recommendations when the component mounts
  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

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
          .filter(rec => rec.id !== recommendationId || rec.status !== 'pending')
          .reduce((sum, rec) => rec.status === 'pending' ? sum + rec.potentialSavings : sum, 0);
          
        setTotalPotentialSavings(newSavings);
      } else {
        toast({
          title: "Failed to apply recommendation",
          description: result.error || "Unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Error applying recommendation:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred, but the UI has been updated",
        variant: "destructive"
      });
      
      // Still update the UI for better UX
      setOptimizationRecommendations(prev => 
        prev.map(rec => 
          rec.id === recommendationId 
            ? { ...rec, status: 'applied' } 
            : rec
        )
      );
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
      .filter(rec => rec.id !== recommendationId || rec.status !== 'pending')
      .reduce((sum, rec) => rec.status === 'pending' ? sum + rec.potentialSavings : sum, 0);
      
    setTotalPotentialSavings(newSavings);
    
    toast({
      title: "Recommendation dismissed",
      description: "The recommendation has been dismissed from your list",
    });
  };

  return {
    isLoading,
    isApplyingRecommendation,
    error,
    optimizationRecommendations,
    totalPotentialSavings,
    loadRecommendations,
    applyRecommendation,
    dismissRecommendation
  };
};
