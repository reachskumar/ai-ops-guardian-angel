
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

interface SecurityFinding {
  id: string;
  severity: string;
  description: string;
  asset: string;
  date: string;
}

interface SecurityTabProps {
  securityFindings: SecurityFinding[];
}

const SecurityTab: React.FC<SecurityTabProps> = ({ securityFindings }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-md font-medium">Security Findings</CardTitle>
            <Button variant="outline" size="sm">
              <Shield className="mr-2 h-4 w-4" />
              Run Scan
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="grid grid-cols-5 p-3 text-xs font-medium text-muted-foreground border-b">
                <div>ID</div>
                <div>Severity</div>
                <div>Description</div>
                <div>Asset</div>
                <div>Detected</div>
              </div>
              {securityFindings.map((finding, i) => (
                <div key={i} className="grid grid-cols-5 p-3 text-sm items-center border-b last:border-0">
                  <div className="font-medium">{finding.id}</div>
                  <div>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      finding.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 
                      finding.severity === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' : 
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {finding.severity}
                    </span>
                  </div>
                  <div>{finding.description}</div>
                  <div>{finding.asset}</div>
                  <div>{finding.date}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>PCI DSS</span>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                  Compliant
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>HIPAA</span>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                  Compliant
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>SOC 2</span>
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                  In Progress
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>GDPR</span>
                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900 dark:text-red-300">
                  Attention Needed
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Security Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm">WAF</span>
              </div>
              <span className="text-xs text-green-500">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm">IDS/IPS</span>
              </div>
              <span className="text-xs text-green-500">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                <span className="text-sm">SIEM</span>
              </div>
              <span className="text-xs text-yellow-500">Needs Config</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm">Vulnerability Scanner</span>
              </div>
              <span className="text-xs text-green-500">Active</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecurityTab;
