
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CloudResource, CloudAccount } from '@/services/cloud/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Cloud, Server, Database, HardDrive, DollarSign, TrendingUp } from 'lucide-react';

interface UnifiedDashboardProps {
  resources: CloudResource[];
  accounts: CloudAccount[];
  loading: boolean;
}

const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({ resources, accounts, loading }) => {
  const dashboardData = useMemo(() => {
    const providerCounts = accounts.reduce((acc, account) => {
      acc[account.provider] = (acc[account.provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const resourcesByProvider = resources.reduce((acc, resource) => {
      const account = accounts.find(a => a.id === resource.cloud_account_id);
      if (account) {
        acc[account.provider] = (acc[account.provider] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const resourcesByType = resources.reduce((acc, resource) => {
      acc[resource.type] = (acc[resource.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      providerCounts,
      resourcesByProvider,
      resourcesByType,
      totalResources: resources.length,
      totalAccounts: accounts.length
    };
  }, [resources, accounts]);

  const providerColors = {
    aws: '#FF9900',
    azure: '#0078D4',
    gcp: '#4285F4'
  };

  const chartData = Object.entries(dashboardData.resourcesByProvider).map(([provider, count]) => ({
    provider: provider.toUpperCase(),
    resources: count,
    fill: providerColors[provider as keyof typeof providerColors] || '#8884d8'
  }));

  const pieData = Object.entries(dashboardData.resourcesByType).map(([type, count]) => ({
    name: type,
    value: count
  }));

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(8).fill(0).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cloud Accounts</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalAccounts}</div>
            <div className="flex gap-2 mt-2">
              {Object.entries(dashboardData.providerCounts).map(([provider, count]) => (
                <Badge key={provider} variant="outline" className="text-xs">
                  {provider.toUpperCase()}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalResources}</div>
            <p className="text-xs text-muted-foreground">
              Across all cloud providers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Optimization</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$2,340</div>
            <p className="text-xs text-muted-foreground">
              Potential monthly savings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cross-Cloud Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">
              Resource utilization score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resources by Cloud Provider</CardTitle>
            <CardDescription>Distribution of resources across your cloud accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="provider" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="resources" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Types Distribution</CardTitle>
            <CardDescription>Breakdown of resource types across all providers</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Provider Health Status */}
      <Card>
        <CardHeader>
          <CardTitle>Multi-Cloud Health Status</CardTitle>
          <CardDescription>Real-time status of your cloud provider connections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    account.status === 'connected' ? 'bg-green-500' : 
                    account.status === 'disconnected' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <h4 className="font-medium">{account.name}</h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {account.provider} • {account.status}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {dashboardData.resourcesByProvider[account.provider] || 0} Resources
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last sync: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedDashboard;
