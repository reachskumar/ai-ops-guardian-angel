
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, ShieldAlert } from "lucide-react";
import VulnerabilityChart from "./VulnerabilityChart";

interface SecurityOverviewProps {
  complianceScore: number;
  lastScanTime: string;
  vulnerabilityData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

const SecurityOverview: React.FC<SecurityOverviewProps> = ({
  complianceScore,
  lastScanTime,
  vulnerabilityData,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">
              Compliance Score
            </CardTitle>
            <Badge
              className={
                complianceScore >= 90
                  ? "bg-success"
                  : complianceScore >= 70
                  ? "bg-warning"
                  : "bg-critical"
              }
            >
              {complianceScore}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Progress value={complianceScore} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" /> Last scan: {new Date(lastScanTime).toLocaleString()}
              </span>
              <Button size="sm" variant="outline" className="h-8">
                Run Scan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">
            Vulnerability Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VulnerabilityChart vulnerabilityData={vulnerabilityData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">
              Security Status
            </CardTitle>
            <ShieldAlert className="h-5 w-5 text-critical" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted rounded-md">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-critical" />
                <span>Critical Issues</span>
              </div>
              <Badge className="bg-critical">{vulnerabilityData[0].value}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-md">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-warning" />
                <span>High Issues</span>
              </div>
              <Badge className="bg-warning">{vulnerabilityData[1].value}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-md">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-success" />
                <span>Passing Controls</span>
              </div>
              <Badge className="bg-success">42</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityOverview;
