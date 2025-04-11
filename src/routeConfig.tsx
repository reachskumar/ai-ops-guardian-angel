
import { RouteObject } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Pages
import Index from "./pages/Index";
import AdminPanel from "./pages/AdminPanel";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/ProfilePage";
import ServersPage from "./pages/ServersPage";
import ServerDetailsPage from "./pages/ServerDetailsPage";
import ServerMonitoringPage from "./pages/ServerMonitoringPage";
import SecurityPage from "./pages/SecurityPage";
import SecurityHardeningPage from "./pages/SecurityHardeningPage";
import CloudResourcesPage from "./pages/CloudResourcesPage";
import CostAnalysisPage from "./pages/CostAnalysisPage";
import KubernetesPage from "./pages/KubernetesPage";
import IAMPage from "./pages/IAMPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import CollaborationPage from "./pages/CollaborationPage";
import IncidentsPage from "./pages/IncidentsPage";
import InfrastructureOverviewPage from "./pages/InfrastructureOverviewPage";
import DatabasesPage from "./pages/DatabasesPage";
import ProjectKanbanPage from "./pages/ProjectKanbanPage";
import WebSocketTestPage from "./pages/WebSocketTestPage";
import DevOpsPage from "./pages/DevOpsPage";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <ProtectedRoute><Index /></ProtectedRoute>,
    index: true
  },
  {
    path: "/auth/*",
    element: <AuthPage />
  },
  {
    path: "/profile",
    element: <ProtectedRoute><ProfilePage /></ProtectedRoute>
  },
  {
    path: "/admin",
    element: <AdminRoute><AdminPanel /></AdminRoute>
  },
  {
    path: "/servers",
    element: <ProtectedRoute><ServersPage /></ProtectedRoute>
  },
  {
    path: "/servers/:serverId",
    element: <ProtectedRoute><ServerDetailsPage /></ProtectedRoute>
  },
  {
    path: "/servers/:serverId/monitoring",
    element: <ProtectedRoute><ServerMonitoringPage /></ProtectedRoute>
  },
  {
    path: "/security",
    element: <ProtectedRoute><SecurityPage /></ProtectedRoute>
  },
  {
    path: "/security/hardening",
    element: <ProtectedRoute><SecurityHardeningPage /></ProtectedRoute>
  },
  {
    path: "/cloud-resources",
    element: <ProtectedRoute><CloudResourcesPage /></ProtectedRoute>
  },
  {
    path: "/cost-analysis",
    element: <ProtectedRoute><CostAnalysisPage /></ProtectedRoute>
  },
  {
    path: "/kubernetes",
    element: <ProtectedRoute><KubernetesPage /></ProtectedRoute>
  },
  {
    path: "/iam",
    element: <ProtectedRoute><IAMPage /></ProtectedRoute>
  },
  {
    path: "/ai-assistant",
    element: <ProtectedRoute><AIAssistantPage /></ProtectedRoute>
  },
  {
    path: "/analytics",
    element: <ProtectedRoute><AnalyticsPage /></ProtectedRoute>
  },
  {
    path: "/collaboration",
    element: <ProtectedRoute><CollaborationPage /></ProtectedRoute>
  },
  {
    path: "/incidents",
    element: <ProtectedRoute><IncidentsPage /></ProtectedRoute>
  },
  {
    path: "/infrastructure",
    element: <ProtectedRoute><InfrastructureOverviewPage /></ProtectedRoute>
  },
  {
    path: "/databases",
    element: <ProtectedRoute><DatabasesPage /></ProtectedRoute>
  },
  {
    path: "/project-kanban",
    element: <ProtectedRoute><ProjectKanbanPage /></ProtectedRoute>
  },
  {
    path: "/websocket-test",
    element: <ProtectedRoute><WebSocketTestPage /></ProtectedRoute>
  },
  {
    path: "/devops",
    element: <ProtectedRoute><DevOpsPage /></ProtectedRoute>
  },
  {
    path: "*",
    element: <NotFound />
  }
];

export default routes;
