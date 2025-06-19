
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CloudAccount } from '@/services/cloud/types';
import { useToast } from '@/hooks/use-toast';
import NetworkingConfiguration from './networking/NetworkingConfiguration';
import NetworkOverviewCards from './networking/NetworkOverviewCards';
import NetworkManagementCard from './networking/NetworkManagementCard';
import NetworkConnectionsList from './networking/NetworkConnectionsList';
import DNSManagementCard from './networking/DNSManagementCard';
import NetworkSecurityCard from './networking/NetworkSecurityCard';
import { mockConnections } from './networking/types';

interface MultiCloudNetworkingProps {
  accounts: CloudAccount[];
}

const MultiCloudNetworking: React.FC<MultiCloudNetworkingProps> = ({ accounts }) => {
  const [showConfiguration, setShowConfiguration] = useState(false);
  const { toast } = useToast();

  // Mock connections data
  const [connections] = useState(mockConnections);

  const createConnection = () => {
    toast({
      title: "Create Connection",
      description: "Opening connection creation wizard...",
    });
    setShowConfiguration(true);
  };

  if (showConfiguration) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Network Configuration</h3>
          <Button variant="outline" onClick={() => setShowConfiguration(false)}>
            Back to Overview
          </Button>
        </div>
        <NetworkingConfiguration accounts={accounts} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <NetworkOverviewCards />
      <NetworkManagementCard onShowConfiguration={() => setShowConfiguration(true)} />
      <NetworkConnectionsList connections={connections} onCreateConnection={createConnection} />
      <DNSManagementCard />
      <NetworkSecurityCard />
    </div>
  );
};

export default MultiCloudNetworking;
