
import React, { useState } from "react";
import { 
  ComplianceHeader, 
  ComplianceContent,
  useComplianceData
} from "../compliance";

const ComplianceSection: React.FC = () => {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const { loading, standards, runComplianceScan } = useComplianceData();

  return (
    <div className="space-y-6">
      <ComplianceHeader viewMode={viewMode} setViewMode={setViewMode} />
      <ComplianceContent 
        loading={loading}
        viewMode={viewMode}
        complianceStandards={standards}
        onScanRequest={runComplianceScan}
      />
    </div>
  );
};

export default ComplianceSection;
