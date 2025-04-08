
import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Cloud, 
  Server, 
  MoreVertical, 
  PlayCircle, 
  StopCircle,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import ClusterDetailsDialog from "../ClusterDetailsDialog";
import { CreateClusterDialog } from "@/components/kubernetes";

// Mock data for demo
const mockClusters = [
  { 
    id: "cluster-1", 
    name: "production-cluster", 
    provider: "AWS EKS", 
    region: "us-west-2", 
    version: "1.26",
    status: "running",
    nodes: 5,
    cpu: "20 vCPU",
    memory: "80 GiB"
  },
  { 
    id: "cluster-2", 
    name: "staging-cluster", 
    provider: "GCP GKE", 
    region: "us-central1", 
    version: "1.25",
    status: "running",
    nodes: 3,
    cpu: "12 vCPU",
    memory: "48 GiB"
  },
  { 
    id: "cluster-3", 
    name: "dev-cluster", 
    provider: "Azure AKS", 
    region: "eastus", 
    version: "1.24",
    status: "stopped",
    nodes: 2,
    cpu: "8 vCPU",
    memory: "32 GiB"
  },
];

const ClustersTab: React.FC = () => {
  const [clusters, setClusters] = useState(mockClusters);
  const [selectedCluster, setSelectedCluster] = useState<typeof mockClusters[0] | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleViewDetails = (cluster: typeof mockClusters[0]) => {
    setSelectedCluster(cluster);
  };

  const handleCloseDetails = () => {
    setSelectedCluster(null);
  };

  const handleStatusChange = (clusterId: string, newStatus: string) => {
    setClusters(clusters.map(cluster => 
      cluster.id === clusterId ? { ...cluster, status: newStatus } : cluster
    ));
    
    toast({
      title: `Cluster ${newStatus === 'running' ? 'Started' : 'Stopped'}`,
      description: `The cluster is now ${newStatus}.`,
    });
  };

  const handleCreateCluster = (newCluster: typeof mockClusters[0]) => {
    setClusters([...clusters, newCluster]);
    
    // Simulate status change after a delay (in a real app this would be handled by backend events)
    setTimeout(() => {
      setClusters(currentClusters => 
        currentClusters.map(cluster => 
          cluster.id === newCluster.id ? { ...cluster, status: 'running' } : cluster
        )
      );
      
      toast({
        title: "Cluster Created",
        description: `${newCluster.name} has been successfully provisioned.`,
      });
    }, 5000);
  };

  const handleDeleteCluster = (clusterId: string) => {
    const clusterName = clusters.find(c => c.id === clusterId)?.name;
    
    setClusters(clusters.filter(cluster => cluster.id !== clusterId));
    
    toast({
      title: "Cluster Deleted",
      description: `${clusterName} has been successfully deleted.`,
      variant: "destructive"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Available Clusters</h3>
        <Button onClick={() => setCreateDialogOpen(true)}>Add Cluster</Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Nodes</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clusters.map((cluster) => (
            <TableRow key={cluster.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-muted-foreground" />
                  {cluster.name}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-muted-foreground" />
                  {cluster.provider}
                </div>
              </TableCell>
              <TableCell>v{cluster.version}</TableCell>
              <TableCell>{cluster.region}</TableCell>
              <TableCell>{cluster.nodes}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    cluster.status === "running"
                      ? "border-green-500 text-green-500"
                      : cluster.status === "provisioning" 
                      ? "border-blue-500 text-blue-500"
                      : "border-amber-500 text-amber-500"
                  }
                >
                  {cluster.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleViewDetails(cluster)}>
                      View Details
                    </DropdownMenuItem>
                    {cluster.status === "running" ? (
                      <DropdownMenuItem onClick={() => handleStatusChange(cluster.id, "stopped")}>
                        <StopCircle className="h-4 w-4 mr-2" />
                        Stop Cluster
                      </DropdownMenuItem>
                    ) : cluster.status !== "provisioning" ? (
                      <DropdownMenuItem onClick={() => handleStatusChange(cluster.id, "running")}>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Start Cluster
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleDeleteCluster(cluster.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Cluster
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <ClusterDetailsDialog 
        open={!!selectedCluster}
        onOpenChange={handleCloseDetails}
        cluster={selectedCluster}
      />
      
      <CreateClusterDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateCluster={handleCreateCluster}
      />
    </div>
  );
};

export default ClustersTab;
