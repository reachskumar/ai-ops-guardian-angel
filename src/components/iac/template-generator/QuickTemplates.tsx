
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Server, Database, Network, Cloud } from 'lucide-react';

const QuickTemplates: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Templates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex flex-col">
            <Server className="h-6 w-6 mb-2" />
            Compute Instance
          </Button>
          <Button variant="outline" className="h-20 flex flex-col">
            <Database className="h-6 w-6 mb-2" />
            Database Setup
          </Button>
          <Button variant="outline" className="h-20 flex flex-col">
            <Network className="h-6 w-6 mb-2" />
            Network Config
          </Button>
          <Button variant="outline" className="h-20 flex flex-col">
            <Cloud className="h-6 w-6 mb-2" />
            Full Stack
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickTemplates;
