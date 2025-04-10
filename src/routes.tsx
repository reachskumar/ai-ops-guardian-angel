
import { Navigate, RouteObject } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Index from "./pages/Index";
import ProfilePage from "./pages/ProfilePage";
import AdminPanel from "./pages/AdminPanel";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import SecurityPage from "./pages/SecurityPage";
import IncidentsPage from "./pages/IncidentsPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import CloudResourcesPage from "./pages/CloudResourcesPage";
import KubernetesPage from "./pages/KubernetesPage";
import ServerDetailsPage from "./pages/ServerDetailsPage";
import ServersPage from "./pages/ServersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import CostAnalysisPage from "./pages/CostAnalysisPage";
import IAMPage from "./pages/IAMPage";
import SecurityHardeningPage from "./pages/SecurityHardeningPage";
import ServerMonitoringPage from "./pages/ServerMonitoringPage";
import InfrastructureOverviewPage from "./pages/InfrastructureOverviewPage";
import CollaborationPage from "./pages/CollaborationPage";
import DatabasesPage from "./pages/DatabasesPage";

const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Index />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminPanel />
      </AdminRoute>
    ),
  },
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/ai-chatbot",
    element: (
      <ProtectedRoute>
        <AIAssistantPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/security",
    element: (
      <ProtectedRoute>
        <SecurityPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/security/hardening",
    element: (
      <ProtectedRoute>
        <SecurityHardeningPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/incidents",
    element: (
      <ProtectedRoute>
        <IncidentsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/cloud-resources",
    element: (
      <ProtectedRoute>
        <CloudResourcesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/kubernetes",
    element: (
      <ProtectedRoute>
        <KubernetesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/server/:id",
    element: (
      <ProtectedRoute>
        <ServerDetailsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/servers",
    element: (
      <ProtectedRoute>
        <ServersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/analytics",
    element: (
      <ProtectedRoute>
        <AnalyticsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/cost",
    element: (
      <ProtectedRoute>
        <CostAnalysisPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/iam",
    element: (
      <ProtectedRoute>
        <IAMPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/monitoring",
    element: (
      <ProtectedRoute>
        <ServerMonitoringPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/infrastructure",
    element: (
      <ProtectedRoute>
        <InfrastructureOverviewPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/collaboration",
    element: (
      <ProtectedRoute>
        <CollaborationPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/databases",
    element: (
      <ProtectedRoute>
        <DatabasesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
