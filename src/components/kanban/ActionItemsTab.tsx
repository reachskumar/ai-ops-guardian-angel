
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { FeatureStatus } from "./types";

interface ActionItemsTabProps {
  features: FeatureStatus[];
}

const ActionItemsTab: React.FC<ActionItemsTabProps> = ({ features }) => {
  // Flatten all pending tasks from all features
  const actionItems = features.flatMap(feature => 
    feature.pendingTasks.map(task => ({
      featureId: feature.id,
      featureName: feature.name,
      task,
      status: feature.status,
      category: feature.category
    }))
  );

  // Sort action items: planned first, then in-progress, then completed
  const sortedActionItems = [...actionItems].sort((a, b) => {
    const statusOrder = { "planned": 0, "in-progress": 1, "completed": 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableCaption>Action items derived from feature pending tasks</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Feature</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Next Steps</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedActionItems.map((item, index) => (
            <TableRow key={`${item.featureId}-${index}`}>
              <TableCell>
                <div className="font-medium">{item.task}</div>
              </TableCell>
              <TableCell>{item.featureName}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="capitalize">
                  {item.category}
                </Badge>
              </TableCell>
              <TableCell>
                {item.status === "completed" && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Completed
                  </Badge>
                )}
                {item.status === "in-progress" && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    In Progress
                  </Badge>
                )}
                {item.status === "planned" && (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Planned
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {item.status === "planned" && (
                  <div className="text-sm">
                    <span className="flex items-center text-amber-800">
                      <ArrowRight className="h-4 w-4 mr-1" /> Initiate planning
                    </span>
                  </div>
                )}
                {item.status === "in-progress" && (
                  <div className="text-sm">
                    <span className="flex items-center text-blue-800">
                      <ArrowRight className="h-4 w-4 mr-1" /> Continue implementation
                    </span>
                  </div>
                )}
                {item.status === "completed" && (
                  <div className="text-sm">
                    <span className="flex items-center text-green-800">
                      <ArrowRight className="h-4 w-4 mr-1" /> Verify and document
                    </span>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ActionItemsTab;
