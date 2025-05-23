
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";
import { OptimizationRecommendation } from "@/hooks/cost/types";
import OptimizationItem from "./OptimizationItem";
import EmptyOptimizations from "./EmptyOptimizations";
import AppliedOptimizations from "./AppliedOptimizations";

interface OptimizationRecommendationsPanelProps {
  isLoading: boolean;
  optimizationRecommendations?: OptimizationRecommendation[];
  recommendations?: OptimizationRecommendation[]; // Add for compatibility
  totalPotentialSavings?: number;
  isApplyingRecommendation?: boolean;
  dismissRecommendation?: (id: string) => void;
  applyRecommendation?: (id: string) => void;
  onApply?: (id: string) => Promise<boolean>;
}

export const OptimizationRecommendationsPanel: React.FC<OptimizationRecommendationsPanelProps> = ({
  isLoading,
  optimizationRecommendations,
  recommendations,
  totalPotentialSavings = 0,
  isApplyingRecommendation = false,
  dismissRecommendation,
  applyRecommendation,
  onApply
}) => {
  // Use recommendations prop if optimizationRecommendations is not provided
  const allRecommendations = optimizationRecommendations || recommendations || [];
  const pendingRecommendations = allRecommendations.filter(rec => rec.status === 'pending');
  const appliedRecommendations = allRecommendations.filter(rec => rec.status === 'applied');

  // Use the appropriate callback function
  const handleApply = (id: string) => {
    if (applyRecommendation) {
      applyRecommendation(id);
    } else if (onApply) {
      onApply(id);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-primary" />
          Cost Optimization Recommendations
        </CardTitle>
        <CardDescription>
          Potential monthly savings: ${totalPotentialSavings.toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin text-muted-foreground border-t-2 border-primary rounded-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRecommendations.length === 0 ? (
              <EmptyOptimizations />
            ) : (
              pendingRecommendations.map((recommendation) => (
                <OptimizationItem
                  key={recommendation.id}
                  recommendation={recommendation}
                  isApplyingRecommendation={isApplyingRecommendation}
                  onDismiss={dismissRecommendation || (() => {})}
                  onApply={handleApply}
                  getDifficultyColor={getDifficultyColor}
                />
              ))
            )}
            
            {appliedRecommendations.length > 0 && (
              <AppliedOptimizations 
                recommendations={appliedRecommendations} 
                optimizations={appliedRecommendations} 
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OptimizationRecommendationsPanel;
