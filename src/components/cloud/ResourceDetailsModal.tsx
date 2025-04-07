
import React, { useState, useEffect } from 'react';
import { CloudResource, getResourceMetrics, ResourceMetric } from '@/services/cloudProviderService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTabs,
  DialogTabsList,
  DialogTabsContent,
  DialogTabsTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  RefreshCw,
  Tag,
  DollarSign,
  Activity,
  Server,
  BarChart,
  Clock,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import ResourceMetrics from './ResourceMetrics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ResourceDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedResource: CloudResource | null;
  resourceDetails: {
    resource: CloudResource | null;
    metrics: any[];
  };
  detailsLoading: boolean;
}

const ResourceDetailsModal: React.FC<ResourceDetailsModalProps> = ({
  isOpen,
  onOpenChange,
  selectedResource,
  resourceDetails,
  detailsLoading,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<ResourceMetric[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(false);

  // Fetch resource metrics when the modal is opened or when the activeTab changes to 'metrics'
  useEffect(() => {
    if (isOpen && selectedResource && activeTab === 'metrics') {
      fetchResourceMetrics();
    }
  }, [isOpen, selectedResource, activeTab]);

  const fetchResourceMetrics = async () => {
    if (!selectedResource) return;
    
    setMetricsLoading(true);
    try {
      const metricsData = await getResourceMetrics(selectedResource.id);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setMetricsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedResource?.name} Details
          </DialogTitle>
        </DialogHeader>
        
        {detailsLoading ? (
          <div className="flex justify-center items-center h-40">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="overview" className="flex items-center gap-1">
                  <Server className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="metrics" className="flex items-center gap-1">
                  <BarChart className="h-4 w-4" />
                  Metrics
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                {resourceDetails.resource && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Resource ID</div>
                        <div className="font-medium">{resourceDetails.resource.resource_id}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Type</div>
                        <div className="font-medium">{resourceDetails.resource.type}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Region</div>
                        <div className="font-medium">{resourceDetails.resource.region}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Status</div>
                        <div className="font-medium">
                          <Badge 
                            variant={resourceDetails.resource.status === 'healthy' ? 'default' : 'destructive'}
                          >
                            {resourceDetails.resource.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Created At</div>
                        <div className="font-medium flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          {new Date(resourceDetails.resource.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Updated At</div>
                        <div className="font-medium flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          {new Date(resourceDetails.resource.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {resourceDetails.resource.cost_per_day !== undefined && (
                      <div className="p-4 bg-muted rounded-md">
                        <div className="font-semibold flex items-center mb-2">
                          <DollarSign className="mr-2 h-4 w-4" />
                          Cost Information
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Daily Cost: </span>
                          ${resourceDetails.resource.cost_per_day.toFixed(2)}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Estimated Monthly: </span>
                          ${(resourceDetails.resource.cost_per_day * 30).toFixed(2)}
                        </div>
                      </div>
                    )}

                    {resourceDetails.resource.tags && Object.keys(resourceDetails.resource.tags).length > 0 && (
                      <div>
                        <div className="font-semibold flex items-center mb-2">
                          <Tag className="mr-2 h-4 w-4" />
                          Tags
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(resourceDetails.resource.tags).map(([key, value]) => (
                            <Tooltip key={key}>
                              <TooltipTrigger asChild>
                                <div className="px-2 py-1 bg-muted rounded text-xs">
                                  {key}: {value}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{key}: {value}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </div>
                    )}

                    {resourceDetails.metrics && resourceDetails.metrics.length > 0 && (
                      <div>
                        <div className="font-semibold flex items-center mb-2">
                          <Activity className="mr-2 h-4 w-4" />
                          Metrics
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {resourceDetails.metrics.map((metric, index) => (
                            <div key={index} className="p-3 border rounded-md">
                              <div className="font-medium">{metric.name}</div>
                              <div className="text-sm text-muted-foreground">{metric.value} {metric.unit}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="metrics">
                <ResourceMetrics 
                  metrics={metrics}
                  onRefresh={fetchResourceMetrics}
                  loading={metricsLoading}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ResourceDetailsModal;
