
import { useState, useCallback, useEffect } from 'react';
import { 
  getResourceDetails, 
  getResourceMetrics, 
  CloudResource,
  ResourceMetric
} from '@/services/cloud';
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
  const [metricsRefreshInterval, setMetricsRefreshInterval] = useState<number | null>(null);
  
  const { toast } = useToast();

  const handleViewDetails = async (resource: CloudResource) => {
    setSelectedResource(resource);
    setDetailsLoading(true);
    
    try {
      const details = await getResourceDetails(resource.id);
      setResourceDetails(details);
      
      // Automatically fetch metrics when viewing resource details
      fetchResourceMetrics(resource.id);
      
      // Set up automatic refresh for metrics
      startMetricsRefresh(resource.id);
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

  const fetchResourceMetrics = useCallback(async (resourceId: string) => {
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
  }, [toast]);

  const startMetricsRefresh = useCallback((resourceId: string) => {
    // Clear any existing interval
    if (metricsRefreshInterval !== null) {
      clearInterval(metricsRefreshInterval);
    }
    
    // Set up new interval - refresh every 30 seconds
    const intervalId = window.setInterval(() => {
      fetchResourceMetrics(resourceId);
    }, 30000) as unknown as number;
    
    setMetricsRefreshInterval(intervalId);
  }, [fetchResourceMetrics, metricsRefreshInterval]);
  
  // Cleanup interval on unmount or when resource changes
  useEffect(() => {
    return () => {
      if (metricsRefreshInterval !== null) {
        clearInterval(metricsRefreshInterval);
      }
    };
  }, [metricsRefreshInterval]);

  return {
    selectedResource,
    setSelectedResource,
    resourceDetails,
    detailsLoading,
    resourceMetrics,
    metricsLoading,
    handleViewDetails,
    fetchResourceMetrics,
    startMetricsRefresh
  };
};
