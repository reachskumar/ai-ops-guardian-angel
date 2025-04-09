
import React from "react";
import { Badge } from "@/components/ui/badge";
import { OptimizationRecommendation } from "@/hooks/cost/types";

interface AppliedOptimizationsProps {
  recommendations: OptimizationRecommendation[];
}

export const AppliedOptimizations: React.FC<AppliedOptimizationsProps> = ({ recommendations }) => {
  if (recommendations.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">
        Recently Applied Optimizations
      </h3>
      <div className="space-y-2">
        {recommendations.slice(0, 2).map(rec => (
          <div 
            key={rec.id} 
            className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded"
          >
            <span className="text-sm">{rec.title}</span>
            <Badge variant="outline" className="text-green-600 border-green-600">
              ${rec.potentialSavings}/mo saved
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppliedOptimizations;
