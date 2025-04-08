
import React from "react";

interface ComplianceCardDetailsProps {
  score: number;
  showExpanded?: boolean;
}

const ComplianceCardDetails: React.FC<ComplianceCardDetailsProps> = ({ 
  score, 
  showExpanded = false 
}) => {
  return (
    <div className="mt-4 pt-4 border-t">
      <h4 className="text-sm font-medium mb-2">Compliance Details</h4>
      <ul className="space-y-2 text-sm">
        <li className="flex justify-between">
          <span className="text-muted-foreground">Controls Passed</span>
          <span>{Math.floor(score / 100 * 42)}/42</span>
        </li>
        <li className="flex justify-between">
          <span className="text-muted-foreground">Last Assessment</span>
          <span>{new Date().toLocaleDateString()}</span>
        </li>
        {showExpanded && (
          <>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Risk Level</span>
              <span>{score >= 85 ? "Low" : score >= 70 ? "Medium" : "High"}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Next Audit</span>
              <span>
                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </span>
            </li>
          </>
        )}
      </ul>
      
      {showExpanded && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Remediation Priority</h4>
          <div className={`text-sm py-1 px-2 rounded ${
            score >= 85
              ? "bg-success/10 text-success"
              : score >= 70
              ? "bg-warning/10 text-warning"
              : "bg-critical/10 text-critical"
          }`}>
            {score >= 85
              ? "Low - Maintain current controls"
              : score >= 70
              ? "Medium - Address within 30 days"
              : "High - Immediate attention required"}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceCardDetails;
