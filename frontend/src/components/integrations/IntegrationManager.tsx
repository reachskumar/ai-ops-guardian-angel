import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  CheckCircle, 
  Settings, 
  Key, 
  Shield, 
  Database,
  GitBranch,
  MessageSquare,
  BarChart3,
  Zap
} from 'lucide-react';
import ClusterOnboarding from './ClusterOnboarding';
import CloudOpsPanel from '../CloudOpsPanel';

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  config: Record<string, any>;
  icon: React.ReactNode;
  requiredFields: string[];
  optionalFields: string[];
}

const IntegrationManager: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [tenantId, setTenantId] = useState<string>("default");
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});

  // Initialize integrations
  useEffect(() => {
    const defaultIntegrations: Integration[] = [
      // Security & Vulnerability Tools
      {
        id: 'trivy',
        name: 'Trivy',
        category: 'Security',
        description: 'Container vulnerability scanner',
        status: 'disconnected',
        config: {},
        icon: <Shield className="w-5 h-5" />,
        requiredFields: ['trivy_path'],
        optionalFields: ['severity_level', 'timeout']
      },
      {
        id: 'gitleaks',
        name: 'Gitleaks',
        category: 'Security',
        description: 'Secrets detection in repositories',
        status: 'disconnected',
        config: {},
        icon: <Key className="w-5 h-5" />,
        requiredFields: ['gitleaks_path'],
        optionalFields: ['exclude_paths', 'report_format']
      },
      {
        id: 'scoutsuite',
        name: 'ScoutSuite',
        category: 'Security',
        description: 'Cloud security posture assessment',
        status: 'disconnected',
        config: {},
        icon: <Shield className="w-5 h-5" />,
        requiredFields: ['aws_access_key', 'aws_secret_key'],
        optionalFields: ['regions', 'services']
      },

      // GitOps & CI/CD Tools
      {
        id: 'github',
        name: 'GitHub',
        category: 'GitOps',
        description: 'GitHub repository integration',
        status: 'disconnected',
        config: {},
        icon: <GitBranch className="w-5 h-5" />,
        requiredFields: ['github_token', 'organization'],
        optionalFields: ['repositories', 'webhook_url']
      },
      {
        id: 'jenkins',
        name: 'Jenkins',
        category: 'GitOps',
        description: 'Jenkins CI/CD server',
        status: 'disconnected',
        config: {},
        icon: <Zap className="w-5 h-5" />,
        requiredFields: ['jenkins_url', 'username', 'api_token'],
        optionalFields: ['jobs', 'pipeline_library']
      },
      {
        id: 'argocd',
        name: 'ArgoCD',
        category: 'GitOps',
        description: 'GitOps continuous deployment',
        status: 'disconnected',
        config: {},
        icon: <GitBranch className="w-5 h-5" />,
        requiredFields: ['argocd_url', 'api_token'],
        optionalFields: ['applications', 'projects']
      },

      // Monitoring & Observability
      {
        id: 'prometheus',
        name: 'Prometheus',
        category: 'Monitoring',
        description: 'Metrics collection and alerting',
        status: 'disconnected',
        config: {},
        icon: <BarChart3 className="w-5 h-5" />,
        requiredFields: ['prometheus_url'],
        optionalFields: ['metrics_path', 'scrape_interval']
      },
      {
        id: 'grafana',
        name: 'Grafana',
        category: 'Monitoring',
        description: 'Visualization and dashboards',
        status: 'disconnected',
        config: {},
        icon: <BarChart3 className="w-5 h-5" />,
        requiredFields: ['grafana_url', 'api_key'],
        optionalFields: ['dashboards', 'datasources']
      },

      // Communication & ChatOps
      {
        id: 'slack',
        name: 'Slack',
        category: 'Communication',
        description: 'Slack notifications and ChatOps',
        status: 'disconnected',
        config: {},
        icon: <MessageSquare className="w-5 h-5" />,
        requiredFields: ['slack_token', 'channel_id'],
        optionalFields: ['webhook_url', 'notifications']
      },
      {
        id: 'teams',
        name: 'Microsoft Teams',
        category: 'Communication',
        description: 'Teams notifications and ChatOps',
        status: 'disconnected',
        config: {},
        icon: <MessageSquare className="w-5 h-5" />,
        requiredFields: ['teams_webhook_url'],
        optionalFields: ['channel', 'notifications']
      },

      // Database & Storage
      {
        id: 'mongodb',
        name: 'MongoDB Atlas',
        category: 'Database',
        description: 'MongoDB Atlas connection',
        status: 'disconnected',
        config: {},
        icon: <Database className="w-5 h-5" />,
        requiredFields: ['connection_string', 'database_name'],
        optionalFields: ['collections', 'indexes']
      },
      {
        id: 'redis',
        name: 'Redis',
        category: 'Database',
        description: 'Redis cache connection',
        status: 'disconnected',
        config: {},
        icon: <Database className="w-5 h-5" />,
        requiredFields: ['redis_url'],
        optionalFields: ['password', 'database']
      }
    ];

    setIntegrations(defaultIntegrations);
  }, []);

  const handleIntegrationSelect = (integration: Integration) => {
    setSelectedIntegration(integration);
    setConfigValues({});
  };

  const handleConfigChange = (field: string, value: string) => {
    setConfigValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConnect = async () => {
    if (!selectedIntegration) return;

    try {
      // Validate required fields
      const missingFields = selectedIntegration.requiredFields.filter(
        field => !configValues[field]
      );

      if (missingFields.length > 0) {
        alert(`Please fill in required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Test connection
      const response = await fetch(`/api/v1/integrations/${tenantId}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          integration: selectedIntegration.id,
          config: configValues
        })
      });

      if (response.ok) {
        // Save secrets (only required fields treated as secrets for this UI)
        await fetch(`/api/v1/integrations/${tenantId}/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: selectedIntegration.id,
            secrets: selectedIntegration.requiredFields.reduce((acc: any, f: string) => {
              acc[f] = configValues[f];
              return acc;
            }, {})
          })
        });
        // Update integration status
        setIntegrations(prev => prev.map(integration => 
          integration.id === selectedIntegration.id 
            ? { ...integration, status: 'connected', config: configValues }
            : integration
        ));
        
        setSelectedIntegration(null);
        setConfigValues({});
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      console.error('Integration connection failed:', error);
      alert('Failed to connect integration. Please check your configuration.');
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    try {
      await fetch(`/api/v1/integrations/${tenantId}/${integrationId}`, { method: 'DELETE' });

      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, status: 'disconnected', config: {} }
          : integration
      ));
    } catch (error) {
      console.error('Failed to disconnect integration:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      connected: 'bg-green-100 text-green-800',
      disconnected: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status}
      </Badge>
    );
  };

  const categories = ['Security', 'GitOps', 'Monitoring', 'Communication', 'Database'];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Integration Manager</h1>
        <p className="text-gray-600">
          Configure external tools and services to enhance your AI-Ops platform capabilities.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <Label htmlFor="tenant" className="text-sm">Tenant</Label>
          <Input id="tenant" value={tenantId} onChange={(e) => setTenantId(e.target.value)} className="w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Integration List */}
        <div className="lg:col-span-2">
          <ClusterOnboarding />
          <CloudOpsPanel />
          {categories.map(category => {
            const categoryIntegrations = integrations.filter(
              integration => integration.category === category
            );

            return (
              <Card key={category} className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {category}
                    <Badge variant="secondary">{categoryIntegrations.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryIntegrations.map(integration => (
                      <Card 
                        key={integration.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedIntegration?.id === integration.id 
                            ? 'ring-2 ring-blue-500' 
                            : ''
                        }`}
                        onClick={() => handleIntegrationSelect(integration)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {integration.icon}
                              <div>
                                <h3 className="font-semibold">{integration.name}</h3>
                                <p className="text-sm text-gray-600">{integration.description}</p>
                              </div>
                            </div>
                            {getStatusIcon(integration.status)}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            {getStatusBadge(integration.status)}
                            {integration.status === 'connected' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDisconnect(integration.id);
                                }}
                              >
                                Disconnect
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          {selectedIntegration ? (
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configure {selectedIntegration.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    {selectedIntegration.description}
                  </p>
                  
                  {/* Required Fields */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Required Fields</h4>
                    {selectedIntegration.requiredFields.map(field => (
                      <div key={field}>
                        <Label htmlFor={field} className="text-sm">
                          {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Label>
                        <Input
                          id={field}
                          type={field.includes('token') || field.includes('key') || field.includes('password') ? 'password' : 'text'}
                          placeholder={`Enter ${field.replace(/_/g, ' ')}`}
                          value={configValues[field] || ''}
                          onChange={(e) => handleConfigChange(field, e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Optional Fields */}
                  {selectedIntegration.optionalFields.length > 0 && (
                    <div className="space-y-3 mt-4">
                      <h4 className="font-medium text-sm">Optional Fields</h4>
                      {selectedIntegration.optionalFields.map(field => (
                        <div key={field}>
                          <Label htmlFor={field} className="text-sm">
                            {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Label>
                          <Input
                            id={field}
                            type="text"
                            placeholder={`Enter ${field.replace(/_/g, ' ')} (optional)`}
                            value={configValues[field] || ''}
                            onChange={(e) => handleConfigChange(field, e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 mt-6">
                    <Button 
                      onClick={handleConnect}
                      className="flex-1"
                      disabled={selectedIntegration.requiredFields.some(
                        field => !configValues[field]
                      )}
                    >
                      Connect Integration
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSelectedIntegration(null);
                        setConfigValues({});
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Integration Help</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Select an integration from the list to configure it. 
                  Connected integrations will be available for use by AI agents.
                </p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Connected - Ready to use</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                    <span>Disconnected - Needs configuration</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span>Error - Connection failed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntegrationManager; 