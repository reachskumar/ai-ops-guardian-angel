import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Brain, Play, Pause, Download } from 'lucide-react';

const ModelTraining: React.FC = () => {
  const trainingJobs = [
    {
      id: 1,
      name: 'Cost Optimization Model v3.1',
      status: 'training',
      progress: 75,
      accuracy: 91.2,
      estimatedTime: '2 hours remaining'
    },
    {
      id: 2,
      name: 'Security Anomaly Detection',
      status: 'completed',
      progress: 100,
      accuracy: 94.8,
      estimatedTime: 'Completed'
    },
    {
      id: 3,
      name: 'Resource Prediction Model',
      status: 'queued',
      progress: 0,
      accuracy: 0,
      estimatedTime: 'Pending'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'training':
        return <Badge variant="secondary">Training</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      default:
        return <Badge variant="outline">Queued</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Model Training</h1>
          <p className="text-muted-foreground">Train and manage machine learning models</p>
        </div>
        <Button>
          <Brain className="mr-2 h-4 w-4" />
          Start Training
        </Button>
      </div>

      <div className="grid gap-4">
        {trainingJobs.map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Brain className="h-5 w-5 text-purple-500" />
                  <div>
                    <CardTitle className="text-lg">{job.name}</CardTitle>
                    <CardDescription>{job.estimatedTime}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(job.status)}
                  <Badge variant="outline">{job.accuracy}% accuracy</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Training Progress</span>
                    <span>{job.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        job.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${job.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-medium capitalize">{job.status}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Progress:</span>
                    <p className="font-medium">{job.progress}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Accuracy:</span>
                    <p className="font-medium">{job.accuracy}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Actions:</span>
                    <div className="flex items-center space-x-1">
                      {job.status === 'training' ? (
                        <Button size="sm" variant="outline">
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : job.status === 'completed' ? (
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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

export default ModelTraining; 