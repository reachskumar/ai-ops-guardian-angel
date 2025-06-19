
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CloudResource, CloudAccount } from '@/services/cloud/types';
import { ArrowRight, Play, Pause, CheckCircle, AlertCircle, Server, Database, HardDrive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CrossCloudMigrationProps {
  resources: CloudResource[];
  accounts: CloudAccount[];
}

interface MigrationJob {
  id: string;
  sourceResource: CloudResource;
  targetProvider: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  estimatedTime: string;
  createdAt: Date;
}

const CrossCloudMigration: React.FC<CrossCloudMigrationProps> = ({ resources, accounts }) => {
  const [selectedResource, setSelectedResource] = useState<string>('');
  const [targetProvider, setTargetProvider] = useState<string>('');
  const [migrationJobs, setMigrationJobs] = useState<MigrationJob[]>([]);
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

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'aws': return 'Amazon Web Services';
      case 'azure': return 'Microsoft Azure';
      case 'gcp': return 'Google Cloud Platform';
      default: return provider;
    }
  };

  const availableProviders = ['aws', 'azure', 'gcp'];

  const startMigration = () => {
    if (!selectedResource || !targetProvider) {
      toast({
        title: "Missing Selection",
        description: "Please select both a resource and target provider",
        variant: "destructive"
      });
      return;
    }

    const resource = resources.find(r => r.id === selectedResource);
    if (!resource) return;

    const newJob: MigrationJob = {
      id: `migration-${Date.now()}`,
      sourceResource: resource,
      targetProvider,
      status: 'pending',
      progress: 0,
      estimatedTime: '45 minutes',
      createdAt: new Date()
    };

    setMigrationJobs(prev => [newJob, ...prev]);
    
    toast({
      title: "Migration Started",
      description: `Migration job created for ${resource.name}`,
    });

    // Simulate migration progress
    setTimeout(() => {
      setMigrationJobs(prev => prev.map(job => 
        job.id === newJob.id ? { ...job, status: 'running', progress: 25 } : job
      ));
    }, 2000);
  };

  const pauseMigration = (jobId: string) => {
    setMigrationJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: 'pending' } : job
    ));
    toast({
      title: "Migration Paused",
      description: "Migration job has been paused",
    });
  };

  const resumeMigration = (jobId: string) => {
    setMigrationJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: 'running' } : job
    ));
    toast({
      title: "Migration Resumed",
      description: "Migration job has been resumed",
    });
  };

  return (
    <div className="space-y-6">
      {/* Migration Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Cross-Cloud Resource Migration</CardTitle>
          <CardDescription>
            Migrate resources between different cloud providers with automated setup and configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Source Resource</label>
              <Select value={selectedResource} onValueChange={setSelectedResource}>
                <SelectTrigger>
                  <SelectValue placeholder="Select resource to migrate" />
                </SelectTrigger>
                <SelectContent>
                  {resources.map((resource) => {
                    const account = accounts.find(a => a.id === resource.cloud_account_id);
                    return (
                      <SelectItem key={resource.id} value={resource.id}>
                        <div className="flex items-center space-x-2">
                          {getResourceIcon(resource.type)}
                          <span>{resource.name}</span>
                          <Badge variant="outline" className="ml-2">
                            {account?.provider?.toUpperCase()}
                          </Badge>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-center">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Target Provider</label>
              <Select value={targetProvider} onValueChange={setTargetProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target provider" />
                </SelectTrigger>
                <SelectContent>
                  {availableProviders.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {getProviderName(provider)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={startMigration} className="w-full">
            <Play className="mr-2 h-4 w-4" />
            Start Migration
          </Button>
        </CardContent>
      </Card>

      {/* Migration Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Migration Jobs</CardTitle>
          <CardDescription>
            Monitor the progress of your cross-cloud migration jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {migrationJobs.length === 0 ? (
            <div className="text-center py-8">
              <Server className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <p className="mt-2 text-muted-foreground">No migration jobs yet.</p>
              <p className="text-sm text-muted-foreground">
                Start by selecting a resource and target provider above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {migrationJobs.map((job) => {
                const sourceAccount = accounts.find(a => a.id === job.sourceResource.cloud_account_id);
                return (
                  <div key={job.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getResourceIcon(job.sourceResource.type)}
                        <div>
                          <h4 className="font-medium">{job.sourceResource.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {sourceAccount?.provider?.toUpperCase()} → {job.targetProvider.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {job.status === 'running' ? (
                          <Button size="sm" variant="outline" onClick={() => pauseMigration(job.id)}>
                            <Pause className="h-4 w-4" />
                          </Button>
                        ) : job.status === 'pending' ? (
                          <Button size="sm" variant="outline" onClick={() => resumeMigration(job.id)}>
                            <Play className="h-4 w-4" />
                          </Button>
                        ) : null}
                        <Badge variant={
                          job.status === 'completed' ? 'default' :
                          job.status === 'failed' ? 'destructive' :
                          job.status === 'running' ? 'secondary' : 'outline'
                        }>
                          {job.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {job.status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
                          {job.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{job.progress}%</span>
                      </div>
                      <Progress value={job.progress} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Started: {job.createdAt.toLocaleTimeString()}</span>
                        <span>ETA: {job.estimatedTime}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Migration Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Migration Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Before Migration</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Create backups of critical data</li>
                <li>• Review network security groups</li>
                <li>• Check regional availability</li>
                <li>• Validate target provider quotas</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">During Migration</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Monitor migration progress</li>
                <li>• Test connectivity periodically</li>
                <li>• Verify data integrity</li>
                <li>• Update DNS records if needed</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrossCloudMigration;
