
import React from "react";
import { Badge } from "@/components/ui/badge";

interface ApiKeyStatusBadgeProps {
  status: string;
}

const ApiKeyStatusBadge: React.FC<ApiKeyStatusBadgeProps> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return "border-green-500 text-green-500";
      case 'expiring soon':
        return "border-amber-500 text-amber-500";
      case 'expired':
      case 'revoked':
        return "border-red-500 text-red-500";
      default:
        return "border-gray-500 text-gray-500";
    }
  };

  return (
    <Badge
      variant="outline"
      className={getStatusColor(status)}
    >
      {status}
    </Badge>
  );
};

export default ApiKeyStatusBadge;
