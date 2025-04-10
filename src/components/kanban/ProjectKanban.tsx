
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { features } from "./features-data";
import KanbanSummary from "./KanbanSummary";
import FeaturesTable from "./FeaturesTable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ActionItemsTab from "./ActionItemsTab";

const ProjectKanban: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

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
          
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="action-items">Action Items</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <FeaturesTable features={features} />
            </TabsContent>
            
            <TabsContent value="action-items">
              <ActionItemsTab features={features} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectKanban;
