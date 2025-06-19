
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Cloud, 
  Server, 
  Database, 
  Network,
  PlayCircle,
  FileCode,
  CheckCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateIaCTemplate, applyIaCTemplate } from '@/services/cloud/infrastructureService';

interface ResourceConfig {
  type: string;
  name: string;
  provider: 'aws' | 'azure' | 'gcp';
  region: string;
  size?: string;
  environment: string;
  tags: Record<string, string>;
}

const ResourceProvisioner: React.FC = () => {
  const [selectedResources, setSelectedResources] = useState<ResourceConfig[]>([]);
  const [currentResource, setCurrentResource] = useState<Partial<ResourceConfig>>({
    provider: 'aws',
    environment: 'dev',
    tags: {}
  });
  const [generatedTemplate, setGeneratedTemplate] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const resourceTypes = {
    aws: [
      { value: 'ec2', label: 'EC2 Instance', icon: Server },
      { value: 'rds', label: 'RDS Database', icon: Database },
      { value: 'vpc', label: 'VPC Network', icon: Network },
      { value: 's3', label: 'S3 Bucket', icon: Cloud }
    ],
    azure: [
      { value: 'vm', label: 'Virtual Machine', icon: Server },
      { value: 'sql', label: 'SQL Database', icon: Database },
      { value: 'vnet', label: 'Virtual Network', icon: Network },
      { value: 'storage', label: 'Storage Account', icon: Cloud }
    ],
    gcp: [
      { value: 'compute', label: 'Compute Engine', icon: Server },
      { value: 'sql', label: 'Cloud SQL', icon: Database },
      { value: 'vpc', label: 'VPC Network', icon: Network },
      { value: 'storage', label: 'Cloud Storage', icon: Cloud }
    ]
  };

  const regions = {
    aws: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'],
    azure: ['East US', 'West Europe', 'Southeast Asia', 'Australia East'],
    gcp: ['us-central1', 'europe-west1', 'asia-southeast1', 'australia-southeast1']
  };

  const sizes = {
    aws: ['t3.micro', 't3.small', 't3.medium', 'm5.large', 'm5.xlarge'],
    azure: ['Standard_B1s', 'Standard_B2s', 'Standard_D2s_v3', 'Standard_D4s_v3'],
    gcp: ['e2-micro', 'e2-small', 'e2-medium', 'n1-standard-1', 'n1-standard-2']
  };

  const addResource = () => {
    if (!currentResource.type || !currentResource.name || !currentResource.region) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    const newResource: ResourceConfig = {
      type: currentResource.type!,
      name: currentResource.name!,
      provider: currentResource.provider!,
      region: currentResource.region!,
      size: currentResource.size,
      environment: currentResource.environment!,
      tags: currentResource.tags || {}
    };

    setSelectedResources(prev => [...prev, newResource]);
    setCurrentResource({
      provider: currentResource.provider,
      environment: currentResource.environment,
      tags: {}
    });

    toast({
      title: 'Resource Added',
      description: `${newResource.type} resource "${newResource.name}" added to deployment`,
    });
  };

  const removeResource = (index: number) => {
    setSelectedResources(prev => prev.filter((_, i) => i !== index));
  };

  const generateTemplate = async () => {
    if (selectedResources.length === 0) {
      toast({
        title: 'No Resources',
        description: 'Please add at least one resource to generate template',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateIaCTemplate('terraform', selectedResources.map(r => r.name));
      
      if (result.success && result.template) {
        setGeneratedTemplate(result.template);
        toast({
          title: 'Template Generated',
          description: 'Terraform template has been generated successfully',
        });
      } else {
        throw new Error(result.error || 'Failed to generate template');
      }
    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate Terraform template',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const deployResources = async () => {
    if (!generatedTemplate) {
      toast({
        title: 'No Template',
        description: 'Please generate a template first',
        variant: 'destructive'
      });
      return;
    }

    setIsDeploying(true);
    setDeploymentStatus('idle');

    try {
      const result = await applyIaCTemplate('terraform', generatedTemplate);
      
      if (result.success) {
        setDeploymentStatus('success');
        toast({
          title: 'Deployment Started',
          description: 'Resources are being provisioned. This may take several minutes.',
        });
      } else {
        setDeploymentStatus('error');
        throw new Error(result.error || 'Deployment failed');
      }
    } catch (error: any) {
      setDeploymentStatus('error');
      toast({
        title: 'Deployment Failed',
        description: error.message || 'Failed to deploy resources',
        variant: 'destructive'
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const currentResourceTypes = resourceTypes[currentResource.provider as keyof typeof resourceTypes] || [];
  const currentRegions = regions[currentResource.provider as keyof typeof regions] || [];
  const currentSizes = sizes[currentResource.provider as keyof typeof sizes] || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Automated Resource Provisioning</h2>
        <p className="text-muted-foreground">
          Deploy cloud resources without writing infrastructure code
        </p>
      </div>

      <Tabs defaultValue="configure" className="space-y-4">
        <TabsList>
          <TabsTrigger value="configure">Configure Resources</TabsTrigger>
          <TabsTrigger value="template">Generated Template</TabsTrigger>
          <TabsTrigger value="deploy">Deploy</TabsTrigger>
        </TabsList>

        <TabsContent value="configure" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Resource</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cloud Provider</Label>
                    <Select 
                      value={currentResource.provider} 
                      onValueChange={(value) => setCurrentResource(prev => ({ ...prev, provider: value as any, type: '', region: '', size: '' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aws">AWS</SelectItem>
                        <SelectItem value="azure">Azure</SelectItem>
                        <SelectItem value="gcp">Google Cloud</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Environment</Label>
                    <Select 
                      value={currentResource.environment} 
                      onValueChange={(value) => setCurrentResource(prev => ({ ...prev, environment: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dev">Development</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="prod">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Resource Type</Label>
                  <Select 
                    value={currentResource.type} 
                    onValueChange={(value) => setCurrentResource(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select resource type" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentResourceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Resource Name</Label>
                    <Input
                      placeholder="e.g., web-server"
                      value={currentResource.name || ''}
                      onChange={(e) => setCurrentResource(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Region</Label>
                    <Select 
                      value={currentResource.region} 
                      onValueChange={(value) => setCurrentResource(prev => ({ ...prev, region: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentRegions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {currentResource.type && ['ec2', 'vm', 'compute'].includes(currentResource.type) && (
                  <div className="space-y-2">
                    <Label>Instance Size</Label>
                    <Select 
                      value={currentResource.size} 
                      onValueChange={(value) => setCurrentResource(prev => ({ ...prev, size: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select instance size" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentSizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button onClick={addResource} className="w-full">
                  Add Resource
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Selected Resources ({selectedResources.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedResources.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No resources selected yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedResources.map((resource, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{resource.provider.toUpperCase()}</Badge>
                            <span className="font-medium">{resource.name}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {resource.type} • {resource.region} • {resource.environment}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeResource(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="template" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Generated Terraform Template</CardTitle>
              <Button 
                onClick={generateTemplate}
                disabled={isGenerating || selectedResources.length === 0}
              >
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileCode className="mr-2 h-4 w-4" />
                )}
                Generate Template
              </Button>
            </CardHeader>
            <CardContent>
              {generatedTemplate ? (
                <div className="space-y-4">
                  <Textarea
                    value={generatedTemplate}
                    onChange={(e) => setGeneratedTemplate(e.target.value)}
                    className="font-mono text-sm min-h-[400px]"
                    placeholder="Generated Terraform template will appear here..."
                  />
                  <Alert>
                    <FileCode className="h-4 w-4" />
                    <AlertDescription>
                      You can review and modify the generated Terraform template before deployment.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No template generated yet</p>
                  <p className="text-sm">Add resources and click "Generate Template"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deploy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deploy Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {deploymentStatus === 'success' && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Deployment initiated successfully! Resources are being provisioned.
                  </AlertDescription>
                </Alert>
              )}

              {deploymentStatus === 'error' && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Deployment failed. Please check your configuration and try again.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Deployment Summary</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Resources to deploy:</strong> {selectedResources.length}</p>
                    <p><strong>Template generated:</strong> {generatedTemplate ? 'Yes' : 'No'}</p>
                    <p><strong>Estimated time:</strong> 5-15 minutes</p>
                  </div>
                </div>

                <Button 
                  onClick={deployResources}
                  disabled={isDeploying || !generatedTemplate}
                  className="w-full"
                  size="lg"
                >
                  {isDeploying ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PlayCircle className="mr-2 h-4 w-4" />
                  )}
                  {isDeploying ? 'Deploying Resources...' : 'Deploy Resources'}
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  This will apply the Terraform template and provision your resources in the cloud.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResourceProvisioner;
