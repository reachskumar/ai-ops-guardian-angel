
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Clock, Check, AlertTriangle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Alert {
  id: string;
  type: "info" | "warning" | "critical";
  message: string;
  timestamp: string;
  acknowledged: boolean;
  server_id: string;
}

interface AlertsPanelProps {
  serverId: string;
  isLoading?: boolean;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ 
  serverId, 
  isLoading = false 
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const { toast } = useToast();

  // Simulate fetching alerts
  useEffect(() => {
    // Mock alerts data
    const mockAlerts: Alert[] = [
      {
        id: "alert-1",
        type: "warning",
        message: "High CPU utilization detected (85%)",
        timestamp: "2025-04-07T08:12:33Z",
        acknowledged: false,
        server_id: serverId
      },
      {
        id: "alert-2",
        type: "info",
        message: "Memory usage above 70% threshold",
        timestamp: "2025-04-07T07:45:21Z",
        acknowledged: true,
        server_id: serverId
      },
      {
        id: "alert-3",
        type: "critical",
        message: "Disk space critically low (5% free)",
        timestamp: "2025-04-07T06:30:15Z",
        acknowledged: false,
        server_id: serverId
      }
    ];
    
    setAlerts(mockAlerts);
  }, [serverId]);

  const handleAcknowledge = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, acknowledged: true } 
        : alert
    ));
    
    toast({
      title: "Alert acknowledged",
      description: "The alert has been marked as acknowledged"
    });
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "critical":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case "warning":
        return <Badge className="bg-amber-500">Warning</Badge>;
      case "critical":
        return <Badge className="bg-red-500">Critical</Badge>;
      default:
        return <Badge className="bg-blue-500">Info</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Server Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-60 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Server Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No alerts found for this server
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className="flex items-start justify-between border-b border-border pb-4"
              >
                <div className="flex gap-3">
                  <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                  <div>
                    <div className="flex gap-2 items-center">
                      {getAlertBadge(alert.type)}
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1">{alert.message}</p>
                  </div>
                </div>
                <div>
                  {alert.acknowledged ? (
                    <span className="text-xs flex items-center gap-1 text-green-500">
                      <Check className="h-3 w-3" /> Acknowledged
                    </span>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleAcknowledge(alert.id)}
                    >
                      Acknowledge
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsPanel;
