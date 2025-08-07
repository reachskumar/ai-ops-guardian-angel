import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Monitor, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const MonitoringCenter: React.FC = () => {
  const services = [
    {
      id: 1,
      name: 'Web Application',
      status: 'healthy',
      uptime: '99.9%',
      responseTime: '120ms',
      lastCheck: '2 minutes ago'
    },
    {
      id: 2,
      name: 'Database Cluster',
      status: 'warning',
      uptime: '98.5%',
      responseTime: '450ms',
      lastCheck: '1 minute ago'
    },
    {
      id: 3,
      name: 'Load Balancer',
      status: 'healthy',
      uptime: '100%',
      responseTime: '50ms',
      lastCheck: '30 seconds ago'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-500">Healthy</Badge>;
      case 'warning':
        return <Badge variant="secondary">Warning</Badge>;
      default:
        return <Badge variant="destructive">Critical</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoring Center</h1>
          <p className="text-muted-foreground">Real-time monitoring and alerting for your infrastructure</p>
        </div>
        <Button>
          <Monitor className="mr-2 h-4 w-4" />
          View Alerts
        </Button>
      </div>

      <div className="grid gap-4">
        {services.map((service) => (
          <Card key={service.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription>Last check: {service.lastCheck}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(service.status)}
                  <Badge variant="outline">{service.uptime} uptime</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="font-medium capitalize">{service.status}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Uptime:</span>
                  <p className="font-medium">{service.uptime}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Response Time:</span>
                  <p className="font-medium">{service.responseTime}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Actions:</span>
                  <div className="flex items-center space-x-1">
                    <Button size="sm" variant="outline">
                      <Monitor className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      View Logs
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MonitoringCenter; 