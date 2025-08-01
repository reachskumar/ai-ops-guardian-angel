import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import DashboardPage from "./pages/DashboardPage";
import TestIntegration from "./components/TestIntegration";
import SimpleTest from "./components/SimpleTest";
import DebugTest from "./components/DebugTest";
import MinimalTest from "./components/MinimalTest";
import UATDashboard from "./components/UATDashboard";
import UATLandingPage from "./components/UATLandingPage";
import RealTimeIntegration from "./components/RealTimeIntegration";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/test" element={<TestIntegration />} />
            <Route path="/simple-test" element={<SimpleTest />} />
            <Route path="/debug" element={<DebugTest />} />
            <Route path="/minimal" element={<MinimalTest />} />
            {/* UAT Routes */}
            <Route path="/uat" element={<UATLandingPage />} />
            <Route path="/uat/dashboard" element={<UATDashboard />} />
            {/* Backend Integration Testing */}
            <Route path="/integration" element={<RealTimeIntegration />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
