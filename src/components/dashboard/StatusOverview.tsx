
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, AlertCircle } from "lucide-react";

interface StatusCardProps {
  title: string;
  count: number;
  status: "healthy" | "warning" | "critical" | "unknown";
  items: { name: string; status: "healthy" | "warning" | "critical" | "unknown" }[];
}

const StatusCard: React.FC<StatusCardProps> = ({ title, count, status, items }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-success";
      case "warning":
        return "bg-warning";
      case "critical":
        return "bg-critical";
      default:
        return "bg-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "critical":
        return <XCircle className="h-4 w-4 text-critical" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Badge
            variant="outline"
            className={`${getStatusColor(status)} text-white px-2 py-0 h-5`}
          >
            {count} {count === 1 ? "item" : "items"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                {getStatusIcon(item.status)}
                <span className="ml-2 text-sm">{item.name}</span>
              </div>
              <Badge
                variant="outline"
                className={`${getStatusColor(item.status)} text-white px-2 py-0 h-5`}
              >
                {item.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const StatusOverview: React.FC = () => {
  const services = [
    { name: "API Gateway", status: "healthy" as const },
    { name: "Auth Service", status: "healthy" as const },
    { name: "Database", status: "healthy" as const },
    { name: "Cache Service", status: "warning" as const },
  ];

  const servers = [
    { name: "Web Server 01", status: "healthy" as const },
    { name: "Web Server 02", status: "healthy" as const },
    { name: "App Server 01", status: "critical" as const },
    { name: "Database Server", status: "healthy" as const },
  ];

  const security = [
    { name: "Firewall", status: "healthy" as const },
    { name: "WAF", status: "healthy" as const },
    { name: "SIEM", status: "warning" as const },
    { name: "Vulnerability Scanner", status: "unknown" as const },
  ];

  const incidents = [
    { name: "INC-001: High CPU", status: "critical" as const },
    { name: "INC-002: Memory Leak", status: "warning" as const },
    { name: "INC-003: Disk Space", status: "warning" as const },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatusCard
        title="Services"
        count={services.length}
        status={services.some(s => s.status === "critical") ? "critical" : services.some(s => s.status === "warning") ? "warning" : "healthy"}
        items={services}
      />
      <StatusCard
        title="Servers"
        count={servers.length}
        status={servers.some(s => s.status === "critical") ? "critical" : servers.some(s => s.status === "warning") ? "warning" : "healthy"}
        items={servers}
      />
      <StatusCard
        title="Security"
        count={security.length}
        status={security.some(s => s.status === "critical") ? "critical" : security.some(s => s.status === "warning") ? "warning" : "healthy"}
        items={security}
      />
      <StatusCard
        title="Active Incidents"
        count={incidents.length}
        status={incidents.some(s => s.status === "critical") ? "critical" : incidents.some(s => s.status === "warning") ? "warning" : "healthy"}
        items={incidents}
      />
    </div>
  );
};

export default StatusOverview;
