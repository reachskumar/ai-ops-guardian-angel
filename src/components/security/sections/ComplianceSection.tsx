
import React from "react";
import { ComplianceCards } from "@/components/security";
import { useSecurityContext } from "../SecurityContext";

const ComplianceSection: React.FC = () => {
  const { complianceItems } = useSecurityContext();

  return (
    <div className="grid grid-cols-1 gap-6 mt-6">
      <ComplianceCards complianceItems={complianceItems} showExpanded={true} />
    </div>
  );
};

export default ComplianceSection;
