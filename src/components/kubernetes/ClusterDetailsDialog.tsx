
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Server, Cpu, MemoryStick, Network, Box } from "lucide-react";

interface ClusterDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cluster: any | null; // Using any for demo simplicity
}

const ClusterDetailsDialog: React.FC<ClusterDetailsDialogProps> = ({
  open,
  onOpenChange,
  cluster
}) => {
  if (!cluster) return null;

  // Generate some mock metrics for the cluster
  const metrics = {
    cpu: {
      used: Math.round(Math.random() * 80),
      total: cluster.cpu
    },
    memory: {
      used: Math.round(Math.random() * 70),
      total: cluster.memory
    },
    pods: {
      running: Math.floor(Math.random() * 50) + 20,
      pending: Math.floor(Math.random() * 5),
      failed: Math.floor(Math.random() * 3)
    },
    nodes: {
      ready: cluster.nodes,
      notReady: 0
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            {cluster.name}
            <Badge
              variant="outline"
              className={
                cluster.status === "running"
                  ? "ml-2 border-green-500 text-green-500"
                  : "ml-2 border-amber-500 text-amber-500"
              }
            >
              {cluster.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {cluster.provider} cluster in {cluster.region} (v{cluster.version})
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="nodes">Nodes</TabsTrigger>
            <TabsTrigger value="workloads">Workloads</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    CPU Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.cpu.used}%</div>
                  <Progress value={metrics.cpu.used} className="h-1.5 mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {cluster.cpu} available
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MemoryStick className="h-4 w-4 text-muted-foreground" />
                    Memory Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.memory.used}%</div>
                  <Progress value={metrics.memory.used} className="h-1.5 mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {cluster.memory} available
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    Nodes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.nodes.ready}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    All nodes healthy
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Box className="h-4 w-4 text-muted-foreground" />
                    Pods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.pods.running}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metrics.pods.pending} pending, {metrics.pods.failed} failed
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Network className="h-4 w-4 text-muted-foreground" />
                    Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.floor(metrics.pods.running / 4)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.floor(metrics.pods.running / 12)} load balancers
                  </p>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Cluster Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kubernetes Version</span>
                  <span>v{cluster.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provider</span>
                  <span>{cluster.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Region</span>
                  <span>{cluster.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={cluster.status === "running" ? "text-green-500" : "text-amber-500"}>
                    {cluster.status.charAt(0).toUpperCase() + cluster.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="nodes">
            <div className="text-center py-8 text-muted-foreground">
              Node details will be displayed here
            </div>
          </TabsContent>
          
          <TabsContent value="workloads">
            <div className="text-center py-8 text-muted-foreground">
              Workload details will be displayed here
            </div>
          </TabsContent>
          
          <TabsContent value="logs">
            <div className="text-center py-8 text-muted-foreground">
              Cluster logs will be displayed here
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ClusterDetailsDialog;
