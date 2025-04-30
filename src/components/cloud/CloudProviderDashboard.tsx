
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CloudAccount } from '@/services/cloud/types';
import { ProviderDashboard } from '@/components/cloud';
import { useCloudResources } from '@/hooks/useCloudResources';

const CloudProviderDashboard: React.FC = () => {
  const { accounts } = useCloudResources();
  
  // Group accounts by provider
  const awsAccounts = accounts.filter(account => account.provider === 'aws');
  const azureAccounts = accounts.filter(account => account.provider === 'azure');
  const gcpAccounts = accounts.filter(account => account.provider === 'gcp');
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cloud Providers</CardTitle>
        <CardDescription>
          View and manage your cloud provider accounts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={accounts.length > 0 ? accounts[0].provider : 'aws'}>
          <TabsList>
            <TabsTrigger value="aws" disabled={awsAccounts.length === 0}>
              <img src="/aws-logo.png" alt="AWS" className="h-4 w-4 mr-2" />
              AWS
            </TabsTrigger>
            <TabsTrigger value="azure" disabled={azureAccounts.length === 0}>
              <img src="/azure-logo.png" alt="Azure" className="h-4 w-4 mr-2" />
              Azure
            </TabsTrigger>
            <TabsTrigger value="gcp" disabled={gcpAccounts.length === 0}>
              <img src="/gcp-logo.png" alt="GCP" className="h-4 w-4 mr-2" />
              GCP
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="aws">
            {awsAccounts.length > 0 ? (
              <div className="space-y-4">
                {awsAccounts.map(account => (
                  <ProviderDashboard key={account.id} account={account} />
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No AWS accounts connected
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="azure">
            {azureAccounts.length > 0 ? (
              <div className="space-y-4">
                {azureAccounts.map(account => (
                  <ProviderDashboard key={account.id} account={account} />
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No Azure accounts connected
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="gcp">
            {gcpAccounts.length > 0 ? (
              <div className="space-y-4">
                {gcpAccounts.map(account => (
                  <ProviderDashboard key={account.id} account={account} />
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No GCP accounts connected
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CloudProviderDashboard;
