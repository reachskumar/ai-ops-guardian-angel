
import { useState, useEffect, useCallback } from 'react';
import { testCloudConnectivity, ConnectivityTestResult } from '@/services/cloud/connectivityService';
import { CloudProvider } from '@/services/cloud/types';
import { useToast } from '@/hooks/use-toast';

interface UseRealTimeConnectivityProps {
  accountId: string;
  provider: CloudProvider;
  accountName: string;
  autoStart?: boolean;
  interval?: number;
}

export const useRealTimeConnectivity = ({
  accountId,
  provider,
  accountName,
  autoStart = false,
  interval = 30000
}: UseRealTimeConnectivityProps) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastResult, setLastResult] = useState<ConnectivityTestResult | null>(null);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  const testConnection = useCallback(async () => {
    setTesting(true);
    try {
      const result = await testCloudConnectivity(accountId, provider);
      setLastResult(result);
      return result;
    } catch (error: any) {
      console.error('Connection test error:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      const errorResult: ConnectivityTestResult = {
        provider,
        success: false,
        error: errorMessage,
        isRealTime: false
      };
      setLastResult(errorResult);
      return errorResult;
    } finally {
      setTesting(false);
    }
  }, [accountId, provider]);

  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;
    
    setIsMonitoring(true);
    
    // Initial test
    testConnection();
    
    // Set up interval
    const intervalId = setInterval(async () => {
      const result = await testConnection();
      
      // Notify on status changes
      if (lastResult && result.success !== lastResult.success) {
        const statusMessage = result.success ? 'connected' : 'disconnected';
        const errorInfo = result.error ? ` (${result.error})` : '';
        
        toast({
          title: "Connection Status Changed",
          description: `${accountName} is now ${statusMessage}${errorInfo}`,
          variant: result.success ? "default" : "destructive"
        });
      }
    }, interval);
    
    return () => {
      clearInterval(intervalId);
      setIsMonitoring(false);
    };
  }, [isMonitoring, testConnection, lastResult, accountName, interval, toast]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  // Auto-start monitoring if requested
  useEffect(() => {
    if (autoStart) {
      const cleanup = startMonitoring();
      return cleanup;
    }
  }, [autoStart, startMonitoring]);

  return {
    isMonitoring,
    lastResult,
    testing,
    testConnection,
    startMonitoring,
    stopMonitoring
  };
};
