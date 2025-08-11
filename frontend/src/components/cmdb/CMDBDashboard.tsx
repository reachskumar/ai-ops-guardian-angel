import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Search, Filter, BarChart3, Network, Database, Server, Globe, Shield, DollarSign, RefreshCw } from 'lucide-react';

interface Resource {
  id: string;
  name: string;
  resource_type: string;
  cloud_provider: string;
  region: string;
  account_id: string;
  status: string;
  owner?: string;
  team?: string;
  project?: string;
  tags: Record<string, string>;
  public_exposure: boolean;
  compliance_status?: string;
  security_score?: number;
  monthly_cost?: number;
  last_updated: string;
}

interface CMDBStats {
  total_resources: number;
  resources_by_provider: Record<string, number>;
  resources_by_type: Record<string, number>;
  public_resources: number;
  compliance_issues: number;
  total_monthly_cost: number;
  untagged_resources: number;
}

const CMDBDashboard: React.FC = () => {
  const [tenantId, setTenantId] = useState<string>('default');
  const [resources, setResources] = useState<Resource[]>([]);
  const [stats, setStats] = useState<CMDBStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    cloud_provider: '',
    resource_type: '',
    region: '',
    owner: '',
    team: '',
    project: '',
    public_exposure: '',
    compliance_status: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  // Mock data for demonstration
  const mockResources: Resource[] = [
    {
      id: 'i-1234567890abcdef0',
      name: 'web-server-01',
      resource_type: 'ec2_instance',
      cloud_provider: 'aws',
      region: 'us-east-1',
      account_id: '123456789012',
      status: 'running',
      owner: 'john.doe',
      team: 'frontend',
      project: 'web-app',
      tags: {
        environment: 'prod',
        cost_center: 'engineering',
        backup: 'daily'
      },
      public_exposure: false,
      compliance_status: 'compliant',
      security_score: 85,
      monthly_cost: 45.50,
      last_updated: '2024-01-15T10:30:00Z'
    },
    {
      id: 'i-0987654321fedcba0',
      name: 'db-server-01',
      resource_type: 'rds_instance',
      cloud_provider: 'aws',
      region: 'us-east-1',
      account_id: '123456789012',
      status: 'running',
      owner: 'jane.smith',
      team: 'backend',
      project: 'web-app',
      tags: {
        environment: 'prod',
        cost_center: 'engineering',
        backup: 'hourly'
      },
      public_exposure: false,
      compliance_status: 'compliant',
      security_score: 90,
      monthly_cost: 120.00,
      last_updated: '2024-01-15T10:30:00Z'
    },
    {
      id: 'vm-prod-web-001',
      name: 'web-server-prod',
      resource_type: 'vm',
      cloud_provider: 'azure',
      region: 'eastus',
      account_id: 'sub-12345678-1234-1234-1234-123456789012',
      status: 'running',
      owner: 'bob.wilson',
      team: 'frontend',
      project: 'web-app',
      tags: {
        environment: 'prod',
        cost_center: 'engineering'
      },
      public_exposure: true,
      compliance_status: 'warning',
      security_score: 70,
      monthly_cost: 65.00,
      last_updated: '2024-01-15T10:30:00Z'
    }
  ];

  const mockStats: CMDBStats = {
    total_resources: 156,
    resources_by_provider: {
      aws: 89,
      azure: 45,
      gcp: 22
    },
    resources_by_type: {
      ec2_instance: 45,
      rds_instance: 12,
      vm: 38,
      storage_account: 15,
      gce_instance: 22,
      cloud_sql: 8,
      lambda_function: 16
    },
    public_resources: 23,
    compliance_issues: 8,
    total_monthly_cost: 12450.75,
    untagged_resources: 12
  };

  useEffect(() => {
    // Load mock data
    setResources(mockResources);
    setStats(mockStats);
    setPagination(prev => ({ ...prev, total: mockResources.length }));
  }, []);

  const handleSearch = () => {
    // Implement search logic
    console.log('Searching with query:', searchQuery);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'ec2_instance':
      case 'vm':
      case 'gce_instance':
        return <Server className="h-4 w-4" />;
      case 'rds_instance':
      case 'cloud_sql':
        return <Database className="h-4 w-4" />;
      case 'lambda_function':
        return <Globe className="h-4 w-4" />;
      default:
        return <Server className="h-4 w-4" />;
    }
  };

  const getCloudProviderIcon = (provider: string) => {
    switch (provider) {
      case 'aws':
        return <div className="w-4 h-4 bg-orange-500 rounded"></div>;
      case 'azure':
        return <div className="w-4 h-4 bg-blue-500 rounded"></div>;
      case 'gcp':
        return <div className="w-4 h-4 bg-red-500 rounded"></div>;
      default:
        return <div className="w-4 h-4 bg-gray-500 rounded"></div>;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      running: 'bg-green-100 text-green-800',
      stopped: 'bg-yellow-100 text-yellow-800',
      terminated: 'bg-red-100 text-red-800',
      creating: 'bg-blue-100 text-blue-800',
      deleting: 'bg-orange-100 text-orange-800'
    };

    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const getComplianceBadge = (status?: string) => {
    if (!status) return null;

    const complianceColors: Record<string, string> = {
      compliant: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      non_compliant: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={complianceColors[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const getSecurityScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CMDB Dashboard</h1>
          <p className="text-muted-foreground">
            Configuration Management Database - Resource Inventory & Compliance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={tenantId} onValueChange={setTenantId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Tenant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default Tenant</SelectItem>
              <SelectItem value="tenant-1">Tenant 1</SelectItem>
              <SelectItem value="tenant-2">Tenant 2</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_resources || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all cloud providers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.total_monthly_cost?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total cloud spend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Public Resources</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.public_resources || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Security exposure risk
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Issues</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.compliance_issues || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Policy violations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
          <CardDescription>
            Find resources by name, tags, or other criteria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Search resources by name, tags, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="cloud-provider">Cloud Provider</Label>
              <Select value={filters.cloud_provider} onValueChange={(value) => handleFilterChange('cloud_provider', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Providers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Providers</SelectItem>
                  <SelectItem value="aws">AWS</SelectItem>
                  <SelectItem value="azure">Azure</SelectItem>
                  <SelectItem value="gcp">GCP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="resource-type">Resource Type</Label>
              <Select value={filters.resource_type} onValueChange={(value) => handleFilterChange('resource_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="ec2_instance">EC2 Instance</SelectItem>
                  <SelectItem value="rds_instance">RDS Instance</SelectItem>
                  <SelectItem value="vm">VM</SelectItem>
                  <SelectItem value="lambda_function">Lambda Function</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="region">Region</Label>
              <Select value={filters.region} onValueChange={(value) => handleFilterChange('region', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Regions</SelectItem>
                  <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                  <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                  <SelectItem value="eu-west-1">Europe (Ireland)</SelectItem>
                  <SelectItem value="eastus">East US</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="public-exposure">Public Exposure</Label>
              <Select value={filters.public_exposure} onValueChange={(value) => handleFilterChange('public_exposure', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Resources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Resources</SelectItem>
                  <SelectItem value="true">Public Only</SelectItem>
                  <SelectItem value="false">Private Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
          <CardDescription>
            {resources.length} resources found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Cloud</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Security</TableHead>
                <TableHead>Compliance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getResourceTypeIcon(resource.resource_type)}
                      <div>
                        <div className="font-medium">{resource.name}</div>
                        <div className="text-sm text-muted-foreground">{resource.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {resource.resource_type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getCloudProviderIcon(resource.cloud_provider)}
                      <span className="capitalize">{resource.cloud_provider}</span>
                    </div>
                  </TableCell>
                  <TableCell>{resource.region}</TableCell>
                  <TableCell>{getStatusBadge(resource.status)}</TableCell>
                  <TableCell>{resource.owner || '-'}</TableCell>
                  <TableCell>{resource.team || '-'}</TableCell>
                  <TableCell>{resource.project || '-'}</TableCell>
                  <TableCell>
                    {resource.monthly_cost ? `$${resource.monthly_cost.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell>
                    {resource.security_score ? (
                      <span className={getSecurityScoreColor(resource.security_score)}>
                        {resource.security_score}/100
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {getComplianceBadge(resource.compliance_status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(pagination.page - 1)}
                    className={pagination.page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink>{pagination.page}</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(pagination.page + 1)}
                    className={pagination.page * pagination.limit >= pagination.total ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* Provider Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resources by Cloud Provider</CardTitle>
            <CardDescription>Distribution across AWS, Azure, and GCP</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.resources_by_provider && Object.entries(stats.resources_by_provider).map(([provider, count]) => (
                <div key={provider} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getCloudProviderIcon(provider)}
                    <span className="capitalize">{provider}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(count / (stats?.total_resources || 1)) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resources by Type</CardTitle>
            <CardDescription>Most common resource types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.resources_by_type && Object.entries(stats.resources_by_type)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getResourceTypeIcon(type)}
                      <span className="capitalize">{type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${(count / (stats?.total_resources || 1)) * 100}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CMDBDashboard;
