import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CloudResource, CloudAccount } from '@/services/cloud/types';
import { ArrowRight, Play, Pause, CheckCircle, AlertCircle, Server, Database, HardDrive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MigrationWizard from './migration/MigrationWizard';

interface CrossCloudMigrationProps {
  resources: CloudResource[];
  accounts: CloudAccount[];
}

const CrossCloudMigration: React.FC<CrossCloudMigrationProps> = ({ resources, accounts }) => {
  const [showWizard, setShowWizard] = useState(false);
  const { toast } = useToast();

  const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'ec2':
      case 'vm':
        return <Server className="h-4 w-4" />;
      case 'rds':
      case 'database':
        return <Database className="h-4 w-4" />;
      case 's3':
      case 'storage':
        return <HardDrive className="h-4 w-4" />;
      default:
        return <Server className="h-4 w-4" />;
    }
  };

  const startMigrationWizard = () => {
    setShowWizard(true);
  };

  if (showWizard) {
    return (
      <div className="flex justify-center">
        <MigrationWizard 
          resources={resources} 
          accounts={accounts} 
          onClose={() => setShowWizard(false)} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Migration Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Resources</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resources.length}</div>
            <p className="text-xs text-muted-foreground">
              Resources ready for migration
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Migration Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98%</div>
            <p className="text-xs text-muted-foreground">
              Historical success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Migration Time</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5h</div>
            <p className="text-xs text-muted-foreground">
              Average completion time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Migration */}
      <Card>
        <CardHeader>
          <CardTitle>Start Migration</CardTitle>
          <CardDescription>
            Use our enhanced migration wizard for step-by-step guidance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Server className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Enhanced Migration Wizard</h3>
            <p className="text-muted-foreground mb-6">
              Our AI-powered wizard will guide you through every step of the migration process,
              including pre-checks, data sync, and post-migration validation.
            </p>
            <Button onClick={startMigrationWizard} size="lg">
              <Play className="mr-2 h-4 w-4" />
              Launch Migration Wizard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Migration Features */}
      <Card>
        <CardHeader>
          <CardTitle>Migration Features</CardTitle>
          <CardDescription>
            Advanced capabilities for seamless cross-cloud migration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Automated Migration</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Pre-migration compatibility checks
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Automated VM provisioning
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Data synchronization with integrity checks
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Network configuration translation
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Migration Support</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  24/7 migration support
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Rollback capabilities
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Real-time progress tracking
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Post-migration validation
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrossCloudMigration;
