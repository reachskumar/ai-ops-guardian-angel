import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const IaCValidator: React.FC = () => {
  const validations = [
    {
      id: 1,
      name: 'terraform/main.tf',
      status: 'passed',
      issues: 0,
      warnings: 2,
      lastValidated: '2024-01-15 10:30 AM'
    },
    {
      id: 2,
      name: 'cloudformation/template.yaml',
      status: 'failed',
      issues: 3,
      warnings: 1,
      lastValidated: '2024-01-14 02:15 PM'
    },
    {
      id: 3,
      name: 'azure/main.bicep',
      status: 'passed',
      issues: 0,
      warnings: 0,
      lastValidated: '2024-01-13 09:45 AM'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return <Badge variant="default" className="bg-green-500">Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Warning</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">IaC Validator</h1>
          <p className="text-muted-foreground">Validate Terraform, CloudFormation, and ARM templates</p>
        </div>
        <Button>
          <CheckCircle className="mr-2 h-4 w-4" />
          Validate All
        </Button>
      </div>

      <div className="grid gap-4">
        {validations.map((validation) => (
          <Card key={validation.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(validation.status)}
                  <div>
                    <CardTitle className="text-lg">{validation.name}</CardTitle>
                    <CardDescription>Last validated: {validation.lastValidated}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(validation.status)}
                  <Badge variant="outline">{validation.issues} issues</Badge>
                  <Badge variant="secondary">{validation.warnings} warnings</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="font-medium capitalize">{validation.status}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Issues:</span>
                  <p className="font-medium">{validation.issues}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Warnings:</span>
                  <p className="font-medium">{validation.warnings}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Actions:</span>
                  <div className="flex items-center space-x-1">
                    <Button size="sm" variant="outline">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      View Details
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

export default IaCValidator; 