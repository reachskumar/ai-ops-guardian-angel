
import React from "react";
import { SidebarWithProvider } from "@/components/Sidebar";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  VisualIaCDesigner, 
  TemplateGenerator, 
  GitOpsWorkflow, 
  DriftDetection 
} from "@/components/iac";

const IaCManagementPage: React.FC = () => {
  return (
    <SidebarWithProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Infrastructure as Code Management</h1>
            <p className="text-muted-foreground">
              Design, generate, and manage your infrastructure with visual tools and automated workflows
            </p>
          </div>

          <Tabs defaultValue="designer" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="designer">Visual Designer</TabsTrigger>
              <TabsTrigger value="templates">Template Generator</TabsTrigger>
              <TabsTrigger value="gitops">GitOps Workflow</TabsTrigger>
              <TabsTrigger value="drift">Drift Detection</TabsTrigger>
            </TabsList>

            <TabsContent value="designer">
              <VisualIaCDesigner />
            </TabsContent>

            <TabsContent value="templates">
              <TemplateGenerator />
            </TabsContent>

            <TabsContent value="gitops">
              <GitOpsWorkflow />
            </TabsContent>

            <TabsContent value="drift">
              <DriftDetection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SidebarWithProvider>
  );
};

export default IaCManagementPage;
