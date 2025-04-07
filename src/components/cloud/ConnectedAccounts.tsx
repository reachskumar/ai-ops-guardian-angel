
import React from 'react';
import { CloudAccount } from '@/services/cloudProviderService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cloud, PlusCircle } from 'lucide-react';

interface ConnectedAccountsProps {
  accounts: CloudAccount[];
  onOpenConnectDialog: () => void;
}

const ConnectedAccounts: React.FC<ConnectedAccountsProps> = ({ 
  accounts, 
  onOpenConnectDialog 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
      </CardHeader>
      <CardContent>
        {accounts.length === 0 ? (
          <div className="text-center py-8">
            <Cloud className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <p className="mt-2 text-muted-foreground">No cloud accounts connected yet.</p>
            <Button 
              variant="outline" 
              onClick={onOpenConnectDialog}
              className="mt-4"
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
                className="border rounded-md p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold">{account.name}</h3>
                  <Badge 
                    variant={
                      account.status === 'connected' ? 'default' : 'destructive'
                    }
                  >
                    {account.status}
                  </Badge>
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
