
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SettingsTab: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Security & Compliance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-tagging</p>
              <p className="text-sm text-muted-foreground">Automatically tag resources with owner and cost center</p>
            </div>
            <Badge variant="default" className="bg-green-500">Enabled</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">CIS Compliance</p>
              <p className="text-sm text-muted-foreground">Enforce CIS benchmarks on all resources</p>
            </div>
            <Badge variant="default" className="bg-green-500">Enabled</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Encryption at Rest</p>
              <p className="text-sm text-muted-foreground">Require encryption for all storage resources</p>
            </div>
            <Badge variant="default" className="bg-green-500">Enabled</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Send email alerts for approvals and deployments</p>
            </div>
            <Badge variant="default" className="bg-green-500">Enabled</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Slack Integration</p>
              <p className="text-sm text-muted-foreground">Send notifications to #devops channel</p>
            </div>
            <Badge variant="default" className="bg-green-500">Enabled</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">SIEM Integration</p>
              <p className="text-sm text-muted-foreground">Forward audit logs to security system</p>
            </div>
            <Badge variant="secondary">Disabled</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
