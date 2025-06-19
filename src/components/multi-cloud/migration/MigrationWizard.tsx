
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CloudResource, CloudAccount } from '@/services/cloud/types';
import { CheckCircle, AlertCircle, ArrowRight, Database, Server, HardDrive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MigrationWizardProps {
  resources: CloudResource[];
  accounts: CloudAccount[];
  onClose: () => void;
}

interface MigrationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  estimatedTime: string;
}

const MigrationWizard: React.FC<MigrationWizardProps> = ({ resources, accounts, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedResource, setSelectedResource] = useState<CloudResource | null>(null);
  const [targetProvider, setTargetProvider] = useState<string>('');
  const [migrationSteps, setMigrationSteps] = useState<MigrationStep[]>([]);
  const { toast } = useToast();

  const generateMigrationSteps = (resource: CloudResource, target: string) => {
    const steps: MigrationStep[] = [];
    
    if (resource.type === 'VM' || resource.type === 'EC2') {
      steps.push(
        {
          id: 'pre-check',
          title: 'Pre-migration Validation',
          description: 'Validate source VM configuration and target compatibility',
          status: 'pending',
          estimatedTime: '5 minutes'
        },
        {
          id: 'snapshot',
          title: 'Create VM Snapshot',
          description: 'Create backup snapshot of the source virtual machine',
          status: 'pending',
          estimatedTime: '15 minutes'
        },
        {
          id: 'network-config',
          title: 'Network Configuration',
          description: 'Configure VPC, subnets, and security groups in target cloud',
          status: 'pending',
          estimatedTime: '10 minutes'
        },
        {
          id: 'vm-creation',
          title: 'VM Provisioning',
          description: 'Create new VM instance in target cloud provider',
          status: 'pending',
          estimatedTime: '20 minutes'
        },
        {
          id: 'data-sync',
          title: 'Data Synchronization',
          description: 'Transfer and sync data from source to target VM',
          status: 'pending',
          estimatedTime: '45 minutes'
        },
        {
          id: 'testing',
          title: 'Migration Testing',
          description: 'Verify VM functionality and performance in target environment',
          status: 'pending',
          estimatedTime: '15 minutes'
        },
        {
          id: 'cutover',
          title: 'DNS Cutover',
          description: 'Update DNS records to point to new VM',
          status: 'pending',
          estimatedTime: '5 minutes'
        }
      );
    } else if (resource.type === 'Database' || resource.type === 'RDS') {
      steps.push(
        {
          id: 'schema-analysis',
          title: 'Database Schema Analysis',
          description: 'Analyze database schema and compatibility',
          status: 'pending',
          estimatedTime: '10 minutes'
        },
        {
          id: 'backup',
          title: 'Database Backup',
          description: 'Create full backup of source database',
          status: 'pending',
          estimatedTime: '30 minutes'
        },
        {
          id: 'target-setup',
          title: 'Target Database Setup',
          description: 'Provision and configure target database instance',
          status: 'pending',
          estimatedTime: '20 minutes'
        },
        {
          id: 'data-migration',
          title: 'Data Migration',
          description: 'Transfer data with integrity verification',
          status: 'pending',
          estimatedTime: '60 minutes'
        },
        {
          id: 'validation',
          title: 'Data Validation',
          description: 'Verify data integrity and consistency',
          status: 'pending',
          estimatedTime: '15 minutes'
        },
        {
          id: 'app-update',
          title: 'Application Update',
          description: 'Update application connection strings',
          status: 'pending',
          estimatedTime: '10 minutes'
        }
      );
    }
    
    return steps;
  };

  const startMigration = () => {
    if (!selectedResource || !targetProvider) return;
    
    const steps = generateMigrationSteps(selectedResource, targetProvider);
    setMigrationSteps(steps);
    setCurrentStep(1);
    
    // Simulate step execution
    simulateStepExecution(steps);
  };

  const simulateStepExecution = (steps: MigrationStep[]) => {
    steps.forEach((step, index) => {
      setTimeout(() => {
        setMigrationSteps(prev => prev.map(s => 
          s.id === step.id ? { ...s, status: 'in-progress' } : s
        ));
        
        setTimeout(() => {
          setMigrationSteps(prev => prev.map(s => 
            s.id === step.id ? { ...s, status: 'completed' } : s
          ));
          
          if (index === steps.length - 1) {
            toast({
              title: "Migration Completed",
              description: `Successfully migrated ${selectedResource?.name} to ${targetProvider}`,
            });
          }
        }, 2000);
      }, index * 3000);
    });
  };

  if (currentStep > 0) {
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Migration Progress: {selectedResource?.name}
          </CardTitle>
          <CardDescription>
            Migrating to {targetProvider.toUpperCase()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {migrationSteps.map((step, index) => (
              <div key={step.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  {step.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {step.status === 'in-progress' && <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                  {step.status === 'failed' && <AlertCircle className="h-5 w-5 text-red-500" />}
                  {step.status === 'pending' && <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                <Badge variant={
                  step.status === 'completed' ? 'default' :
                  step.status === 'in-progress' ? 'secondary' :
                  step.status === 'failed' ? 'destructive' : 'outline'
                }>
                  {step.status}
                </Badge>
                <span className="text-sm text-muted-foreground">{step.estimatedTime}</span>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Progress 
              value={(migrationSteps.filter(s => s.status === 'completed').length / migrationSteps.length) * 100} 
              className="flex-1 mx-4" 
            />
            <span className="text-sm">
              {migrationSteps.filter(s => s.status === 'completed').length} / {migrationSteps.length} completed
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Migration Wizard</CardTitle>
        <CardDescription>
          Select a resource and target provider to begin migration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Select Resource to Migrate</label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {resources.map(resource => (
                <div 
                  key={resource.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedResource?.id === resource.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedResource(resource)}
                >
                  <div className="flex items-center space-x-3">
                    {resource.type === 'VM' || resource.type === 'EC2' ? <Server className="h-4 w-4" /> : 
                     resource.type === 'Database' || resource.type === 'RDS' ? <Database className="h-4 w-4" /> :
                     <HardDrive className="h-4 w-4" />}
                    <div>
                      <p className="font-medium">{resource.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {resource.type} • {resource.region} • {resource.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Target Cloud Provider</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {['aws', 'azure', 'gcp'].map(provider => (
                <Button
                  key={provider}
                  variant={targetProvider === provider ? 'default' : 'outline'}
                  onClick={() => setTargetProvider(provider)}
                  className="justify-center"
                >
                  {provider.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={startMigration}
            disabled={!selectedResource || !targetProvider}
          >
            Start Migration
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MigrationWizard;
