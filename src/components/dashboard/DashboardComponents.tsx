
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Loading spinner with skeleton UI
export const LazyLoadingSpinner = () => (
  <div className="w-full">
    <Skeleton className="h-[180px] w-full rounded-md" />
  </div>
);
