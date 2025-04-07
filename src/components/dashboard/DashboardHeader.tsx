
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface DashboardHeaderProps {
  refreshData: () => void;
  isRefreshing?: boolean; // Make isRefreshing optional
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  refreshData,
  isRefreshing = false // Provide a default value
}) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Operations Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time overview of your infrastructure and cloud resources
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={refreshData} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
