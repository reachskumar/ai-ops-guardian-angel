
import React from 'react';
import { CloudResource } from '@/services/cloudProviderService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, Server, Database, Cloud } from 'lucide-react';

interface ResourceInventoryProps {
  resources: CloudResource[];
  loading: boolean;
  onViewDetails: (resource: CloudResource) => void;
}

const ResourceInventory: React.FC<ResourceInventoryProps> = ({
  resources,
  loading,
  onViewDetails
}) => {
  const renderResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'ec2': return <Server className="h-4 w-4" />;
      case 'rds': return <Database className="h-4 w-4" />;
      case 'storage': return <Cloud className="h-4 w-4" />;
      default: return <Cloud className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-8">
            <Server className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <p className="mt-2 text-muted-foreground">No resources found.</p>
            <p className="text-sm text-muted-foreground">
              Resources will appear once you connect a cloud provider.
            </p>
          </div>
        ) : (
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
                      onClick={() => onViewDetails(resource)}
                    >
                      <Eye className="mr-2 h-4 w-4" /> Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ResourceInventory;
