
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  ChevronRight,
  Clock,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface IncidentProps {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "in-progress" | "resolved";
  time: string;
  assignee: string | null;
}

const IncidentCard: React.FC<{ incident: IncidentProps }> = ({ incident }) => {
  const getSeverityColor = () => {
    switch (incident.severity) {
      case "critical":
        return "bg-critical text-white";
      case "high":
        return "bg-warning text-white";
      case "medium":
        return "bg-info text-white";
      default:
        return "bg-muted-foreground text-white";
    }
  };

  const getStatusColor = () => {
    switch (incident.status) {
      case "open":
        return "border-critical text-critical";
      case "in-progress":
        return "border-warning text-warning";
      case "resolved":
        return "border-success text-success";
      default:
        return "border-muted-foreground text-muted-foreground";
    }
  };

  return (
    <div className="border border-border rounded-md p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={getSeverityColor()}>
            {incident.severity}
          </Badge>
          <span className="text-sm font-medium">{incident.id}</span>
        </div>
        <Badge variant="outline" className={getStatusColor()}>
          {incident.status}
        </Badge>
      </div>
      <h4 className="text-sm font-medium">{incident.title}</h4>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{incident.time}</span>
        </div>
        <div className="flex items-center gap-1">
          <User className="h-3 w-3" />
          <span>{incident.assignee || "Unassigned"}</span>
        </div>
      </div>
    </div>
  );
};

const IncidentPanel: React.FC = () => {
  const incidents: IncidentProps[] = [
    {
      id: "INC-001",
      title: "High CPU Usage on Production Database",
      severity: "critical",
      status: "open",
      time: "10 mins ago",
      assignee: null,
    },
    {
      id: "INC-002",
      title: "Memory Leak in Authentication Service",
      severity: "high",
      status: "in-progress",
      time: "45 mins ago",
      assignee: "John D.",
    },
    {
      id: "INC-003",
      title: "Disk Space Warning on App Server",
      severity: "medium",
      status: "in-progress",
      time: "2 hours ago",
      assignee: "Sarah L.",
    },
    {
      id: "INC-004",
      title: "Network Latency in EU Region",
      severity: "low",
      status: "resolved",
      time: "1 day ago",
      assignee: "Mike T.",
    },
  ];

  return (
    <Card className="col-span-1 row-span-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" /> Incidents
          </CardTitle>
          <Button variant="outline" size="sm" className="h-8">
            Create New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {incidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
          <Button
            variant="outline"
            className="w-full justify-between mt-4"
            asChild
          >
            <a href="/incidents">
              View All Incidents
              <ChevronRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncidentPanel;
