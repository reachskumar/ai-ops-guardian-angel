
import {
  Home,
  Settings,
  LayoutDashboard,
  Users,
  Lock,
  ListChecks,
  Network,
  Server,
  ShieldAlert,
  FileCode2,
  AlertTriangle,
  CloudDrizzle,
  BarChart3,
  Database,
  Box,
  GitBranch,
  Bot,
  KanbanSquare,
  CreditCard,
  Cloud,
  Shield
} from "lucide-react";
import Index from "@/pages/Index";
import SettingsPage from "@/pages/SettingsPage";
import CloudResourcesPage from "@/pages/CloudResourcesPage";
import AdminPanel from "@/pages/AdminPanel";
import SecurityPage from "@/pages/SecurityPage";
import IncidentManagement from "@/pages/IncidentsPage";
import DocumentationPage from "@/pages/DocumentationPage";
import InfrastructureOverviewPage from "@/pages/InfrastructureOverviewPage";
import MultiCloudPage from "@/pages/MultiCloudPage";
import ServersPage from "@/pages/ServersPage";
import CostAnalysisPage from "@/pages/CostAnalysisPage";
import KubernetesPage from "@/pages/KubernetesPage";
import DatabasesPage from "@/pages/DatabasesPage";
import IAMPage from "@/pages/IAMPage";
import DevOpsPage from "@/pages/DevOpsPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import CollaborationPage from "@/pages/CollaborationPage";
import AIAssistantPage from "@/pages/AIAssistantPage";
import ProjectKanbanPage from "@/pages/ProjectKanbanPage";
import NotFound from "@/pages/NotFound";

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  title: string;
  icon?: React.ReactNode;
  children?: RouteConfig[];
}

const routes: RouteConfig[] = [
  {
    path: "/",
    element: <Index />,
    title: "Dashboard",
    icon: <LayoutDashboard />,
  },
  {
    path: "/infrastructure",
    element: <InfrastructureOverviewPage />,
    title: "Infrastructure",
    icon: <Network />,
  },
  {
    path: "/servers",
    element: <ServersPage />,
    title: "Servers",
    icon: <Server />,
  },
  {
    path: "/security",
    element: <SecurityPage />,
    title: "Security",
    icon: <Shield />,
  },
  {
    path: "/cloud-resources",
    element: <CloudResourcesPage />,
    title: "Cloud Resources",
    icon: <Cloud />,
  },
  {
    path: "/multi-cloud",
    element: <MultiCloudPage />,
    title: "Multi-Cloud",
    icon: <CloudDrizzle />,
  },
  {
    path: "/cost-analysis",
    element: <CostAnalysisPage />,
    title: "Cost Analysis",
    icon: <CreditCard />,
  },
  {
    path: "/kubernetes",
    element: <KubernetesPage />,
    title: "Kubernetes",
    icon: <Box />,
  },
  {
    path: "/databases",
    element: <DatabasesPage />,
    title: "Databases",
    icon: <Database />,
  },
  {
    path: "/iam",
    element: <IAMPage />,
    title: "IAM",
    icon: <Lock />,
  },
  {
    path: "/devops",
    element: <DevOpsPage />,
    title: "DevOps",
    icon: <GitBranch />,
  },
  {
    path: "/analytics",
    element: <AnalyticsPage />,
    title: "Analytics",
    icon: <BarChart3 />,
  },
  {
    path: "/collaboration",
    element: <CollaborationPage />,
    title: "Collaboration",
    icon: <Users />,
  },
  {
    path: "/incidents",
    element: <IncidentManagement />,
    title: "Incidents",
    icon: <AlertTriangle />,
  },
  {
    path: "/ai-assistant",
    element: <AIAssistantPage />,
    title: "AI Assistant",
    icon: <Bot />,
  },
  {
    path: "/project-kanban",
    element: <ProjectKanbanPage />,
    title: "Project Kanban",
    icon: <KanbanSquare />,
  },
  {
    path: "/documentation",
    element: <DocumentationPage />,
    title: "Documentation",
    icon: <FileCode2 />,
  },
  {
    path: "/admin",
    element: <AdminPanel />,
    title: "Admin Panel",
    icon: <Settings />,
  },
  {
    path: "/settings",
    element: <SettingsPage />,
    title: "Settings",
    icon: <Settings />,
  },
  {
    path: "*",
    element: <NotFound />,
    title: "Not Found",
  },
];

export { routes };
export default routes;
