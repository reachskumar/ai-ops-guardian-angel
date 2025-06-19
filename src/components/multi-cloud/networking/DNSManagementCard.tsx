
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const DNSManagementCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Unified DNS Management</CardTitle>
        <CardDescription>
          Manage DNS records across all cloud providers from a single interface
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium">Global DNS Zones</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="font-mono text-sm">example.com</span>
                <Badge variant="outline">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="font-mono text-sm">api.example.com</span>
                <Badge variant="outline">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="font-mono text-sm">staging.example.com</span>
                <Badge variant="secondary">Inactive</Badge>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium">Traffic Routing</h4>
            <div className="space-y-2">
              <div className="p-3 border rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Geo-based Routing</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Routes traffic based on user location
                </p>
              </div>
              <div className="p-3 border rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Health Check Routing</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Automatic failover on health check failures
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DNSManagementCard;
