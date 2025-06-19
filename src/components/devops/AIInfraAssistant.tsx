
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Send, 
  Loader, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Zap,
  Server,
  Cpu,
  HardDrive,
  Network
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendChatMessage, simulateInfrastructureProvisioning } from '@/services/aiChatService';

interface InfraRequest {
  id: string;
  query: string;
  response: string;
  estimatedCost: number;
  recommendedSpecs: {
    instanceType: string;
    cpu: string;
    memory: string;
    storage: string;
    gpu?: string;
  };
  timestamp: Date;
  status: 'analyzing' | 'ready' | 'provisioning' | 'completed';
}

interface DriftAlert {
  id: string;
  resourceId: string;
  resourceName: string;
  driftType: 'configuration' | 'security' | 'cost' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  autoHealable: boolean;
  timestamp: Date;
}

const AIInfraAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requests, setRequests] = useState<InfraRequest[]>([]);
  const [driftAlerts, setDriftAlerts] = useState<DriftAlert[]>([
    {
      id: 'drift-001',
      resourceId: 'i-0123456789abcdef0',
      resourceName: 'web-server-prod',
      driftType: 'configuration',
      severity: 'medium',
      description: 'Security group rules have been modified outside of Terraform',
      autoHealable: true,
      timestamp: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: 'drift-002',
      resourceId: 'rds-prod-db',
      resourceName: 'main-database',
      driftType: 'cost',
      severity: 'high',
      description: 'Instance size increased from db.t3.medium to db.t3.large',
      autoHealable: false,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
  ]);
  const { toast } = useToast();

  // Simulate drift detection
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newDrift: DriftAlert = {
          id: `drift-${Date.now()}`,
          resourceId: `resource-${Math.random().toString(36).substr(2, 9)}`,
          resourceName: `auto-scaling-group-${Math.floor(Math.random() * 100)}`,
          driftType: ['configuration', 'security', 'cost', 'performance'][Math.floor(Math.random() * 4)] as any,
          severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          description: 'Detected configuration drift in auto-scaling group',
          autoHealable: Math.random() > 0.5,
          timestamp: new Date()
        };
        
        setDriftAlerts(prev => [newDrift, ...prev.slice(0, 9)]);
        
        toast({
          title: 'Drift Detected',
          description: `Configuration drift detected in ${newDrift.resourceName}`,
          variant: newDrift.severity === 'high' ? 'destructive' : 'default'
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [toast]);

  const analyzeInfraRequest = async (query: string) => {
    setIsLoading(true);
    
    try {
      // Enhanced prompt for infrastructure analysis
      const enhancedPrompt = `
        Analyze this infrastructure request and provide:
        1. Recommended cloud resources and specifications
        2. Estimated monthly cost breakdown
        3. Performance optimization suggestions
        4. Security best practices
        
        Request: "${query}"
        
        Please format your response with specific recommendations for instance types, storage, networking, and provide a detailed cost estimate.
      `;

      const response = await sendChatMessage(enhancedPrompt, []);
      
      // Simulate cost prediction based on query content
      let estimatedCost = 150; // Base cost
      if (query.toLowerCase().includes('gpu')) estimatedCost += 800;
      if (query.toLowerCase().includes('training')) estimatedCost += 500;
      if (query.toLowerCase().includes('high performance')) estimatedCost += 300;
      if (query.toLowerCase().includes('production')) estimatedCost += 200;
      
      // Generate recommended specs based on query
      const recommendedSpecs = generateRecommendedSpecs(query);
      
      const newRequest: InfraRequest = {
        id: `req-${Date.now()}`,
        query,
        response,
        estimatedCost,
        recommendedSpecs,
        timestamp: new Date(),
        status: 'ready'
      };
      
      setRequests(prev => [newRequest, ...prev]);
      
    } catch (error) {
      console.error('Error analyzing infrastructure request:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Failed to analyze infrastructure request. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecommendedSpecs = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('gpu') && lowerQuery.includes('training')) {
      return {
        instanceType: 'g4dn.xlarge',
        cpu: '4 vCPUs (Intel Xeon)',
        memory: '16 GB',
        storage: '125 GB NVMe SSD',
        gpu: 'NVIDIA T4 (16GB)'
      };
    } else if (lowerQuery.includes('web') || lowerQuery.includes('app')) {
      return {
        instanceType: 't3.medium',
        cpu: '2 vCPUs',
        memory: '4 GB',
        storage: '30 GB GP3'
      };
    } else if (lowerQuery.includes('database')) {
      return {
        instanceType: 'db.t3.large',
        cpu: '2 vCPUs',
        memory: '8 GB',
        storage: '100 GB GP3'
      };
    } else {
      return {
        instanceType: 't3.medium',
        cpu: '2 vCPUs',
        memory: '4 GB',
        storage: '30 GB GP3'
      };
    }
  };

  const handleProvision = async (request: InfraRequest) => {
    setRequests(prev => 
      prev.map(r => 
        r.id === request.id 
          ? { ...r, status: 'provisioning' }
          : r
      )
    );

    try {
      const result = await simulateInfrastructureProvisioning(
        'aws',
        request.recommendedSpecs.instanceType,
        request.recommendedSpecs
      );

      setRequests(prev => 
        prev.map(r => 
          r.id === request.id 
            ? { ...r, status: 'completed' }
            : r
        )
      );

      toast({
        title: 'Provisioning Complete',
        description: `Successfully provisioned ${request.recommendedSpecs.instanceType}`,
      });
    } catch (error) {
      setRequests(prev => 
        prev.map(r => 
          r.id === request.id 
            ? { ...r, status: 'ready' }
            : r
        )
      );

      toast({
        title: 'Provisioning Failed',
        description: 'Failed to provision infrastructure. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleAutoHeal = async (alert: DriftAlert) => {
    toast({
      title: 'Auto-Healing Started',
      description: `Attempting to auto-heal ${alert.resourceName}...`,
    });

    // Simulate auto-healing
    setTimeout(() => {
      setDriftAlerts(prev => prev.filter(a => a.id !== alert.id));
      toast({
        title: 'Auto-Healing Complete',
        description: `Successfully healed drift in ${alert.resourceName}`,
      });
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    analyzeInfraRequest(input);
    setInput('');
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: 'default',
      medium: 'secondary',
      high: 'destructive',
      critical: 'destructive'
    };
    return <Badge variant={variants[severity as keyof typeof variants] as any}>{severity}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'analyzing':
        return <Badge variant="secondary"><Loader className="h-3 w-3 mr-1 animate-spin" />Analyzing</Badge>;
      case 'ready':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Ready</Badge>;
      case 'provisioning':
        return <Badge variant="secondary"><Loader className="h-3 w-3 mr-1 animate-spin" />Provisioning</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bot className="h-6 w-6" />
        <h2 className="text-2xl font-bold">AI Infrastructure Assistant</h2>
      </div>

      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat">Chat Assistant</TabsTrigger>
          <TabsTrigger value="drift">
            Drift Detection
            {driftAlerts.filter(a => a.severity === 'high' || a.severity === 'critical').length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {driftAlerts.filter(a => a.severity === 'high' || a.severity === 'critical').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="recommendations">Smart Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Infrastructure Chat Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  placeholder="e.g., 'Provision me a GPU VM for training', 'I need a web server for 1000 users'"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>

              <div className="space-y-4">
                {requests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <p className="font-medium">"{request.query}"</p>
                            {getStatusBadge(request.status)}
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <DollarSign className="h-3 w-3" />
                              ${request.estimatedCost}/month
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Recommended Specs</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <Server className="h-3 w-3" />
                                {request.recommendedSpecs.instanceType}
                              </div>
                              <div className="flex items-center gap-2">
                                <Cpu className="h-3 w-3" />
                                {request.recommendedSpecs.cpu}
                              </div>
                              <div className="flex items-center gap-2">
                                <HardDrive className="h-3 w-3" />
                                {request.recommendedSpecs.memory}
                              </div>
                              <div className="flex items-center gap-2">
                                <Network className="h-3 w-3" />
                                {request.recommendedSpecs.storage}
                              </div>
                              {request.recommendedSpecs.gpu && (
                                <div className="flex items-center gap-2">
                                  <Zap className="h-3 w-3" />
                                  {request.recommendedSpecs.gpu}
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">AI Response</h4>
                            <p className="text-sm text-muted-foreground">
                              {request.response.substring(0, 200)}...
                            </p>
                          </div>
                        </div>

                        {request.status === 'ready' && (
                          <Button 
                            onClick={() => handleProvision(request)}
                            className="w-full"
                          >
                            Provision Infrastructure
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drift">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Infrastructure Drift Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {driftAlerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{alert.resourceName}</h4>
                          {getSeverityBadge(alert.severity)}
                          <Badge variant="outline">{alert.driftType}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Detected {alert.timestamp.toLocaleString()}
                        </p>
                      </div>
                      
                      {alert.autoHealable && (
                        <Button
                          size="sm"
                          onClick={() => handleAutoHeal(alert)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          Auto-Heal
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {driftAlerts.length === 0 && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      No infrastructure drift detected. All resources are in compliance.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Smart Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Cost Optimization:</strong> Your web servers have been underutilized (15% avg CPU). 
                    Consider downsizing from t3.large to t3.medium to save $45/month.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Server className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Performance:</strong> Database queries show increased latency. 
                    Consider upgrading to db.r5.large or enabling read replicas.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Security:</strong> All instances are using latest AMIs and security groups are properly configured.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIInfraAssistant;
