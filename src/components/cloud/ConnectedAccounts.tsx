
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Plus, 
  RefreshCw, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CloudAccount } from '@/services/cloud/types';
import { ProviderDashboard } from '@/components/cloud';
import { Badge } from '@/components/ui/badge';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';

interface ConnectedAccountsProps {
  accounts: CloudAccount[];
  onOpenConnectDialog: () => void;
  onSyncResources: (accountId: string) => Promise<void>;
  onDeleteAccount: (accountId: string) => Promise<void>;
  syncStatus?: Record<string, 'idle' | 'loading' | 'success' | 'error'>;
  syncErrorMessages?: Record<string, string>;
}

const ConnectedAccounts: React.FC<ConnectedAccountsProps> = ({
  accounts,
  onOpenConnectDialog,
  onSyncResources,
  onDeleteAccount,
  syncStatus = {},
  syncErrorMessages = {}
}) => {
  const [expandedAccounts, setExpandedAccounts] = useState<Record<string, boolean>>({});
  
  // Toggle account expanded state
  const toggleAccountExpanded = (accountId: string) => {
    setExpandedAccounts(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };
  
  // Get provider image based on provider type
  const getProviderImage = (provider: string) => {
    switch (provider) {
      case 'aws':
        return '/aws-logo.png';
      case 'azure':
        return '/azure-logo.png';
      case 'gcp':
        return '/gcp-logo.png';
      default:
        return '/cloud-logo.png';
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Connected Accounts</h2>
        <Button onClick={onOpenConnectDialog} size="sm">
          <Plus className="mr-1 h-4 w-4" /> Connect Provider
        </Button>
      </div>
      
      {accounts.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-4">No cloud accounts connected yet.</p>
          <Button onClick={onOpenConnectDialog}>
            <Plus className="mr-2 h-4 w-4" /> Connect Provider
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => (
            <Collapsible
              key={account.id}
              open={expandedAccounts[account.id]}
              onOpenChange={() => toggleAccountExpanded(account.id)}
              className="border rounded-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 bg-card">
                <div className="flex items-center space-x-3">
                  <img 
                    src={getProviderImage(account.provider)} 
                    alt={account.provider} 
                    className="h-8 w-8"
                  />
                  <div>
                    <h3 className="font-medium">{account.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="capitalize">{account.provider}</span>
                      {account.status === 'connected' ? (
                        <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 hover:bg-green-50">
                          <CheckCircle className="h-3 w-3 mr-1" /> Connected
                        </Badge>
                      ) : account.status === 'disconnected' ? (
                        <Badge variant="outline" className="ml-2 bg-orange-50 text-orange-700 hover:bg-orange-50">
                          <AlertTriangle className="h-3 w-3 mr-1" /> Disconnected
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="ml-2">
                          <XCircle className="h-3 w-3 mr-1" /> Error
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSyncResources(account.id);
                    }}
                    disabled={syncStatus[account.id] === 'loading'}
                  >
                    <RefreshCw 
                      className={`h-4 w-4 mr-1 ${syncStatus[account.id] === 'loading' ? 'animate-spin' : ''}`} 
                    /> 
                    Sync
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this cloud account?')) {
                        onDeleteAccount(account.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <CollapsibleTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm">
                      {expandedAccounts[account.id] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>
              
              <CollapsibleContent>
                <div className="p-4 border-t bg-card/50">
                  <ProviderDashboard account={account} />
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConnectedAccounts;
