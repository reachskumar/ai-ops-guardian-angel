
import React from "react";

export const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center py-6">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);
