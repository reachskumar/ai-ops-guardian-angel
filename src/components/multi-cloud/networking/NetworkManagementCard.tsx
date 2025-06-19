
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Network, Globe } from 'lucide-react';

interface NetworkManagementCardProps {
  onShowConfiguration: () => void;
}

const NetworkManagementCard: React.FC<NetworkManagementCardProps> = ({ onShowConfiguration }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Network Management</CardTitle>
        <CardDescription>
          Configure and manage your multi-cloud network infrastructure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={onShowConfiguration}
            className="h-20 flex flex-col items-center justify-center"
          >
            <Network className="h-6 w-6 mb-2" />
            Configure VPN Connections
          </Button>
          <Button 
            variant="outline"
            onClick={onShowConfiguration}
            className="h-20 flex flex-col items-center justify-center"
          >
            <Globe className="h-6 w-6 mb-2" />
            Manage DNS Zones
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NetworkManagementCard;
