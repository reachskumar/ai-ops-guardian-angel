import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

interface VulnerabilityData {
  name: string;
  value: number;
  color: string;
}

interface Vulnerability {
  id: string;
  title: string;
  severity: string;
  component: string;
  discovered: string;
  status: string;
}

export interface ComplianceItem {
  id: string;
  name: string;
  status: string;
  score: number;
}

interface SecurityContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
  lastScanTime: string;
  setLastScanTime: (time: string) => void;
  selectedCompliance: string[];
  setSelectedCompliance: (compliance: string[]) => void;
  complianceScore: number;
  setComplianceScore: (score: number) => void;
  vulnerabilityData: VulnerabilityData[];
  setVulnerabilityData: (data: VulnerabilityData[]) => void;
  complianceItems: ComplianceItem[];
  vulnerabilities: Vulnerability[];
  setVulnerabilities: (vulnerabilities: Vulnerability[]) => void;
  refreshSecurityData: (selectedStandards?: string[]) => void;
  handleVulnerabilityScan: () => void;
}

export const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error("useSecurityContext must be used within a SecurityProvider");
  }
  return context;
};

export const SecurityProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<string>(new Date().toISOString());
  const [selectedCompliance, setSelectedCompliance] = useState<string[]>(["All"]);
  const [complianceScore, setComplianceScore] = useState(85);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);

  // Sample data for the vulnerability chart
  const [vulnerabilityData, setVulnerabilityData] = useState([
    { name: "Critical", value: 3, color: "#ef4444" },
    { name: "High", value: 8, color: "#f97316" },
    { name: "Medium", value: 15, color: "#f59e0b" },
    { name: "Low", value: 24, color: "#3b82f6" },
  ]);

  // Sample compliance data with id field added
  const complianceItems: ComplianceItem[] = [
    { id: "pci-dss", name: "PCI DSS", status: "Passing", score: 92 },
    { id: "hipaa", name: "HIPAA", status: "Needs Review", score: 78 },
    { id: "nist", name: "NIST", status: "Passing", score: 85 },
    { id: "soc-2", name: "SOC 2", status: "Warning", score: 72 },
  ];

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

  // Handle vulnerability scan and update data
  const handleVulnerabilityScan = () => {
    // We'll generate some random new vulnerability data when scanning
    setTimeout(() => {
      // Simulate changing vulnerability counts
      setVulnerabilityData([
        { name: "Critical", value: Math.floor(Math.random() * 5) + 1, color: "#ef4444" },
        { name: "High", value: Math.floor(Math.random() * 7) + 5, color: "#f97316" },
        { name: "Medium", value: Math.floor(Math.random() * 10) + 10, color: "#f59e0b" },
        { name: "Low", value: Math.floor(Math.random() * 15) + 15, color: "#3b82f6" },
      ]);
      
      // Add a new vulnerability
      const newVulnerability = {
        id: `CVE-2023-${Math.floor(Math.random() * 9000) + 1000}`,
        title: "New Security Vulnerability",
        severity: ["Critical", "High", "Medium"][Math.floor(Math.random() * 3)],
        component: ["API Server", "Web UI", "Database", "Auth System"][Math.floor(Math.random() * 4)],
        discovered: new Date().toISOString().split('T')[0],
        status: "Open"
      };
      
      setVulnerabilities(prev => [newVulnerability, ...prev]);
      setLastScanTime(new Date().toISOString());
    }, 3000);
  };

  return (
    <SecurityContext.Provider value={{
      activeTab,
      setActiveTab,
      isScanning,
      setIsScanning,
      lastScanTime,
      setLastScanTime,
      selectedCompliance,
      setSelectedCompliance,
      complianceScore,
      setComplianceScore,
      vulnerabilityData,
      setVulnerabilityData,
      complianceItems,
      vulnerabilities,
      setVulnerabilities,
      refreshSecurityData,
      handleVulnerabilityScan
    }}>
      {children}
    </SecurityContext.Provider>
  );
};
