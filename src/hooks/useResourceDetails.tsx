
import { useState, useEffect } from 'react';
import { CloudResource } from '@/services/cloud/types';
import { getResourceDetails, getResourceMetrics, ResourceMetric } from '@/services/cloud';

interface ResourceDetailsState {
  resource: CloudResource | null;
  metrics: ResourceMetric[];
}

export const useResourceDetails = (resourceId?: string | null) => {
  const [state, setState] = useState<ResourceDetailsState>({
    resource: null,
    metrics: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<CloudResource | null>(null);

  useEffect(() => {
    if (!resourceId) {
      setState({ resource: null, metrics: [] });
      return;
    }

    const fetchResourceDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [resource, metrics] = await Promise.all([
          getResourceDetails(resourceId),
          getResourceMetrics(resourceId)
        ]);

        setState({
          resource,
          metrics
        });
      } catch (err: any) {
        setError(err.message || 'Failed to fetch resource details');
      } finally {
        setLoading(false);
      }
    };

    fetchResourceDetails();
  }, [resourceId]);

  const handleViewDetails = (resource: CloudResource) => {
    setSelectedResource(resource);
  };

  const fetchResourceMetrics = async (resourceId: string) => {
    try {
      const metrics = await getResourceMetrics(resourceId);
      setState(prev => ({ ...prev, metrics }));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch resource metrics');
    }
  };

  return {
    ...state,
    loading,
    error,
    selectedResource,
    setSelectedResource,
    resourceDetails: state.resource,
    detailsLoading: loading,
    resourceMetrics: state.metrics,
    metricsLoading: loading,
    handleViewDetails,
    fetchResourceMetrics,
    refetch: () => {
      if (resourceId) {
        // Re-trigger the effect
        setState({ resource: null, metrics: [] });
      }
    }
  };
};
