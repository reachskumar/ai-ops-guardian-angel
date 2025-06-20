
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Wifi, WifiOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { testCloudConnectivity, ConnectivityTestResult } from '@/services/cloud/connectivityService';
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
  const { toast } = useToast();

  const handleTestConnectivity = async () => {
    setTesting(true);
    
    try {
      const result = await testCloudConnectivity(accountId, provider);
      setLastResult(result);
      
      if (result.success) {
        toast({
          title: "Connectivity Test Passed",
          description: `Successfully connected to ${accountName} (${provider.toUpperCase()})`,
        });
      } else {
        toast({
          title: "Connectivity Test Failed",
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

  const getStatusIcon = () => {
    if (testing) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    
    if (lastResult === null) {
      return <Wifi className="h-4 w-4" />;
    }
    
    return lastResult.success ? 
      <CheckCircle className="h-4 w-4 text-green-600" /> : 
      <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusBadge = () => {
    if (lastResult === null) return null;
    
    return (
      <Badge variant={lastResult.success ? "default" : "destructive"} className="ml-2">
        {lastResult.success ? "Connected" : "Failed"}
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
        Test Connectivity
      </Button>
      {getStatusBadge()}
      {lastResult?.details && lastResult.success && (
        <div className="text-xs text-muted-foreground ml-2">
          {provider === 'aws' && lastResult.details.accountId && (
            `Account: ${lastResult.details.accountId}`
          )}
          {provider === 'gcp' && lastResult.details.projectId && (
            `Project: ${lastResult.details.projectId}`
          )}
          {provider === 'azure' && lastResult.details.subscriptionId && (
            `Subscription: ${lastResult.details.subscriptionId.substring(0, 8)}...`
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectivityTestButton;
