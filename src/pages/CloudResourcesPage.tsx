
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, PlusCircle } from 'lucide-react';

// Import custom hooks
import { useCloudResources } from '@/hooks/useCloudResources';
import { useResourceFilters } from '@/hooks/useResourceFilters';
import { useResourceDetails } from '@/hooks/useResourceDetails';
import { useCloudProvider } from '@/hooks/useCloudProvider';

// Import components
import ConnectedAccounts from '@/components/cloud/ConnectedAccounts';
import ResourceInventory from '@/components/cloud/ResourceInventory';
import ResourceDetailsModal from '@/components/cloud/ResourceDetailsModal';
import ConnectProviderDialog from '@/components/cloud/ConnectProviderDialog';
import ResourceFilters from '@/components/cloud/ResourceFilters';

const CloudResourcesPage: React.FC = () => {
  // Use our custom hooks
  const { resources, accounts, loading, fetchResources } = useCloudResources();
  const {
    filters,
    filteredResources,
    typeOptions,
    regionOptions,
    statusOptions,
    handleFilterChange,
    handleFilterRemove,
    clearFilters
  } = useResourceFilters(resources);
  
  const {
    selectedResource,
    setSelectedResource,
    resourceDetails,
    detailsLoading,
    handleViewDetails
  } = useResourceDetails();
  
  const {
    connectDialogOpen,
    setConnectDialogOpen,
    connecting,
    handleConnectProvider
  } = useCloudProvider(fetchResources); // Pass the fetchResources as a success callback

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

      {/* Resource Filters Component */}
      <ResourceFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        typeOptions={typeOptions}
        regionOptions={regionOptions}
        statusOptions={statusOptions}
      />

      {/* Resource Inventory Component */}
      <ResourceInventory 
        resources={filteredResources} 
        loading={loading} 
        onViewDetails={handleViewDetails}
        filters={filters}
        onFilterRemove={handleFilterRemove}
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
