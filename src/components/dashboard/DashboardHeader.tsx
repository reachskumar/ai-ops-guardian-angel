import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface DashboardHeaderProps {
  totalResources: number;
  activeAlerts: number;
  averageHealth: number;
  costThisMonth: number;
  onRefresh: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  totalResources,
  activeAlerts,
  averageHealth,
  costThisMonth,
  onRefresh
}) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Welcome back!
          </h2>
          <p className="text-sm text-muted-foreground">
            Here's what's happening with your infrastructure today.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border rounded-md p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Resources
          </h3>
          <p className="text-2xl font-semibold">{totalResources}</p>
        </div>
        <div className="border rounded-md p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Active Alerts
          </h3>
          <p className="text-2xl font-semibold">{activeAlerts}</p>
        </div>
        <div className="border rounded-md p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Average Health
          </h3>
          <p className="text-2xl font-semibold">{averageHealth}%</p>
        </div>
        <div className="border rounded-md p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Cost This Month
          </h3>
          <p className="text-2xl font-semibold">${costThisMonth}</p>
        </div>
      </div>
      <Button onClick={onRefresh} variant="outline">
        <RefreshCw className="mr-2 h-4 w-4" />
        Refresh Data
      </Button>
    </div>
  );
};

export default DashboardHeader;
