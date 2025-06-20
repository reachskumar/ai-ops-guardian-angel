
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
} from "lucide-react";
import Index from "@/pages/Index";
import SettingsPage from "@/pages/SettingsPage";
import CloudResourcesPage from "@/pages/CloudResourcesPage";
import AdminPanel from "@/pages/AdminPanel";
import SecurityPage from "@/pages/SecurityPage";
import { CompliancePage } from "@/pages/CompliancePage";
import IncidentManagement from "@/pages/IncidentsPage";
import DocumentationPage from "@/pages/DocumentationPage";

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
    path: "/cloud-resources",
    element: <CloudResourcesPage />,
    title: "Cloud Resources",
    icon: <Server />,
  },
  {
    path: "/security",
    element: <SecurityPage />,
    title: "Security",
    icon: <ShieldAlert />,
  },
  {
    path: "/compliance",
    element: <CompliancePage />,
    title: "Compliance",
    icon: <ListChecks />,
  },
  {
    path: "/incidents",
    element: <IncidentManagement />,
    title: "Incidents",
    icon: <AlertTriangle />,
  },
  {
    path: "/admin-panel",
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
