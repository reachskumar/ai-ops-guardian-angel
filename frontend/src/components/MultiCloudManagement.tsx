import { useState } from "react";
import { 
  Cloud, 
  Server, 
  Database, 
  HardDrive, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Eye,
  Settings,
  Power,
  PowerOff
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CloudResource {
  id: string;
  name: string;
  type: 'compute' | 'storage' | 'database' | 'network';
  provider: 'aws' | 'azure' | 'gcp';
  status: 'running' | 'stopped' | 'error' | 'warning';
  cost: number;
  usage: number;
  region: string;
  lastActivity: string;
  recommendations?: string[];
}

const MultiCloudManagement = () => {
  const [selectedProvider, setSelectedProvider] = useState<'all' | 'aws' | 'azure' | 'gcp'>('all');

  const cloudResources: CloudResource[] = [
    {
      id: '1',
      name: 'web-app-prod-01',
      type: 'compute',
      provider: 'aws',
      status: 'running',
      cost: 245.50,
      usage: 78,
      region: 'us-east-1',
      lastActivity: '2 minutes ago',
      recommendations: ['Right-size instance', 'Enable auto-scaling']
    },
    {
      id: '2', 
      name: 'analytics-db-cluster',
      type: 'database',
      provider: 'azure',
      status: 'running',
      cost: 892.30,
      usage: 65,
      region: 'east-us',
      lastActivity: '5 minutes ago',
      recommendations: ['Optimize storage tier', 'Review backup frequency']
    },
    {
      id: '3',
      name: 'ml-training-gpu',
      type: 'compute',
      provider: 'gcp',
      status: 'stopped',
      cost: 0,
      usage: 0,
      region: 'us-central1',
      lastActivity: '2 hours ago',
      recommendations: ['Consider preemptible instances', 'Schedule auto-shutdown']
    },
    {
      id: '4',
      name: 'data-warehouse-storage',
      type: 'storage',
      provider: 'aws',
      status: 'running',
      cost: 156.75,
      usage: 45,
      region: 'us-west-2',
      lastActivity: '1 hour ago',
      recommendations: ['Move to infrequent access tier']
    },
    {
      id: '5',
      name: 'container-registry',
      type: 'storage',
      provider: 'azure',
      status: 'warning',
      cost: 67.20,
      usage: 89,
      region: 'west-europe',
      lastActivity: '30 minutes ago',
      recommendations: ['Clean up old images', 'Enable lifecycle policies']
    },
    {
      id: '6',
      name: 'api-gateway-cluster',
      type: 'network',
      provider: 'gcp',
      status: 'running',
      cost: 123.45,
      usage: 72,
      region: 'europe-west1',
      lastActivity: '1 minute ago',
      recommendations: ['Enable CDN', 'Optimize routing rules']
    }
  ];

  const providerStats = {
    aws: {
      resources: cloudResources.filter(r => r.provider === 'aws').length,
      cost: cloudResources.filter(r => r.provider === 'aws').reduce((sum, r) => sum + r.cost, 0),
      status: 'healthy'
    },
    azure: {
      resources: cloudResources.filter(r => r.provider === 'azure').length,
      cost: cloudResources.filter(r => r.provider === 'azure').reduce((sum, r) => sum + r.cost, 0),
      status: 'warning'
    },
    gcp: {
      resources: cloudResources.filter(r => r.provider === 'gcp').length,
      cost: cloudResources.filter(r => r.provider === 'gcp').reduce((sum, r) => sum + r.cost, 0),
      status: 'healthy'
    }
  };

  const filteredResources = selectedProvider === 'all' 
    ? cloudResources 
    : cloudResources.filter(r => r.provider === selectedProvider);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'stopped':
        return <PowerOff className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'compute':
        return <Server className="w-5 h-5" />;
      case 'storage':
        return <HardDrive className="w-5 h-5" />;
      case 'database':
        return <Database className="w-5 h-5" />;
      case 'network':
        return <Cloud className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getProviderGradient = (provider: string) => {
    switch (provider) {
      case 'aws':
        return 'aws-gradient';
      case 'azure':
        return 'azure-gradient';
      case 'gcp':
        return 'gcp-gradient';
      default:
        return 'bg-gradient-primary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Provider Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(providerStats).map(([provider, stats]) => (
          <Card 
            key={provider} 
            className={`infra-card hover-lift cursor-pointer ${
              selectedProvider === provider ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedProvider(provider as any)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${getProviderGradient(provider)} flex items-center justify-center`}>
                  <Cloud className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center space-x-2">
                  {stats.status === 'healthy' ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-warning" />
                  )}
                  <span className="text-sm capitalize">{stats.status}</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold capitalize mb-2">{provider}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Resources</span>
                  <span className="font-medium">{stats.resources}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Cost</span>
                  <span className="font-medium">${stats.cost.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resource Management */}
      <Card className="infra-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Server className="w-5 h-5 mr-2" />
              Resource Management
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Tabs value={selectedProvider} onValueChange={(value) => setSelectedProvider(value as any)}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="aws">AWS</TabsTrigger>
                  <TabsTrigger value="azure">Azure</TabsTrigger>
                  <TabsTrigger value="gcp">GCP</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="p-4 hover-lift infra-transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg ${getProviderGradient(resource.provider)} flex items-center justify-center`}>
                      {getTypeIcon(resource.type)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold">{resource.name}</h4>
                        {getStatusIcon(resource.status)}
                        <Badge variant="outline" className="text-xs">
                          {resource.provider.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                        <span>{resource.region}</span>
                        <span>•</span>
                        <span>Last activity: {resource.lastActivity}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    {/* Usage */}
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">Usage</div>
                      <div className="flex items-center space-x-2">
                        <Progress value={resource.usage} className="w-16 h-2" />
                        <span className="text-sm font-medium">{resource.usage}%</span>
                      </div>
                    </div>
                    
                    {/* Cost */}
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">Cost</div>
                      <div className="text-lg font-semibold">
                        ${resource.cost.toFixed(2)}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className={resource.status === 'running' ? 'text-destructive' : 'text-success'}
                      >
                        {resource.status === 'running' ? 
                          <PowerOff className="w-4 h-4" /> : 
                          <Power className="w-4 h-4" />
                        }
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Recommendations */}
                {resource.recommendations && resource.recommendations.length > 0 && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium">AI Recommendations</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {resource.recommendations.map((rec, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {rec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiCloudManagement;