
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Network, Plus, Settings } from 'lucide-react';
import { NetworkConnection } from './types';
import { getProviderColor } from './utils';

interface NetworkConnectionsListProps {
  connections: NetworkConnection[];
  onCreateConnection: () => void;
}

const NetworkConnectionsList: React.FC<NetworkConnectionsListProps> = ({ 
  connections, 
  onCreateConnection 
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Network Connections</CardTitle>
          <CardDescription>
            Manage connections between your cloud providers
          </CardDescription>
        </div>
        <Button onClick={onCreateConnection}>
          <Plus className="mr-2 h-4 w-4" />
          Create Connection
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {connections.map((connection) => (
            <div key={connection.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Network className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">{connection.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getProviderColor(connection.sourceProvider)}>
                        {connection.sourceProvider.toUpperCase()}
                      </Badge>
                      <span className="text-muted-foreground">→</span>
                      <Badge className={getProviderColor(connection.targetProvider)}>
                        {connection.targetProvider.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={
                    connection.status === 'connected' ? 'default' :
                    connection.status === 'connecting' ? 'secondary' : 'destructive'
                  }>
                    {connection.status}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <p className="font-medium capitalize">{connection.type.replace('-', ' ')}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Bandwidth:</span>
                  <p className="font-medium">{connection.bandwidth}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Latency:</span>
                  <p className="font-medium">{connection.latency}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NetworkConnectionsList;
