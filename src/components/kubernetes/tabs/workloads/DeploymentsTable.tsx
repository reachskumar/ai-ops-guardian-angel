
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Box } from "lucide-react";

// Mock data moved to a separate file
import { mockDeployments } from "./mockData";

const DeploymentsTable: React.FC = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Namespace</TableHead>
          <TableHead>Cluster</TableHead>
          <TableHead>Replicas</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Age</TableHead>
          <TableHead>Image</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockDeployments.map((deployment) => (
          <TableRow key={deployment.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <Box className="h-4 w-4 text-muted-foreground" />
                {deployment.name}
              </div>
            </TableCell>
            <TableCell>{deployment.namespace}</TableCell>
            <TableCell>{deployment.cluster}</TableCell>
            <TableCell>{deployment.replicas}</TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={
                  deployment.status === "Running"
                    ? "border-green-500 text-green-500"
                    : "border-red-500 text-red-500"
                }
              >
                {deployment.status}
              </Badge>
            </TableCell>
            <TableCell>{deployment.age}</TableCell>
            <TableCell>
              <code className="bg-muted px-2 py-1 rounded text-xs">
                {deployment.image}
              </code>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DeploymentsTable;
