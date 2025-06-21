
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Wifi, WifiOff, Loader2, CheckCircle, XCircle, AlertTriangle, Zap } from 'lucide-react';
import { testCloudConnectivity, ConnectivityTestResult, startRealTimeMonitoring } from '@/services/cloud/connectivityService';
import { CloudProvider } from '@/services/cloud/types';

interface ConnectivityTestButtonProps {
  accountId: string;
  provider: CloudProvider;
  accountName: string;
}

const ConnectivityTestButton: React.FC<ConnectivityTestButtonProps> = ({
  accountId,
  provider,
  accountName
}) => {
  const [testing, setTesting] = useState(false);
  const [lastResult, setLastResult] = useState<ConnectivityTestResult | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const { toast } = useToast();

  const handleTestConnectivity = async () => {
    setTesting(true);
    
    try {
      const result = await testCloudConnectivity(accountId, provider);
      setLastResult(result);
      
      if (result.success) {
        const isRealTime = result.isRealTime;
        toast({
          title: isRealTime ? "Real-Time Connection Successful" : "Credentials Validated",
          description: isRealTime 
            ? `Successfully connected to ${accountName} (${provider.toUpperCase()}) in real-time`
            : `Credentials validated for ${accountName} (${provider.toUpperCase()}). Real-time API test unavailable.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Connection Test Failed",
          description: result.error || "Failed to connect to cloud provider",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Test Error",
        description: error.message || "Failed to run connectivity test",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const handleToggleMonitoring = () => {
    if (isMonitoring) {
      setIsMonitoring(false);
      toast({
        title: "Monitoring Stopped",
        description: `Stopped real-time monitoring for ${accountName}`,
      });
    } else {
      setIsMonitoring(true);
      
      // Start real-time monitoring
      const cleanup = startRealTimeMonitoring(accountId, provider, (result) => {
        setLastResult(result);
        
        if (result.success !== lastResult?.success) {
          toast({
            title: "Connection Status Changed",
            description: `${accountName} is now ${result.success ? 'connected' : 'disconnected'}`,
            variant: result.success ? "default" : "destructive"
          });
        }
      });
      
      toast({
        title: "Real-Time Monitoring Started",
        description: `Now monitoring ${accountName} connection status`,
      });
      
      // Cleanup on component unmount or monitoring stop
      return cleanup;
    }
  };

  useEffect(() => {
    // Cleanup monitoring when component unmounts
    return () => {
      if (isMonitoring) {
        setIsMonitoring(false);
      }
    };
  }, []);

  const getStatusIcon = () => {
    if (testing) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    
    if (lastResult === null) {
      return <Wifi className="h-4 w-4" />;
    }
    
    if (lastResult.success && lastResult.isRealTime) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    
    if (lastResult.success && !lastResult.isRealTime) {
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
    
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusBadge = () => {
    if (lastResult === null) return null;
    
    if (lastResult.success && lastResult.isRealTime) {
      return (
        <Badge variant="default" className="ml-2 bg-green-100 text-green-800 border-green-300">
          <Zap className="h-3 w-3 mr-1" />
          Live Connected
        </Badge>
      );
    }
    
    if (lastResult.success && !lastResult.isRealTime) {
      return (
        <Badge variant="outline" className="ml-2 border-yellow-500 text-yellow-700">
          Validated
        </Badge>
      );
    }
    
    return (
      <Badge variant="destructive" className="ml-2">
        Failed
      </Badge>
    );
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleTestConnectivity}
        disabled={testing}
      >
        {getStatusIcon()}
        Test Connection
      </Button>
      
      <Button
        variant={isMonitoring ? "default" : "outline"}
        size="sm"
        onClick={handleToggleMonitoring}
        disabled={testing}
      >
        <Zap className={`h-4 w-4 mr-1 ${isMonitoring ? 'animate-pulse' : ''}`} />
        {isMonitoring ? 'Stop Monitor' : 'Live Monitor'}
      </Button>
      
      {getStatusBadge()}
      
      {lastResult?.details && lastResult.success && (
        <div className="text-xs text-muted-foreground ml-2">
          {lastResult.isRealTime && (
            <span className="text-green-600 font-medium">Real-time • </span>
          )}
          {!lastResult.isRealTime && lastResult.details.fallbackMode && (
            <span className="text-yellow-600">Validation only • </span>
          )}
          {provider === 'aws' && (lastResult.details.accountId || lastResult.details.accessKeyId) && (
            <>
              {lastResult.details.accountId ? 
                `Account: ${lastResult.details.accountId}` : 
                `Key: ${lastResult.details.accessKeyId}`
              }
            </>
          )}
          {provider === 'gcp' && lastResult.details.projectId && (
            `Project: ${lastResult.details.projectId}`
          )}
          {provider === 'azure' && lastResult.details.subscriptionId && (
            `Subscription: ${lastResult.details.subscriptionId}`
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectivityTestButton;
