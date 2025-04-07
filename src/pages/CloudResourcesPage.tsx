
import React, { useState, useEffect } from 'react';
import { 
  getCloudAccounts, 
  getCloudResources, 
  getResourceDetails,
  connectCloudProvider,
  CloudResource, 
  CloudAccount
} from '@/services/cloudProviderService';
import { Button } from '@/components/ui/button';
import { RefreshCw, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

// Import our newly created components
import ConnectedAccounts from '@/components/cloud/ConnectedAccounts';
import ResourceInventory from '@/components/cloud/ResourceInventory';
import ResourceDetailsModal from '@/components/cloud/ResourceDetailsModal';
import ConnectProviderDialog from '@/components/cloud/ConnectProviderDialog';

const CloudResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<CloudResource[]>([]);
  const [accounts, setAccounts] = useState<CloudAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<CloudResource | null>(null);
  const [resourceDetails, setResourceDetails] = useState<{resource: CloudResource | null, metrics: any[]}>({
    resource: null,
    metrics: []
  });
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const { toast } = useToast();

  // Define the form schema with Zod
  const formSchema = z.object({
    provider: z.enum(['aws', 'azure', 'gcp'] as const),
    name: z.string().min(3, "Name must be at least 3 characters"),
    credentials: z.record(z.string())
  });

  // Fetch resources and accounts
  const fetchResources = async () => {
    setLoading(true);
    try {
      const accountsResult = await getCloudAccounts();
      const resourcesResult = await getCloudResources();
      
      setAccounts(accountsResult);
      setResources(resourcesResult.resources);
    } catch (error) {
      toast({
        title: "Error fetching resources",
        description: "Could not load cloud resources",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleViewDetails = async (resource: CloudResource) => {
    setSelectedResource(resource);
    setDetailsLoading(true);
    
    try {
      const details = await getResourceDetails(resource.id);
      setResourceDetails(details);
    } catch (error) {
      toast({
        title: "Error fetching resource details",
        description: "Could not load detailed information",
        variant: "destructive"
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  // Handle connecting a new cloud provider
  const handleConnectProvider = async (data: z.infer<typeof formSchema>) => {
    setConnecting(true);
    try {
      const result = await connectCloudProvider(
        data.provider,
        data.credentials,
        data.name
      );
      
      if (result.success) {
        toast({
          title: "Provider Connected",
          description: `Successfully connected to ${data.name}`,
        });
        setConnectDialogOpen(false);
        // Refresh the accounts list
        fetchResources();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to cloud provider",
        variant: "destructive"
      });
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cloud Resources</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={fetchResources}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> 
            Refresh Resources
          </Button>
          <Button onClick={() => setConnectDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> 
            Connect Provider
          </Button>
        </div>
      </div>

      {/* Connected Accounts Component */}
      <ConnectedAccounts 
        accounts={accounts} 
        onOpenConnectDialog={() => setConnectDialogOpen(true)} 
      />

      {/* Resource Inventory Component */}
      <ResourceInventory 
        resources={resources} 
        loading={loading} 
        onViewDetails={handleViewDetails} 
      />

      {/* Resource Details Modal Component */}
      <ResourceDetailsModal 
        isOpen={selectedResource !== null}
        onOpenChange={(open) => !open && setSelectedResource(null)}
        selectedResource={selectedResource}
        resourceDetails={resourceDetails}
        detailsLoading={detailsLoading}
      />

      {/* Connect Provider Dialog Component */}
      <ConnectProviderDialog
        open={connectDialogOpen}
        onOpenChange={setConnectDialogOpen}
        onConnectProvider={handleConnectProvider}
        connecting={connecting}
      />
    </div>
  );
};

export default CloudResourcesPage;
