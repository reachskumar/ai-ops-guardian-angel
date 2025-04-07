
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { SidebarWithProvider } from "@/components/Sidebar";
import Header from "@/components/Header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ServerHardening, GoldenImageTab } from "@/components/security";
import { FileBadge, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const SecurityHardeningPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("server-hardening");
  
  // Mock server data
  const servers = [
    { 
      id: "srv-001", 
      name: "Web Server 01", 
      status: "running", 
      os: "Ubuntu 22.04 LTS"
    },
    { 
      id: "srv-002", 
      name: "DB Server 01", 
      status: "running", 
      os: "Amazon Linux 2" 
    },
    { 
      id: "srv-003", 
      name: "API Server 01", 
      status: "running", 
      os: "Ubuntu 20.04 LTS"
    },
    { 
      id: "srv-004", 
      name: "Cache Server", 
      status: "maintenance", 
      os: "Amazon Linux 2"
    }
  ];
  
  const handleApplyHardening = async (serverId: string, ruleIds: string[]) => {
    console.log(`Applying hardening rules ${ruleIds.join(", ")} to server ${serverId}`);
    
    // In a real app, this would be an API call to apply the rules
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const server = servers.find(s => s.id === serverId);
        
        // Simulate success
        toast({
          title: "Hardening Complete",
          description: `Successfully applied ${ruleIds.length} hardening rules to ${server?.name}`,
        });
        resolve();
      }, 5000);
    });
  };
  
  return (
    <SidebarWithProvider>
      <Helmet>
        <title>Security Hardening - AI Ops Guardian</title>
      </Helmet>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Security Hardening</h1>
            <p className="text-muted-foreground">
              Apply security controls and create hardened golden images based on compliance standards
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="server-hardening" className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>Server Hardening</span>
              </TabsTrigger>
              <TabsTrigger value="golden-images" className="flex items-center gap-1">
                <FileBadge className="h-4 w-4" />
                <span>Golden Images</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="server-hardening" className="space-y-6">
              <ServerHardening 
                servers={servers}
                onApplyHardening={handleApplyHardening}
              />
            </TabsContent>
            
            <TabsContent value="golden-images" className="space-y-6">
              <GoldenImageTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SidebarWithProvider>
  );
};

export default SecurityHardeningPage;
