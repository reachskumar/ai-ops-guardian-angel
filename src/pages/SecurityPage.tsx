
import React, { useState, useEffect } from "react";
import { SidebarWithProvider } from "@/components/Sidebar";
import Header from "@/components/Header";
import { toast } from "@/hooks/use-toast";
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
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<string>(new Date().toISOString());
  const [selectedCompliance, setSelectedCompliance] = useState<string[]>(["All"]);
  const [complianceScore, setComplianceScore] = useState(85);

  // Sample data for the vulnerability chart
  const vulnerabilityData = [
    { name: "Critical", value: 3, color: "#ef4444" },
    { name: "High", value: 8, color: "#f97316" },
    { name: "Medium", value: 15, color: "#f59e0b" },
    { name: "Low", value: 24, color: "#3b82f6" },
  ];

  // Sample compliance data
  const complianceItems = [
    { name: "PCI DSS", status: "Passing", score: 92 },
    { name: "HIPAA", status: "Needs Review", score: 78 },
    { name: "NIST", status: "Passing", score: 85 },
    { name: "SOC 2", status: "Warning", score: 72 },
  ];

  // Sample vulnerability data
  const vulnerabilities = [
    { 
      id: "CVE-2023-1234", 
      title: "SQL Injection in API Endpoint", 
      severity: "Critical", 
      component: "API Server", 
      discovered: "2023-03-15", 
      status: "Open" 
    },
    { 
      id: "CVE-2023-5678", 
      title: "Cross-Site Scripting", 
      severity: "High", 
      component: "Web UI", 
      discovered: "2023-03-20", 
      status: "In-Progress" 
    },
    { 
      id: "CVE-2023-9101", 
      title: "Outdated SSL Certificate", 
      severity: "Medium", 
      component: "Load Balancer", 
      discovered: "2023-03-25", 
      status: "Resolved" 
    },
  ];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const refreshSecurityData = (selectedStandards?: string[]) => {
    setIsScanning(true);
    
    const standards = selectedStandards || selectedCompliance;
    setSelectedCompliance(standards);
    
    // Simulate scanning delay
    setTimeout(() => {
      setIsScanning(false);
      setLastScanTime(new Date().toISOString());
      
      // Calculate a new compliance score based on selected standards
      let newScore = 85; // Default
      
      if (standards.includes("All")) {
        newScore = 85;
      } else if (standards.includes("PCI DSS")) {
        newScore = 92;
      } else if (standards.includes("HIPAA")) {
        newScore = 78;
      } else if (standards.includes("NIST")) {
        newScore = 85;
      } else if (standards.includes("SOC 2")) {
        newScore = 72;
      }
      
      setComplianceScore(newScore);
      
      // Show completion toast with info about what was scanned
      const standardsText = standards.length === 1 && standards[0] === "All" 
        ? "all compliance standards" 
        : `${standards.join(", ")} compliance`;
      
      toast({
        title: "Security Scan Complete",
        description: `Scan completed for ${standardsText}`,
      });
    }, 3000);
  };

  // For demo purposes, we'll automatically scan when the component mounts
  useEffect(() => {
    // You would typically fetch real security data here
  }, []);

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

          {/* Pass all necessary props to the SecurityTabs component */}
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

          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="md:col-span-2">
                <SecurityOverview 
                  complianceScore={complianceScore}
                  lastScanTime={lastScanTime}
                  vulnerabilityData={vulnerabilityData}
                  isScanning={isScanning}
                  onRunScan={() => refreshSecurityData()}
                />
              </div>
              <div className="space-y-6">
                <ComplianceCards complianceItems={complianceItems} />
                <HardeningLink />
              </div>
            </div>
          )}

          {activeTab === "vulnerabilities" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="md:col-span-2">
                <VulnerabilityTable vulnerabilities={vulnerabilities} />
              </div>
              <div>
                <VulnerabilityChart vulnerabilityData={vulnerabilityData} />
              </div>
            </div>
          )}

          {activeTab === "compliance" && (
            <div className="grid grid-cols-1 gap-6 mt-6">
              <ComplianceCards complianceItems={complianceItems} showExpanded={true} />
            </div>
          )}
        </div>
      </div>
    </SidebarWithProvider>
  );
};

export default SecurityPage;
