
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { SidebarWithProvider } from "@/components/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCloudResources } from "@/hooks/useCloudResources";
import { 
  UnifiedDashboard, 
  CrossCloudMigration, 
  MultiCloudNetworking, 
  DisasterRecovery,
  PolicyGovernance,
  WorkloadDistribution 
} from "@/components/multi-cloud";

const MultiCloudPage: React.FC = () => {
  const { resources, accounts, loading } = useCloudResources();
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <SidebarWithProvider>
      <Helmet>
        <title>Multi-Cloud Orchestration - AI Ops Guardian</title>
      </Helmet>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Multi-Cloud Orchestration</h1>
          <p className="text-muted-foreground">
            Manage and orchestrate resources across AWS, Azure, and GCP from a unified interface
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="migration">Migration</TabsTrigger>
            <TabsTrigger value="networking">Networking</TabsTrigger>
            <TabsTrigger value="disaster-recovery">DR</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
            <TabsTrigger value="workload">Workload</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <UnifiedDashboard 
              resources={resources} 
              accounts={accounts} 
              loading={loading} 
            />
          </TabsContent>

          <TabsContent value="migration" className="mt-6">
            <CrossCloudMigration 
              resources={resources} 
              accounts={accounts} 
            />
          </TabsContent>

          <TabsContent value="networking" className="mt-6">
            <MultiCloudNetworking 
              accounts={accounts} 
            />
          </TabsContent>

          <TabsContent value="disaster-recovery" className="mt-6">
            <DisasterRecovery 
              resources={resources} 
              accounts={accounts} 
            />
          </TabsContent>

          <TabsContent value="governance" className="mt-6">
            <PolicyGovernance 
              resources={resources} 
              accounts={accounts} 
            />
          </TabsContent>

          <TabsContent value="workload" className="mt-6">
            <WorkloadDistribution 
              resources={resources} 
              accounts={accounts} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </SidebarWithProvider>
  );
};

export default MultiCloudPage;
