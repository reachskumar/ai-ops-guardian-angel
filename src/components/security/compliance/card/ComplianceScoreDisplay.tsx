
import React from "react";
import { Progress } from "@/components/ui/progress";

interface ComplianceScoreDisplayProps {
  score: number;
}

const ComplianceScoreDisplay: React.FC<ComplianceScoreDisplayProps> = ({ score }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Compliance Score</span>
        <span
          className={`text-sm font-medium ${
            score >= 85
              ? "text-success"
              : score >= 70
              ? "text-warning"
              : "text-critical"
          }`}
        >
          {score}%
        </span>
      </div>
      <Progress value={score} className="h-1.5" />
    </div>
  );
};

export default ComplianceScoreDisplay;
