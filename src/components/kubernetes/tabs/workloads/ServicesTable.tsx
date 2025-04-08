
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
import { Network, Globe } from "lucide-react";

// Mock data moved to a separate file
import { mockServices } from "./mockData";

const ServicesTable: React.FC = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Namespace</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Cluster IP</TableHead>
          <TableHead>External IP</TableHead>
          <TableHead>Ports</TableHead>
          <TableHead>Age</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockServices.map((service) => (
          <TableRow key={service.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 text-muted-foreground" />
                {service.name}
              </div>
            </TableCell>
            <TableCell>{service.namespace}</TableCell>
            <TableCell>
              <Badge variant="outline">
                {service.type}
              </Badge>
            </TableCell>
            <TableCell>{service.clusterIP}</TableCell>
            <TableCell>
              {service.externalIP !== "-" ? (
                <div className="flex items-center gap-1">
                  <Globe className="h-3 w-3 text-primary" />
                  {service.externalIP}
                </div>
              ) : (
                service.externalIP
              )}
            </TableCell>
            <TableCell>
              <code className="bg-muted px-2 py-0.5 rounded text-xs">
                {service.ports}
              </code>
            </TableCell>
            <TableCell>{service.age}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ServicesTable;
