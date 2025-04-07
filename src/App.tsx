import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./providers/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

const Index = lazy(() => import("./pages/Index"));
const AIAssistantPage = lazy(() => import("./pages/AIAssistantPage"));
const SecurityPage = lazy(() => import("./pages/SecurityPage"));
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <HelmetProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ai-chatbot"
                  element={
                    <ProtectedRoute>
                      <AIAssistantPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/security"
                  element={
                    <ProtectedRoute requiredRole="operator">
                      <SecurityPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/incidents"
                  element={
                    <ProtectedRoute requiredRole="operator">
                      <IncidentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/collaboration"
                  element={
                    <ProtectedRoute>
                      <CollaborationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute requiredRole="developer">
                      <AnalyticsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminPanel />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/cloud-resources"
                  element={
                    <ProtectedRoute requiredRole="developer">
                      <CloudResourcesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/servers"
                  element={
                    <ProtectedRoute requiredRole="operator">
                      <ServersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/servers/:serverId"
                  element={
                    <ProtectedRoute requiredRole="viewer">
                      <ServerDetailsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/monitoring"
                  element={
                    <ProtectedRoute requiredRole="operator">
                      <ServerMonitoringPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/infrastructure"
                  element={
                    <ProtectedRoute requiredRole="developer">
                      <InfrastructureOverviewPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/iam"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <IAMPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <NotFound />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/databases"
                  element={
                    <ProtectedRoute requiredRole="operator">
                      <NotFound />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cost"
                  element={
                    <ProtectedRoute requiredRole="developer">
                      <NotFound />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </HelmetProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
