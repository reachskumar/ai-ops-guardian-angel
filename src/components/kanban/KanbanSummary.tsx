
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock, Code } from "lucide-react";
import { FeatureStatus } from "./types";

interface KanbanSummaryProps {
  features: FeatureStatus[];
}

const KanbanSummary: React.FC<KanbanSummaryProps> = ({ features }) => {
  return (
    <div className="mb-6 flex flex-wrap gap-4">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle className="h-4 w-4 mr-1" />
          Completed: {features.filter(f => f.status === "completed").length}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
          <Clock className="h-4 w-4 mr-1" />
          In Progress: {features.filter(f => f.status === "in-progress").length}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
          <AlertCircle className="h-4 w-4 mr-1" />
          Planned: {features.filter(f => f.status === "planned").length}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
          <Code className="h-4 w-4 mr-1" />
          Using Mock Data: {features.filter(f => f.dataStatus === "mock").length}
        </Badge>
      </div>
    </div>
  );
};

export default KanbanSummary;
