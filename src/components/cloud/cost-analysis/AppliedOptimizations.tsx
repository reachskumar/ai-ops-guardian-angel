
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, TrendingDown } from "lucide-react";
import { OptimizationRecommendation } from "@/hooks/cost/types";

interface AppliedOptimizationsProps {
  recommendations?: OptimizationRecommendation[];
  optimizations?: OptimizationRecommendation[];
}

const AppliedOptimizations: React.FC<AppliedOptimizationsProps> = ({ 
  recommendations = [], 
  optimizations = [] 
}) => {
  // Use either recommendations or optimizations, whichever is provided
  const appliedItems = recommendations.length > 0 ? recommendations : optimizations;

  if (appliedItems.length === 0) return null;

  const totalSavings = appliedItems.reduce((sum, item) => 
    sum + (item.potentialSavings || item.impact || 0), 0);

  return (
    <Card className="mt-6 border-green-100 bg-green-50/30">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-green-600" />
          Applied Optimizations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appliedItems.map((item) => (
            <div key={item.id} className="flex items-start gap-2 border-l-2 border-green-500 pl-3 py-1">
              <Check className="h-4 w-4 mt-1 text-green-600 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sm">
                  {item.title || item.description}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.description || `Applied on ${new Date().toLocaleDateString()}`}
                </p>
                <span className="text-xs text-green-600 font-medium mt-1 block">
                  ${(item.potentialSavings || item.impact || 0).toLocaleString()} monthly savings
                </span>
              </div>
            </div>
          ))}
          
          <div className="mt-2 pt-2 border-t border-muted flex justify-between items-center text-sm">
            <span>Total savings</span>
            <span className="font-medium text-green-600">
              ${totalSavings.toLocaleString()}/month
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppliedOptimizations;
