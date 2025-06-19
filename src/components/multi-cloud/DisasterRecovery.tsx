
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CloudResource, CloudAccount } from '@/services/cloud/types';
import { Shield, Clock, MapPin, Zap } from 'lucide-react';

interface DisasterRecoveryProps {
  resources: CloudResource[];
  accounts: CloudAccount[];
}

const DisasterRecovery: React.FC<DisasterRecoveryProps> = ({ resources, accounts }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RTO Target</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15 min</div>
            <p className="text-xs text-muted-foreground">Recovery Time Objective</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RPO Target</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1 hour</div>
            <p className="text-xs text-muted-foreground">Recovery Point Objective</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DR Sites</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Active disaster recovery sites</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failover Status</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Ready</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Disaster Recovery Plans</CardTitle>
          <CardDescription>
            Automated failover configuration across multiple cloud providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Production Database Failover</h4>
                <p className="text-sm text-muted-foreground">AWS RDS → Azure SQL Database</p>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Web Application Failover</h4>
                <p className="text-sm text-muted-foreground">Azure App Service → AWS ECS</p>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Storage Replication</h4>
                <p className="text-sm text-muted-foreground">AWS S3 → GCP Cloud Storage</p>
              </div>
              <Badge variant="secondary">Testing</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recovery Testing</CardTitle>
          <CardDescription>Schedule and track disaster recovery tests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Button>Schedule DR Test</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DisasterRecovery;
