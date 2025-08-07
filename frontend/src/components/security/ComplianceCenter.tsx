import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const ComplianceCenter: React.FC = () => {
  const complianceFrameworks = [
    {
      id: 1,
      name: 'SOC 2 Type II',
      status: 'compliant',
      score: 98,
      lastAudit: '2024-01-15',
      nextAudit: '2024-07-15'
    },
    {
      id: 2,
      name: 'ISO 27001',
      status: 'in_progress',
      score: 85,
      lastAudit: '2024-01-10',
      nextAudit: '2024-04-10'
    },
    {
      id: 3,
      name: 'GDPR',
      status: 'compliant',
      score: 100,
      lastAudit: '2024-01-05',
      nextAudit: '2024-12-05'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant':
        return <Badge variant="default" className="bg-green-500">Compliant</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      default:
        return <Badge variant="destructive">Non-Compliant</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Compliance Center</h1>
          <p className="text-muted-foreground">Monitor and manage compliance across multiple frameworks</p>
        </div>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>

      <div className="grid gap-4">
        {complianceFrameworks.map((framework) => (
          <Card key={framework.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(framework.status)}
                  <div>
                    <CardTitle className="text-lg">{framework.name}</CardTitle>
                    <CardDescription>Compliance score: {framework.score}%</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(framework.status)}
                  <Badge variant="outline">{framework.score}%</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="font-medium capitalize">{framework.status.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Score:</span>
                  <p className="font-medium">{framework.score}%</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Audit:</span>
                  <p className="font-medium">{framework.lastAudit}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Next Audit:</span>
                  <p className="font-medium">{framework.nextAudit}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ComplianceCenter; 