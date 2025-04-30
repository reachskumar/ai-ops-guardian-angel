
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, AlertTriangle } from 'lucide-react';
import { CloudAccount } from '@/services/cloud/types';
import { getResourceTypes, getRegions } from '@/services/cloud/providerFactory';
import { Skeleton } from '@/components/ui/skeleton';

interface ProviderDashboardProps {
  account: CloudAccount;
}

const ProviderDashboard: React.FC<ProviderDashboardProps> = ({ account }) => {
  const [resourceTypes, setResourceTypes] = useState<{ category: string; types: string[] }[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (account?.provider) {
      // Get provider-specific resource types
      const types = getResourceTypes(account.provider);
      setResourceTypes(types);
      
      // Get provider-specific regions
      const availableRegions = getRegions(account.provider);
      setRegions(availableRegions);
      
      setIsLoading(false);
    }
  }, [account]);
  
  // Get provider-specific logo and name
  const getProviderInfo = () => {
    switch (account.provider) {
      case 'aws':
        return { 
          name: 'Amazon Web Services',
          logo: '/aws-logo.png',
          color: 'text-orange-500',
          console: 'https://console.aws.amazon.com/'
        };
      case 'azure':
        return { 
          name: 'Microsoft Azure',
          logo: '/azure-logo.png',
          color: 'text-blue-500',
          console: 'https://portal.azure.com/'
        };
      case 'gcp':
        return { 
          name: 'Google Cloud Platform',
          logo: '/gcp-logo.png',
          color: 'text-red-500',
          console: 'https://console.cloud.google.com/'
        };
      default:
        return { 
          name: 'Cloud Provider',
          logo: '/cloud-logo.png',
          color: 'text-gray-500',
          console: '#'
        };
    }
  };
  
  const providerInfo = getProviderInfo();
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            {!isLoading ? (
              <>
                <img src={providerInfo.logo} alt={providerInfo.name} className="h-6 w-6" />
                <span className={providerInfo.color}>{providerInfo.name}</span>
              </>
            ) : (
              <Skeleton className="h-6 w-40" />
            )}
          </CardTitle>
          <CardDescription>{account.name}</CardDescription>
        </div>
        <a 
          href={providerInfo.console} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          Open Console →
        </a>
      </CardHeader>
      <CardContent>
        {account.status === 'error' ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              {account.error_message || 'There was an error connecting to your account.'}
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue="resources">
            <TabsList>
              <TabsTrigger value="resources">Available Resources</TabsTrigger>
              <TabsTrigger value="regions">Regions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="resources" className="space-y-4">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                resourceTypes.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <h4 className="text-sm font-semibold capitalize">{category.category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {category.types.map((type) => (
                        <span
                          key={type}
                          className="bg-secondary text-secondary-foreground px-2 py-1 text-xs rounded-md"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="regions">
              {isLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {regions.map((region) => (
                    <div key={region} className="text-sm p-2 bg-secondary rounded">
                      {region}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default ProviderDashboard;
