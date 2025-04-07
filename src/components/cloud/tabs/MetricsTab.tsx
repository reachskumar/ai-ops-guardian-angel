
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChartBar, RefreshCw } from 'lucide-react';
import { ResourceMetricsDashboard } from '@/components/cloud';
import { Skeleton } from '@/components/ui/skeleton';

interface MetricsTabProps {
  selectedResource: any | null;
  setActiveTab: (tab: string) => void;
}

const MetricsTab: React.FC<MetricsTabProps> = ({
  selectedResource,
  setActiveTab,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshed(new Date());
    }, 1000);
  };

  return (
    <>
      {selectedResource ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">{selectedResource.name || 'Resource'} Metrics</h3>
              {lastRefreshed && (
                <p className="text-sm text-muted-foreground">
                  Last refreshed: {lastRefreshed.toLocaleTimeString()}
                </p>
              )}
            </div>
            <Button 
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          {isRefreshing ? (
            <div className="space-y-4">
              <Skeleton className="h-[400px] w-full" />
            </div>
          ) : (
            <ResourceMetricsDashboard 
              resourceId={selectedResource.id}
              resourceType={selectedResource.type}
            />
          )}
        </div>
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
    </>
  );
};

export default MetricsTab;
