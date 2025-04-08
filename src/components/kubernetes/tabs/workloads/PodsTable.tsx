
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
import { Server } from "lucide-react";

// Mock data moved to a separate file
import { mockPods } from "./mockData";

const PodsTable: React.FC = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Namespace</TableHead>
          <TableHead>Node</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Restarts</TableHead>
          <TableHead>Age</TableHead>
          <TableHead>IP</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockPods.map((pod) => (
          <TableRow key={pod.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-muted-foreground" />
                {pod.name}
              </div>
            </TableCell>
            <TableCell>{pod.namespace}</TableCell>
            <TableCell>{pod.node}</TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={
                  pod.status === "Running"
                    ? "border-green-500 text-green-500"
                    : "border-red-500 text-red-500"
                }
              >
                {pod.status}
              </Badge>
            </TableCell>
            <TableCell>
              <span className={pod.restarts > 0 ? "text-amber-500 font-medium" : ""}>
                {pod.restarts}
              </span>
            </TableCell>
            <TableCell>{pod.age}</TableCell>
            <TableCell>{pod.ip}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PodsTable;
