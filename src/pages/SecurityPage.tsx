
import React from "react";
import Header from "@/components/Header";
import { SidebarWithProvider } from "@/components/Sidebar";
import { SecurityOverview, SecurityTabs } from "@/components/security";

const SecurityPage: React.FC = () => {
  const complianceScore = 78;
  const lastScanTime = "2023-04-07T08:30:00Z";

  const vulnerabilityData = [
    { name: "Critical", value: 2, color: "#ef4444" },
    { name: "High", value: 3, color: "#f59e0b" },
    { name: "Medium", value: 5, color: "#3b82f6" },
    { name: "Low", value: 12, color: "#6b7280" },
  ];

  const vulnerabilities = [
    {
      id: "CVE-2023-1234",
      title: "Authentication Bypass in API Gateway",
      severity: "critical",
      component: "api-gateway:v1.2.3",
      discovered: "2 days ago",
      status: "open",
    },
    {
      id: "CVE-2023-5678",
      title: "SQL Injection in User Service",
      severity: "critical",
      component: "user-service:v2.0.1",
      discovered: "3 days ago",
      status: "in-progress",
    },
    {
      id: "CVE-2023-2468",
      title: "Outdated TLS Version",
      severity: "high",
      component: "nginx:1.18.0",
      discovered: "1 week ago",
      status: "in-progress",
    },
    {
      id: "CVE-2023-9101",
      title: "Insecure Dependency",
      severity: "high",
      component: "node-modules/axios:0.21.1",
      discovered: "1 week ago",
      status: "open",
    },
    {
      id: "CVE-2023-3579",
      title: "Cross-Site Scripting (XSS)",
      severity: "high",
      component: "frontend:v3.2.0",
      discovered: "2 weeks ago",
      status: "open",
    },
  ];

  const complianceItems = [
    { name: "CIS Benchmarks", status: "Passing", score: 92 },
    { name: "NIST Framework", status: "Needs Review", score: 84 },
    { name: "PCI DSS", status: "Failing", score: 64 },
    { name: "HIPAA", status: "Passing", score: 90 },
    { name: "SOC 2", status: "Passing", score: 88 },
    { name: "GDPR", status: "Needs Review", score: 76 },
    { name: "ISO 27001", status: "Passing", score: 86 },
  ];

  return (
    <SidebarWithProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Security & Compliance</h1>
            <p className="text-muted-foreground">
              Monitor vulnerabilities, ensure compliance, and secure your
              infrastructure
            </p>
          </div>

          <SecurityOverview 
            complianceScore={complianceScore}
            lastScanTime={lastScanTime}
            vulnerabilityData={vulnerabilityData}
          />

          <div className="mt-8">
            <SecurityTabs 
              vulnerabilities={vulnerabilities}
              complianceItems={complianceItems}
            />
          </div>
        </div>
      </div>
    </SidebarWithProvider>
  );
};

export default SecurityPage;
