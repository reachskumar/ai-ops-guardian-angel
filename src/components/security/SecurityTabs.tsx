
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TabActions from "./TabActions";
import TabContents from "./TabContents";

export interface SecurityTabsProps {
  vulnerabilities: Array<{
    id: string;
    title: string;
    severity: string;
    component: string;
    discovered: string;
    status: string;
  }>;
  complianceItems: Array<{
    name: string;
    status: string;
    score: number;
  }>;
  vulnerabilityData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onRefreshData?: (selectedStandards?: string[]) => void;
  lastScanTime?: string;
  complianceScore?: number;
  isScanning?: boolean;
}

const SecurityTabs: React.FC<SecurityTabsProps> = ({ 
  vulnerabilities, 
  complianceItems, 
  vulnerabilityData = [],
  activeTab = "overview", 
  onTabChange = () => {},
  onRefreshData = () => {},
  lastScanTime = new Date().toISOString(),
  complianceScore = 85,
  isScanning = false
}) => {
  const [showComplianceSelector, setShowComplianceSelector] = useState(false);

  const handleRefresh = () => {
    setShowComplianceSelector(true);
  };

  return (
    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={onTabChange}>
      <div className="flex items-center justify-between mb-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>
        
        <TabActions 
          showComplianceSelector={showComplianceSelector}
          setShowComplianceSelector={setShowComplianceSelector}
          onRefreshData={onRefreshData}
          isScanning={isScanning}
        />
      </div>

      <TabContents 
        vulnerabilities={vulnerabilities}
        complianceItems={complianceItems}
        vulnerabilityData={vulnerabilityData}
        complianceScore={complianceScore}
        lastScanTime={lastScanTime}
        isScanning={isScanning}
        onRunScan={handleRefresh}
      />
    </Tabs>
  );
};

export default SecurityTabs;
