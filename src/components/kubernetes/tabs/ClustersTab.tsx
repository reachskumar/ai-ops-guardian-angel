
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ClusterDetailsDialog from "../ClusterDetailsDialog";
import { CreateClusterDialog } from "@/components/kubernetes";
import { ClustersTable, mockClusters } from "./clusters";

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
      
      <ClustersTable 
        clusters={clusters}
        onViewDetails={handleViewDetails}
        onStatusChange={handleStatusChange}
        onDeleteCluster={handleDeleteCluster}
      />
      
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
