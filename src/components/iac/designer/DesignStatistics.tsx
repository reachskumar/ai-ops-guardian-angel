
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResourceNode, Connection } from './types';

interface DesignStatisticsProps {
  resources: ResourceNode[];
  connections: Connection[];
}

const DesignStatistics: React.FC<DesignStatisticsProps> = ({ resources, connections }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Design Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{resources.length}</div>
            <div className="text-sm text-muted-foreground">Total Resources</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{connections.length}</div>
            <div className="text-sm text-muted-foreground">Connections</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{new Set(resources.map(r => r.type)).size}</div>
            <div className="text-sm text-muted-foreground">Resource Types</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {resources.length > 0 ? 'Ready' : 'Empty'}
            </div>
            <div className="text-sm text-muted-foreground">Design Status</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DesignStatistics;
