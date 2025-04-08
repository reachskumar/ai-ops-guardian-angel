
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertTriangle, ShieldAlert, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

interface ComplianceItem {
  id: string;
  name: string;
  status: string;
  score: number;
}

interface ComplianceCardsProps {
  complianceItems: ComplianceItem[];
  showExpanded?: boolean;
  onScanRequest?: (standardId: string) => Promise<void>;
}

const ComplianceCards: React.FC<ComplianceCardsProps> = ({ 
  complianceItems, 
  showExpanded = false,
  onScanRequest 
}) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [scanning, setScanning] = useState<string | null>(null);

  const toggleExpand = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isExpanded = (itemName: string) => expandedItems.includes(itemName);

  const handleScanRequest = async (id: string) => {
    if (!onScanRequest) return;
    
    setScanning(id);
    try {
      await onScanRequest(id);
    } finally {
      setScanning(null);
    }
  };

  return (
    <div className={`grid grid-cols-1 ${showExpanded ? 'md:grid-cols-3' : 'md:grid-cols-2'} xl:grid-cols-3 gap-4`}>
      {complianceItems.map((item) => (
        <Collapsible
          key={item.id}
          open={isExpanded(item.name)}
          onOpenChange={() => toggleExpand(item.name)}
          className="border border-border rounded-lg p-4 transition-all duration-200 hover:shadow-md"
        >
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
            
            {onScanRequest && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                disabled={scanning === item.id}
                onClick={() => handleScanRequest(item.id)}
              >
                {scanning === item.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  'Run Compliance Scan'
                )}
              </Button>
            )}
            
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full flex items-center justify-center border border-border/30"
              >
                {isExpanded(item.name) ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Show Details
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
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
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Risk Level</span>
                    <span>{item.score >= 85 ? "Low" : item.score >= 70 ? "Medium" : "High"}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Next Audit</span>
                    <span>
                      {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </span>
                  </li>
                </ul>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Remediation Priority</h4>
                  <div className={`text-sm py-1 px-2 rounded ${
                    item.score >= 85
                      ? "bg-success/10 text-success"
                      : item.score >= 70
                      ? "bg-warning/10 text-warning"
                      : "bg-critical/10 text-critical"
                  }`}>
                    {item.score >= 85
                      ? "Low - Maintain current controls"
                      : item.score >= 70
                      ? "Medium - Address within 30 days"
                      : "High - Immediate attention required"}
                  </div>
                </div>
              </div>
            </CollapsibleContent>
            
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
        </Collapsible>
      ))}
    </div>
  );
};

export default ComplianceCards;
