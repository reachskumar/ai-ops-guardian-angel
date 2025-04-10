
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FeatureStatus } from "./types";

interface FeaturesTableProps {
  features: FeatureStatus[];
}

const FeaturesTable: React.FC<FeaturesTableProps> = ({ features }) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableCaption>Last updated: {new Date().toLocaleDateString()}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Feature</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Pending Tasks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {features.map((feature) => (
            <TableRow key={feature.id}>
              <TableCell>
                <div className="font-medium">{feature.name}</div>
                <div className="text-xs text-muted-foreground">{feature.description}</div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="capitalize">
                  {feature.category}
                </Badge>
              </TableCell>
              <TableCell>
                {feature.status === "completed" && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    Completed
                  </Badge>
                )}
                {feature.status === "in-progress" && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                    In Progress
                  </Badge>
                )}
                {feature.status === "planned" && (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                    Planned
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {feature.dataStatus === "mock" ? (
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                    Mock Data
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    Real Data
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <ul className="list-disc list-inside text-sm">
                  {feature.pendingTasks.map((task, index) => (
                    <li key={index}>{task}</li>
                  ))}
                </ul>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FeaturesTable;
