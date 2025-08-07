import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Core Components
import Navigation from './components/Navigation';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import CloudConnection from './components/CloudConnection';
import ResourceList from './components/ResourceList';
import AIChat from './components/AIChat';

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
              <div className="min-h-screen bg-background">
                <Navigation />
                <main className="flex-1 p-6">
                  <Routes>
                    {/* Core Routes */}
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/cloud-connection" element={<CloudConnection />} />
                    <Route path="/resources" element={<ResourceList />} />
                    <Route path="/chat" element={<AIChat />} />
                    
                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>
              <Toaster />
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </NextThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
