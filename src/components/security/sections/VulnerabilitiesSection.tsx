
import React from "react";
import { VulnerabilityTable, VulnerabilityChart } from "@/components/security";
import { useSecurityContext } from "../SecurityContext";
import ScannerIntegration from "../ScannerIntegration";

const VulnerabilitiesSection: React.FC = () => {
  const {
    vulnerabilities,
    vulnerabilityData,
    handleVulnerabilityScan
  } = useSecurityContext();

  return (
    <div className="space-y-6 mt-6">
      <ScannerIntegration />
      
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
    </div>
  );
};

export default VulnerabilitiesSection;
