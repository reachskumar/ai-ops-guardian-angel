
import React, { useState, useEffect } from 'react';
import { 
  getCloudAccounts, 
  getCloudResources, 
  getResourceDetails,
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
  Eye,
  Activity,
  Calendar,
  Tag,
  DollarSign
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';

const CloudResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<CloudResource[]>([]);
  const [accounts, setAccounts] = useState<CloudAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<CloudResource | null>(null);
  const [resourceDetails, setResourceDetails] = useState<{resource: CloudResource | null, metrics: any[]}>({
    resource: null,
    metrics: []
  });
  const [detailsLoading, setDetailsLoading] = useState(false);
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

  const handleViewDetails = async (resource: CloudResource) => {
    setSelectedResource(resource);
    setDetailsLoading(true);
    
    try {
      const details = await getResourceDetails(resource.id);
      setResourceDetails(details);
    } catch (error) {
      toast({
        title: "Error fetching resource details",
        description: "Could not load detailed information",
        variant: "destructive"
      });
    } finally {
      setDetailsLoading(false);
    }
  };

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
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleViewDetails(resource)}
                    >
                      <Eye className="mr-2 h-4 w-4" /> Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Resource Details Modal */}
      <Dialog 
        open={selectedResource !== null} 
        onOpenChange={(open) => !open && setSelectedResource(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedResource && renderResourceIcon(selectedResource.type)}
              {selectedResource?.name} Details
            </DialogTitle>
          </DialogHeader>
          
          {detailsLoading ? (
            <div className="flex justify-center items-center h-40">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {resourceDetails.resource && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Resource ID</div>
                      <div className="font-medium">{resourceDetails.resource.resource_id}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Type</div>
                      <div className="font-medium">{resourceDetails.resource.type}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Region</div>
                      <div className="font-medium">{resourceDetails.resource.region}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Status</div>
                      <div className="font-medium">
                        <Badge variant={resourceDetails.resource.status === 'healthy' ? 'default' : 'destructive'}>
                          {resourceDetails.resource.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Created At</div>
                      <div className="font-medium flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {new Date(resourceDetails.resource.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Updated At</div>
                      <div className="font-medium flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {new Date(resourceDetails.resource.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {resourceDetails.resource.cost_per_day !== undefined && (
                    <div className="p-4 bg-muted rounded-md">
                      <div className="font-semibold flex items-center mb-2">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Cost Information
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Daily Cost: </span>
                        ${resourceDetails.resource.cost_per_day.toFixed(2)}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Estimated Monthly: </span>
                        ${(resourceDetails.resource.cost_per_day * 30).toFixed(2)}
                      </div>
                    </div>
                  )}

                  {resourceDetails.resource.tags && Object.keys(resourceDetails.resource.tags).length > 0 && (
                    <div>
                      <div className="font-semibold flex items-center mb-2">
                        <Tag className="mr-2 h-4 w-4" />
                        Tags
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(resourceDetails.resource.tags).map(([key, value]) => (
                          <Tooltip key={key}>
                            <TooltipTrigger asChild>
                              <div className="px-2 py-1 bg-muted rounded text-xs">
                                {key}: {value}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{key}: {value}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  )}

                  {resourceDetails.metrics && resourceDetails.metrics.length > 0 && (
                    <div>
                      <div className="font-semibold flex items-center mb-2">
                        <Activity className="mr-2 h-4 w-4" />
                        Metrics
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {resourceDetails.metrics.map((metric, index) => (
                          <div key={index} className="p-3 border rounded-md">
                            <div className="font-medium">{metric.name}</div>
                            <div className="text-sm text-muted-foreground">{metric.value} {metric.unit}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CloudResourcesPage;
