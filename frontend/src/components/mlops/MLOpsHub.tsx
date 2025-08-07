import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Brain, Play, Pause, Settings } from 'lucide-react';

const MLOpsHub: React.FC = () => {
  const models = [
    {
      id: 1,
      name: 'Cost Prediction Model',
      status: 'running',
      accuracy: 94.2,
      lastTrained: '2024-01-15',
      version: 'v2.1.0'
    },
    {
      id: 2,
      name: 'Anomaly Detection',
      status: 'idle',
      accuracy: 89.7,
      lastTrained: '2024-01-10',
      version: 'v1.5.2'
    },
    {
      id: 3,
      name: 'Resource Optimization',
      status: 'training',
      accuracy: 91.3,
      lastTrained: '2024-01-12',
      version: 'v3.0.1'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge variant="default" className="bg-green-500">Running</Badge>;
      case 'training':
        return <Badge variant="secondary">Training</Badge>;
      default:
        return <Badge variant="outline">Idle</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">MLOps Hub</h1>
          <p className="text-muted-foreground">Manage machine learning models and pipelines</p>
        </div>
        <Button>
          <Brain className="mr-2 h-4 w-4" />
          Deploy Model
        </Button>
      </div>

      <div className="grid gap-4">
        {models.map((model) => (
          <Card key={model.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Brain className="h-5 w-5 text-purple-500" />
                  <div>
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                    <CardDescription>Version {model.version}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(model.status)}
                  <Badge variant="outline">{model.accuracy}% accuracy</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="font-medium capitalize">{model.status}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Accuracy:</span>
                  <p className="font-medium">{model.accuracy}%</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Trained:</span>
                  <p className="font-medium">{model.lastTrained}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Actions:</span>
                  <div className="flex items-center space-x-1">
                    {model.status === 'running' ? (
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

export default MLOpsHub; 