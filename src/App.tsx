
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AIAssistantPage from "./pages/AIAssistantPage";
import SecurityPage from "./pages/SecurityPage";
import IncidentsPage from "./pages/IncidentsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/ai-chatbot" element={<AIAssistantPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/incidents" element={<IncidentsPage />} />
          {/* Placeholder routes for navigation items */}
          <Route path="/cloud-resources" element={<NotFound />} />
          <Route path="/servers" element={<NotFound />} />
          <Route path="/monitoring" element={<NotFound />} />
          <Route path="/iam" element={<NotFound />} />
          <Route path="/settings" element={<NotFound />} />
          <Route path="/databases" element={<NotFound />} />
          <Route path="/cost" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
