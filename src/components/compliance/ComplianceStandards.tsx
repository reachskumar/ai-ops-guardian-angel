
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertTriangle, ShieldAlert, Check, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ComplianceStandardProps {
  name: string;
  description: string;
  level?: string;
  score: number;
  status: "passing" | "warning" | "failing" | "not-applicable";
  controls: {
    id: string;
    name: string;
    status: "passed" | "warning" | "failed";
    description: string;
  }[];
}

interface ComplianceStandardsProps {
  standards: ComplianceStandardProps[];
  onViewDetails: (standardName: string) => void;
  onRunScan: () => void;
  scanningStatus: "idle" | "scanning" | "complete";
}

const ComplianceStandards: React.FC<ComplianceStandardsProps> = ({
  standards,
  onViewDetails,
  onRunScan,
  scanningStatus
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passing":
      case "passed":
        return <ShieldCheck className="h-5 w-5 text-success" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "failing":
      case "failed":
        return <ShieldAlert className="h-5 w-5 text-critical" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passing":
      case "passed":
        return "bg-success text-success-foreground";
      case "warning":
        return "bg-warning text-warning-foreground";
      case "failing":
      case "failed":
        return "bg-critical text-critical-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    let color = "";
    let text = "";

    switch (status) {
      case "passing":
        color = "bg-success text-success-foreground";
        text = "Passing";
        break;
      case "warning":
        color = "bg-warning text-warning-foreground";
        text = "Needs Review";
        break;
      case "failing":
        color = "bg-critical text-critical-foreground";
        text = "Failing";
        break;
      case "not-applicable":
        color = "bg-muted text-muted-foreground";
        text = "Not Applicable";
        break;
      case "passed":
        color = "bg-success text-success-foreground";
        text = "Passed";
        break;
      case "failed":
        color = "bg-critical text-critical-foreground";
        text = "Failed";
        break;
      default:
        color = "bg-muted text-muted-foreground";
        text = "Unknown";
    }

    return <Badge className={color}>{text}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Compliance Standards</h2>
        <Button 
          onClick={onRunScan}
          disabled={scanningStatus === "scanning"}
        >
          {scanningStatus === "scanning" ? (
            <>
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
              Scanning...
            </>
          ) : (
            "Run Compliance Scan"
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {standards.map((standard) => (
          <Card key={standard.name} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(standard.status)}
                  <CardTitle className="text-lg">
                    {standard.name}
                    {standard.level && (
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        Level {standard.level}
                      </span>
                    )}
                  </CardTitle>
                </div>
                {getStatusBadge(standard.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{standard.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Compliance Score</span>
                  <span className={`text-sm font-medium ${
                    standard.score >= 85 ? "text-success" :
                    standard.score >= 70 ? "text-warning" :
                    "text-critical"
                  }`}>
                    {standard.score}%
                  </span>
                </div>
                <Progress value={standard.score} className="h-2" />
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="controls">
                  <AccordionTrigger className="text-sm">
                    View Controls ({standard.controls.length})
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 mt-2">
                      {standard.controls.slice(0, 3).map((control) => (
                        <div 
                          key={control.id} 
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <div className="flex items-center gap-2">
                            {getStatusIcon(control.status)}
                            <span className="text-sm">{control.name}</span>
                          </div>
                          {getStatusBadge(control.status)}
                        </div>
                      ))}
                      
                      {standard.controls.length > 3 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-2"
                          onClick={() => onViewDetails(standard.name)}
                        >
                          View All {standard.controls.length} Controls
                        </Button>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <Button 
                variant="outline"
                onClick={() => onViewDetails(standard.name)}
                className="w-full"
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ComplianceStandards;
