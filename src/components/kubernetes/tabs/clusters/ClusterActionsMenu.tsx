
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  MoreVertical, 
  PlayCircle, 
  StopCircle,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ClusterActionsMenuProps {
  cluster: {
    id: string;
    name: string;
    status: string;
  };
  onViewDetails: (cluster: any) => void;
  onStatusChange: (clusterId: string, newStatus: string) => void;
  onDeleteCluster: (clusterId: string) => void;
}

const ClusterActionsMenu: React.FC<ClusterActionsMenuProps> = ({
  cluster,
  onViewDetails,
  onStatusChange,
  onDeleteCluster
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onViewDetails(cluster)}>
          View Details
        </DropdownMenuItem>
        {cluster.status === "running" ? (
          <DropdownMenuItem onClick={() => onStatusChange(cluster.id, "stopped")}>
            <StopCircle className="h-4 w-4 mr-2" />
            Stop Cluster
          </DropdownMenuItem>
        ) : cluster.status !== "provisioning" ? (
          <DropdownMenuItem onClick={() => onStatusChange(cluster.id, "running")}>
            <PlayCircle className="h-4 w-4 mr-2" />
            Start Cluster
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-destructive"
          onClick={() => onDeleteCluster(cluster.id)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Cluster
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ClusterActionsMenu;
