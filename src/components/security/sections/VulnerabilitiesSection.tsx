
import React from "react";
import { VulnerabilityTable, VulnerabilityChart } from "@/components/security";
import { useSecurityContext } from "../SecurityContext";
import ScannerIntegration from "../ScannerIntegration";
import VulnerabilityScanner from "../VulnerabilityScanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const VulnerabilitiesSection: React.FC = () => {
  const {
    vulnerabilities,
    vulnerabilityData,
    handleVulnerabilityScan
  } = useSecurityContext();

  return (
    <div className="space-y-6 mt-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scanner">Live Scanner</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <VulnerabilityTable 
                vulnerabilities={vulnerabilities} 
                onRescan={handleVulnerabilityScan}
              />
            </div>
            <div>
              <VulnerabilityChart vulnerabilityData={vulnerabilityData} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="scanner">
          <VulnerabilityScanner />
        </TabsContent>
        
        <TabsContent value="integrations">
          <ScannerIntegration />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VulnerabilitiesSection;
