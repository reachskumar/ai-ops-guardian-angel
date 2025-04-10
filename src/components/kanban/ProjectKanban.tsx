
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Clock, Code } from "lucide-react";

interface FeatureStatus {
  id: string;
  name: string;
  description: string;
  status: "completed" | "in-progress" | "planned";
  dataStatus: "real" | "mock";
  pendingTasks: string[];
  category: "infrastructure" | "security" | "monitoring" | "collaboration" | "cloud" | "analytics" | "other";
}

const features: FeatureStatus[] = [
  {
    id: "dashboard",
    name: "Dashboard Overview",
    description: "Main dashboard with system status overview",
    status: "completed",
    dataStatus: "mock",
    pendingTasks: ["Connect to real-time data sources"],
    category: "monitoring",
  },
  {
    id: "servers",
    name: "Server Management",
    description: "Server inventory and monitoring tools",
    status: "completed",
    dataStatus: "mock",
    pendingTasks: ["Add server provisioning capabilities"],
    category: "infrastructure",
  },
  {
    id: "security",
    name: "Security Monitoring",
    description: "Security vulnerabilities and compliance tracking",
    status: "completed",
    dataStatus: "mock",
    pendingTasks: ["Implement real security scanner integration"],
    category: "security",
  },
  {
    id: "cloud-resources",
    name: "Cloud Resource Management",
    description: "Manage cloud providers and resources",
    status: "completed",
    dataStatus: "mock",
    pendingTasks: ["Add support for more cloud providers", "Implement real API connections"],
    category: "cloud",
  },
  {
    id: "cost-analysis",
    name: "Cost Analysis",
    description: "Cloud cost analysis and optimization",
    status: "completed",
    dataStatus: "mock",
    pendingTasks: ["Connect to actual billing APIs"],
    category: "analytics",
  },
  {
    id: "kubernetes",
    name: "Kubernetes Management",
    description: "Manage Kubernetes clusters and workloads",
    status: "completed",
    dataStatus: "mock",
    pendingTasks: ["Implement pod scaling", "Add deployment pipeline integration"],
    category: "infrastructure",
  },
  {
    id: "iam",
    name: "Identity & Access Management",
    description: "User and permission management",
    status: "completed",
    dataStatus: "mock",
    pendingTasks: ["Connect with external identity providers"],
    category: "security",
  },
  {
    id: "ai-assistant",
    name: "AI Assistant",
    description: "AI-powered DevOps assistant",
    status: "in-progress",
    dataStatus: "mock",
    pendingTasks: ["Improve prompt responses", "Add more specialized DevOps capabilities"],
    category: "other",
  },
  {
    id: "analytics",
    name: "Analytics & Reporting",
    description: "System performance and usage analytics",
    status: "completed",
    dataStatus: "mock",
    pendingTasks: ["Create more advanced dashboards", "Add export capabilities"],
    category: "analytics",
  },
  {
    id: "collaboration",
    name: "Team Collaboration",
    description: "Collaborative workspaces for teams",
    status: "in-progress",
    dataStatus: "mock",
    pendingTasks: ["Implement real-time chat", "Add document sharing"],
    category: "collaboration",
  },
  {
    id: "incidents",
    name: "Incident Management",
    description: "Track and manage system incidents",
    status: "planned",
    dataStatus: "mock",
    pendingTasks: ["Create incident workflows", "Implement alerting system"],
    category: "monitoring",
  },
  {
    id: "infrastructure",
    name: "Infrastructure Overview",
    description: "Holistic view of all infrastructure components",
    status: "completed",
    dataStatus: "mock",
    pendingTasks: ["Add more granular metrics", "Implement infrastructure-as-code viewer"],
    category: "infrastructure",
  },
  {
    id: "databases",
    name: "Database Management",
    description: "Monitor and manage database systems",
    status: "completed",
    dataStatus: "mock",
    pendingTasks: ["Add query performance analyzer", "Implement backup management"],
    category: "infrastructure",
  }
];

const ProjectKanban: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Kanban</CardTitle>
          <CardDescription>
            Overview of all features and their implementation status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                <CheckCircle className="h-4 w-4 mr-1" />
                Completed: {features.filter(f => f.status === "completed").length}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                <Clock className="h-4 w-4 mr-1" />
                In Progress: {features.filter(f => f.status === "in-progress").length}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                <AlertCircle className="h-4 w-4 mr-1" />
                Planned: {features.filter(f => f.status === "planned").length}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                <Code className="h-4 w-4 mr-1" />
                Using Mock Data: {features.filter(f => f.dataStatus === "mock").length}
              </Badge>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableCaption>Last updated: {new Date().toLocaleDateString()}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Pending Tasks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {features.map((feature) => (
                  <TableRow key={feature.id}>
                    <TableCell>
                      <div className="font-medium">{feature.name}</div>
                      <div className="text-xs text-muted-foreground">{feature.description}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {feature.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {feature.status === "completed" && (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                          Completed
                        </Badge>
                      )}
                      {feature.status === "in-progress" && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                          In Progress
                        </Badge>
                      )}
                      {feature.status === "planned" && (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                          Planned
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {feature.dataStatus === "mock" ? (
                        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                          Mock Data
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                          Real Data
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <ul className="list-disc list-inside text-sm">
                        {feature.pendingTasks.map((task, index) => (
                          <li key={index}>{task}</li>
                        ))}
                      </ul>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectKanban;
