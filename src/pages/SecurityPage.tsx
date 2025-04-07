
import React from "react";
import Header from "@/components/Header";
import { SidebarWithProvider } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  FileCheck,
  Filter,
  Download,
  Clock,
  Search,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const SecurityPage: React.FC = () => {
  const complianceScore = 78;
  const lastScanTime = "2023-04-07T08:30:00Z";

  const vulnerabilityData = [
    { name: "Critical", value: 2, color: "#ef4444" },
    { name: "High", value: 3, color: "#f59e0b" },
    { name: "Medium", value: 5, color: "#3b82f6" },
    { name: "Low", value: 12, color: "#6b7280" },
  ];

  const vulnerabilities = [
    {
      id: "CVE-2023-1234",
      title: "Authentication Bypass in API Gateway",
      severity: "critical",
      component: "api-gateway:v1.2.3",
      discovered: "2 days ago",
      status: "open",
    },
    {
      id: "CVE-2023-5678",
      title: "SQL Injection in User Service",
      severity: "critical",
      component: "user-service:v2.0.1",
      discovered: "3 days ago",
      status: "in-progress",
    },
    {
      id: "CVE-2023-2468",
      title: "Outdated TLS Version",
      severity: "high",
      component: "nginx:1.18.0",
      discovered: "1 week ago",
      status: "in-progress",
    },
    {
      id: "CVE-2023-9101",
      title: "Insecure Dependency",
      severity: "high",
      component: "node-modules/axios:0.21.1",
      discovered: "1 week ago",
      status: "open",
    },
    {
      id: "CVE-2023-3579",
      title: "Cross-Site Scripting (XSS)",
      severity: "high",
      component: "frontend:v3.2.0",
      discovered: "2 weeks ago",
      status: "open",
    },
  ];

  const complianceItems = [
    { name: "CIS Benchmarks", status: "Passing", score: 92 },
    { name: "NIST Framework", status: "Needs Review", score: 84 },
    { name: "PCI DSS", status: "Failing", score: 64 },
    { name: "HIPAA", status: "Passing", score: 90 },
    { name: "SOC 2", status: "Passing", score: 88 },
    { name: "GDPR", status: "Needs Review", score: 76 },
    { name: "ISO 27001", status: "Passing", score: 86 },
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
          <Badge variant="outline" className="border-critical text-critical">
            Open
          </Badge>
        );
      case "in-progress":
        return (
          <Badge variant="outline" className="border-warning text-warning">
            In Progress
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="outline" className="border-success text-success">
            Resolved
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <SidebarWithProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Security & Compliance</h1>
            <p className="text-muted-foreground">
              Monitor vulnerabilities, ensure compliance, and secure your
              infrastructure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">
                    Compliance Score
                  </CardTitle>
                  <Badge
                    className={
                      complianceScore >= 90
                        ? "bg-success"
                        : complianceScore >= 70
                        ? "bg-warning"
                        : "bg-critical"
                    }
                  >
                    {complianceScore}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Progress value={complianceScore} className="h-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-4 w-4" /> Last scan: {new Date(lastScanTime).toLocaleString()}
                    </span>
                    <Button size="sm" variant="outline" className="h-8">
                      Run Scan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">
                  Vulnerability Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={vulnerabilityData}
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {vulnerabilityData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                          />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(222 47% 14%)",
                          borderColor: "hsl(215 25% 22%)",
                          color: "#F3F4F6",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">
                    Security Status
                  </CardTitle>
                  <ShieldAlert className="h-5 w-5 text-critical" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-critical" />
                      <span>Critical Issues</span>
                    </div>
                    <Badge className="bg-critical">{vulnerabilityData[0].value}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      <span>High Issues</span>
                    </div>
                    <Badge className="bg-warning">{vulnerabilityData[1].value}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-success" />
                      <span>Passing Controls</span>
                    </div>
                    <Badge className="bg-success">42</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Tabs defaultValue="vulnerabilities">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
                  <TabsTrigger value="compliance">Compliance</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="h-8 gap-1">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 gap-1">
                    <Search className="h-4 w-4" />
                    Search
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 gap-1">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              <TabsContent value="vulnerabilities">
                <Card>
                  <CardHeader>
                    <CardTitle>Vulnerability Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border border-border">
                      <div className="grid grid-cols-12 gap-2 border-b border-border bg-muted py-3 px-4">
                        <div className="col-span-2 text-sm font-medium">ID</div>
                        <div className="col-span-4 text-sm font-medium">Title</div>
                        <div className="col-span-2 text-sm font-medium">Severity</div>
                        <div className="col-span-2 text-sm font-medium">Discovered</div>
                        <div className="col-span-2 text-sm font-medium">Status</div>
                      </div>
                      <div className="divide-y divide-border">
                        {vulnerabilities.map((vuln, i) => (
                          <div key={i} className="grid grid-cols-12 gap-2 py-3 px-4 hover:bg-muted/50">
                            <div className="col-span-2 text-sm">{vuln.id}</div>
                            <div className="col-span-4 text-sm">
                              <div>{vuln.title}</div>
                              <div className="text-xs text-muted-foreground mt-1">{vuln.component}</div>
                            </div>
                            <div className="col-span-2 text-sm">
                              {getSeverityBadge(vuln.severity)}
                            </div>
                            <div className="col-span-2 text-sm">{vuln.discovered}</div>
                            <div className="col-span-2 text-sm">
                              {getStatusBadge(vuln.status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="compliance">
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {complianceItems.map((item, i) => (
                        <div key={i} className="border border-border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              {item.score >= 85 ? (
                                <ShieldCheck className="h-5 w-5 text-success" />
                              ) : item.score >= 70 ? (
                                <AlertTriangle className="h-5 w-5 text-warning" />
                              ) : (
                                <ShieldAlert className="h-5 w-5 text-critical" />
                              )}
                              <h3 className="font-medium">{item.name}</h3>
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                item.status === "Passing"
                                  ? "border-success text-success"
                                  : item.status === "Needs Review"
                                  ? "border-warning text-warning"
                                  : "border-critical text-critical"
                              }
                            >
                              {item.status}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Compliance Score</span>
                              <span
                                className={`text-sm font-medium ${
                                  item.score >= 85
                                    ? "text-success"
                                    : item.score >= 70
                                    ? "text-warning"
                                    : "text-critical"
                                }`}
                              >
                                {item.score}%
                              </span>
                            </div>
                            <Progress value={item.score} className="h-1.5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </SidebarWithProvider>
  );
};

export default SecurityPage;
