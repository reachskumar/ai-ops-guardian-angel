
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Cloud, Server } from "lucide-react";
import ClusterStatusBadge from "./ClusterStatusBadge";
import ClusterActionsMenu from "./ClusterActionsMenu";

interface Cluster {
  id: string;
  name: string;
  provider: string;
  region: string;
  version: string;
  status: string;
  nodes: number;
  cpu: string;
  memory: string;
}

interface ClustersTableProps {
  clusters: Cluster[];
  onViewDetails: (cluster: Cluster) => void;
  onStatusChange: (clusterId: string, newStatus: string) => void;
  onDeleteCluster: (clusterId: string) => void;
}

const ClustersTable: React.FC<ClustersTableProps> = ({
  clusters,
  onViewDetails,
  onStatusChange,
  onDeleteCluster
}) => {
  return (
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
              <ClusterStatusBadge status={cluster.status} />
            </TableCell>
            <TableCell className="text-right">
              <ClusterActionsMenu 
                cluster={cluster}
                onViewDetails={onViewDetails}
                onStatusChange={onStatusChange}
                onDeleteCluster={onDeleteCluster}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ClustersTable;
