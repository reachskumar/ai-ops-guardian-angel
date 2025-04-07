
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RefreshCw, Server, Activity, Clock } from "lucide-react";

interface ServerMetric {
  name: string;
  value: number;
  max: number;
  unit: string;
  status: "normal" | "warning" | "critical";
}

interface ServerMetricsPanelProps {
  serverName: string;
  serverStatus: string;
  lastUpdated: string;
  metrics: ServerMetric[];
  onRefresh?: () => void;
}

const ServerMetricsPanel: React.FC<ServerMetricsPanelProps> = ({
  serverName,
  serverStatus,
  lastUpdated,
  metrics,
  onRefresh
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

  const getMetricStatusColor = (status: "normal" | "warning" | "critical") => {
    switch(status) {
      case "normal":
        return "text-green-500";
      case "warning":
        return "text-amber-500";
      case "critical":
        return "text-red-500";
      default:
        return "";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex flex-col space-y-1.5">
          <CardTitle className="text-md font-medium flex items-center">
            <Server className="h-5 w-5 text-primary mr-2" /> {serverName}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge className={getStatusColor(serverStatus)}>{serverStatus}</Badge>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Updated {lastUpdated}</span>
            </div>
          </div>
        </div>
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{metric.name}</div>
                <div className="flex items-center">
                  <span className={`text-sm font-medium ${getMetricStatusColor(metric.status)}`}>
                    {metric.value} {metric.unit}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Progress 
                  value={(metric.value / metric.max) * 100} 
                  className={
                    metric.status === "critical" ? "h-2 bg-secondary [&>div]:bg-red-500" : 
                    metric.status === "warning" ? "h-2 bg-secondary [&>div]:bg-amber-500" : 
                    "h-2 bg-secondary [&>div]:bg-green-500"
                  }
                />
                <span className="text-xs text-muted-foreground">{Math.round((metric.value / metric.max) * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServerMetricsPanel;
