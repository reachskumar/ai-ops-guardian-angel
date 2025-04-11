
import React from 'react';
import { CloudAccount } from '@/services/cloud';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cloud, PlusCircle, RefreshCw, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConnectedAccountsProps {
  accounts: CloudAccount[];
  onOpenConnectDialog: () => void;
  onSyncResources?: (accountId: string) => void;
  onDeleteAccount?: (accountId: string) => void;
  syncStatus?: {[accountId: string]: 'idle' | 'syncing' | 'success' | 'error'};
}

const ConnectedAccounts: React.FC<ConnectedAccountsProps> = ({ 
  accounts, 
  onOpenConnectDialog,
  onSyncResources,
  onDeleteAccount,
  syncStatus = {}
}) => {
  const [accountToDelete, setAccountToDelete] = React.useState<CloudAccount | null>(null);
  
  const handleConfirmDelete = () => {
    if (accountToDelete && onDeleteAccount) {
      onDeleteAccount(accountToDelete.id);
    }
    setAccountToDelete(null);
  };

  return (
    <>
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
              {accounts.map(account => {
                const status = syncStatus[account.id] || 'idle';
                return (
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
                    <div className="flex space-x-2 mt-3">
                      {onSyncResources && (
                        <Button 
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => onSyncResources(account.id)}
                          disabled={status === 'syncing'}
                        >
                          {status === 'syncing' ? (
                            <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                          ) : status === 'success' ? (
                            <CheckCircle className="mr-2 h-3 w-3 text-green-500" />
                          ) : status === 'error' ? (
                            <AlertCircle className="mr-2 h-3 w-3 text-red-500" />
                          ) : (
                            <RefreshCw className="mr-2 h-3 w-3" />
                          )}
                          Sync
                        </Button>
                      )}
                      {onDeleteAccount && (
                        <Button 
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setAccountToDelete(account)}
                        >
                          <Trash2 className="mr-2 h-3 w-3" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      
      <AlertDialog open={!!accountToDelete} onOpenChange={(open) => !open && setAccountToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {accountToDelete?.name}? This will disconnect the account and 
              remove all associated resources from your dashboard. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConnectedAccounts;
