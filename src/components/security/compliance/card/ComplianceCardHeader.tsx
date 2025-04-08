
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertTriangle, ShieldAlert } from "lucide-react";

interface ComplianceCardHeaderProps {
  name: string;
  status: string;
  score: number;
}

const ComplianceCardHeader: React.FC<ComplianceCardHeaderProps> = ({ name, status, score }) => {
  return (
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center gap-2">
        {score >= 85 ? (
          <ShieldCheck className="h-5 w-5 text-success" />
        ) : score >= 70 ? (
          <AlertTriangle className="h-5 w-5 text-warning" />
        ) : (
          <ShieldAlert className="h-5 w-5 text-critical" />
        )}
        <h3 className="font-medium">{name}</h3>
      </div>
      <Badge
        variant="outline"
        className={
          status === "Passing"
            ? "border-success text-success"
            : status === "Needs Review"
            ? "border-warning text-warning"
            : "border-critical text-critical"
        }
      >
        {status}
      </Badge>
    </div>
  );
};

export default ComplianceCardHeader;
