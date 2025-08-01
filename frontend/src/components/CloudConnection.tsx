import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cloud, Shield, Key, Eye, CheckCircle, AlertTriangle,
  Plus, Settings, RefreshCw, TestTube, Database, Server,
  Globe, Lock, User, Building, ArrowRight, ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { aiServicesAPI } from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../lib/auth';

interface CloudProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  status: 'connected' | 'disconnected' | 'testing' | 'error';
  accounts: CloudAccount[];
}

interface CloudAccount {
  id: string;
  name: string;
  accountId: string;
  region: string;
  status: 'active' | 'inactive' | 'error';
  resources: number;
  cost: number;
}

const CloudConnection: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [showSecrets, setShowSecrets] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [providers, setProviders] = useState<CloudProvider[]>([]);
  const [connectionData, setConnectionData] = useState({
    accessKey: '',
    secretKey: '',
    region: 'us-east-1',
    subscriptionId: '',
    tenantId: '',
    clientId: '',
    clientSecret: '',
    projectId: '',
    serviceAccountKey: '',
  });

  const cloudProviders: CloudProvider[] = [
    {
      id: 'aws',
      name: 'Amazon Web Services',
      icon: '☁️',
      color: 'bg-orange-500',
      description: 'Connect your AWS accounts for comprehensive cloud management',
      status: 'disconnected',
      accounts: []
    },
    {
      id: 'azure',
      name: 'Microsoft Azure',
      icon: '☁️',
      color: 'bg-blue-500',
      description: 'Integrate Azure subscriptions for multi-cloud operations',
      status: 'disconnected',
      accounts: []
    },
    {
      id: 'gcp',
      name: 'Google Cloud Platform',
      icon: '☁️',
      color: 'bg-red-500',
      description: 'Connect GCP projects for unified cloud management',
      status: 'disconnected',
      accounts: []
    },
    {
      id: 'oci',
      name: 'Oracle Cloud Infrastructure',
      icon: '☁️',
      color: 'bg-red-600',
      description: 'Integrate OCI tenancies for complete cloud coverage',
      status: 'disconnected',
      accounts: []
    }
  ];

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to connect to cloud providers.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    loadConnectedProviders();
  }, [isAuthenticated, navigate, toast]);

  const loadConnectedProviders = async () => {
    try {
      const response = await aiServicesAPI.getCloudProviders();
      if (response.success && response.data) {
        const connectedProviders = response.data.providers || [];
        const updatedProviders = cloudProviders.map(provider => {
          const connected = connectedProviders.find((p: any) => p.provider === provider.id);
          return {
            ...provider,
            status: connected ? 'connected' : 'disconnected',
            accounts: connected?.accounts || []
          };
        });
        setProviders(updatedProviders);
      } else {
        setProviders(cloudProviders);
      }
    } catch (error) {
      console.error('Failed to load providers:', error);
      setProviders(cloudProviders);
    }
  };

  const handleConnect = async (providerId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to connect to cloud providers.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    setIsConnecting(true);
    setSelectedProvider(providerId);
    
    try {
      // Get credentials based on provider
      const credentials = getCredentialsForProvider(providerId);
      
      const response = await aiServicesAPI.connectCloudProvider(providerId, credentials);
      
      if (response.success) {
        toast({
          title: "Connection Successful",
          description: response.data?.message || `Successfully connected to ${providerId.toUpperCase()}`,
        });
        
        // Reload providers to show updated status
        await loadConnectedProviders();
      } else {
        throw new Error(response.error || 'Connection failed');
      }
    } catch (error) {
      let errorMessage = 'Unknown error';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Provide specific guidance for common errors
      if (errorMessage.includes('InvalidClientTokenId') || errorMessage.includes('InvalidAccessKeyId')) {
        errorMessage = 'Invalid AWS credentials. Please use real Access Key ID and Secret Access Key from your AWS IAM user.';
      } else if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
        errorMessage = 'Authentication failed. Please log in again and try connecting.';
      } else if (errorMessage.includes('credential validation failed')) {
        errorMessage = 'Invalid credentials. Please check your cloud provider credentials and try again.';
      }
      
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${providerId.toUpperCase()}: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const getCredentialsForProvider = (providerId: string) => {
    switch (providerId) {
      case 'aws':
        return {
          access_key_id: connectionData.accessKey,
          secret_access_key: connectionData.secretKey,
          region: connectionData.region || 'us-east-1'
        };
      case 'azure':
        return {
          subscription_id: connectionData.subscriptionId,
          client_id: connectionData.clientId,
          client_secret: connectionData.clientSecret,
          tenant_id: connectionData.tenantId
        };
      case 'gcp':
        return {
          service_account_key: connectionData.serviceAccountKey
        };
      case 'oci':
        return {
          tenancy_ocid: connectionData.tenantId,
          user_ocid: connectionData.clientId,
          fingerprint: connectionData.accessKey,
          private_key: connectionData.secretKey
        };
      default:
        return {};
    }
  };

  const handleTestConnection = async (providerId: string) => {
    // Simulate connection testing
    const provider = providers.find(p => p.id === providerId);
    if (provider) {
      // Update status to testing
      setTimeout(() => {
        // Update status based on test result
      }, 2000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'disconnected': return 'text-gray-500';
      case 'testing': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'disconnected': return <Cloud className="h-4 w-4 text-gray-500" />;
      case 'testing': return <RefreshCw className="h-4 w-4 text-yellow-600 animate-spin" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Cloud className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Authentication Status */}
      {!isAuthenticated && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Authentication Required:</strong> Please{' '}
            <Button 
              variant="link" 
              className="p-0 h-auto font-semibold text-blue-600"
              onClick={() => navigate('/auth')}
            >
              log in
            </Button>{' '}
            to connect to cloud providers.
          </AlertDescription>
        </Alert>
      )}
      
      {isAuthenticated && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Authenticated as:</strong> {user?.email || 'Unknown user'}
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Cloud Provider Connections
        </h1>
        <p className="text-lg text-gray-600">
          Connect your cloud providers to enable AI-powered infrastructure management
        </p>
      </div>

      {/* Important Notice */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Production Setup Required:</strong> This is a production-ready system that requires real cloud provider credentials. 
          <br /><br />
          <strong>For AWS:</strong> Use real Access Key ID and Secret Access Key from your AWS IAM user
          <br />
          <strong>For Azure:</strong> Use real Service Principal credentials (Client ID, Client Secret, Tenant ID, Subscription ID)
          <br />
          <strong>For GCP:</strong> Use real Service Account JSON key file content
          <br /><br />
          <strong>Note:</strong> Test/demo credentials will be rejected. Only real credentials will work.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="connect">Connect Providers</TabsTrigger>
          <TabsTrigger value="accounts">Connected Accounts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {providers.map((provider) => (
              <Card key={provider.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-lg ${provider.color} flex items-center justify-center text-white`}>
                        {provider.icon}
                      </div>
                      <div>
                        <CardTitle className="text-sm">{provider.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {provider.accounts.length} accounts
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusIcon(provider.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    {provider.description}
                  </p>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant={provider.status === 'connected' ? 'outline' : 'default'}
                      onClick={() => handleConnect(provider.id)}
                      disabled={!isAuthenticated || (isConnecting && selectedProvider === provider.id)}
                    >
                      {isConnecting && selectedProvider === provider.id ? (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          Connecting...
                        </>
                      ) : !isAuthenticated ? (
                        'Login Required'
                      ) : provider.status === 'connected' ? (
                        'Manage'
                      ) : (
                        'Connect'
                      )}
                    </Button>
                    {provider.status === 'connected' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleTestConnection(provider.id)}
                      >
                        <TestTube className="h-3 w-3 mr-1" />
                        Test
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle>Connection Status</CardTitle>
              <CardDescription>
                Overview of your cloud provider connections and health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providers.map((provider) => (
                  <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        provider.status === 'connected' ? 'bg-green-500' :
                        provider.status === 'testing' ? 'bg-yellow-500' :
                        provider.status === 'error' ? 'bg-red-500' : 'bg-gray-300'
                      }`} />
                      <div>
                        <p className="font-medium">{provider.name}</p>
                        <p className="text-sm text-gray-500">
                          {provider.accounts.length} accounts connected
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      provider.status === 'connected' ? 'default' :
                      provider.status === 'testing' ? 'secondary' :
                      provider.status === 'error' ? 'destructive' : 'outline'
                    }>
                      {provider.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Connect Providers Tab */}
        <TabsContent value="connect" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AWS Connection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-6 h-6 bg-orange-500 rounded mr-2 flex items-center justify-center text-white text-xs">
                    AWS
                  </div>
                  Amazon Web Services
                </CardTitle>
                <CardDescription>
                  Connect using Access Keys or IAM Role
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="aws-access-key">Access Key ID</Label>
                  <Input
                    id="aws-access-key"
                    type="text"
                    placeholder="AKIA..."
                    value={connectionData.accessKey}
                    onChange={(e) => setConnectionData({...connectionData, accessKey: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="aws-secret-key">Secret Access Key</Label>
                  <div className="relative">
                    <Input
                      id="aws-secret-key"
                      type={showSecrets ? "text" : "password"}
                      placeholder="••••••••"
                      value={connectionData.secretKey}
                      onChange={(e) => setConnectionData({...connectionData, secretKey: e.target.value})}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowSecrets(!showSecrets)}
                    >
                      {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aws-region">Default Region</Label>
                  <Input
                    id="aws-region"
                    type="text"
                    placeholder="us-east-1"
                    value={connectionData.region}
                    onChange={(e) => setConnectionData({...connectionData, region: e.target.value})}
                  />
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => handleConnect('aws')}
                  disabled={isConnecting && selectedProvider === 'aws'}
                >
                  {isConnecting && selectedProvider === 'aws' ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4 mr-2" />
                      Connect AWS Account
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Azure Connection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-6 h-6 bg-blue-500 rounded mr-2 flex items-center justify-center text-white text-xs">
                    AZ
                  </div>
                  Microsoft Azure
                </CardTitle>
                <CardDescription>
                  Connect using Service Principal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="azure-tenant-id">Tenant ID</Label>
                  <Input
                    id="azure-tenant-id"
                    type="text"
                    placeholder="00000000-0000-0000-0000-000000000000"
                    value={connectionData.tenantId}
                    onChange={(e) => setConnectionData({...connectionData, tenantId: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="azure-client-id">Client ID</Label>
                  <Input
                    id="azure-client-id"
                    type="text"
                    placeholder="00000000-0000-0000-0000-000000000000"
                    value={connectionData.clientId}
                    onChange={(e) => setConnectionData({...connectionData, clientId: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="azure-client-secret">Client Secret</Label>
                  <div className="relative">
                    <Input
                      id="azure-client-secret"
                      type={showSecrets ? "text" : "password"}
                      placeholder="••••••••"
                      value={connectionData.clientSecret}
                      onChange={(e) => setConnectionData({...connectionData, clientSecret: e.target.value})}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowSecrets(!showSecrets)}
                    >
                      {showSecrets ? <Eye className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="azure-subscription-id">Subscription ID</Label>
                  <Input
                    id="azure-subscription-id"
                    type="text"
                    placeholder="00000000-0000-0000-0000-000000000000"
                    value={connectionData.subscriptionId}
                    onChange={(e) => setConnectionData({...connectionData, subscriptionId: e.target.value})}
                  />
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => handleConnect('azure')}
                  disabled={isConnecting && selectedProvider === 'azure'}
                >
                  {isConnecting && selectedProvider === 'azure' ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4 mr-2" />
                      Connect Azure Subscription
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* GCP Connection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-6 h-6 bg-red-500 rounded mr-2 flex items-center justify-center text-white text-xs">
                    GCP
                  </div>
                  Google Cloud Platform
                </CardTitle>
                <CardDescription>
                  Connect using Service Account Key
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gcp-project-id">Project ID</Label>
                  <Input
                    id="gcp-project-id"
                    type="text"
                    placeholder="my-project-123"
                    value={connectionData.projectId}
                    onChange={(e) => setConnectionData({...connectionData, projectId: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gcp-service-account">Service Account Key (JSON)</Label>
                  <textarea
                    id="gcp-service-account"
                    className="w-full h-32 p-3 border rounded-md resize-none"
                    placeholder='{"type": "service_account", "project_id": "..."}'
                    value={connectionData.serviceAccountKey}
                    onChange={(e) => setConnectionData({...connectionData, serviceAccountKey: e.target.value})}
                  />
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => handleConnect('gcp')}
                  disabled={isConnecting && selectedProvider === 'gcp'}
                >
                  {isConnecting && selectedProvider === 'gcp' ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4 mr-2" />
                      Connect GCP Project
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* OCI Connection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-6 h-6 bg-red-600 rounded mr-2 flex items-center justify-center text-white text-xs">
                    OCI
                  </div>
                  Oracle Cloud Infrastructure
                </CardTitle>
                <CardDescription>
                  Connect using API Keys
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="oci-user-id">User OCID</Label>
                  <Input
                    id="oci-user-id"
                    type="text"
                    placeholder="ocid1.user.oc1.."
                    value={connectionData.accessKey}
                    onChange={(e) => setConnectionData({...connectionData, accessKey: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="oci-tenancy-id">Tenancy OCID</Label>
                  <Input
                    id="oci-tenancy-id"
                    type="text"
                    placeholder="ocid1.tenancy.oc1.."
                    value={connectionData.secretKey}
                    onChange={(e) => setConnectionData({...connectionData, secretKey: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="oci-fingerprint">Fingerprint</Label>
                  <Input
                    id="oci-fingerprint"
                    type="text"
                    placeholder="aa:bb:cc:dd:ee:ff:00:11:22:33:44:55:66:77:88:99"
                    value={connectionData.region}
                    onChange={(e) => setConnectionData({...connectionData, region: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="oci-private-key">Private Key</Label>
                  <textarea
                    id="oci-private-key"
                    className="w-full h-32 p-3 border rounded-md resize-none"
                    placeholder="-----BEGIN PRIVATE KEY-----..."
                    value={connectionData.serviceAccountKey}
                    onChange={(e) => setConnectionData({...connectionData, serviceAccountKey: e.target.value})}
                  />
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => handleConnect('oci')}
                  disabled={isConnecting && selectedProvider === 'oci'}
                >
                  {isConnecting && selectedProvider === 'oci' ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4 mr-2" />
                      Connect OCI Tenancy
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Security Notice */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Notice:</strong> All credentials are encrypted and stored securely. 
              We never store plain text secrets and use industry-standard encryption for all sensitive data.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Connected Accounts Tab */}
        <TabsContent value="accounts" className="space-y-6">
          <div className="text-center py-8">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Connected Accounts</h3>
            <p className="text-gray-600 mb-4">
              Connect your cloud providers to start managing your infrastructure
            </p>
            <Button onClick={() => setSelectedProvider('overview')}>
              <Plus className="h-4 w-4 mr-2" />
              Connect Your First Provider
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CloudConnection; 