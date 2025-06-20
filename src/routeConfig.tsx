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
} from "lucide-react";
import { Main } from "@/pages/Main";
import { Settings as SettingsPage } from "@/pages/Settings";
import { CloudResources } from "@/pages/CloudResources";
import { AdminPanel } from "@/pages/AdminPanel";
import { Security } from "@/pages/Security";
import { CompliancePage } from "@/pages/CompliancePage";
import { NetworkPage } from "@/pages/NetworkPage";
import { IncidentManagement } from "@/pages/IncidentManagement";
import { ApiKeys } from "@/pages/ApiKeys";
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
    element: <Main />,
    title: "Dashboard",
    icon: <LayoutDashboard />,
  },
  {
    path: "/cloud-resources",
    element: <CloudResources />,
    title: "Cloud Resources",
    icon: <Server />,
  },
  {
    path: "/network",
    element: <NetworkPage />,
    title: "Network",
    icon: <Network />,
  },
  {
    path: "/security",
    element: <Security />,
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
    path: "/api-keys",
    element: <ApiKeys />,
    title: "API Keys",
    icon: <Lock />,
  },
  {
    path: "/settings",
    element: <SettingsPage />,
    title: "Settings",
    icon: <Settings />,
  },
];

const documentationRoute = {
  path: "/documentation",
  element: <DocumentationPage />,
  title: "Documentation",
  icon: <FileCode2 />,
};

export { routes, documentationRoute };
