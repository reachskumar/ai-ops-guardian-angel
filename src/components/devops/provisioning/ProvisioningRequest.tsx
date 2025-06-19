
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Cloud, 
  Server, 
  Database, 
  Network,
  HardDrive,
  Shield,
  DollarSign,
  Clock,
  Users,
  Settings,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface ProvisioningConfig {
  // Basic Configuration
  cloudProvider: 'aws' | 'azure' | 'gcp' | 'on-prem';
  resourceType: string;
  region: string;
  zone?: string;
  
  // Instance Configuration
  osType: string;
  baseImage: string;
  instanceType: string;
  instanceCount: number;
  
  // Network Configuration
  vpc: string;
  subnet: string;
  securityGroups: string[];
  networkTags: Record<string, string>;
  
  // Storage Configuration
  storageType: string;
  storageSize: number;
  encryption: boolean;
  
  // Application Configuration
  applicationType?: 'custom' | 'catalog' | 'helm' | 'docker-compose' | 'git-repo';
  catalogApp?: string;
  helmChart?: string;
  dockerCompose?: string;
  gitRepo?: string;
  gitBranch?: string;
  
  // Cost & Quota
  estimatedCost: number;
  budgetLimit: number;
  
  // Lifecycle
  ttl?: number; // days
  scheduledStart?: string;
  scheduledEnd?: string;
  autoDeprovision: boolean;
  
  // Metadata
  tags: Record<string, string>;
  description: string;
  businessJustification: string;
}

interface ProvisioningRequestProps {
  onSubmit: (config: ProvisioningConfig) => void;
  userRole: 'admin' | 'requestor' | 'viewer';
  budgetRemaining: number;
  quotaStatus: Record<string, { used: number; limit: number }>;
}

const ProvisioningRequest: React.FC<ProvisioningRequestProps> = ({
  onSubmit,
  userRole,
  budgetRemaining,
  quotaStatus
}) => {
  const [config, setConfig] = useState<Partial<ProvisioningConfig>>({
    cloudProvider: 'aws',
    instanceCount: 1,
    storageSize: 20,
    encryption: true,
    autoDeprovision: false,
    estimatedCost: 0,
    tags: {},
    networkTags: {}
  });
  const [activeTab, setActiveTab] = useState('basic');
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [quotaWarnings, setQuotaWarnings] = useState<string[]>([]);
  const { toast } = useToast();

  // Resource type options by provider
  const resourceTypes = {
    aws: [
      { value: 'ec2', label: 'EC2 Instance', icon: Server },
      { value: 'rds', label: 'RDS Database', icon: Database },
      { value: 'eks', label: 'EKS Cluster', icon: Network },
      { value: 's3', label: 'S3 Bucket', icon: Cloud },
      { value: 'lambda', label: 'Lambda Function', icon: Settings }
    ],
    azure: [
      { value: 'vm', label: 'Virtual Machine', icon: Server },
      { value: 'sql', label: 'SQL Database', icon: Database },
      { value: 'aks', label: 'AKS Cluster', icon: Network },
      { value: 'storage', label: 'Storage Account', icon: Cloud }
    ],
    gcp: [
      { value: 'compute', label: 'Compute Engine', icon: Server },
      { value: 'sql', label: 'Cloud SQL', icon: Database },
      { value: 'gke', label: 'GKE Cluster', icon: Network },
      { value: 'storage', label: 'Cloud Storage', icon: Cloud }
    ],
    'on-prem': [
      { value: 'vm', label: 'Virtual Machine', icon: Server },
      { value: 'kubernetes', label: 'Kubernetes Cluster', icon: Network }
    ]
  };

  // OS/Image options
  const osOptions = {
    aws: [
      { value: 'amazon-linux-2023', label: 'Amazon Linux 2023' },
      { value: 'ubuntu-22.04', label: 'Ubuntu 22.04 LTS' },
      { value: 'centos-8', label: 'CentOS 8' },
      { value: 'windows-2022', label: 'Windows Server 2022' },
      { value: 'rhel-9', label: 'Red Hat Enterprise Linux 9' }
    ],
    azure: [
      { value: 'ubuntu-20.04', label: 'Ubuntu 20.04 LTS' },
      { value: 'windows-2022', label: 'Windows Server 2022' },
      { value: 'rhel-8', label: 'Red Hat Enterprise Linux 8' },
      { value: 'centos-8', label: 'CentOS 8.5' }
    ],
    gcp: [
      { value: 'ubuntu-22.04', label: 'Ubuntu 22.04 LTS' },
      { value: 'centos-8', label: 'CentOS 8' },
      { value: 'windows-2022', label: 'Windows Server 2022' },
      { value: 'rhel-9', label: 'Red Hat Enterprise Linux 9' }
    ],
    'on-prem': [
      { value: 'ubuntu-22.04', label: 'Ubuntu 22.04 LTS' },
      { value: 'centos-8', label: 'CentOS 8' },
      { value: 'rhel-9', label: 'Red Hat Enterprise Linux 9' }
    ]
  };

  // Instance types by provider
  const instanceTypes = {
    aws: ['t3.micro', 't3.small', 't3.medium', 't3.large', 'm5.large', 'm5.xlarge', 'c5.large', 'r5.large'],
    azure: ['Standard_B1ls', 'Standard_B1s', 'Standard_B2s', 'Standard_D2s_v3', 'Standard_D4s_v3'],
    gcp: ['e2-micro', 'e2-small', 'e2-medium', 'e2-standard-2', 'n1-standard-1', 'n1-standard-2'],
    'on-prem': ['small', 'medium', 'large', 'xlarge']
  };

  // Application catalog
  const catalogApps = [
    { value: 'wordpress', label: 'WordPress', description: 'Content Management System' },
    { value: 'jenkins', label: 'Jenkins', description: 'CI/CD Pipeline' },
    { value: 'ml-workspace', label: 'ML Workspace', description: 'Jupyter + TensorFlow' },
    { value: 'gitlab', label: 'GitLab', description: 'DevOps Platform' },
    { value: 'prometheus', label: 'Prometheus', description: 'Monitoring Stack' },
    { value: 'postgres', label: 'PostgreSQL', description: 'Database Server' }
  ];

  // Cost estimation (mock)
  const calculateEstimatedCost = () => {
    let cost = 0;
    
    // Base instance cost
    if (config.instanceType?.includes('micro')) cost += 8.5;
    else if (config.instanceType?.includes('small')) cost += 20;
    else if (config.instanceType?.includes('medium')) cost += 40;
    else if (config.instanceType?.includes('large')) cost += 80;
    else cost += 160;
    
    // Storage cost
    cost += (config.storageSize || 20) * 0.1;
    
    // Instance count multiplier
    cost *= (config.instanceCount || 1);
    
    setEstimatedCost(cost);
    setConfig(prev => ({ ...prev, estimatedCost: cost }));
  };

  // Check quota limits
  const checkQuotas = () => {
    const warnings: string[] = [];
    
    if (config.resourceType === 'eks' || config.resourceType === 'aks' || config.resourceType === 'gke') {
      const clusterQuota = quotaStatus['clusters'];
      if (clusterQuota && clusterQuota.used >= clusterQuota.limit) {
        warnings.push(`Cluster quota exceeded (${clusterQuota.used}/${clusterQuota.limit})`);
      }
    }
    
    if (estimatedCost > budgetRemaining) {
      warnings.push(`Estimated cost (₹${estimatedCost}) exceeds remaining budget (₹${budgetRemaining})`);
    }
    
    setQuotaWarnings(warnings);
  };

  // Update cost and quota checks when relevant fields change
  React.useEffect(() => {
    calculateEstimatedCost();
    checkQuotas();
  }, [config.instanceType, config.instanceCount, config.storageSize, config.resourceType]);

  const handleSubmit = () => {
    if (!config.cloudProvider || !config.resourceType || !config.region) {
      toast({
        title: 'Missing Required Fields',
        description: 'Please fill in all required configuration fields',
        variant: 'destructive'
      });
      return;
    }

    if (quotaWarnings.length > 0 && userRole !== 'admin') {
      toast({
        title: 'Quota/Budget Limits Exceeded',
        description: 'Please adjust your configuration or request approval',
        variant: 'destructive'
      });
      return;
    }

    onSubmit(config as ProvisioningConfig);
  };

  const currentResourceTypes = resourceTypes[config.cloudProvider as keyof typeof resourceTypes] || [];
  const currentOsOptions = osOptions[config.cloudProvider as keyof typeof osOptions] || [];
  const currentInstanceTypes = instanceTypes[config.cloudProvider as keyof typeof instanceTypes] || [];

  if (userRole === 'viewer') {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          You have read-only access. Contact an admin to request resource provisioning.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Estimated Cost</p>
                <p className="text-2xl font-bold">₹{estimatedCost.toFixed(2)}/month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Budget Remaining</p>
                <p className="text-2xl font-bold">₹{budgetRemaining}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant={quotaWarnings.length > 0 ? "destructive" : "default"}>
                  {quotaWarnings.length > 0 ? "Needs Approval" : "Ready to Deploy"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {quotaWarnings.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {quotaWarnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="application">Application</TabsTrigger>
          <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cloud Provider *</Label>
                  <Select 
                    value={config.cloudProvider} 
                    onValueChange={(value) => setConfig(prev => ({ ...prev, cloudProvider: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aws">AWS</SelectItem>
                      <SelectItem value="azure">Azure</SelectItem>
                      <SelectItem value="gcp">Google Cloud</SelectItem>
                      <SelectItem value="on-prem">On-Premises</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Resource Type *</Label>
                  <Select 
                    value={config.resourceType} 
                    onValueChange={(value) => setConfig(prev => ({ ...prev, resourceType: value }))}
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Region *</Label>
                  <Input
                    placeholder="e.g., us-east-1"
                    value={config.region || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, region: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Availability Zone</Label>
                  <Input
                    placeholder="e.g., us-east-1a"
                    value={config.zone || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, zone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Operating System *</Label>
                  <Select 
                    value={config.osType} 
                    onValueChange={(value) => setConfig(prev => ({ ...prev, osType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select OS" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentOsOptions.map((os) => (
                        <SelectItem key={os.value} value={os.value}>
                          {os.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Instance Type *</Label>
                  <Select 
                    value={config.instanceType} 
                    onValueChange={(value) => setConfig(prev => ({ ...prev, instanceType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select instance type" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentInstanceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Number of Instances: {config.instanceCount}</Label>
                <Slider
                  value={[config.instanceCount || 1]}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, instanceCount: value[0] }))}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>VPC/Virtual Network</Label>
                  <Input
                    placeholder="e.g., vpc-12345678"
                    value={config.vpc || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, vpc: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Subnet</Label>
                  <Input
                    placeholder="e.g., subnet-12345678"
                    value={config.subnet || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, subnet: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Security Groups (comma-separated)</Label>
                <Input
                  placeholder="e.g., sg-web, sg-database"
                  value={config.securityGroups?.join(', ') || ''}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    securityGroups: e.target.value.split(',').map(sg => sg.trim()).filter(sg => sg)
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Network Tags</Label>
                <Textarea
                  placeholder="key1=value1&#10;key2=value2"
                  value={Object.entries(config.networkTags || {}).map(([k, v]) => `${k}=${v}`).join('\n')}
                  onChange={(e) => {
                    const tags: Record<string, string> = {};
                    e.target.value.split('\n').forEach(line => {
                      const [key, value] = line.split('=');
                      if (key && value) {
                        tags[key.trim()] = value.trim();
                      }
                    });
                    setConfig(prev => ({ ...prev, networkTags: tags }));
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Storage Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Storage Type</Label>
                  <Select 
                    value={config.storageType} 
                    onValueChange={(value) => setConfig(prev => ({ ...prev, storageType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select storage type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gp3">GP3 (General Purpose SSD)</SelectItem>
                      <SelectItem value="gp2">GP2 (General Purpose SSD)</SelectItem>
                      <SelectItem value="io1">IO1 (Provisioned IOPS SSD)</SelectItem>
                      <SelectItem value="st1">ST1 (Throughput Optimized HDD)</SelectItem>
                      <SelectItem value="sc1">SC1 (Cold HDD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Storage Size (GB): {config.storageSize}</Label>
                  <Slider
                    value={[config.storageSize || 20]}
                    onValueChange={(value) => setConfig(prev => ({ ...prev, storageSize: value[0] }))}
                    max={1000}
                    min={8}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="encryption"
                  checked={config.encryption}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, encryption: checked as boolean }))}
                />
                <Label htmlFor="encryption">Enable Encryption at Rest</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="application" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Application Type</Label>
                <Select 
                  value={config.applicationType} 
                  onValueChange={(value) => setConfig(prev => ({ ...prev, applicationType: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select application type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom/Manual Setup</SelectItem>
                    <SelectItem value="catalog">Application Catalog</SelectItem>
                    <SelectItem value="helm">Helm Chart</SelectItem>
                    <SelectItem value="docker-compose">Docker Compose</SelectItem>
                    <SelectItem value="git-repo">Git Repository (IaC)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {config.applicationType === 'catalog' && (
                <div className="space-y-2">
                  <Label>Catalog Application</Label>
                  <Select 
                    value={config.catalogApp} 
                    onValueChange={(value) => setConfig(prev => ({ ...prev, catalogApp: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select application" />
                    </SelectTrigger>
                    <SelectContent>
                      {catalogApps.map((app) => (
                        <SelectItem key={app.value} value={app.value}>
                          <div>
                            <div className="font-medium">{app.label}</div>
                            <div className="text-sm text-muted-foreground">{app.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {config.applicationType === 'helm' && (
                <div className="space-y-2">
                  <Label>Helm Chart</Label>
                  <Input
                    placeholder="e.g., bitnami/wordpress"
                    value={config.helmChart || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, helmChart: e.target.value }))}
                  />
                </div>
              )}

              {config.applicationType === 'docker-compose' && (
                <div className="space-y-2">
                  <Label>Docker Compose File URL</Label>
                  <Input
                    placeholder="https://raw.githubusercontent.com/..."
                    value={config.dockerCompose || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, dockerCompose: e.target.value }))}
                  />
                </div>
              )}

              {config.applicationType === 'git-repo' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Git Repository</Label>
                    <Input
                      placeholder="https://github.com/user/repo.git"
                      value={config.gitRepo || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, gitRepo: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Branch</Label>
                    <Input
                      placeholder="main"
                      value={config.gitBranch || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, gitBranch: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lifecycle" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lifecycle Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Time to Live (TTL) - Days</Label>
                <Input
                  type="number"
                  placeholder="7"
                  value={config.ttl || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, ttl: parseInt(e.target.value) || undefined }))}
                />
                <p className="text-sm text-muted-foreground">
                  Resource will be automatically deleted after this many days
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Scheduled Start</Label>
                  <Input
                    type="datetime-local"
                    value={config.scheduledStart || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, scheduledStart: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Scheduled End</Label>
                  <Input
                    type="datetime-local"
                    value={config.scheduledEnd || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, scheduledEnd: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="autoDeprovision"
                  checked={config.autoDeprovision}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoDeprovision: checked as boolean }))}
                />
                <Label htmlFor="autoDeprovision">Auto-deprovision inactive resources</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Metadata & Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the purpose of this resource..."
                  value={config.description || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Business Justification</Label>
                <Textarea
                  placeholder="Explain the business need for this resource..."
                  value={config.businessJustification || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, businessJustification: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Tags (for cost tracking and governance)</Label>
                <Textarea
                  placeholder="Environment=Production&#10;CostCenter=Engineering&#10;Owner=john.doe@company.com"
                  value={Object.entries(config.tags || {}).map(([k, v]) => `${k}=${v}`).join('\n')}
                  onChange={(e) => {
                    const tags: Record<string, string> = {};
                    e.target.value.split('\n').forEach(line => {
                      const [key, value] = line.split('=');
                      if (key && value) {
                        tags[key.trim()] = value.trim();
                      }
                    });
                    setConfig(prev => ({ ...prev, tags }));
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>Budget Limit (₹/month)</Label>
                <Input
                  type="number"
                  placeholder="1000"
                  value={config.budgetLimit || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, budgetLimit: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <div />
        <Button onClick={handleSubmit} size="lg" disabled={quotaWarnings.length > 0 && userRole !== 'admin'}>
          {userRole === 'admin' || quotaWarnings.length === 0 ? 'Deploy Resource' : 'Request Approval'}
        </Button>
      </div>
    </div>
  );
};

export default ProvisioningRequest;
