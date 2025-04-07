
import React from "react";
import Header from "@/components/Header";
import { SidebarWithProvider } from "@/components/Sidebar";
import AIChat from "@/components/AIChat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Bot, 
  Terminal, 
  Code, 
  MessageSquare, 
  Shield, 
  Cloud, 
  AlertTriangle, 
  Gauge, 
  GitBranch,
  Users
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
              <Tabs defaultValue="commands">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="commands">Commands</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                </TabsList>
                
                <TabsContent value="commands">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Available Commands</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start gap-2">
                          <Cloud className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <h3 className="font-medium text-sm">Provisioning</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              Try "Create a new EC2 instance in us-east-1"
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <Shield className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <h3 className="font-medium text-sm">Security</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              Try "Scan production environment for vulnerabilities"
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <Gauge className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <h3 className="font-medium text-sm">Monitoring</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              Try "Show me CPU usage for the database servers"
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <h3 className="font-medium text-sm">Incidents</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              Try "Create an incident for high memory usage on app server"
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <Users className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <h3 className="font-medium text-sm">IAM</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              Try "Grant read access to user john on S3 bucket logs"
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <GitBranch className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <h3 className="font-medium text-sm">CI/CD</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              Try "Deploy latest version to staging environment"
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="resources">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Supported Resources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start gap-2">
                          <Cloud className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <h3 className="font-medium text-sm">Clouds</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              AWS, Azure, GCP
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <Shield className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <h3 className="font-medium text-sm">Security Tools</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              Trivy, OpenSCAP, CIS Benchmarks
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <Code className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <h3 className="font-medium text-sm">Infrastructure as Code</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              Terraform, CloudFormation, Ansible
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <h3 className="font-medium text-sm">Integrations</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              Jira, ServiceNow, Slack, Teams
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </SidebarWithProvider>
  );
};

export default AIAssistantPage;
