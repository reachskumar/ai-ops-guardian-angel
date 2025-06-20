
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const TemplatesTab: React.FC = () => {
  const templates = [
    {
      name: 'Standard Web App Stack',
      description: 'Load balancer + Auto Scaling Group + RDS',
      cost: '₹450/month',
      compliance: 'CIS Level 1'
    },
    {
      name: 'AI/ML Workspace',
      description: 'GPU instances + Jupyter + TensorFlow',
      cost: '₹1,200/month',
      compliance: 'GDPR Ready'
    },
    {
      name: 'Development Environment',
      description: 'Small instances with 7-day TTL',
      cost: '₹150/month',
      compliance: 'Auto-approved'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Infrastructure Templates & Blueprints</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">{template.cost}</Badge>
                    <Badge variant="secondary">{template.compliance}</Badge>
                  </div>
                  <Button size="sm" className="w-full">Deploy Template</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplatesTab;
