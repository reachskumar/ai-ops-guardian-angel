
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CloudResource, CloudAccount } from '@/services/cloud/types';
import { Cloud, DollarSign, Server, Database, HardDrive, TrendingUp, AlertTriangle } from 'lucide-react';
import CostOptimizationEngine from './cost/CostOptimizationEngine';
import ResourceDependencyMap from './dependencies/ResourceDependencyMap';

interface UnifiedDashboardProps {
  resources: CloudResource[];
  accounts: CloudAccount[];
  loading: boolean;
}

const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({ resources, accounts, loading }) => {
  const [activeView, setActiveView] = useState<'overview' | 'cost' | 'dependencies'>('overview');

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  const getProviderStats = () => {
    const stats = accounts.reduce((acc, account) => {
      const providerResources = resources.filter(r => r.cloud_account_id === account.id);
      acc[account.provider] = (acc[account.provider] || 0) + providerResources.length;
      return acc;
    }, {} as Record<string, number>);
    
    return stats;
  };

  const providerStats = getProviderStats();
  const totalResources = resources.length;
  const totalCost = 12500; // Mock total cost
  const costSavings = 3200; // Mock savings

  if (activeView === 'cost') {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Cost Optimization</h3>
          <Button variant="outline" onClick={() => setActiveView('overview')}>
            Back to Overview
          </Button>
        </div>
        <CostOptimizationEngine resources={resources} accounts={accounts} />
      </div>
    );
  }

  if (activeView === 'dependencies') {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Resource Dependencies</h3>
          <Button variant="outline" onClick={() => setActiveView('overview')}>
            Back to Overview
          </Button>
        </div>
        <ResourceDependencyMap resources={resources} accounts={accounts} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Multi-Cloud Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResources}</div>
            <p className="text-xs text-muted-foreground">
              Across {accounts.length} cloud providers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all providers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${costSavings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Monthly optimization savings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94%</div>
            <p className="text-xs text-muted-foreground">
              Overall system health
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Provider Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Distribution</CardTitle>
          <CardDescription>
            Resources distributed across cloud providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(providerStats).map(([provider, count]) => (
              <div key={provider} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Cloud className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium capitalize">{provider}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{count} resources</Badge>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(count / totalResources) * 100}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cost Optimization
            </CardTitle>
            <CardDescription>
              AI-powered cost optimization recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Get personalized recommendations to reduce your cloud spending by up to 40%.
            </p>
            <Button onClick={() => setActiveView('cost')} className="w-full">
              View Optimization
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Resource Dependencies
            </CardTitle>
            <CardDescription>
              Visualize cross-cloud resource relationships
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Map and monitor dependencies between resources across different cloud providers.
            </p>
            <Button onClick={() => setActiveView('dependencies')} variant="outline" className="w-full">
              View Dependencies
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Health Monitoring
            </CardTitle>
            <CardDescription>
              Real-time health across all clouds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Monitor the health and performance of your multi-cloud infrastructure.
            </p>
            <Button variant="outline" className="w-full">
              View Health Status
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UnifiedDashboard;
