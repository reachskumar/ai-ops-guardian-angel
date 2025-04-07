
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarWithProvider } from '@/components/Sidebar';
import { RefreshCw, PlusCircle, Tag, Gauge, DollarSign, ChartBar, Cloud } from 'lucide-react';
import Header from '@/components/Header';

// Import custom hooks
import { useCloudResources } from '@/hooks/useCloudResources';
import { useResourceFilters } from '@/hooks/useResourceFilters';
import { useResourceDetails } from '@/hooks/useResourceDetails';
import { useCloudProvider } from '@/hooks/useCloudProvider';

// Import components
import { 
  ConnectedAccounts,
  ResourceInventory,
  ResourceDetailsModal,
  ConnectProviderDialog,
  ResourceFilters,
  ResourceProvisioningForm,
  ResourceTagsManager,
  CostAnalysisPanel,
  ResourceMetricsDashboard,
  CloudProviderIntegration
} from '@/components/cloud';

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
    resourceMetrics,
    metricsLoading,
    handleViewDetails,
    fetchResourceMetrics
  } = useResourceDetails();
  
  const {
    connectDialogOpen,
    setConnectDialogOpen,
    connecting,
    handleConnectProvider
  } = useCloudProvider(fetchResources);

  // State for new features
  const [activeTab, setActiveTab] = useState("inventory");
  const [provisioningDialogOpen, setProvisioningDialogOpen] = useState(false);
  
  // Handle resource provisioning dialog
  const handleOpenProvisioningDialog = () => {
    setProvisioningDialogOpen(true);
  };
  
  const handleProvisioningSuccess = () => {
    setProvisioningDialogOpen(false);
    fetchResources(); // Refresh resources list
  };

  return (
    <SidebarWithProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 p-6 space-y-6">
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
              <Button onClick={handleOpenProvisioningDialog}>
                <PlusCircle className="mr-2 h-4 w-4" /> 
                Provision Resource
              </Button>
            </div>
          </div>

          {/* Connected Accounts Component */}
          <ConnectedAccounts 
            accounts={accounts} 
            onOpenConnectDialog={() => setConnectDialogOpen(true)} 
          />

          {/* Main Tabs for Cloud Resources Features */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="inventory" className="flex items-center gap-1">
                <Cloud className="h-4 w-4" />
                <span>Inventory</span>
              </TabsTrigger>
              <TabsTrigger value="metrics" className="flex items-center gap-1">
                <Gauge className="h-4 w-4" />
                <span>Metrics</span>
              </TabsTrigger>
              <TabsTrigger value="costs" className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span>Cost Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="tags" className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                <span>Tags</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="inventory">
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
            </TabsContent>
            
            <TabsContent value="metrics">
              {selectedResource ? (
                <ResourceMetricsDashboard 
                  resourceId={selectedResource.id}
                  resourceType={selectedResource.type}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg">
                  <ChartBar className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-lg font-medium">No Resource Selected</h3>
                  <p className="text-muted-foreground mt-1 mb-4 text-center max-w-md">
                    Select a resource from the Inventory tab to view detailed metrics and performance information
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab("inventory")}>
                    Go to Inventory
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="costs">
              <CostAnalysisPanel />
            </TabsContent>
            
            <TabsContent value="tags">
              {selectedResource ? (
                <ResourceTagsManager 
                  resourceId={selectedResource.id}
                  initialTags={selectedResource.tags || {}}
                  onUpdate={fetchResources}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg">
                  <Tag className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-lg font-medium">No Resource Selected</h3>
                  <p className="text-muted-foreground mt-1 mb-4 text-center max-w-md">
                    Select a resource from the Inventory tab to manage its tags
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab("inventory")}>
                    Go to Inventory
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Resource Details Modal Component */}
          <ResourceDetailsModal 
            isOpen={selectedResource !== null}
            onOpenChange={(open) => !open && setSelectedResource(null)}
            selectedResource={selectedResource}
            resourceDetails={resourceDetails}
            detailsLoading={detailsLoading}
            resourceMetrics={resourceMetrics}
            metricsLoading={metricsLoading}
          />

          {/* Connect Provider Dialog Component */}
          <ConnectProviderDialog
            open={connectDialogOpen}
            onOpenChange={setConnectDialogOpen}
            onConnectProvider={handleConnectProvider}
            connecting={connecting}
          />
        </div>
      </div>
    </SidebarWithProvider>
  );
};

export default CloudResourcesPage;
