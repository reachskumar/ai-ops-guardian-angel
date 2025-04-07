
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, HardDrive, Network } from "lucide-react";

interface MetricStatusCardProps {
  title: string;
  value: string | number;
  unit: string;
  status: string;
  icon?: "cpu" | "memory" | "disk" | "network";
}

const MetricStatusCard: React.FC<MetricStatusCardProps> = ({
  title,
  value,
  unit,
  status,
  icon = "cpu",
}) => {
  // Get badge variant based on status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "critical":
        return "destructive";
      case "warning":
        return "warning";
      case "normal":
      default:
        return "default";
    }
  };

  // Get the appropriate icon component
  const getIcon = () => {
    switch (icon) {
      case "cpu":
        return <Cpu className="h-4 w-4 mr-2 text-blue-500" />;
      case "memory":
        return <div className="h-4 w-4 mr-2 bg-green-500 rounded-full" />;
      case "disk":
        return <HardDrive className="h-4 w-4 mr-2 text-amber-500" />;
      case "network":
        return <Network className="h-4 w-4 mr-2 text-purple-500" />;
      default:
        return <Cpu className="h-4 w-4 mr-2 text-blue-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center">
            {getIcon()}
            {title}
          </CardTitle>
          <Badge variant={getStatusBadgeVariant(status)}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {value !== undefined ? (
          <div className="text-2xl font-bold">
            {value}{unit}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No data available</div>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricStatusCard;
