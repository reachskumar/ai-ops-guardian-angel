
import React, { useState, useEffect } from 'react';
import { 
  getCloudAccounts, 
  getCloudResources, 
  CloudResource, 
  CloudAccount 
} from '@/services/cloudProviderService';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Cloud, 
  Server, 
  Database, 
  RefreshCw, 
  Eye 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const CloudResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<CloudResource[]>([]);
  const [accounts, setAccounts] = useState<CloudAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchResources = async () => {
    setLoading(true);
    try {
      const accountsResult = await getCloudAccounts();
      const resourcesResult = await getCloudResources();
      
      setAccounts(accountsResult);
      setResources(resourcesResult.resources);
    } catch (error) {
      toast({
        title: "Error fetching resources",
        description: "Could not load cloud resources",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const renderResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'ec2': return <Server className="h-4 w-4" />;
      case 'rds': return <Database className="h-4 w-4" />;
      case 'storage': return <Cloud className="h-4 w-4" />;
      default: return <Cloud className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cloud Resources</h1>
        <Button 
          variant="outline" 
          onClick={fetchResources}
          disabled={loading}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> 
          Refresh Resources
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resource Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map(resource => (
                <TableRow key={resource.id}>
                  <TableCell className="flex items-center gap-2">
                    {renderResourceIcon(resource.type)}
                    {resource.name}
                  </TableCell>
                  <TableCell>{resource.type}</TableCell>
                  <TableCell>{resource.region}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        resource.status === 'healthy' 
                          ? 'default' 
                          : 'destructive'
                      }
                    >
                      {resource.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <Eye className="mr-2 h-4 w-4" /> Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CloudResourcesPage;
