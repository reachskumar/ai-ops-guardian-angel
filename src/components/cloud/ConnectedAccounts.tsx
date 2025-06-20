
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, RefreshCw, Trash2, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { CloudAccount } from '@/services/cloud/types';
import ConnectivityTestButton from './ConnectivityTestButton';

interface ConnectedAccountsProps {
  accounts: CloudAccount[];
  onOpenConnectDialog: () => void;
  onSyncResources: (accountId: string) => Promise<void>;
  onDeleteAccount: (accountId: string) => Promise<boolean>;
  syncStatus: {[accountId: string]: 'idle' | 'loading' | 'success' | 'error'};
  syncErrorMessages: {[accountId: string]: string | null};
}

const ConnectedAccounts: React.FC<ConnectedAccountsProps> = ({
  accounts,
  onOpenConnectDialog,
  onSyncResources,
  onDeleteAccount,
  syncStatus,
  syncErrorMessages
}) => {
  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'aws':
        return '🔶';
      case 'azure':
        return '🔵';
      case 'gcp':
        return '🔴';
      default:
        return '☁️';
    }
  };

  const getSyncStatusIcon = (accountId: string) => {
    const status = syncStatus[accountId] || 'idle';
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Connected Cloud Accounts</CardTitle>
          <Button onClick={onOpenConnectDialog} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Connect Account
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {accounts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">☁️</div>
            <h3 className="text-lg font-semibold mb-2">No Cloud Accounts Connected</h3>
            <p className="text-muted-foreground mb-4">
              Connect your AWS, Azure, or Google Cloud accounts to start managing resources.
            </p>
            <Button onClick={onOpenConnectDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Connect Your First Account
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getProviderIcon(account.provider)}</span>
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {account.provider}
                      </p>
                    </div>
                  </div>
                  <Badge variant={account.status === 'connected' ? 'default' : 'destructive'}>
                    {account.status}
                  </Badge>
                </div>

                {/* Connectivity Test Button */}
                <ConnectivityTestButton 
                  accountId={account.id}
                  provider={account.provider as any}
                  accountName={account.name}
                />

                {/* Sync Status */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last sync:</span>
                  <div className="flex items-center gap-1">
                    {getSyncStatusIcon(account.id)}
                    <span>
                      {account.last_synced_at 
                        ? new Date(account.last_synced_at).toLocaleString()
                        : 'Never'
                      }
                    </span>
                  </div>
                </div>

                {/* Error Message */}
                {syncErrorMessages[account.id] && (
                  <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                    {syncErrorMessages[account.id]}
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSyncResources(account.id)}
                    disabled={syncStatus[account.id] === 'loading'}
                    className="flex-1"
                  >
                    <RefreshCw className={`mr-1 h-3 w-3 ${
                      syncStatus[account.id] === 'loading' ? 'animate-spin' : ''
                    }`} />
                    Sync
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteAccount(account.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectedAccounts;
