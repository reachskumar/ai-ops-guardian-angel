
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SecurityPanel: React.FC = () => {
  const complianceScore = 78;

  const vulnerabilities = {
    critical: 2,
    high: 3,
    medium: 5,
    low: 12,
  };

  const complianceItems = [
    { name: "CIS Benchmarks", status: "Passing", score: 92 },
    { name: "NIST Framework", status: "Needs Review", score: 84 },
    { name: "PCI DSS", status: "Failing", score: 64 },
    { name: "HIPAA", status: "Passing", score: 90 },
  ];

  return (
    <Card className="col-span-1 row-span-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Security & Compliance
          </CardTitle>
          <Button variant="outline" size="sm" className="h-8">
            Run Scan
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Compliance Score</h4>
              <span
                className={`text-sm font-bold ${
                  complianceScore >= 90
                    ? "text-success"
                    : complianceScore >= 70
                    ? "text-warning"
                    : "text-critical"
                }`}
              >
                {complianceScore}%
              </span>
            </div>
            <Progress value={complianceScore} className="h-2" />
            <div className="grid grid-cols-2 gap-2 mt-3">
              {complianceItems.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between bg-muted rounded-md p-2"
                >
                  <div className="flex items-center gap-1">
                    {item.score >= 85 ? (
                      <ShieldCheck className="h-3 w-3 text-success" />
                    ) : item.score >= 70 ? (
                      <AlertTriangle className="h-3 w-3 text-warning" />
                    ) : (
                      <ShieldAlert className="h-3 w-3 text-critical" />
                    )}
                    <span className="text-xs">{item.name}</span>
                  </div>
                  <span
                    className={`text-xs font-medium ${
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
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Vulnerability Summary</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted rounded-md p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground">
                    Critical
                  </span>
                  <p className="text-xl font-bold text-critical">
                    {vulnerabilities.critical}
                  </p>
                </div>
                <Badge className="bg-critical">Action needed</Badge>
              </div>
              <div className="bg-muted rounded-md p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground">
                    High
                  </span>
                  <p className="text-xl font-bold text-warning">
                    {vulnerabilities.high}
                  </p>
                </div>
                <Badge className="bg-warning">Attention</Badge>
              </div>
              <div className="bg-muted rounded-md p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground">
                    Medium
                  </span>
                  <p className="text-xl font-bold text-info">
                    {vulnerabilities.medium}
                  </p>
                </div>
                <Badge className="bg-info">Review</Badge>
              </div>
              <div className="bg-muted rounded-md p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground">
                    Low
                  </span>
                  <p className="text-xl font-bold text-muted-foreground">
                    {vulnerabilities.low}
                  </p>
                </div>
                <Badge variant="outline">Info</Badge>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full justify-between"
              asChild
            >
              <a href="/security">
                View Full Security Report
                <ChevronRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityPanel;
