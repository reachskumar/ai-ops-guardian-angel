
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, AlertTriangle, CheckCircle } from "lucide-react";

interface ServerHealthIndicatorProps {
  score: number; // 0-100
  issues: number;
}

const ServerHealthIndicator: React.FC<ServerHealthIndicatorProps> = ({
  score,
  issues
}) => {
  const getHealthStatus = () => {
    if (score >= 80) return { status: "Healthy", icon: CheckCircle, color: "text-green-500" };
    if (score >= 50) return { status: "Warning", icon: AlertTriangle, color: "text-amber-500" };
    return { status: "Critical", icon: AlertTriangle, color: "text-red-500" };
  };

  const health = getHealthStatus();
  const HealthIcon = health.icon;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Server Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col items-center">
            <div className={`text-5xl font-bold ${health.color}`}>{score}</div>
            <div className="flex items-center gap-1.5 mt-2">
              <HealthIcon className={`h-4 w-4 ${health.color}`} />
              <span className={health.color}>{health.status}</span>
            </div>
          </div>
          
          <Progress 
            value={score} 
            className={
              score >= 80 ? "h-2.5 bg-muted [&>div]:bg-green-500" : 
              score >= 50 ? "h-2.5 bg-muted [&>div]:bg-amber-500" : 
              "h-2.5 bg-muted [&>div]:bg-red-500"
            }
          />
          
          <div className="text-center text-sm text-muted-foreground">
            {issues > 0 ? (
              <span>{issues} issue{issues !== 1 ? 's' : ''} detected</span>
            ) : (
              <span>No issues detected</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServerHealthIndicator;
