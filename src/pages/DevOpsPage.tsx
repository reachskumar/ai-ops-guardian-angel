
import React from "react";
import { SidebarWithProvider } from "@/components/Sidebar";
import Header from "@/components/Header";
import AIChat from "@/components/AIChat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DevOpsPage: React.FC = () => {
  return (
    <SidebarWithProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">DevOps Automation</h1>
            <p className="text-muted-foreground">
              Streamline your infrastructure operations with CI/CD pipelines and automation tools
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>CI/CD Pipeline Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                        <span>Production Pipeline</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Last run: 35m ago</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                        <span>Staging Pipeline</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Last run: 2h ago</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500 mr-2"></div>
                        <span>Development Pipeline</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Running...</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Infrastructure Deployment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                        <span>Terraform Modules</span>
                      </div>
                      <span className="text-sm text-muted-foreground">v1.2.0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                        <span>Ansible Playbooks</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Last run: Yesterday</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                        <span>Kubernetes Manifests</span>
                      </div>
                      <span className="text-sm text-muted-foreground">v2.4.1</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-1 h-full">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>DevOps Assistant</CardTitle>
                </CardHeader>
                <CardContent className="h-[500px]">
                  <AIChat />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SidebarWithProvider>
  );
};

export default DevOpsPage;
