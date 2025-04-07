
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Loading spinner with skeleton UI
export const LazyLoadingSpinner = () => (
  <div className="w-full">
    <Skeleton className="h-[180px] w-full rounded-md" />
  </div>
);

// Resource status indicator
export const ResourceStatusIndicator: React.FC<{
  status: string;
}> = ({ status }) => {
  const getStatusClass = () => {
    switch (status.toLowerCase()) {
      case "running":
      case "active":
      case "online":
      case "healthy":
        return "bg-green-500";
      case "warning":
      case "degraded":
        return "bg-amber-500";
      case "stopped":
      case "offline":
      case "inactive":
        return "bg-gray-500";
      case "error":
      case "critical":
        return "bg-red-500";
      case "maintenance":
        return "bg-blue-500";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${getStatusClass()}`} />
      <span className="text-sm capitalize">{status}</span>
    </div>
  );
};
