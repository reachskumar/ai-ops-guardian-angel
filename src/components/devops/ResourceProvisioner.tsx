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
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { 
  Cloud, 
  Server, 
  Database, 
  Network,
  PlayCircle,
  FileCode,
  CheckCircle,
  Loader2,
  AlertTriangle,
  HardDrive,
  Settings,
  Shield,
  Monitor
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateIaCTemplate, applyIaCTemplate } from '@/services/cloud/infrastructureService';

interface NetworkConfig {
  vpcCidr: string;
  subnetCidr: string;
  enablePublicIp: boolean;
  securityGroups: string[];
  loadBalancer: boolean;
}

interface StorageConfig {
  volumeType: 'gp3' | 'gp2' | 'io1' | 'io2' | 'st1' | 'sc1';
  volumeSize: number;
  iops?: number;
  encrypted: boolean;
  backupRetention: number;
}

interface DatabaseConfig {
  engine: 'mysql' | 'postgresql' | 'mongodb' | 'redis';
  version: string;
  instanceClass: string;
  storage: number;
  multiAz: boolean;
  backupWindow: string;
}

interface ResourceConfig {
  type: string;
  name: string;
  provider: 'aws' | 'azure' | 'gcp';
  region: string;
  size?: string;
  environment: string;
  tags: Record<string, string>;
  // Enhanced configurations
  osImage?: string;
  instanceCount: number;
  network?: NetworkConfig;
  storage?: StorageConfig;
  database?: DatabaseConfig;
  monitoring: boolean;
  autoScaling: boolean;
  minInstances?: number;
  maxInstances?: number;
}

const ResourceProvisioner: React.FC = () => {
  const [selectedResources, setSelectedResources] = useState<ResourceConfig[]>([]);
  const [currentResource, setCurrentResource] = useState<Partial<ResourceConfig>>({
    provider: 'aws',
    environment: 'dev',
    tags: {},
    instanceCount: 1,
    monitoring: true,
    autoScaling: false,
    network: {
      vpcCidr: '10.0.0.0/16',
      subnetCidr: '10.0.1.0/24',
      enablePublicIp: true,
      securityGroups: [],
      loadBalancer: false
    },
    storage: {
      volumeType: 'gp3',
      volumeSize: 20,
      encrypted: true,
      backupRetention: 7
    },
    database: {
      engine: 'mysql',
      version: '8.0',
      instanceClass: 'db.t3.micro',
      storage: 20,
      multiAz: false,
      backupWindow: '03:00-04:00'
    }
  });
  const [generatedTemplate, setGeneratedTemplate] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const resourceTypes = {
    aws: [
      { value: 'ec2', label: 'EC2 Instance', icon: Server, category: 'compute' },
      { value: 'rds', label: 'RDS Database', icon: Database, category: 'database' },
      { value: 'vpc', label: 'VPC Network', icon: Network, category: 'network' },
      { value: 's3', label: 'S3 Bucket', icon: Cloud, category: 'storage' },
      { value: 'elb', label: 'Load Balancer', icon: Network, category: 'network' },
      { value: 'efs', label: 'EFS Storage', icon: HardDrive, category: 'storage' }
    ],
    azure: [
      { value: 'vm', label: 'Virtual Machine', icon: Server, category: 'compute' },
      { value: 'sql', label: 'SQL Database', icon: Database, category: 'database' },
      { value: 'vnet', label: 'Virtual Network', icon: Network, category: 'network' },
      { value: 'storage', label: 'Storage Account', icon: Cloud, category: 'storage' },
      { value: 'lb', label: 'Load Balancer', icon: Network, category: 'network' }
    ],
    gcp: [
      { value: 'compute', label: 'Compute Engine', icon: Server, category: 'compute' },
      { value: 'sql', label: 'Cloud SQL', icon: Database, category: 'database' },
      { value: 'vpc', label: 'VPC Network', icon: Network, category: 'network' },
      { value: 'storage', label: 'Cloud Storage', icon: Cloud, category: 'storage' },
      { value: 'lb', label: 'Load Balancer', icon: Network, category: 'network' }
    ]
  };

  const osImages = {
    aws: [
      { value: 'ami-0abcdef1234567890', label: 'Amazon Linux 2023' },
      { value: 'ami-0123456789abcdef0', label: 'Ubuntu 22.04 LTS' },
      { value: 'ami-0fedcba0987654321', label: 'CentOS 8' },
      { value: 'ami-0987654321fedcba0', label: 'Windows Server 2022' },
      { value: 'ami-0456789012345678a', label: 'Red Hat Enterprise Linux 9' }
    ],
    azure: [
      { value: 'canonical:0001-com-ubuntu-server-focal:20_04-lts-gen2:latest', label: 'Ubuntu 20.04 LTS' },
      { value: 'MicrosoftWindowsServer:WindowsServer:2022-datacenter-g2:latest', label: 'Windows Server 2022' },
      { value: 'RedHat:RHEL:8-gen2:latest', label: 'Red Hat Enterprise Linux 8' },
      { value: 'OpenLogic:CentOS:8_5-gen2:latest', label: 'CentOS 8.5' }
    ],
    gcp: [
      { value: 'projects/ubuntu-os-cloud/global/images/family/ubuntu-2204-lts', label: 'Ubuntu 22.04 LTS' },
      { value: 'projects/centos-cloud/global/images/family/centos-8', label: 'CentOS 8' },
      { value: 'projects/windows-cloud/global/images/family/windows-2022', label: 'Windows Server 2022' },
      { value: 'projects/rhel-cloud/global/images/family/rhel-9', label: 'Red Hat Enterprise Linux 9' }
    ]
  };

  const regions = {
    aws: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1', 'ap-northeast-1'],
    azure: ['East US', 'West Europe', 'Southeast Asia', 'Australia East', 'Japan East'],
    gcp: ['us-central1', 'europe-west1', 'asia-southeast1', 'australia-southeast1', 'asia-northeast1']
  };

  const sizes = {
    aws: ['t3.nano', 't3.micro', 't3.small', 't3.medium', 't3.large', 't3.xlarge', 'm5.large', 'm5.xlarge', 'm5.2xlarge', 'c5.large', 'c5.xlarge'],
    azure: ['Standard_B1ls', 'Standard_B1s', 'Standard_B2s', 'Standard_D2s_v3', 'Standard_D4s_v3', 'Standard_D8s_v3'],
    gcp: ['e2-micro', 'e2-small', 'e2-medium', 'e2-standard-2', 'e2-standard-4', 'n1-standard-1', 'n1-standard-2', 'n1-standard-4']
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
      tags: currentResource.tags || {},
      osImage: currentResource.osImage,
      instanceCount: currentResource.instanceCount || 1,
      network: currentResource.network,
      storage: currentResource.storage,
      database: currentResource.database,
      monitoring: currentResource.monitoring || false,
      autoScaling: currentResource.autoScaling || false,
      minInstances: currentResource.minInstances,
      maxInstances: currentResource.maxInstances
    };

    setSelectedResources(prev => [...prev, newResource]);
    setCurrentResource({
      provider: currentResource.provider,
      environment: currentResource.environment,
      tags: {},
      instanceCount: 1,
      monitoring: true,
      autoScaling: false,
      network: {
        vpcCidr: '10.0.0.0/16',
        subnetCidr: '10.0.1.0/24',
        enablePublicIp: true,
        securityGroups: [],
        loadBalancer: false
      },
      storage: {
        volumeType: 'gp3',
        volumeSize: 20,
        encrypted: true,
        backupRetention: 7
      },
      database: {
        engine: 'mysql',
        version: '8.0',
        instanceClass: 'db.t3.micro',
        storage: 20,
        multiAz: false,
        backupWindow: '03:00-04:00'
      }
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
  const currentOsImages = osImages[currentResource.provider as keyof typeof osImages] || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Automated Resource Provisioning</h2>
        <p className="text-muted-foreground">
          Deploy cloud resources with comprehensive configuration options
        </p>
      </div>

      <Tabs defaultValue="configure" className="space-y-4">
        <TabsList>
          <TabsTrigger value="configure">Configure Resources</TabsTrigger>
          <TabsTrigger value="template">Generated Template</TabsTrigger>
          <TabsTrigger value="deploy">Deploy</TabsTrigger>
        </TabsList>

        <TabsContent value="configure" className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Basic Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Basic Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cloud Provider</Label>
                    <Select 
                      value={currentResource.provider} 
                      onValueChange={(value) => setCurrentResource(prev => ({ ...prev, provider: value as any, type: '', region: '', size: '', osImage: '' }))}
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

                <div className="space-y-2">
                  <Label>Resource Name</Label>
                  <Input
                    placeholder="e.g., web-server"
                    value={currentResource.name || ''}
                    onChange={(e) => setCurrentResource(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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

                  <div className="space-y-2">
                    <Label>Instance Count</Label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={currentResource.instanceCount || 1}
                      onChange={(e) => setCurrentResource(prev => ({ ...prev, instanceCount: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                </div>

                {currentResource.type && ['ec2', 'vm', 'compute'].includes(currentResource.type) && (
                  <>
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

                    <div className="space-y-2">
                      <Label>Operating System / Image</Label>
                      <Select 
                        value={currentResource.osImage} 
                        onValueChange={(value) => setCurrentResource(prev => ({ ...prev, osImage: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select OS image" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentOsImages.map((image) => (
                            <SelectItem key={image.value} value={image.value}>
                              {image.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="monitoring"
                      checked={currentResource.monitoring}
                      onCheckedChange={(checked) => setCurrentResource(prev => ({ ...prev, monitoring: checked as boolean }))}
                    />
                    <Label htmlFor="monitoring">Enable Monitoring</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="autoScaling"
                      checked={currentResource.autoScaling}
                      onCheckedChange={(checked) => setCurrentResource(prev => ({ ...prev, autoScaling: checked as boolean }))}
                    />
                    <Label htmlFor="autoScaling">Enable Auto Scaling</Label>
                  </div>

                  {currentResource.autoScaling && (
                    <div className="grid grid-cols-2 gap-4 ml-6">
                      <div className="space-y-2">
                        <Label>Min Instances</Label>
                        <Input
                          type="number"
                          min="1"
                          value={currentResource.minInstances || 1}
                          onChange={(e) => setCurrentResource(prev => ({ ...prev, minInstances: parseInt(e.target.value) || 1 }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Instances</Label>
                        <Input
                          type="number"
                          min="1"
                          value={currentResource.maxInstances || 10}
                          onChange={(e) => setCurrentResource(prev => ({ ...prev, maxInstances: parseInt(e.target.value) || 10 }))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Network Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Network Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>VPC CIDR</Label>
                  <Input
                    placeholder="10.0.0.0/16"
                    value={currentResource.network?.vpcCidr || ''}
                    onChange={(e) => setCurrentResource(prev => ({ 
                      ...prev, 
                      network: { ...prev.network!, vpcCidr: e.target.value }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Subnet CIDR</Label>
                  <Input
                    placeholder="10.0.1.0/24"
                    value={currentResource.network?.subnetCidr || ''}
                    onChange={(e) => setCurrentResource(prev => ({ 
                      ...prev, 
                      network: { ...prev.network!, subnetCidr: e.target.value }
                    }))}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="publicIp"
                      checked={currentResource.network?.enablePublicIp}
                      onCheckedChange={(checked) => setCurrentResource(prev => ({ 
                        ...prev, 
                        network: { ...prev.network!, enablePublicIp: checked as boolean }
                      }))}
                    />
                    <Label htmlFor="publicIp">Enable Public IP</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="loadBalancer"
                      checked={currentResource.network?.loadBalancer}
                      onCheckedChange={(checked) => setCurrentResource(prev => ({ 
                        ...prev, 
                        network: { ...prev.network!, loadBalancer: checked as boolean }
                      }))}
                    />
                    <Label htmlFor="loadBalancer">Add Load Balancer</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Security Groups (comma-separated)</Label>
                  <Input
                    placeholder="web-sg, app-sg"
                    value={currentResource.network?.securityGroups.join(', ') || ''}
                    onChange={(e) => setCurrentResource(prev => ({ 
                      ...prev, 
                      network: { 
                        ...prev.network!, 
                        securityGroups: e.target.value.split(',').map(sg => sg.trim()).filter(sg => sg)
                      }
                    }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Storage & Database Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Storage & Database
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentResource.type && ['ec2', 'vm', 'compute'].includes(currentResource.type) && (
                  <div className="space-y-4">
                    <h4 className="font-medium">EBS Configuration</h4>
                    
                    <div className="space-y-2">
                      <Label>Volume Type</Label>
                      <Select 
                        value={currentResource.storage?.volumeType} 
                        onValueChange={(value) => setCurrentResource(prev => ({ 
                          ...prev, 
                          storage: { ...prev.storage!, volumeType: value as any }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gp3">GP3 (General Purpose SSD)</SelectItem>
                          <SelectItem value="gp2">GP2 (General Purpose SSD)</SelectItem>
                          <SelectItem value="io1">IO1 (Provisioned IOPS SSD)</SelectItem>
                          <SelectItem value="io2">IO2 (Provisioned IOPS SSD)</SelectItem>
                          <SelectItem value="st1">ST1 (Throughput Optimized HDD)</SelectItem>
                          <SelectItem value="sc1">SC1 (Cold HDD)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Volume Size (GB): {currentResource.storage?.volumeSize}</Label>
                      <Slider
                        value={[currentResource.storage?.volumeSize || 20]}
                        onValueChange={(value) => setCurrentResource(prev => ({ 
                          ...prev, 
                          storage: { ...prev.storage!, volumeSize: value[0] }
                        }))}
                        max={1000}
                        min={8}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {['io1', 'io2'].includes(currentResource.storage?.volumeType || '') && (
                      <div className="space-y-2">
                        <Label>IOPS</Label>
                        <Input
                          type="number"
                          min="100"
                          max="64000"
                          value={currentResource.storage?.iops || 3000}
                          onChange={(e) => setCurrentResource(prev => ({ 
                            ...prev, 
                            storage: { ...prev.storage!, iops: parseInt(e.target.value) || 3000 }
                          }))}
                        />
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="encrypted"
                        checked={currentResource.storage?.encrypted}
                        onCheckedChange={(checked) => setCurrentResource(prev => ({ 
                          ...prev, 
                          storage: { ...prev.storage!, encrypted: checked as boolean }
                        }))}
                      />
                      <Label htmlFor="encrypted">Enable Encryption</Label>
                    </div>

                    <div className="space-y-2">
                      <Label>Backup Retention (days)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="365"
                        value={currentResource.storage?.backupRetention || 7}
                        onChange={(e) => setCurrentResource(prev => ({ 
                          ...prev, 
                          storage: { ...prev.storage!, backupRetention: parseInt(e.target.value) || 7 }
                        }))}
                      />
                    </div>
                  </div>
                )}

                {currentResource.type && ['rds', 'sql'].includes(currentResource.type) && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Database Configuration</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Database Engine</Label>
                        <Select 
                          value={currentResource.database?.engine} 
                          onValueChange={(value) => setCurrentResource(prev => ({ 
                            ...prev, 
                            database: { ...prev.database!, engine: value as any }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mysql">MySQL</SelectItem>
                            <SelectItem value="postgresql">PostgreSQL</SelectItem>
                            <SelectItem value="mongodb">MongoDB</SelectItem>
                            <SelectItem value="redis">Redis</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Version</Label>
                        <Input
                          value={currentResource.database?.version || ''}
                          onChange={(e) => setCurrentResource(prev => ({ 
                            ...prev, 
                            database: { ...prev.database!, version: e.target.value }
                          }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Instance Class</Label>
                      <Select 
                        value={currentResource.database?.instanceClass} 
                        onValueChange={(value) => setCurrentResource(prev => ({ 
                          ...prev, 
                          database: { ...prev.database!, instanceClass: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="db.t3.micro">db.t3.micro</SelectItem>
                          <SelectItem value="db.t3.small">db.t3.small</SelectItem>
                          <SelectItem value="db.t3.medium">db.t3.medium</SelectItem>
                          <SelectItem value="db.r5.large">db.r5.large</SelectItem>
                          <SelectItem value="db.r5.xlarge">db.r5.xlarge</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Storage (GB)</Label>
                      <Input
                        type="number"
                        min="20"
                        max="65536"
                        value={currentResource.database?.storage || 20}
                        onChange={(e) => setCurrentResource(prev => ({ 
                          ...prev, 
                          database: { ...prev.database!, storage: parseInt(e.target.value) || 20 }
                        }))}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="multiAz"
                        checked={currentResource.database?.multiAz}
                        onCheckedChange={(checked) => setCurrentResource(prev => ({ 
                          ...prev, 
                          database: { ...prev.database!, multiAz: checked as boolean }
                        }))}
                      />
                      <Label htmlFor="multiAz">Multi-AZ Deployment</Label>
                    </div>

                    <div className="space-y-2">
                      <Label>Backup Window</Label>
                      <Input
                        placeholder="03:00-04:00"
                        value={currentResource.database?.backupWindow || ''}
                        onChange={(e) => setCurrentResource(prev => ({ 
                          ...prev, 
                          database: { ...prev.database!, backupWindow: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
            <Button onClick={addResource} className="px-8">
              Add Resource Configuration
            </Button>
          </div>

          {/* Selected Resources Display */}
          {selectedResources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Resources ({selectedResources.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedResources.map((resource, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{resource.provider.toUpperCase()}</Badge>
                          <span className="font-medium">{resource.name}</span>
                          <Badge>{resource.type}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {resource.region} • {resource.environment} • {resource.instanceCount} instance(s)
                        </div>
                        {resource.size && (
                          <div className="text-sm text-muted-foreground">
                            Size: {resource.size}
                          </div>
                        )}
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
              </CardContent>
            </Card>
          )}
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
                    <p><strong>Total instances:</strong> {selectedResources.reduce((sum, r) => sum + (r.instanceCount || 1), 0)}</p>
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
