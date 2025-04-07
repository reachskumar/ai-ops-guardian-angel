
import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Use React.lazy for code splitting to improve initial load time
const Index = lazy(() => import("./pages/Index"));
const AIAssistantPage = lazy(() => import("./pages/AIAssistantPage"));
const SecurityPage = lazy(() => import("./pages/SecurityPage"));
const IncidentsPage = lazy(() => import("./pages/IncidentsPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));

// Create a new query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Disable refetching data when window regains focus
      staleTime: 5 * 60 * 1000, // Set stale time to 5 minutes
    },
  },
});

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
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
                  <ProtectedRoute>
                    <SecurityPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/incidents"
                element={
                  <ProtectedRoute>
                    <IncidentsPage />
                  </ProtectedRoute>
                }
              />
              {/* Admin-only routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                }
              />
              {/* Placeholder routes for navigation items */}
              <Route
                path="/cloud-resources"
                element={
                  <ProtectedRoute>
                    <NotFound />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/servers"
                element={
                  <ProtectedRoute>
                    <NotFound />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/monitoring"
                element={
                  <ProtectedRoute>
                    <NotFound />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/iam"
                element={
                  <ProtectedRoute>
                    <NotFound />
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
                  <ProtectedRoute>
                    <NotFound />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cost"
                element={
                  <ProtectedRoute>
                    <NotFound />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
