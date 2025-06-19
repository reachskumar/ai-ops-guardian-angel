
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CloudResource, CloudAccount } from '@/services/cloud/types';
import { Shield, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

interface PolicyGovernanceProps {
  resources: CloudResource[];
  accounts: CloudAccount[];
}

const PolicyGovernance: React.FC<PolicyGovernanceProps> = ({ resources, accounts }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Across all providers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94%</div>
            <p className="text-xs text-muted-foreground">Overall compliance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Remediated</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Policy Violations</CardTitle>
          <CardDescription>Review and remediate policy violations across all cloud providers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg border-red-200">
              <div>
                <h4 className="font-medium text-red-800">Unencrypted S3 Bucket</h4>
                <p className="text-sm text-muted-foreground">AWS - prod-data-bucket</p>
              </div>
              <Badge variant="destructive">Critical</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg border-yellow-200">
              <div>
                <h4 className="font-medium text-yellow-800">Open Security Group</h4>
                <p className="text-sm text-muted-foreground">Azure - web-sg-01</p>
              </div>
              <Badge variant="secondary">Medium</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg border-yellow-200">
              <div>
                <h4 className="font-medium text-yellow-800">Missing Resource Tags</h4>
                <p className="text-sm text-muted-foreground">GCP - compute-instance-03</p>
              </div>
              <Badge variant="secondary">Low</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Unified Security Policies</CardTitle>
          <CardDescription>Manage security policies across all cloud providers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Encryption Policies</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Data at Rest</span>
                    <Badge variant="default">Enforced</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Data in Transit</span>
                    <Badge variant="default">Enforced</Badge>
                  </div>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Access Control</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">MFA Required</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Role-based Access</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PolicyGovernance;
