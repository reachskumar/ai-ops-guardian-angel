
import React from "react";
import { Check } from "lucide-react";

export const EmptyOptimizations: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 mb-2">
        <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
      </div>
      <h3 className="text-lg font-medium mb-1">Great job!</h3>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        You've addressed all cost optimization recommendations.
        We'll notify you when new opportunities are detected.
      </p>
    </div>
  );
};

export default EmptyOptimizations;
