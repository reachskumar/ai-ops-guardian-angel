
import React, { useState } from "react";
import { SidebarWithProvider } from "@/components/Sidebar";
import Header from "@/components/Header";
import { KubernetesTabs } from "@/components/kubernetes";

const KubernetesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("clusters");

  return (
    <SidebarWithProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Kubernetes Management</h1>
              <p className="text-muted-foreground">
                Monitor and manage your Kubernetes clusters and workloads
              </p>
            </div>
          </div>

          <KubernetesTabs 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>
    </SidebarWithProvider>
  );
};

export default KubernetesPage;
