
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { features } from "./features-data";
import KanbanSummary from "./KanbanSummary";
import FeaturesTable from "./FeaturesTable";

const ProjectKanban: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Kanban</CardTitle>
          <CardDescription>
            Overview of all features and their implementation status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <KanbanSummary features={features} />
          <FeaturesTable features={features} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectKanban;
