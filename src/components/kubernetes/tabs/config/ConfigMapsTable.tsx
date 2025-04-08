
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export interface ConfigMap {
  id: string;
  name: string;
  namespace: string;
  cluster: string;
  keys: number;
  age: string;
}

interface ConfigMapsTableProps {
  configMaps: ConfigMap[];
}

const ConfigMapsTable: React.FC<ConfigMapsTableProps> = ({ configMaps }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Namespace</TableHead>
          <TableHead>Cluster</TableHead>
          <TableHead>Keys</TableHead>
          <TableHead>Age</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {configMaps.map((config) => (
          <TableRow key={config.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                {config.name}
              </div>
            </TableCell>
            <TableCell>{config.namespace}</TableCell>
            <TableCell>{config.cluster}</TableCell>
            <TableCell>{config.keys}</TableCell>
            <TableCell>{config.age}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm">
                View
              </Button>
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ConfigMapsTable;
