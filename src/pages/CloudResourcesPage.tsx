
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarWithProvider } from '@/components/Sidebar';
import { RefreshCw, PlusCircle, Tag, Gauge, DollarSign, ChartBar, Cloud, FileCode, Activity, Settings } from 'lucide-react';
import Header from '@/components/Header';

// Import custom hooks
import { useCloudResources } from '@/hooks/useCloudResources';
import { useResourceFilters } from '@/hooks/useResourceFilters';
import { useResourceDetails } from '@/hooks/useResourceDetails';
import { useCloudProvider } from '@/hooks/useCloudProvider';

// Import components
import { 
  ConnectedAccounts,
  ResourceDetailsModal,
  ConnectProviderDialog,
  InventoryTab,
  MetricsTab,
  CostAnalysisTab,
  TagsTab,
  IaCTab,
  ConnectionErrorAlert
} from '@/components/cloud';

// Import new management components
import ResourceManagementPanel from '@/components/cloud/ResourceManagementPanel';
import RealTimeResourceMonitor from '@/components/cloud/RealTimeResourceMonitor';

// Import ResourceProvisioningDialog
import ResourceProvisioningDialog from '@/components/cloud/ResourceProvisioningDialog';

const CloudResourcesPage: React.FC = () => {
  // Use our custom hooks
  const { 
    resources, 
    accounts, 
    loading, 
    fetchResources, 
    syncResources, 
    deleteAccount,
    syncStatus,
    syncErrorMessages
  } = useCloudResources();
  
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
  
  // State for connection errors and syncing
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Effect to log accounts whenever they change
  useEffect(() => {
    console.log("Accounts in CloudResourcesPage:", accounts);
  }, [accounts]);
  
  const {
    connectDialogOpen,
    setConnectDialogOpen,
    connecting,
    handleConnectProvider
  } = useCloudProvider(() => {
    console.log("Connection successful callback triggered");
    fetchResources();
    setConnectionError(null);
  });

  // State for new features
  const [activeTab, setActiveTab] = useState("inventory");
  const [provisioningDialogOpen, setProvisioningDialogOpen] = useState(false);
  const [managementMode, setManagementMode] = useState(false);
  
  // Handle opening provisioning dialog
  const handleOpenProvisioningDialog = () => {
    if (accounts.length === 0) {
      setConnectionError("You need to connect a cloud provider account before provisioning resources.");
      setConnectDialogOpen(true);
      return;
    }
    setProvisioningDialogOpen(true);
  };
  
  const handleProvisioningSuccess = () => {
    setProvisioningDialogOpen(false);
    // Wait briefly then fetch resources to allow backend to process
    setTimeout(() => {
      fetchResources();
    }, 1000);
  };
  
  // Handle resource action completion (start, stop, delete, etc.)
  const handleResourceActionComplete = () => {
    // Refresh resources to show updated status
    fetchResources();
    
    // If the resource was deleted, close the details modal
    if (selectedResource) {
      const resourceStillExists = resources.some(r => r.id === selectedResource.id);
      if (!resourceStillExists) {
        setSelectedResource(null);
      }
    }
  };
  
  // Handle connection error
  const handleConnectionFailure = (error?: string) => {
    setConnectionError(error || "Failed to connect to cloud provider");
  };

  // Wrapper for handleConnectProvider to catch errors
  const safeHandleConnectProvider = async (data: any) => {
    try {
      await handleConnectProvider(data);
    } catch (error: any) {
      handleConnectionFailure(error.message);
    }
  };

  // Refresh connection manually
  const handleForceRefresh = () => {
    console.log("Force refreshing cloud resources and accounts");
    fetchResources();
  };

  // Handle syncing resources for an account
  const handleSyncResources = async (accountId: string) => {
    await syncResources(accountId);
  };
  
  // Handle deleting an account - now returns boolean as expected
  const handleDeleteAccount = async (accountId: string): Promise<boolean> => {
    return await deleteAccount(accountId);
  };

  // Check if any accounts are connected and ready
  const hasConnectedAccounts = accounts.length > 0;

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
                onClick={handleForceRefresh}
                disabled={loading}
                title="Refresh resources and accounts"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> 
                Refresh Resources
              </Button>
              <Button 
                variant={managementMode ? "default" : "outline"}
                onClick={() => setManagementMode(!managementMode)}
                title="Toggle advanced management mode"
              >
                <Settings className="mr-2 h-4 w-4" />
                Management Mode
              </Button>
              <Button 
                onClick={handleOpenProvisioningDialog}
                title={hasConnectedAccounts ? "Provision a new resource" : "Connect an account first"}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> 
                Provision Resource
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          <ConnectionErrorAlert 
            isVisible={!!connectionError}
            error={connectionError || undefined}
            onRetry={() => setConnectionError(null)}
          />

          {/* Connected Accounts Component */}
          <ConnectedAccounts 
            accounts={accounts} 
            onOpenConnectDialog={() => setConnectDialogOpen(true)} 
            onSyncResources={handleSyncResources}
            onDeleteAccount={handleDeleteAccount}
            syncStatus={syncStatus}
            syncErrorMessages={syncErrorMessages}
          />

          {/* Main Tabs for Cloud Resources Features */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className={managementMode ? 'grid-cols-7' : 'grid-cols-5'}>
              <TabsTrigger value="inventory" className="flex items-center gap-1">
                <Cloud className="h-4 w-4" />
                <span>Inventory</span>
              </TabsTrigger>
              {managementMode && (
                <TabsTrigger value="realtime" className="flex items-center gap-1">
                  <Activity className="h-4 w-4" />
                  <span>Real-Time</span>
                </TabsTrigger>
              )}
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
              <TabsTrigger value="iac" className="flex items-center gap-1">
                <FileCode className="h-4 w-4" />
                <span>Infrastructure as Code</span>
              </TabsTrigger>
              {managementMode && (
                <TabsTrigger value="management" className="flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  <span>Advanced</span>
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="inventory">
              <InventoryTab 
                filters={filters}
                filteredResources={filteredResources}
                typeOptions={typeOptions}
                regionOptions={regionOptions}
                statusOptions={statusOptions}
                loading={loading}
                handleFilterChange={handleFilterChange}
                handleFilterRemove={handleFilterRemove}
                clearFilters={clearFilters}
                handleViewDetails={handleViewDetails}
              />
            </TabsContent>
            
            {managementMode && (
              <TabsContent value="realtime">
                <RealTimeResourceMonitor resources={resources} />
              </TabsContent>
            )}
            
            <TabsContent value="metrics">
              <MetricsTab 
                selectedResource={selectedResource}
                setActiveTab={setActiveTab}
              />
            </TabsContent>
            
            <TabsContent value="costs">
              <CostAnalysisTab />
            </TabsContent>
            
            <TabsContent value="tags">
              <TagsTab 
                selectedResource={selectedResource}
                setActiveTab={setActiveTab}
                fetchResources={fetchResources}
              />
            </TabsContent>
            
            <TabsContent value="iac">
              <IaCTab />
            </TabsContent>
            
            {managementMode && (
              <TabsContent value="management">
                {selectedResource ? (
                  <ResourceManagementPanel 
                    resource={selectedResource}
                    onResourceUpdate={handleResourceActionComplete}
                  />
                ) : (
                  <div className="text-center py-8">
                    <Settings className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <p className="mt-2 text-muted-foreground">
                      Select a resource from the Inventory tab to manage it here.
                    </p>
                  </div>
                )}
              </TabsContent>
            )}
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
            onActionComplete={handleResourceActionComplete}
          />

          {/* Connect Provider Dialog Component */}
          <ConnectProviderDialog
            open={connectDialogOpen}
            onOpenChange={setConnectDialogOpen}
            onConnectProvider={safeHandleConnectProvider}
            connecting={connecting}
          />

          {/* Resource Provisioning Dialog */}
          <ResourceProvisioningDialog
            open={provisioningDialogOpen}
            onOpenChange={setProvisioningDialogOpen}
            accounts={accounts}
            onSuccess={handleProvisioningSuccess}
          />
        </div>
      </div>
    </SidebarWithProvider>
  );
};

export default CloudResourcesPage;
