import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Bot, Activity, Settings, Play, Pause } from 'lucide-react';
import { useParams } from 'react-router-dom';

const AgentDetails: React.FC = () => {
  const { agentId } = useParams();
  
  const agent = {
    id: agentId,
    name: 'Cost Optimization Agent',
    description: 'Automatically optimizes cloud costs and identifies savings opportunities',
    status: 'active',
    type: 'Cost Management',
    lastActive: '2 minutes ago',
    metrics: {
      costSavings: '$12,450',
      optimizationRate: '94%',
      resourcesAnalyzed: 156,
      recommendations: 23
    },
    capabilities: [
      'Real-time cost analysis',
      'ML-based forecasting',
      'Resource rightsizing',
      'Multi-cloud optimization'
    ]
  };

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
          <h1 className="text-3xl font-bold">{agent.name}</h1>
          <p className="text-muted-foreground">{agent.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(agent.status)}
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Configure
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cost Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{agent.metrics.costSavings}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Optimization Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agent.metrics.optimizationRate}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resources Analyzed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agent.metrics.resourcesAnalyzed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agent.metrics.recommendations}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Agent Capabilities</CardTitle>
            <CardDescription>Current capabilities and features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {agent.capabilities.map((capability, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Bot className="h-4 w-4 text-blue-500" />
                  <span>{capability}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agent Status</CardTitle>
            <CardDescription>Current status and activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <span className="font-medium capitalize">{agent.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Type:</span>
                <span className="font-medium">{agent.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Active:</span>
                <span className="font-medium">{agent.lastActive}</span>
              </div>
              <div className="flex items-center space-x-2 pt-4">
                {agent.status === 'active' ? (
                  <Button variant="outline">
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </Button>
                ) : (
                  <Button variant="outline">
                    <Play className="mr-2 h-4 w-4" />
                    Start
                  </Button>
                )}
                <Button variant="outline">
                  <Activity className="mr-2 h-4 w-4" />
                  View Logs
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentDetails; 