
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
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

export interface Secret {
  id: string;
  name: string;
  namespace: string;
  cluster: string;
  type: string;
  keys: number;
  age: string;
}

interface SecretsTableProps {
  secrets: Secret[];
}

const SecretsTable: React.FC<SecretsTableProps> = ({ secrets }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Namespace</TableHead>
          <TableHead>Cluster</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Keys</TableHead>
          <TableHead>Age</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {secrets.map((secret) => (
          <TableRow key={secret.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                {secret.name}
              </div>
            </TableCell>
            <TableCell>{secret.namespace}</TableCell>
            <TableCell>{secret.cluster}</TableCell>
            <TableCell>
              <Badge variant="outline">
                {secret.type}
              </Badge>
            </TableCell>
            <TableCell>{secret.keys}</TableCell>
            <TableCell>{secret.age}</TableCell>
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

export default SecretsTable;
