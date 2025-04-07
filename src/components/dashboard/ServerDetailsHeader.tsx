
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ServerDetailsHeaderProps {
  serverName: string;
  serverStatus: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const ServerDetailsHeader: React.FC<ServerDetailsHeaderProps> = ({
  serverName,
  serverStatus,
  onRefresh,
  isRefreshing = false
}) => {
  const getStatusColor = (status: string) => {
    switch(status) {
      case "running":
        return "bg-green-500 hover:bg-green-600";
      case "warning":
        return "bg-amber-500 hover:bg-amber-600";
      case "stopped":
        return "bg-gray-500 hover:bg-gray-600";
      case "maintenance":
        return "bg-blue-500 hover:bg-blue-600";
      default:
        return "";
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">{serverName}</h2>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={getStatusColor(serverStatus)}>{serverStatus}</Badge>
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        )}
      </div>
    </div>
  );
};

export default ServerDetailsHeader;
