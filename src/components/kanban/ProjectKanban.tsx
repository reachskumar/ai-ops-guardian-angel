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
  category: "infrastructure" | "security" | "monitoring" | "collaboration" | "cloud" | "analytics" | "devops" | "other";
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
  },
  
  {
    id: "cicd",
    name: "CI/CD Pipeline Integration",
    description: "Monitor and manage deployment pipelines",
    status: "planned",
    dataStatus: "mock",
    pendingTasks: ["Connect with popular CI/CD platforms", "Implement pipeline visualization"],
    category: "devops",
  },
  {
    id: "iac-repo",
    name: "Infrastructure as Code Repository",
    description: "Version control for infrastructure code",
    status: "planned",
    dataStatus: "mock",
    pendingTasks: ["Implement Git integration", "Add code validation and testing"],
    category: "devops",
  },
  {
    id: "multi-cloud-cost",
    name: "Multi-Cloud Cost Comparison",
    description: "Compare costs across cloud providers",
    status: "planned",
    dataStatus: "mock",
    pendingTasks: ["Add support for major cloud providers", "Create comparison visualizations"],
    category: "cloud",
  },
  {
    id: "auto-remediation",
    name: "Automated Remediation",
    description: "Automatically fix common infrastructure issues",
    status: "planned",
    dataStatus: "mock",
    pendingTasks: ["Define remediation rules", "Implement automation workflows"],
    category: "devops",
  },
  {
    id: "compliance-reporting",
    name: "Compliance Reporting",
    description: "Generate reports for regulatory frameworks",
    status: "planned",
    dataStatus: "mock",
    pendingTasks: ["Add support for GDPR, HIPAA, SOC 2", "Create report templates"],
    category: "security",
  },
  {
    id: "log-aggregation",
    name: "Log Aggregation and Analysis",
    description: "Centralized log management with search",
    status: "planned",
    dataStatus: "mock",
    pendingTasks: ["Implement log collection agents", "Create search interface"],
    category: "monitoring",
  },
  {
    id: "performance-benchmarking",
    name: "Performance Benchmarking",
    description: "Compare infrastructure against industry standards",
    status: "planned",
    dataStatus: "mock",
    pendingTasks: ["Collect benchmark data", "Create comparison visualizations"],
    category: "analytics",
  },
  {
    id: "capacity-planning",
    name: "Capacity Planning",
    description: "Forecast resource needs based on historical usage",
    status: "planned",
    dataStatus: "mock",
    pendingTasks: ["Implement predictive algorithms", "Create forecast visualizations"],
    category: "analytics",
  },
  {
    id: "dr-testing",
    name: "Disaster Recovery Testing",
    description: "Automated testing of DR procedures",
    status: "planned",
    dataStatus: "mock",
    pendingTasks: ["Define test scenarios", "Create automated testing workflows"],
    category: "devops",
  },
  {
    id: "api-management",
    name: "API Management",
    description: "Monitor and manage APIs with usage metrics",
    status: "planned",
    dataStatus: "mock",
    pendingTasks: ["Create API gateway integration", "Implement documentation generator"],
    category: "devops",
  },
  {
    id: "sla-monitoring",
    name: "SLA Monitoring",
    description: "Track service uptime against defined SLAs",
    status: "planned",
    dataStatus: "mock",
    pendingTasks: ["Define SLA metrics", "Create alerting system"],
    category: "monitoring",
  },
  {
    id: "training-environment",
    name: "Training Environment",
    description: "Sandbox environments for team training",
    status: "planned",
    dataStatus: "mock",
    pendingTasks: ["Create environment templates", "Implement provisioning system"],
    category: "collaboration",
  },
  {
    id: "custom-dashboard",
    name: "Custom Dashboard Builder",
    description: "Create personalized dashboards with widgets",
    status: "planned",
    dataStatus: "mock",
    pendingTasks: ["Create widget library", "Implement drag-and-drop interface"],
    category: "other",
  },
  {
    id: "mobile-app",
    name: "Mobile Companion App",
    description: "Monitoring and alerts on mobile devices",
    status: "planned",
    dataStatus: "mock",
    pendingTasks: ["Create mobile app design", "Implement push notifications"],
    category: "other",
  },
  {
    id: "integration-marketplace",
    name: "Integration Marketplace",
    description: "Directory of pre-built tool integrations",
    status: "planned",
    dataStatus: "mock",
    pendingTasks: ["Create integration framework", "Build initial integrations"],
    category: "devops",
  },
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
