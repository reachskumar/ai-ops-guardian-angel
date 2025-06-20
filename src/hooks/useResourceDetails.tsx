
import { useState, useEffect } from 'react';
import { CloudResource } from '@/services/cloud/types';
import { getResourceDetails, getResourceMetrics, ResourceMetric } from '@/services/cloud';

interface ResourceDetailsState {
  resource: CloudResource | null;
  metrics: ResourceMetric[];
}

export const useResourceDetails = (resourceId: string | null) => {
  const [state, setState] = useState<ResourceDetailsState>({
    resource: null,
    metrics: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return {
    ...state,
    loading,
    error,
    refetch: () => {
      if (resourceId) {
        // Re-trigger the effect
        setState({ resource: null, metrics: [] });
      }
    }
  };
};
