import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Play, Pause, Settings, BarChart3 } from 'lucide-react';

const LangGraphWorkflows: React.FC = () => {
  const workflows = [
    {
      id: 1,
      name: 'Infrastructure Provisioning Flow',
      status: 'running',
      description: 'Automated infrastructure provisioning with AI-driven optimization',
      steps: 8,
      lastRun: '2024-01-15 10:30 AM',
      successRate: 95
    },
    {
      id: 2,
      name: 'Cost Optimization Pipeline',
      status: 'idle',
      description: 'Continuous cost monitoring and optimization recommendations',
      steps: 12,
      lastRun: '2024-01-14 02:15 PM',
      successRate: 88
    },
    {
      id: 3,
      name: 'Security Compliance Check',
      status: 'running',
      description: 'Automated security compliance validation and remediation',
      steps: 6,
      lastRun: '2024-01-13 09:45 AM',
      successRate: 92
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge variant="default" className="bg-green-500">Running</Badge>;
      case 'idle':
        return <Badge variant="secondary">Idle</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">LangGraph Workflows</h1>
          <p className="text-muted-foreground">AI-powered workflow automation with LangGraph</p>
        </div>
        <Button>
          <Settings className="mr-2 h-4 w-4" />
          Workflow Settings
        </Button>
      </div>

      <div className="grid gap-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  <div>
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    <CardDescription>{workflow.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(workflow.status)}
                  <div className="flex items-center space-x-1">
                    {workflow.status === 'running' ? (
                      <Button size="sm" variant="outline">
                        <Pause className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Steps:</span>
                  <p className="font-medium">{workflow.steps}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Run:</span>
                  <p className="font-medium">{workflow.lastRun}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Success Rate:</span>
                  <p className="font-medium">{workflow.successRate}%</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="font-medium capitalize">{workflow.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LangGraphWorkflows; 