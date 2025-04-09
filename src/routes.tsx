
import React, { lazy, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import LoadingFallback from "./components/ui/loading-fallback";

// Import the Index component directly instead of lazy loading it
import Index from "./pages/Index";

// Lazy loaded page components
const AIAssistantPage = lazy(() => import("./pages/AIAssistantPage"));
const SecurityPage = lazy(() => import("./pages/SecurityPage"));
const SecurityHardeningPage = lazy(() => import("./pages/SecurityHardeningPage"));
const IncidentsPage = lazy(() => import("./pages/IncidentsPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const CollaborationPage = lazy(() => import("./pages/CollaborationPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const CloudResourcesPage = lazy(() => import("./pages/CloudResourcesPage"));
const ServersPage = lazy(() => import("./pages/ServersPage"));
const ServerDetailsPage = lazy(() => import("./pages/ServerDetailsPage"));
const ServerMonitoringPage = lazy(() => import("./pages/ServerMonitoringPage"));
const InfrastructureOverviewPage = lazy(() => import("./pages/InfrastructureOverviewPage"));
const IAMPage = lazy(() => import("./pages/IAMPage"));
const KubernetesPage = lazy(() => import("./pages/KubernetesPage"));
const CostAnalysisPage = lazy(() => import("./pages/CostAnalysisPage"));

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route 
        path="/auth" 
        element={
          <Suspense fallback={<LoadingFallback />}>
            <AuthPage />
          </Suspense>
        } 
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            {/* Index is not lazy loaded, so no need for Suspense here */}
            <Index />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-chatbot"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <AIAssistantPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      {/* Continue with the same pattern for other routes */}
      <Route
        path="/security"
        element={
          <ProtectedRoute requiredRole="operator">
            <Suspense fallback={<LoadingFallback />}>
              <SecurityPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/security/hardening"
        element={
          <ProtectedRoute requiredRole="operator">
            <Suspense fallback={<LoadingFallback />}>
              <SecurityHardeningPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/incidents"
        element={
          <ProtectedRoute requiredRole="operator">
            <Suspense fallback={<LoadingFallback />}>
              <IncidentsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/collaboration"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <CollaborationPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute requiredRole="developer">
            <Suspense fallback={<LoadingFallback />}>
              <AnalyticsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <ProfilePage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Suspense fallback={<LoadingFallback />}>
              <AdminPanel />
            </Suspense>
          </AdminRoute>
        }
      />
      <Route
        path="/cloud-resources"
        element={
          <ProtectedRoute requiredRole="developer">
            <Suspense fallback={<LoadingFallback />}>
              <CloudResourcesPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/kubernetes"
        element={
          <ProtectedRoute requiredRole="developer">
            <Suspense fallback={<LoadingFallback />}>
              <KubernetesPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/servers"
        element={
          <ProtectedRoute requiredRole="operator">
            <Suspense fallback={<LoadingFallback />}>
              <ServersPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/servers/:serverId"
        element={
          <ProtectedRoute requiredRole="viewer">
            <Suspense fallback={<LoadingFallback />}>
              <ServerDetailsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/monitoring"
        element={
          <ProtectedRoute requiredRole="operator">
            <Suspense fallback={<LoadingFallback />}>
              <ServerMonitoringPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/infrastructure"
        element={
          <ProtectedRoute requiredRole="developer">
            <Suspense fallback={<LoadingFallback />}>
              <InfrastructureOverviewPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/iam"
        element={
          <ProtectedRoute requiredRole="admin">
            <Suspense fallback={<LoadingFallback />}>
              <IAMPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <NotFound />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/databases"
        element={
          <ProtectedRoute requiredRole="operator">
            <Suspense fallback={<LoadingFallback />}>
              <NotFound />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cost"
        element={
          <ProtectedRoute requiredRole="developer">
            <Suspense fallback={<LoadingFallback />}>
              <CostAnalysisPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route 
        path="*" 
        element={
          <Suspense fallback={<LoadingFallback />}>
            <NotFound />
          </Suspense>
        } 
      />
    </Routes>
  );
};

export default AppRoutes;
