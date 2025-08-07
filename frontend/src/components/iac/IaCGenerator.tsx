import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Code, Download, Play, Settings } from 'lucide-react';

const IaCGenerator: React.FC = () => {
  const templates = [
    {
      id: 1,
      name: 'AWS EC2 Instance',
      description: 'Basic EC2 instance with security groups and IAM roles',
      provider: 'AWS',
      complexity: 'Simple',
      lastUsed: '2024-01-15'
    },
    {
      id: 2,
      name: 'Multi-Tier Application',
      description: 'Complete application stack with load balancer, app servers, and database',
      provider: 'AWS',
      complexity: 'Advanced',
      lastUsed: '2024-01-14'
    },
    {
      id: 3,
      name: 'Kubernetes Cluster',
      description: 'EKS cluster with worker nodes and monitoring',
      provider: 'AWS',
      complexity: 'Complex',
      lastUsed: '2024-01-13'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Infrastructure as Code Generator</h1>
          <p className="text-muted-foreground">Generate Terraform, CloudFormation, and ARM templates with AI</p>
        </div>
        <Button>
          <Code className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Code className="h-5 w-5 text-blue-500" />
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{template.provider}</Badge>
                  <Badge variant="secondary">{template.complexity}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Provider:</span>
                  <p className="font-medium">{template.provider}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Complexity:</span>
                  <p className="font-medium">{template.complexity}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Used:</span>
                  <p className="font-medium">{template.lastUsed}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Actions:</span>
                  <div className="flex items-center space-x-1">
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
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

export default IaCGenerator; 