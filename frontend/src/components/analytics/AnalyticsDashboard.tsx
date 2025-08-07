import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { BarChart3, TrendingUp, TrendingDown, Activity } from 'lucide-react';

const AnalyticsDashboard: React.FC = () => {
  const metrics = [
    {
      id: 1,
      name: 'Total Cost',
      value: '$12,450',
      change: '+15%',
      trend: 'up',
      description: 'Monthly cloud infrastructure costs'
    },
    {
      id: 2,
      name: 'Resource Utilization',
      value: '78%',
      change: '+5%',
      trend: 'up',
      description: 'Average CPU and memory utilization'
    },
    {
      id: 3,
      name: 'Security Score',
      value: '92',
      change: '-2%',
      trend: 'down',
      description: 'Overall security compliance score'
    },
    {
      id: 4,
      name: 'Uptime',
      value: '99.9%',
      change: '+0.1%',
      trend: 'up',
      description: 'System availability this month'
    }
  ];

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive analytics and insights for your infrastructure</p>
        </div>
        <Button>
          <BarChart3 className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">{metric.name}</CardTitle>
                </div>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(metric.trend)}
                  <Badge variant="outline">{metric.change}</Badge>
                </div>
              </div>
              <CardDescription>{metric.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 