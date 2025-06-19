
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

const NetworkSecurityCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Network Security
        </CardTitle>
        <CardDescription>
          Cross-cloud security policies and compliance status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium">Security Policies</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Encryption in Transit</span>
                <Badge variant="default">Enforced</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Network Segmentation</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">DDoS Protection</span>
                <Badge variant="secondary">Partial</Badge>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium">Compliance Status</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">SOC 2 Type II</span>
                <Badge variant="default">Compliant</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">GDPR</span>
                <Badge variant="default">Compliant</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">HIPAA</span>
                <Badge variant="destructive">Review Needed</Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NetworkSecurityCard;
