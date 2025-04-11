
import React from 'react';
import { CloudAccount } from '@/services/cloud';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cloud, PlusCircle, RefreshCw } from 'lucide-react';

interface ConnectedAccountsProps {
  accounts: CloudAccount[];
  onOpenConnectDialog: () => void;
  onSyncResources?: (accountId: string) => void;
  syncing?: boolean;
}

const ConnectedAccounts: React.FC<ConnectedAccountsProps> = ({ 
  accounts, 
  onOpenConnectDialog,
  onSyncResources,
  syncing = false
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Connected Accounts</CardTitle>
        <Button 
          variant="outline" 
          onClick={onOpenConnectDialog}
          size="sm"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> 
          Connect Provider
        </Button>
      </CardHeader>
      <CardContent>
        {accounts.length === 0 ? (
          <div className="text-center py-8">
            <Cloud className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <p className="mt-2 text-muted-foreground">No cloud accounts connected yet.</p>
            <p className="text-sm text-muted-foreground mb-4">
              Connect a cloud provider to start managing your resources
            </p>
            <Button 
              variant="outline" 
              onClick={onOpenConnectDialog}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> 
              Connect Provider
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {accounts.map(account => (
              <div 
                key={account.id} 
                className="border rounded-md p-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">{account.name}</h3>
                  <Badge 
                    variant={
                      account.status === 'connected' ? 'default' : 'destructive'
                    }
                  >
                    {account.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">ID: {account.id}</p>
                <p className="text-xs text-muted-foreground mb-2">Provider: {account.provider.toUpperCase()}</p>
                {account.last_synced_at && (
                  <p className="text-xs text-muted-foreground">
                    Last synced: {new Date(account.last_synced_at).toLocaleString()}
                  </p>
                )}
                {onSyncResources && (
                  <Button 
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => onSyncResources(account.id)}
                    disabled={syncing}
                  >
                    <RefreshCw className={`mr-2 h-3 w-3 ${syncing ? 'animate-spin' : ''}`} />
                    Sync Resources
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectedAccounts;
