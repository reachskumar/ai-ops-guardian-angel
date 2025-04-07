
import React from "react";
import { cn } from "@/lib/utils";

interface ServerItem {
  id: string;
  name: string;
  status: string;
  type: string;
  ip: string;
  os: string;
  cpu: string;
  memory: string;
  region: string;
}

interface ServerListProps {
  servers: ServerItem[];
  selectedServerId: string | null;
  onSelectServer: (id: string) => void;
}

const ServerList: React.FC<ServerListProps> = ({ 
  servers, 
  selectedServerId, 
  onSelectServer 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-500";
      case "warning":
        return "bg-amber-500";
      case "stopped":
        return "bg-gray-500";
      case "maintenance":
        return "bg-blue-500";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div className="divide-y">
      {servers.map((server) => (
        <div
          key={server.id}
          className={cn(
            "flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors",
            selectedServerId === server.id && "bg-muted"
          )}
          onClick={() => onSelectServer(server.id)}
        >
          <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(server.status)}`} />
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{server.name}</div>
            <div className="text-xs text-muted-foreground truncate">
              {server.type} | {server.region}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServerList;
