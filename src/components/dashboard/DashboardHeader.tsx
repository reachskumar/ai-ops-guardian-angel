
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Activity, Clock } from "lucide-react";

interface DashboardHeaderProps {
  refreshData: () => void;
  isRefreshing: boolean;
  lastRefreshed?: Date | null;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  refreshData, 
  isRefreshing, 
  lastRefreshed 
}) => {
  const formatLastRefreshed = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Activity className="h-8 w-8 text-primary" />
          Cloud Infrastructure Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Real-time monitoring and management of your cloud resources
        </p>
        {lastRefreshed && (
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last updated: {formatLastRefreshed(lastRefreshed)}</span>
            <span className="text-green-500">• Live data from cloud providers</span>
          </div>
        )}
      </div>
      <Button 
        onClick={refreshData} 
        disabled={isRefreshing}
        size="lg"
        className="flex items-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        {isRefreshing ? "Refreshing..." : "Refresh Data"}
      </Button>
    </div>
  );
};

export default DashboardHeader;
