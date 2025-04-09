
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, Loader2, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { OptimizationRecommendation } from "@/hooks/cost/types";

interface OptimizationItemProps {
  recommendation: OptimizationRecommendation;
  isApplyingRecommendation: boolean;
  onDismiss: (id: string) => void;
  onApply: (id: string) => void;
  getDifficultyColor: (difficulty: string) => string;
}

export const OptimizationItem: React.FC<OptimizationItemProps> = ({
  recommendation,
  isApplyingRecommendation,
  onDismiss,
  onApply,
  getDifficultyColor
}) => {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-start gap-2">
          <h3 className="font-medium">{recommendation.title}</h3>
          {recommendation.resourceType && (
            <Badge variant="outline">{recommendation.resourceType}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={getDifficultyColor(recommendation.difficulty)}>
                  {recommendation.difficulty.charAt(0).toUpperCase() + recommendation.difficulty.slice(1)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Implementation difficulty level</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded text-xs font-medium">
            Save ${recommendation.potentialSavings}/mo
          </span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{recommendation.description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Updated {new Date().toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onDismiss(recommendation.id)}
          >
            <X className="h-4 w-4 mr-1" /> Dismiss
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={() => onApply(recommendation.id)}
            disabled={isApplyingRecommendation}
          >
            {isApplyingRecommendation ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-1" />
            )}
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OptimizationItem;
