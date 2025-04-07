
import React from "react";
import Header from "@/components/Header";
import { SidebarWithProvider } from "@/components/Sidebar";
import AIChat from "@/components/AIChat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Terminal, Code, MessageSquare } from "lucide-react";

const AIAssistantPage: React.FC = () => {
  return (
    <SidebarWithProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">AI Operations Assistant</h1>
            <p className="text-muted-foreground">
              Interact with your AI assistant to manage and automate your DevOps workflows
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <div className="h-[calc(100vh-240px)]">
                <AIChat />
              </div>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Commands</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <Terminal className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium text-sm">Provisioning</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Try "Create a new EC2 instance in us-east-1"
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Code className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium text-sm">Monitoring</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Try "Show me CPU usage for the database servers"
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Bot className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium text-sm">Automation</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Try "Restart the failed pods in the production namespace"
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium text-sm">Incidents</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Try "Create an incident for high memory usage on app server"
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SidebarWithProvider>
  );
};

export default AIAssistantPage;
