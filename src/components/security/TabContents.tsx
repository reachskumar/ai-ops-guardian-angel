
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SecurityOverview from "./SecurityOverview";
import VulnerabilityTable from "./VulnerabilityTable";
import ComplianceCards from "./ComplianceCards";
import { ComplianceItem } from "./SecurityContext";

interface TabContentsProps {
  vulnerabilities: Array<{
    id: string;
    title: string;
    severity: string;
    component: string;
    discovered: string;
    status: string;
  }>;
  complianceItems: ComplianceItem[];
  vulnerabilityData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  complianceScore: number;
  lastScanTime: string;
  isScanning: boolean;
  onRunScan: () => void;
}

const TabContents: React.FC<TabContentsProps> = ({
  vulnerabilities,
  complianceItems,
  vulnerabilityData,
  complianceScore,
  lastScanTime,
  isScanning,
  onRunScan
}) => {
  return (
    <>
      <TabsContent value="overview">
        <Card>
          <CardHeader>
            <CardTitle>Security Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <SecurityOverview 
              complianceScore={complianceScore}
              lastScanTime={lastScanTime}
              vulnerabilityData={vulnerabilityData}
              isScanning={isScanning}
              onRunScan={onRunScan}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="vulnerabilities">
        <Card>
          <CardHeader>
            <CardTitle>Vulnerability Report</CardTitle>
          </CardHeader>
          <CardContent>
            <VulnerabilityTable vulnerabilities={vulnerabilities} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="compliance">
        <Card>
          <CardHeader>
            <CardTitle>Compliance Report</CardTitle>
          </CardHeader>
          <CardContent>
            <ComplianceCards complianceItems={complianceItems} />
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
};

export default TabContents;
