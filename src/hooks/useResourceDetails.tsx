
import { useState } from 'react';
import { 
  getResourceDetails, 
  getResourceMetrics, 
  CloudResource,
  ResourceMetric
} from '@/services/cloudProviderService';
import { useToast } from '@/hooks/use-toast';

export const useResourceDetails = () => {
  const [selectedResource, setSelectedResource] = useState<CloudResource | null>(null);
  const [resourceDetails, setResourceDetails] = useState<{resource: CloudResource | null, metrics: any[]}>({
    resource: null,
    metrics: []
  });
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [resourceMetrics, setResourceMetrics] = useState<ResourceMetric[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(false);
  
  const { toast } = useToast();

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

  const fetchResourceMetrics = async (resourceId: string) => {
    setMetricsLoading(true);
    try {
      const metricsData = await getResourceMetrics(resourceId);
      setResourceMetrics(metricsData);
    } catch (error) {
      toast({
        title: "Error fetching metrics",
        description: "Could not load resource metrics",
        variant: "destructive"
      });
    } finally {
      setMetricsLoading(false);
    }
  };

  return {
    selectedResource,
    setSelectedResource,
    resourceDetails,
    detailsLoading,
    resourceMetrics,
    metricsLoading,
    handleViewDetails,
    fetchResourceMetrics
  };
};
