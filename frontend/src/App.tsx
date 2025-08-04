import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Layout Components
import Navigation from './components/Navigation';
import { Sidebar } from './components/Sidebar';

// Main Pages
import Dashboard from './components/Dashboard';
import AIChatInterface from './components/AIChatInterface';
import UATDashboard from './components/UATDashboard';
import UATLandingPage from './components/UATLandingPage';
import RealTimeIntegration from './components/RealTimeIntegration';

// Feature Pages
import CostOptimization from './components/CostOptimization';
import MultiCloudManagement from './components/MultiCloudManagement';
import CloudConnection from './components/CloudConnection';
import FeatureShowcase from './components/FeatureShowcase';

// AI Agent Pages
import { AIAgentsHub } from './components/ai-agents/AIAgentsHub';
import { AgentDetails } from './components/ai-agents/AgentDetails';

// Workflow Pages
import { LangGraphWorkflows } from './components/workflows/LangGraphWorkflows';
import { HITLWorkflows } from './components/workflows/HITLWorkflows';

// Plugin System
import { PluginMarketplace } from './components/plugins/PluginMarketplace';
import { PluginManager } from './components/plugins/PluginManager';

// RAG System
import { KnowledgeBase } from './components/rag/KnowledgeBase';
import { DocumentUpload } from './components/rag/DocumentUpload';

// IaC System
import { IaCGenerator } from './components/iac/IaCGenerator';
import { IaCValidator } from './components/iac/IaCValidator';

// Security & Compliance
import { SecurityDashboard } from './components/security/SecurityDashboard';
import { ComplianceCenter } from './components/security/ComplianceCenter';

// Analytics & Monitoring
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { MonitoringCenter } from './components/analytics/MonitoringCenter';

// MLOps
import { MLOpsHub } from './components/mlops/MLOpsHub';
import { ModelTraining } from './components/mlops/ModelTraining';

// Authentication
import AuthForm from './components/AuthForm';
import { AuthProvider } from './contexts/AuthContext';

// Contexts
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Styles
import './styles/globals.css';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <CustomThemeProvider>
          <NotificationProvider>
            <AuthProvider>
              <Router>
                <div className="min-h-screen bg-background">
                  <Navigation />
                  <div className="flex">
                    <Sidebar />
                    <main className="flex-1 p-6">
                      <Routes>
                        {/* Main Routes */}
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/chat" element={<AIChatInterface />} />
                        
                        {/* UAT Routes */}
                        <Route path="/uat" element={<UATLandingPage />} />
                        <Route path="/uat/dashboard" element={<UATDashboard />} />
                        <Route path="/integration" element={<RealTimeIntegration />} />
                        
                        {/* Feature Routes */}
                        <Route path="/cost-optimization" element={<CostOptimization />} />
                        <Route path="/multi-cloud" element={<MultiCloudManagement />} />
                        <Route path="/cloud-connection" element={<CloudConnection />} />
                        <Route path="/features" element={<FeatureShowcase />} />
                        
                        {/* AI Agents Routes */}
                        <Route path="/agents" element={<AIAgentsHub />} />
                        <Route path="/agents/:agentId" element={<AgentDetails />} />
                        
                        {/* Workflow Routes */}
                        <Route path="/workflows/langgraph" element={<LangGraphWorkflows />} />
                        <Route path="/workflows/hitl" element={<HITLWorkflows />} />
                        
                        {/* Plugin Routes */}
                        <Route path="/plugins" element={<PluginManager />} />
                        <Route path="/plugins/marketplace" element={<PluginMarketplace />} />
                        
                        {/* RAG Routes */}
                        <Route path="/knowledge" element={<KnowledgeBase />} />
                        <Route path="/knowledge/upload" element={<DocumentUpload />} />
                        
                        {/* IaC Routes */}
                        <Route path="/iac/generator" element={<IaCGenerator />} />
                        <Route path="/iac/validator" element={<IaCValidator />} />
                        
                        {/* Security Routes */}
                        <Route path="/security" element={<SecurityDashboard />} />
                        <Route path="/compliance" element={<ComplianceCenter />} />
                        
                        {/* Analytics Routes */}
                        <Route path="/analytics" element={<AnalyticsDashboard />} />
                        <Route path="/monitoring" element={<MonitoringCenter />} />
                        
                        {/* MLOps Routes */}
                        <Route path="/mlops" element={<MLOpsHub />} />
                        <Route path="/mlops/training" element={<ModelTraining />} />
                        
                        {/* Auth Routes */}
                        <Route path="/auth" element={<AuthForm />} />
                        
                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </main>
                  </div>
                </div>
                <Toaster 
                  position="top-right"
                  richColors
                  closeButton
                  duration={4000}
                />
              </Router>
            </AuthProvider>
          </NotificationProvider>
        </CustomThemeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
