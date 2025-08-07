import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Shield, AlertTriangle, CheckCircle, Eye } from 'lucide-react';

const SecurityDashboard: React.FC = () => {
  const securityMetrics = [
    {
      id: 1,
      name: 'Critical Vulnerabilities',
      count: 2,
      status: 'critical',
      description: 'High-priority security issues requiring immediate attention'
    },
    {
      id: 2,
      name: 'Security Compliance',
      count: 95,
      status: 'good',
      description: 'Overall compliance score across all security policies'
    },
    {
      id: 3,
      name: 'Active Threats',
      count: 0,
      status: 'good',
      description: 'Currently detected active security threats'
    },
    {
      id: 4,
      name: 'Failed Access Attempts',
      count: 12,
      status: 'warning',
      description: 'Failed authentication attempts in the last 24 hours'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'good':
        return <Badge variant="default" className="bg-green-500">Good</Badge>;
      default:
        return <Badge variant="secondary">Warning</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">Monitor security posture and compliance across your infrastructure</p>
        </div>
        <Button>
          <Shield className="mr-2 h-4 w-4" />
          Security Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {securityMetrics.map((metric) => (
          <Card key={metric.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(metric.status)}
                  <CardTitle className="text-lg">{metric.name}</CardTitle>
                </div>
                {getStatusBadge(metric.status)}
              </div>
              <CardDescription>{metric.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.count}</div>
              <div className="flex items-center space-x-2 mt-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SecurityDashboard; 