
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertTriangle, ShieldAlert } from "lucide-react";

interface ComplianceItem {
  name: string;
  status: string;
  score: number;
}

interface ComplianceCardsProps {
  complianceItems: ComplianceItem[];
  showExpanded?: boolean;
}

const ComplianceCards: React.FC<ComplianceCardsProps> = ({ complianceItems, showExpanded = false }) => {
  return (
    <div className={`grid grid-cols-1 ${showExpanded ? 'md:grid-cols-3' : 'md:grid-cols-2'} xl:grid-cols-3 gap-4`}>
      {complianceItems.map((item, i) => (
        <div key={i} className="border border-border rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              {item.score >= 85 ? (
                <ShieldCheck className="h-5 w-5 text-success" />
              ) : item.score >= 70 ? (
                <AlertTriangle className="h-5 w-5 text-warning" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-critical" />
              )}
              <h3 className="font-medium">{item.name}</h3>
            </div>
            <Badge
              variant="outline"
              className={
                item.status === "Passing"
                  ? "border-success text-success"
                  : item.status === "Needs Review"
                  ? "border-warning text-warning"
                  : "border-critical text-critical"
              }
            >
              {item.status}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Compliance Score</span>
              <span
                className={`text-sm font-medium ${
                  item.score >= 85
                    ? "text-success"
                    : item.score >= 70
                    ? "text-warning"
                    : "text-critical"
                }`}
              >
                {item.score}%
              </span>
            </div>
            <Progress value={item.score} className="h-1.5" />
            {showExpanded && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Compliance Details</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Controls Passed</span>
                    <span>{Math.floor(item.score / 100 * 42)}/42</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Last Assessment</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ComplianceCards;
