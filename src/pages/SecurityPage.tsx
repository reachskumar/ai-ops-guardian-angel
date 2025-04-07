
import React, { useState } from "react";
import { SidebarWithProvider } from "@/components/Sidebar";
import Header from "@/components/Header";
import { 
  VulnerabilityChart, 
  ComplianceCards, 
  VulnerabilityTable,
  SecurityOverview,
  SecurityTabs,
  HardeningLink
} from "@/components/security";

const SecurityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Sample data for the vulnerability chart
  const vulnerabilityData = [
    { name: "Critical", value: 3, color: "#ef4444" },
    { name: "High", value: 8, color: "#f97316" },
    { name: "Medium", value: 15, color: "#f59e0b" },
    { name: "Low", value: 24, color: "#3b82f6" },
  ];

  return (
    <SidebarWithProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Security Center</h1>
              <p className="text-muted-foreground">
                Monitor and manage security across your infrastructure
              </p>
            </div>
          </div>

          <SecurityTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <SecurityOverview />
              </div>
              <div className="space-y-6">
                <ComplianceCards />
                <HardeningLink />
              </div>
            </div>
          )}

          {activeTab === "vulnerabilities" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <VulnerabilityTable />
              </div>
              <div>
                <VulnerabilityChart vulnerabilityData={vulnerabilityData} />
              </div>
            </div>
          )}

          {activeTab === "compliance" && (
            <div className="grid grid-cols-1 gap-6">
              <ComplianceCards showExpanded={true} />
            </div>
          )}
        </div>
      </div>
    </SidebarWithProvider>
  );
};

export default SecurityPage;
