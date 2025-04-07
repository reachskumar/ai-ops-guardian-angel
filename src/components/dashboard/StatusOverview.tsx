
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, AlertCircle } from "lucide-react";

// Define a union type for allowed statuses
type StatusType = "healthy" | "warning" | "critical" | "unknown";

interface StatusCardProps {
  title: string;
  count: number;
  status: StatusType;
  items: { name: string; status: StatusType }[];
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
    { name: "API Gateway", status: "healthy" as StatusType },
    { name: "Auth Service", status: "healthy" as StatusType },
    { name: "Database", status: "healthy" as StatusType },
    { name: "Cache Service", status: "warning" as StatusType },
  ];

  const servers = [
    { name: "Web Server 01", status: "healthy" as StatusType },
    { name: "Web Server 02", status: "healthy" as StatusType },
    { name: "App Server 01", status: "critical" as StatusType },
    { name: "Database Server", status: "healthy" as StatusType },
  ];

  const security = [
    { name: "Firewall", status: "healthy" as StatusType },
    { name: "WAF", status: "healthy" as StatusType },
    { name: "SIEM", status: "warning" as StatusType },
    { name: "Vulnerability Scanner", status: "unknown" as StatusType },
  ];

  const incidents = [
    { name: "INC-001: High CPU", status: "critical" as StatusType },
    { name: "INC-002: Memory Leak", status: "warning" as StatusType },
    { name: "INC-003: Disk Space", status: "warning" as StatusType },
  ];

  // Helper function to determine aggregate status
  const determineStatus = (items: { status: StatusType }[]): StatusType => {
    if (items.some(item => item.status === "critical")) return "critical";
    if (items.some(item => item.status === "warning")) return "warning";
    return "healthy";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatusCard
        title="Services"
        count={services.length}
        status={determineStatus(services)}
        items={services}
      />
      <StatusCard
        title="Servers"
        count={servers.length}
        status={determineStatus(servers)}
        items={servers}
      />
      <StatusCard
        title="Security"
        count={security.length}
        status={determineStatus(security)}
        items={security}
      />
      <StatusCard
        title="Active Incidents"
        count={incidents.length}
        status={determineStatus(incidents)}
        items={incidents}
      />
    </div>
  );
};

export default StatusOverview;
