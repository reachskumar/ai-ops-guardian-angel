
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChartBar } from 'lucide-react';
import { ResourceMetricsDashboard } from '@/components/cloud';

interface MetricsTabProps {
  selectedResource: any | null;
  setActiveTab: (tab: string) => void;
}

const MetricsTab: React.FC<MetricsTabProps> = ({
  selectedResource,
  setActiveTab,
}) => {
  return (
    <>
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
    </>
  );
};

export default MetricsTab;
