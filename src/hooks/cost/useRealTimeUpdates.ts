
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface UseRealTimeUpdatesProps {
  refreshCallback: () => Promise<void>;
}

export const useRealTimeUpdates = ({ refreshCallback }: UseRealTimeUpdatesProps) => {
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const enableRealTimeUpdates = useCallback(() => {
    // Clear any existing interval
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
    
    // Set up a new interval - refresh every 30 seconds
    const interval = setInterval(() => {
      refreshCallback();
    }, 30000);
    
    setRefreshInterval(interval);
    
    toast({
      title: "Real-time updates enabled",
      description: "Cost data will refresh automatically every 30 seconds",
    });
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [refreshCallback, refreshInterval, toast]);

  const disableRealTimeUpdates = useCallback(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
      
      toast({
        title: "Real-time updates disabled",
        description: "Cost data will only update when manually refreshed",
      });
    }
  }, [refreshInterval, toast]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  return {
    enableRealTimeUpdates,
    disableRealTimeUpdates,
    isRealTimeEnabled: !!refreshInterval
  };
};
