import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Clock, User, CheckCircle, AlertCircle } from 'lucide-react';

const HITLWorkflows: React.FC = () => {
  const workflows = [
    {
      id: 1,
      name: 'AWS Resource Provisioning',
      status: 'pending_approval',
      requester: 'john.doe@company.com',
      description: 'Provision EC2 instance for development team',
      createdAt: '2024-01-15 10:30 AM',
      priority: 'high'
    },
    {
      id: 2,
      name: 'Cost Optimization Changes',
      status: 'approved',
      requester: 'jane.smith@company.com',
      description: 'Implement cost optimization recommendations',
      createdAt: '2024-01-14 02:15 PM',
      priority: 'medium'
    },
    {
      id: 3,
      name: 'Security Policy Update',
      status: 'rejected',
      requester: 'admin@company.com',
      description: 'Update security group rules for production',
      createdAt: '2024-01-13 09:45 AM',
      priority: 'critical'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending Approval</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Human-in-the-Loop Workflows</h1>
          <p className="text-muted-foreground">Review and approve AI-driven infrastructure changes</p>
        </div>
        <Button>
          <User className="mr-2 h-4 w-4" />
          My Approvals
        </Button>
      </div>

      <div className="grid gap-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(workflow.status)}
                  <div>
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    <CardDescription>{workflow.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(workflow.status)}
                  <Badge variant="outline">{workflow.priority}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Requester:</span>
                  <p className="font-medium">{workflow.requester}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <p className="font-medium">{workflow.createdAt}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Priority:</span>
                  <p className="font-medium capitalize">{workflow.priority}</p>
                </div>
              </div>
              
              {workflow.status === 'pending_approval' && (
                <div className="flex items-center space-x-2 mt-4">
                  <Button size="sm" className="bg-green-500 hover:bg-green-600">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button size="sm" variant="outline">
                    Request Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HITLWorkflows; 