
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CloudAccount } from '@/services/cloud/types';
import { Network, Wifi, Shield, Globe, Plus, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MultiCloudNetworkingProps {
  accounts: CloudAccount[];
}

interface NetworkConnection {
  id: string;
  name: string;
  sourceProvider: string;
  targetProvider: string;
  type: 'vpn' | 'peering' | 'transit-gateway';
  status: 'connected' | 'connecting' | 'disconnected';
  bandwidth: string;
  latency: string;
}

const MultiCloudNetworking: React.FC<MultiCloudNetworkingProps> = ({ accounts }) => {
  const [connections] = useState<NetworkConnection[]>([
    {
      id: '1',
      name: 'AWS-Azure VPN',
      sourceProvider: 'aws',
      targetProvider: 'azure',
      type: 'vpn',
      status: 'connected',
      bandwidth: '1 Gbps',
      latency: '45ms'
    },
    {
      id: '2',
      name: 'Azure-GCP Peering',
      sourceProvider: 'azure',
      targetProvider: 'gcp',
      type: 'peering',
      status: 'connecting',
      bandwidth: '10 Gbps',
      latency: '12ms'
    }
  ]);

  const { toast } = useToast();

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'aws': return 'bg-orange-100 text-orange-800';
      case 'azure': return 'bg-blue-100 text-blue-800';
      case 'gcp': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const createConnection = () => {
    toast({
      title: "Create Network Connection",
      description: "Network connection wizard opened",
    });
  };

  return (
    <div className="space-y-6">
      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {connections.filter(c => c.status === 'connected').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {connections.length} total connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bandwidth</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">11 Gbps</div>
            <p className="text-xs text-muted-foreground">
              Aggregate cross-cloud bandwidth
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Latency</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28ms</div>
            <p className="text-xs text-muted-foreground">
              Cross-provider average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Network Connections */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Network Connections</CardTitle>
            <CardDescription>
              Manage connections between your cloud providers
            </CardDescription>
          </div>
          <Button onClick={createConnection}>
            <Plus className="mr-2 h-4 w-4" />
            Create Connection
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connections.map((connection) => (
              <div key={connection.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Network className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">{connection.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getProviderColor(connection.sourceProvider)}>
                          {connection.sourceProvider.toUpperCase()}
                        </Badge>
                        <span className="text-muted-foreground">→</span>
                        <Badge className={getProviderColor(connection.targetProvider)}>
                          {connection.targetProvider.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      connection.status === 'connected' ? 'default' :
                      connection.status === 'connecting' ? 'secondary' : 'destructive'
                    }>
                      {connection.status}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p className="font-medium capitalize">{connection.type.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bandwidth:</span>
                    <p className="font-medium">{connection.bandwidth}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Latency:</span>
                    <p className="font-medium">{connection.latency}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* DNS Management */}
      <Card>
        <CardHeader>
          <CardTitle>Unified DNS Management</CardTitle>
          <CardDescription>
            Manage DNS records across all cloud providers from a single interface
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Global DNS Zones</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="font-mono text-sm">example.com</span>
                  <Badge variant="outline">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="font-mono text-sm">api.example.com</span>
                  <Badge variant="outline">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="font-mono text-sm">staging.example.com</span>
                  <Badge variant="secondary">Inactive</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Traffic Routing</h4>
              <div className="space-y-2">
                <div className="p-3 border rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Geo-based Routing</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Routes traffic based on user location
                  </p>
                </div>
                <div className="p-3 border rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Health Check Routing</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Automatic failover on health check failures
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security & Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Network Security
          </CardTitle>
          <CardDescription>
            Cross-cloud security policies and compliance status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Security Policies</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Encryption in Transit</span>
                  <Badge variant="default">Enforced</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Network Segmentation</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">DDoS Protection</span>
                  <Badge variant="secondary">Partial</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Compliance Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">SOC 2 Type II</span>
                  <Badge variant="default">Compliant</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">GDPR</span>
                  <Badge variant="default">Compliant</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">HIPAA</span>
                  <Badge variant="destructive">Review Needed</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiCloudNetworking;
