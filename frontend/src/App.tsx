import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Core Components
import AppShell from './components/AppShell';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import CloudConnection from './components/CloudConnection';
import ResourceList from './components/ResourceList';
import AIChat from './components/AIChat';
import LandingHero from './components/LandingHero';
import ProtectedRoute from './components/ProtectedRoute';
import SRECenter from './components/sre/SRECenter';
import FinOpsCenter from './components/finops/FinOpsCenter';
import SecurityComplianceCenter from './components/security/SecurityComplianceCenter';
import MLOpsCenter from './components/mlops/MLOpsCenter';
import IntegrationsRAGCenter from './components/integrations/IntegrationsRAGCenter';

// Styles
import './styles/globals.css';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NextThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <ThemeProvider>
          <AuthProvider>
            <Router>
              <AppShell>
                <Routes>
                    {/* Public */}
                    <Route path="/" element={<LandingHero />} />
                    <Route path="/login" element={<LoginPage />} />

                    {/* Protected */}
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/cloud-connection" element={<ProtectedRoute><CloudConnection /></ProtectedRoute>} />
                    <Route path="/resources" element={<ProtectedRoute><ResourceList /></ProtectedRoute>} />
                    <Route path="/chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
                    <Route path="/sre" element={<ProtectedRoute><SRECenter /></ProtectedRoute>} />
                    <Route path="/finops" element={<ProtectedRoute><FinOpsCenter /></ProtectedRoute>} />
                    <Route path="/security" element={<ProtectedRoute><SecurityComplianceCenter /></ProtectedRoute>} />
                    <Route path="/mlops" element={<ProtectedRoute><MLOpsCenter /></ProtectedRoute>} />
                    <Route path="/integrations-rag" element={<ProtectedRoute><IntegrationsRAGCenter /></ProtectedRoute>} />
                    
                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppShell>
              <Toaster />
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </NextThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
