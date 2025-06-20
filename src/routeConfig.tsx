
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
    path: "/cloud-resources",
    element: <CloudResourcesPage />,
    title: "Cloud Resources",
    icon: <Server />,
  },
  {
    path: "/multi-cloud",
    element: <MultiCloudPage />,
    title: "Multi-Cloud",
    icon: <CloudDrizzle />,
  },
  {
    path: "/security",
    element: <SecurityPage />,
    title: "Security",
    icon: <ShieldAlert />,
  },
  {
    path: "/incidents",
    element: <IncidentManagement />,
    title: "Incidents",
    icon: <AlertTriangle />,
  },
  {
    path: "/admin",
    element: <AdminPanel />,
    title: "Admin Panel",
    icon: <Users />,
  },
  {
    path: "/settings",
    element: <SettingsPage />,
    title: "Settings",
    icon: <Settings />,
  },
  {
    path: "/documentation",
    element: <DocumentationPage />,
    title: "Documentation",
    icon: <FileCode2 />,
  },
];

export { routes };
export default routes;
