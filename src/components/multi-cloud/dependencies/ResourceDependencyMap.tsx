
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CloudResource, CloudAccount } from '@/services/cloud/types';
import { Network, AlertTriangle, CheckCircle, Server, Database, HardDrive, Globe } from 'lucide-react';

interface ResourceDependencyMapProps {
  resources: CloudResource[];
  accounts: CloudAccount[];
}

interface Dependency {
  id: string;
  sourceResource: string;
  targetResource: string;
  type: 'network' | 'data' | 'service' | 'security';
  status: 'healthy' | 'warning' | 'critical';
  latency?: number;
  description: string;
}

interface ResourceNode {
  id: string;
  name: string;
  type: string;
  provider: string;
  status: string;
  dependencies: string[];
  dependents: string[];
}

const ResourceDependencyMap: React.FC<ResourceDependencyMapProps> = ({ resources, accounts }) => {
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [resourceNodes, setResourceNodes] = useState<ResourceNode[]>([]);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  useEffect(() => {
    generateDependencies();
    createResourceNodes();
  }, [resources]);

  const generateDependencies = () => {
    // Simulate cross-cloud dependencies
    const mockDependencies: Dependency[] = [
      {
        id: '1',
        sourceResource: 'gcp-instance-1',
        targetResource: 'aws-rds-1',
        type: 'data',
        status: 'healthy',
        latency: 45,
        description: 'GCP VM connects to AWS RDS for user data'
      },
      {
        id: '2', 
        sourceResource: 'azure-webapp-1',
        targetResource: 'gcp-instance-1',
        type: 'service',
        status: 'warning',
        latency: 120,
        description: 'Azure Web App calls GCP API service'
      },
      {
        id: '3',
        sourceResource: 'aws-lambda-1',
        targetResource: 'azure-storage-1',
        type: 'data',
        status: 'healthy',
        latency: 35,
        description: 'AWS Lambda processes files from Azure Blob Storage'
      },
      {
        id: '4',
        sourceResource: 'gcp-instance-1',
        targetResource: 'aws-cloudfront-1',
        type: 'network',
        status: 'critical',
        latency: 200,
        description: 'GCP service routes traffic through AWS CloudFront'
      },
      {
        id: '5',
        sourceResource: 'azure-vm-1',
        targetResource: 'gcp-instance-1',
        type: 'security',
        status: 'healthy',
        description: 'Azure VM authenticates via GCP IAM'
      }
    ];

    setDependencies(mockDependencies);
  };

  const createResourceNodes = () => {
    const nodes: ResourceNode[] = resources.map(resource => {
      const deps = dependencies.filter(d => d.sourceResource === resource.name);
      const dependents = dependencies.filter(d => d.targetResource === resource.name);
      
      return {
        id: resource.id,
        name: resource.name,
        type: resource.type,
        provider: accounts.find(a => a.id === resource.cloud_account_id)?.provider || 'unknown',
        status: resource.status,
        dependencies: deps.map(d => d.targetResource),
        dependents: dependents.map(d => d.sourceResource)
      };
    });

    setResourceNodes(nodes);
  };

  const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'vm':
      case 'ec2':
        return <Server className="h-4 w-4" />;
      case 'database':
      case 'rds':
        return <Database className="h-4 w-4" />;
      case 'storage':
      case 's3':
        return <HardDrive className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100'; 
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'aws': return 'bg-orange-100 text-orange-800';
      case 'azure': return 'bg-blue-100 text-blue-800';
      case 'gcp': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDependencyTypeIcon = (type: string) => {
    switch (type) {
      case 'network': return <Network className="h-3 w-3" />;
      case 'data': return <Database className="h-3 w-3" />;
      case 'service': return <Server className="h-3 w-3" />;
      case 'security': return <CheckCircle className="h-3 w-3" />;
      default: return <Globe className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Resource Dependency Mapping</h3>
          <p className="text-sm text-muted-foreground">
            Visualize relationships and dependencies across cloud providers
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            onClick={() => setViewMode('map')}
          >
            Map View
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
        </div>
      </div>

      {/* Dependency Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Network className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total Dependencies</span>
            </div>
            <p className="text-2xl font-bold mt-1">{dependencies.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Healthy</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-green-600">
              {dependencies.filter(d => d.status === 'healthy').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Warnings</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-yellow-600">
              {dependencies.filter(d => d.status === 'warning').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Critical</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-red-600">
              {dependencies.filter(d => d.status === 'critical').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Map View */}
      {viewMode === 'map' && (
        <Card>
          <CardHeader>
            <CardTitle>Dependency Visualization</CardTitle>
            <CardDescription>
              Interactive map showing resource relationships across clouds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* AWS Resources */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center">
                  <Badge className="bg-orange-100 text-orange-800 mr-2">AWS</Badge>
                  Resources
                </h4>
                {resourceNodes.filter(node => node.provider === 'aws').map(node => (
                  <div
                    key={node.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedResource === node.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedResource(node.id)}
                  >
                    <div className="flex items-center space-x-2">
                      {getResourceIcon(node.type)}
                      <span className="font-medium">{node.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {node.dependencies.length} deps • {node.dependents.length} dependents
                    </div>
                  </div>
                ))}
              </div>

              {/* Azure Resources */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center">
                  <Badge className="bg-blue-100 text-blue-800 mr-2">Azure</Badge>
                  Resources
                </h4>
                {resourceNodes.filter(node => node.provider === 'azure').map(node => (
                  <div
                    key={node.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedResource === node.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedResource(node.id)}
                  >
                    <div className="flex items-center space-x-2">
                      {getResourceIcon(node.type)}
                      <span className="font-medium">{node.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {node.dependencies.length} deps • {node.dependents.length} dependents
                    </div>
                  </div>
                ))}
              </div>

              {/* GCP Resources */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center">
                  <Badge className="bg-red-100 text-red-800 mr-2">GCP</Badge>
                  Resources
                </h4>
                {resourceNodes.filter(node => node.provider === 'gcp').map(node => (
                  <div
                    key={node.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedResource === node.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedResource(node.id)}
                  >
                    <div className="flex items-center space-x-2">
                      {getResourceIcon(node.type)}
                      <span className="font-medium">{node.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {node.dependencies.length} deps • {node.dependents.length} dependents
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle>Dependency Details</CardTitle>
            <CardDescription>
              Detailed list of all cross-cloud dependencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dependencies.map(dependency => (
                <div key={dependency.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getDependencyTypeIcon(dependency.type)}
                      <div>
                        <h4 className="font-medium">
                          {dependency.sourceResource} → {dependency.targetResource}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {dependency.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(dependency.status)}>
                        {dependency.status}
                      </Badge>
                      {dependency.latency && (
                        <span className="text-sm text-muted-foreground">
                          {dependency.latency}ms
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <Badge variant="outline" className="capitalize">
                      {dependency.type} dependency
                    </Badge>
                    {dependency.status === 'critical' && (
                      <span className="text-red-600 text-xs">
                        ⚠️ Requires immediate attention
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Resource Details */}
      {selectedResource && (
        <Card>
          <CardHeader>
            <CardTitle>Resource Details</CardTitle>
            <CardDescription>
              Dependencies and relationships for selected resource
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const node = resourceNodes.find(n => n.id === selectedResource);
              if (!node) return null;
              
              return (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {getResourceIcon(node.type)}
                    <div>
                      <h4 className="font-medium">{node.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getProviderColor(node.provider)}>
                          {node.provider.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{node.type}</Badge>
                        <Badge variant={node.status === 'running' ? 'default' : 'secondary'}>
                          {node.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Dependencies ({node.dependencies.length})</h5>
                      <div className="space-y-1">
                        {node.dependencies.map(dep => (
                          <div key={dep} className="text-sm p-2 bg-gray-50 rounded">
                            {dep}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Dependents ({node.dependents.length})</h5>
                      <div className="space-y-1">
                        {node.dependents.map(dep => (
                          <div key={dep} className="text-sm p-2 bg-gray-50 rounded">
                            {dep}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResourceDependencyMap;
