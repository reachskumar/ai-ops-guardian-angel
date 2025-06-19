
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CloudAccount } from '@/services/cloud/types';
import { Network, Wifi, Globe, Shield, Plus, Settings, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NetworkingConfigurationProps {
  accounts: CloudAccount[];
}

interface VPNConnection {
  id: string;
  name: string;
  source: string;
  target: string;
  status: 'connected' | 'connecting' | 'failed';
  bandwidth: string;
  encryption: string;
}

interface DNSZone {
  id: string;
  domain: string;
  provider: string;
  records: number;
  status: 'active' | 'inactive';
}

const NetworkingConfiguration: React.FC<NetworkingConfigurationProps> = ({ accounts }) => {
  const [activeTab, setActiveTab] = useState<'vpn' | 'dns' | 'loadbalancer'>('vpn');
  const [vpnConnections, setVpnConnections] = useState<VPNConnection[]>([
    {
      id: '1',
      name: 'AWS-Azure-VPN-Primary',
      source: 'aws',
      target: 'azure',
      status: 'connected',
      bandwidth: '1 Gbps',
      encryption: 'AES-256'
    }
  ]);
  const [dnsZones, setDnsZones] = useState<DNSZone[]>([
    {
      id: '1',
      domain: 'myapp.com',
      provider: 'global',
      records: 15,
      status: 'active'
    }
  ]);
  const [showVPNForm, setShowVPNForm] = useState(false);
  const [showDNSForm, setShowDNSForm] = useState(false);
  const { toast } = useToast();

  const createVPNConnection = (formData: any) => {
    const newConnection: VPNConnection = {
      id: Date.now().toString(),
      name: formData.name,
      source: formData.source,
      target: formData.target,
      status: 'connecting',
      bandwidth: formData.bandwidth,
      encryption: 'AES-256'
    };
    
    setVpnConnections(prev => [...prev, newConnection]);
    setShowVPNForm(false);
    
    // Simulate connection establishment
    setTimeout(() => {
      setVpnConnections(prev => prev.map(conn => 
        conn.id === newConnection.id ? { ...conn, status: 'connected' } : conn
      ));
      toast({
        title: "VPN Connection Established",
        description: `Successfully connected ${formData.source} to ${formData.target}`,
      });
    }, 3000);
  };

  const createDNSZone = (formData: any) => {
    const newZone: DNSZone = {
      id: Date.now().toString(),
      domain: formData.domain,
      provider: 'global',
      records: 0,
      status: 'active'
    };
    
    setDnsZones(prev => [...prev, newZone]);
    setShowDNSForm(false);
    
    toast({
      title: "DNS Zone Created",
      description: `DNS zone for ${formData.domain} has been configured`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={activeTab === 'vpn' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('vpn')}
          className="flex-1"
        >
          <Network className="mr-2 h-4 w-4" />
          VPN Connections
        </Button>
        <Button
          variant={activeTab === 'dns' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('dns')}
          className="flex-1"
        >
          <Globe className="mr-2 h-4 w-4" />
          DNS Management
        </Button>
        <Button
          variant={activeTab === 'loadbalancer' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('loadbalancer')}
          className="flex-1"
        >
          <Wifi className="mr-2 h-4 w-4" />
          Load Balancing
        </Button>
      </div>

      {/* VPN Tab */}
      {activeTab === 'vpn' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>VPN Connections</CardTitle>
              <CardDescription>
                Secure connections between cloud providers
              </CardDescription>
            </div>
            <Button onClick={() => setShowVPNForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New VPN
            </Button>
          </CardHeader>
          <CardContent>
            {showVPNForm && <VPNForm onSubmit={createVPNConnection} onCancel={() => setShowVPNForm(false)} accounts={accounts} />}
            
            <div className="space-y-4 mt-4">
              {vpnConnections.map(connection => (
                <div key={connection.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-blue-500" />
                      <div>
                        <h4 className="font-medium">{connection.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {connection.source.toUpperCase()} ↔ {connection.target.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={connection.status === 'connected' ? 'default' : 'secondary'}>
                      {connection.status === 'connected' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {connection.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Bandwidth:</span>
                      <p className="font-medium">{connection.bandwidth}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Encryption:</span>
                      <p className="font-medium">{connection.encryption}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* DNS Tab */}
      {activeTab === 'dns' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>DNS Management</CardTitle>
              <CardDescription>
                Unified DNS across all cloud providers
              </CardDescription>
            </div>
            <Button onClick={() => setShowDNSForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Zone
            </Button>
          </CardHeader>
          <CardContent>
            {showDNSForm && <DNSForm onSubmit={createDNSZone} onCancel={() => setShowDNSForm(false)} />}
            
            <div className="space-y-4 mt-4">
              {dnsZones.map(zone => (
                <div key={zone.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-green-500" />
                      <div>
                        <h4 className="font-medium">{zone.domain}</h4>
                        <p className="text-sm text-muted-foreground">
                          {zone.records} DNS records
                        </p>
                      </div>
                    </div>
                    <Badge variant={zone.status === 'active' ? 'default' : 'secondary'}>
                      {zone.status}
                    </Badge>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4 mr-1" />
                      Manage Records
                    </Button>
                    <Button size="sm" variant="outline">
                      View Analytics
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Load Balancer Tab */}
      {activeTab === 'loadbalancer' && (
        <Card>
          <CardHeader>
            <CardTitle>Cross-Cloud Load Balancing</CardTitle>
            <CardDescription>
              Distribute traffic across multiple cloud providers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Global Load Balancer</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Routes traffic based on latency and health checks
                </p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">AWS Endpoints:</span>
                    <p className="font-medium">3 active</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Azure Endpoints:</span>
                    <p className="font-medium">2 active</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">GCP Endpoints:</span>
                    <p className="font-medium">1 active</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const VPNForm: React.FC<{
  onSubmit: (data: any) => void;
  onCancel: () => void;
  accounts: CloudAccount[];
}> = ({ onSubmit, onCancel, accounts }) => {
  const [formData, setFormData] = useState({
    name: '',
    source: '',
    target: '',
    bandwidth: '1 Gbps'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-4 bg-muted/50">
      <h4 className="font-medium">Create VPN Connection</h4>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Connection Name</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., AWS-Azure-Production"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Bandwidth</label>
          <Select value={formData.bandwidth} onValueChange={(value) => setFormData(prev => ({ ...prev, bandwidth: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="100 Mbps">100 Mbps</SelectItem>
              <SelectItem value="1 Gbps">1 Gbps</SelectItem>
              <SelectItem value="10 Gbps">10 Gbps</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Source Provider</label>
          <Select value={formData.source} onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aws">AWS</SelectItem>
              <SelectItem value="azure">Azure</SelectItem>
              <SelectItem value="gcp">GCP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Target Provider</label>
          <Select value={formData.target} onValueChange={(value) => setFormData(prev => ({ ...prev, target: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select target" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aws">AWS</SelectItem>
              <SelectItem value="azure">Azure</SelectItem>
              <SelectItem value="gcp">GCP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Create VPN
        </Button>
      </div>
    </form>
  );
};

const DNSForm: React.FC<{
  onSubmit: (data: any) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    domain: '',
    ttl: '300'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-4 bg-muted/50">
      <h4 className="font-medium">Create DNS Zone</h4>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Domain Name</label>
          <Input
            value={formData.domain}
            onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
            placeholder="e.g., myapp.com"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Default TTL</label>
          <Select value={formData.ttl} onValueChange={(value) => setFormData(prev => ({ ...prev, ttl: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="300">5 minutes</SelectItem>
              <SelectItem value="3600">1 hour</SelectItem>
              <SelectItem value="86400">24 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Create Zone
        </Button>
      </div>
    </form>
  );
};

export default NetworkingConfiguration;
