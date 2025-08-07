import React, { useState, useEffect } from 'react';

interface Resource {
  id: string;
  name: string;
  type: string;
  region: string;
  status: string;
  provider: string;
  cost?: number;
}

const ResourceList = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<string>('all');

  useEffect(() => {
    // Fetch resources from connected cloud accounts
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      // In production, this would fetch from your cloud integration service
      const mockResources: Resource[] = [
        {
          id: 'i-1234567890abcdef0',
          name: 'web-server-01',
          type: 'EC2 Instance',
          region: 'us-east-1',
          status: 'running',
          provider: 'AWS',
          cost: 45.20
        },
        {
          id: 'vol-1234567890abcdef0',
          name: 'web-server-01-ebs',
          type: 'EBS Volume',
          region: 'us-east-1',
          status: 'in-use',
          provider: 'AWS',
          cost: 8.50
        },
        {
          id: 'sg-1234567890abcdef0',
          name: 'web-server-sg',
          type: 'Security Group',
          region: 'us-east-1',
          status: 'active',
          provider: 'AWS'
        },
        {
          id: 'vm-azure-001',
          name: 'azure-vm-01',
          type: 'Virtual Machine',
          region: 'East US',
          status: 'running',
          provider: 'Azure',
          cost: 52.30
        }
      ];

      setResources(mockResources);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResources = selectedProvider === 'all' 
    ? resources 
    : resources.filter(r => r.provider === selectedProvider);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'stopped':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Cloud Resources</h1>
        <p className="text-muted-foreground mt-2">Manage your multi-cloud infrastructure</p>
      </div>

      {/* Provider Filter */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedProvider('all')}
            className={`px-4 py-2 rounded-lg ${
              selectedProvider === 'all' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            All Providers
          </button>
          <button
            onClick={() => setSelectedProvider('AWS')}
            className={`px-4 py-2 rounded-lg ${
              selectedProvider === 'AWS' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            AWS
          </button>
          <button
            onClick={() => setSelectedProvider('Azure')}
            className={`px-4 py-2 rounded-lg ${
              selectedProvider === 'Azure' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            Azure
          </button>
          <button
            onClick={() => setSelectedProvider('GCP')}
            className={`px-4 py-2 rounded-lg ${
              selectedProvider === 'GCP' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            GCP
          </button>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <div key={resource.id} className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">{resource.name}</h3>
                <p className="text-sm text-muted-foreground">{resource.type}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(resource.status)}`}>
                {resource.status}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Provider:</span>
                <span className="text-foreground">{resource.provider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Region:</span>
                <span className="text-foreground">{resource.region}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span className="text-foreground font-mono text-xs">{resource.id}</span>
              </div>
              {resource.cost && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Cost:</span>
                  <span className="text-foreground">${resource.cost}</span>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex space-x-2">
              <button className="flex-1 px-3 py-2 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90">
                View Details
              </button>
              <button className="flex-1 px-3 py-2 text-xs bg-muted text-foreground rounded hover:bg-muted/80">
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">☁️</div>
          <h3 className="text-lg font-medium text-foreground mb-2">No resources found</h3>
          <p className="text-muted-foreground">
            Connect your cloud accounts to see your resources here
          </p>
        </div>
      )}
    </div>
  );
};

export default ResourceList; 