
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

          <SecurityTabs 
            vulnerabilities={vulnerabilities} 
            complianceItems={complianceItems} 
          />

          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <SecurityOverview 
                  complianceScore={85}
                  lastScanTime="2023-04-05T14:30:00"
                  vulnerabilityData={vulnerabilityData}
                />
              </div>
              <div className="space-y-6">
                <ComplianceCards complianceItems={complianceItems} />
                <HardeningLink />
              </div>
            </div>
          )}

          {activeTab === "vulnerabilities" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <VulnerabilityTable vulnerabilities={vulnerabilities} />
              </div>
              <div>
                <VulnerabilityChart vulnerabilityData={vulnerabilityData} />
              </div>
            </div>
          )}

          {activeTab === "compliance" && (
            <div className="grid grid-cols-1 gap-6">
              <ComplianceCards complianceItems={complianceItems} />
            </div>
          )}
        </div>
      </div>
    </SidebarWithProvider>
  );
};

export default SecurityPage;
