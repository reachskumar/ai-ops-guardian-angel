
import React from "react";
import { SidebarWithProvider } from "@/components/Sidebar";
import Header from "@/components/Header";
import { 
  SecurityTabs,
  SecurityProvider,
  useSecurityContext,
  OverviewSection,
  VulnerabilitiesSection,
  ComplianceSection
} from "@/components/security";

const SecurityPageContent: React.FC = () => {
  const {
    vulnerabilities,
    complianceItems,
    vulnerabilityData,
    activeTab,
    setActiveTab,
    refreshSecurityData,
    lastScanTime,
    complianceScore,
    isScanning
  } = useSecurityContext();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
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

        <SecurityTabs 
          vulnerabilities={vulnerabilities} 
          complianceItems={complianceItems} 
          vulnerabilityData={vulnerabilityData}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onRefreshData={refreshSecurityData}
          lastScanTime={lastScanTime}
          complianceScore={complianceScore}
          isScanning={isScanning}
        />

        {activeTab === "overview" && <OverviewSection />}
        {activeTab === "vulnerabilities" && <VulnerabilitiesSection />}
        {activeTab === "compliance" && <ComplianceSection />}
      </div>
    </div>
  );
};

const SecurityPage: React.FC = () => {
  return (
    <SecurityProvider>
      <SidebarWithProvider>
        <SecurityPageContent />
      </SidebarWithProvider>
    </SecurityProvider>
  );
};

export default SecurityPage;
