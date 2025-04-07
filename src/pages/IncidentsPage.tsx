
import React from "react";
import Header from "@/components/Header";
import { SidebarWithProvider } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  MoreVertical,
  Clock,
  Search,
  Filter,
  PlusCircle,
  User,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface IncidentProps {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "in-progress" | "resolved";
  created: string;
  updated: string;
  assignee: string | null;
  source: string;
}

const IncidentsPage: React.FC = () => {
  const incidents: IncidentProps[] = [
    {
      id: "INC-001",
      title: "High CPU Usage on Production Database",
      description:
        "CPU usage on the production database has been over 90% for the last 30 minutes, causing slow response times.",
      severity: "critical",
      status: "open",
      created: "2023-04-07T10:30:00Z",
      updated: "2023-04-07T10:45:00Z",
      assignee: null,
      source: "Monitoring Alert",
    },
    {
      id: "INC-002",
      title: "Memory Leak in Authentication Service",
      description:
        "Authentication service is experiencing a memory leak, causing increased latency and potential service disruption.",
      severity: "high",
      status: "in-progress",
      created: "2023-04-07T09:15:00Z",
      updated: "2023-04-07T10:20:00Z",
      assignee: "John D.",
      source: "Kubernetes Dashboard",
    },
    {
      id: "INC-003",
      title: "Disk Space Warning on App Server",
      description:
        "App server disk usage is approaching 85%, requiring cleanup or expansion.",
      severity: "medium",
      status: "in-progress",
      created: "2023-04-07T08:00:00Z",
      updated: "2023-04-07T09:30:00Z",
      assignee: "Sarah L.",
      source: "AWS CloudWatch",
    },
    {
      id: "INC-004",
      title: "Network Latency in EU Region",
      description:
        "Users in the EU region are experiencing increased latency when accessing the application.",
      severity: "low",
      status: "resolved",
      created: "2023-04-06T14:20:00Z",
      updated: "2023-04-07T08:45:00Z",
      assignee: "Mike T.",
      source: "User Reports",
    },
    {
      id: "INC-005",
      title: "SSL Certificate Expiration Warning",
      description:
        "SSL certificate for api.example.com will expire in 14 days.",
      severity: "medium",
      status: "open",
      created: "2023-04-07T11:10:00Z",
      updated: "2023-04-07T11:10:00Z",
      assignee: null,
      source: "Security Scanner",
    },
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return <Badge className="bg-critical">Critical</Badge>;
      case "high":
        return <Badge className="bg-warning">High</Badge>;
      case "medium":
        return <Badge className="bg-info">Medium</Badge>;
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return (
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-critical"></span>
            <span>Open</span>
          </div>
        );
      case "in-progress":
        return (
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-warning"></span>
            <span>In Progress</span>
          </div>
        );
      case "resolved":
        return (
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-success"></span>
            <span>Resolved</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-muted-foreground"></span>
            <span>Unknown</span>
          </div>
        );
    }
  };

  const incidentMetrics = {
    open: incidents.filter((i) => i.status === "open").length,
    inProgress: incidents.filter((i) => i.status === "in-progress").length,
    resolved: incidents.filter((i) => i.status === "resolved").length,
    critical: incidents.filter((i) => i.severity === "critical").length,
    mttr: "45 mins", // Mean Time To Resolution (example value)
  };

  return (
    <SidebarWithProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Incident Management</h1>
              <p className="text-muted-foreground">
                Track, manage, and resolve operational incidents
              </p>
            </div>
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" /> Create Incident
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
            <Card className="bg-card">
              <CardContent className="p-4">
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-3xl font-bold text-critical">
                    {incidentMetrics.open}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Open</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="p-4">
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-3xl font-bold text-warning">
                    {incidentMetrics.inProgress}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    In Progress
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="p-4">
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-3xl font-bold text-success">
                    {incidentMetrics.resolved}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Resolved</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="p-4">
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-3xl font-bold text-critical">
                    {incidentMetrics.critical}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Critical</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="p-4">
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-3xl font-bold">{incidentMetrics.mttr}</div>
                  <p className="text-sm text-muted-foreground mt-1">Avg. MTTR</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" /> Incidents
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="h-8 gap-1">
                    <Search className="h-4 w-4" />
                    Search
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 gap-1">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="open">Open</TabsTrigger>
                  <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="m-0">
                  <div className="rounded-md border border-border">
                    <div className="grid grid-cols-12 gap-2 border-b border-border bg-muted py-3 px-4">
                      <div className="col-span-2 text-sm font-medium">ID</div>
                      <div className="col-span-3 text-sm font-medium">Title</div>
                      <div className="col-span-2 text-sm font-medium">Severity</div>
                      <div className="col-span-2 text-sm font-medium">Status</div>
                      <div className="col-span-2 text-sm font-medium">Assignee</div>
                      <div className="col-span-1 text-sm font-medium">Actions</div>
                    </div>
                    <div className="divide-y divide-border">
                      {incidents.map((incident, i) => (
                        <div key={i} className="grid grid-cols-12 gap-2 py-3 px-4 hover:bg-muted/50">
                          <div className="col-span-2 text-sm">{incident.id}</div>
                          <div className="col-span-3 text-sm">
                            <div>{incident.title}</div>
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(incident.created).toLocaleString()}
                            </div>
                          </div>
                          <div className="col-span-2 text-sm">
                            {getSeverityBadge(incident.severity)}
                          </div>
                          <div className="col-span-2 text-sm">
                            {getStatusBadge(incident.status)}
                          </div>
                          <div className="col-span-2 text-sm">
                            {incident.assignee ? (
                              <div className="flex items-center gap-1">
                                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                                  <User className="h-3 w-3 text-white" />
                                </div>
                                <span>{incident.assignee}</span>
                              </div>
                            ) : (
                              <Badge variant="outline">Unassigned</Badge>
                            )}
                          </div>
                          <div className="col-span-1 text-sm">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Assign</DropdownMenuItem>
                                <DropdownMenuItem>Update Status</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="open" className="m-0">
                  {/* Similar structure as 'all' but filtered for open incidents */}
                  <div className="rounded-md border border-border">
                    <div className="grid grid-cols-12 gap-2 border-b border-border bg-muted py-3 px-4">
                      <div className="col-span-2 text-sm font-medium">ID</div>
                      <div className="col-span-3 text-sm font-medium">Title</div>
                      <div className="col-span-2 text-sm font-medium">Severity</div>
                      <div className="col-span-2 text-sm font-medium">Status</div>
                      <div className="col-span-2 text-sm font-medium">Assignee</div>
                      <div className="col-span-1 text-sm font-medium">Actions</div>
                    </div>
                    <div className="divide-y divide-border">
                      {incidents
                        .filter((incident) => incident.status === "open")
                        .map((incident, i) => (
                          <div key={i} className="grid grid-cols-12 gap-2 py-3 px-4 hover:bg-muted/50">
                            <div className="col-span-2 text-sm">{incident.id}</div>
                            <div className="col-span-3 text-sm">
                              <div>{incident.title}</div>
                              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(incident.created).toLocaleString()}
                              </div>
                            </div>
                            <div className="col-span-2 text-sm">
                              {getSeverityBadge(incident.severity)}
                            </div>
                            <div className="col-span-2 text-sm">
                              {getStatusBadge(incident.status)}
                            </div>
                            <div className="col-span-2 text-sm">
                              {incident.assignee ? (
                                <div className="flex items-center gap-1">
                                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                                    <User className="h-3 w-3 text-white" />
                                  </div>
                                  <span>{incident.assignee}</span>
                                </div>
                              ) : (
                                <Badge variant="outline">Unassigned</Badge>
                              )}
                            </div>
                            <div className="col-span-1 text-sm">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Assign</DropdownMenuItem>
                                  <DropdownMenuItem>Update Status</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="in-progress" className="m-0">
                  {/* Content for in-progress tab */}
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    {incidents.filter(i => i.status === "in-progress").length > 0 ? (
                      <p>In-progress incidents would be listed here</p>
                    ) : (
                      <div className="text-center">
                        <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p>No incidents in progress</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="resolved" className="m-0">
                  {/* Content for resolved tab */}
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    {incidents.filter(i => i.status === "resolved").length > 0 ? (
                      <p>Resolved incidents would be listed here</p>
                    ) : (
                      <div className="text-center">
                        <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p>No resolved incidents</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarWithProvider>
  );
};

export default IncidentsPage;
