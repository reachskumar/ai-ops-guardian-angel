
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Trash2, 
  Settings, 
  Activity,
  Cloud,
  Server,
  Database,
  HardDrive,
  Network,
  Shield,
  DollarSign,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { CloudResource } from '@/services/cloud/types';
import { useToast } from '@/hooks/use-toast';
import ResourceActions from './ResourceActions';
import ResourceMetrics from './ResourceMetrics';
import ResourceCostTracker from './ResourceCostTracker';
import ResourceConfigurationPanel from './ResourceConfigurationPanel';

interface ResourceManagementPanelProps {
  resource: CloudResource;
  onResourceUpdate: () => void;
}

const ResourceManagementPanel: React.FC<ResourceManagementPanelProps> = ({
  resource,
  onResourceUpdate
}) => {
  const [realTimeStatus, setRealTimeStatus] = useState(resource.status);
  const [isManaging, setIsManaging] = useState(false);
  const { toast } = useToast();

  // Simulate real-time status updates
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, this would be a WebSocket or Server-Sent Events connection
      // For demo, we'll simulate status changes
      if (Math.random() > 0.95) {
        const statuses = ['running', 'stopped', 'starting', 'stopping'];
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        if (newStatus !== realTimeStatus) {
          setRealTimeStatus(newStatus);
          toast({
            title: "Status Update",
            description: `${resource.name} status changed to ${newStatus}`,
          });
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [resource.name, realTimeStatus, toast]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="h-4 w-4 text-green-500" />;
      case 'stopped': return <Square className="h-4 w-4 text-red-500" />;
      case 'starting': return <Play className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'stopping': return <Square className="h-4 w-4 text-orange-500 animate-pulse" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'ec2': return <Server className="h-5 w-5" />;
      case 'rds': return <Database className="h-5 w-5" />;
      case 'storage': return <HardDrive className="h-5 w-5" />;
      case 'network': return <Network className="h-5 w-5" />;
      default: return <Cloud className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Resource Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getResourceTypeIcon(resource.type)}
              <div>
                <CardTitle className="flex items-center gap-2">
                  {resource.name}
                  {getStatusIcon(realTimeStatus)}
                  <Badge variant={realTimeStatus === 'running' ? 'default' : 'secondary'}>
                    {realTimeStatus}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {resource.type} • {resource.region}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Live
              </Badge>
              {resource.cost_per_day && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  ${resource.cost_per_day.toFixed(2)}/day
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResourceActions 
            resource={{ ...resource, status: realTimeStatus }} 
            onActionComplete={() => {
              onResourceUpdate();
              setIsManaging(false);
            }}
          />
        </CardContent>
      </Card>

      {/* Management Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resource Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">ID:</span>
                  <span className="text-sm font-mono">{resource.resource_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <span className="text-sm">{resource.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Region:</span>
                  <span className="text-sm">{resource.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created:</span>
                  <span className="text-sm">{new Date(resource.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Current Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(realTimeStatus)}
                  <span className="font-medium capitalize">{realTimeStatus}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Uptime: {Math.floor(Math.random() * 24)}h {Math.floor(Math.random() * 60)}m
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tags */}
          {resource.tags && Object.keys(resource.tags).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(resource.tags).map(([key, value]) => (
                    <Badge key={key} variant="outline" className="text-xs">
                      {key}: {value}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="metrics">
          <ResourceMetrics 
            metrics={[]} 
            onRefresh={() => {}} 
            loading={false}
          />
        </TabsContent>

        <TabsContent value="configuration">
          <ResourceConfigurationPanel 
            resource={resource}
            onConfigurationChange={onResourceUpdate}
          />
        </TabsContent>

        <TabsContent value="costs">
          <ResourceCostTracker 
            resource={resource}
          />
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Encryption</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {resource.metadata?.encryption ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Network className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Network Access</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Restricted to VPC
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Run Security Scan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResourceManagementPanel;
