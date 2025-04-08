
import React from "react";
import { Badge } from "@/components/ui/badge";

interface ClusterStatusBadgeProps {
  status: string;
}

const ClusterStatusBadge: React.FC<ClusterStatusBadgeProps> = ({ status }) => {
  return (
    <Badge
      variant="outline"
      className={
        status === "running"
          ? "border-green-500 text-green-500"
          : status === "provisioning" 
          ? "border-blue-500 text-blue-500"
          : "border-amber-500 text-amber-500"
      }
    >
      {status}
    </Badge>
  );
};

export default ClusterStatusBadge;
