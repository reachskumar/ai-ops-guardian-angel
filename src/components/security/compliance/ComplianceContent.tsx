
import React from "react";
import { ComplianceCards } from "@/components/security";
import { Loader2 } from "lucide-react";
import { ComplianceStandard } from "./types";
import ComplianceStandardsTable from "./ComplianceStandardsTable";
import { ComplianceItem } from "@/components/security/ComplianceCards";

interface ComplianceContentProps {
  loading: boolean;
  viewMode: "cards" | "table";
  complianceStandards: ComplianceStandard[];
  onScanRequest: (standardId: string) => void;
}

const ComplianceContent: React.FC<ComplianceContentProps> = ({
  loading,
  viewMode,
  complianceStandards,
  onScanRequest
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (viewMode === "cards") {
    // Map from ComplianceStandard to ComplianceItem
    const complianceItems: ComplianceItem[] = complianceStandards.map(std => ({
      id: std.id,
      name: std.name,
      status: std.status || 'Not Assessed',
      score: std.score || 0,
    }));
    
    return <ComplianceCards complianceItems={complianceItems} onScanRequest={onScanRequest} />;
  }

  return <ComplianceStandardsTable complianceStandards={complianceStandards} onRunScan={onScanRequest} />;
};

export default ComplianceContent;
