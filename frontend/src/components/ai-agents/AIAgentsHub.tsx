import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Bot, Play, Pause, Settings } from 'lucide-react';

const AIAgentsHub: React.FC = () => {
  const agents = [
    {
      id: 1,
      name: 'Cost Optimization Agent',
      status: 'active',
      description: 'Automatically optimizes cloud costs and identifies savings opportunities',
      type: 'Cost Management',
      lastActive: '2 minutes ago'
    },
    {
      id: 2,
      name: 'Security Monitoring Agent',
      status: 'active',
      description: 'Monitors security threats and compliance violations in real-time',
      type: 'Security',
      lastActive: '5 minutes ago'
    },
    {
      id: 3,
      name: 'Resource Scaling Agent',
      status: 'idle',
      description: 'Automatically scales resources based on demand and performance metrics',
      type: 'Infrastructure',
      lastActive: '1 hour ago'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'idle':
        return <Badge variant="secondary">Idle</Badge>;
      default:
        return <Badge variant="outline">Inactive</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Agents Hub</h1>
          <p className="text-muted-foreground">Manage and monitor your AI agents</p>
        </div>
        <Button>
          <Bot className="mr-2 h-4 w-4" />
          Deploy Agent
        </Button>
      </div>

      <div className="grid gap-4">
        {agents.map((agent) => (
          <Card key={agent.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bot className="h-5 w-5 text-blue-500" />
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <CardDescription>{agent.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(agent.status)}
                  <Badge variant="outline">{agent.type}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="font-medium capitalize">{agent.status}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <p className="font-medium">{agent.type}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Active:</span>
                  <p className="font-medium">{agent.lastActive}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Actions:</span>
                  <div className="flex items-center space-x-1">
                    {agent.status === 'active' ? (
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AIAgentsHub; 