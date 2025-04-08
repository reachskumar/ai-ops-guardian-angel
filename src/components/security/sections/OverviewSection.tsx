
import React from "react";
import { SecurityOverview, HardeningLink } from "@/components/security";
import { ComplianceCards, ComplianceItem } from "@/components/security";
import { useSecurityContext } from "../SecurityContext";

const OverviewSection: React.FC = () => {
  const {
    complianceScore,
    lastScanTime,
    vulnerabilityData,
    isScanning,
    refreshSecurityData,
    complianceItems
  } = useSecurityContext();

  return (
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
  );
};

export default OverviewSection;
