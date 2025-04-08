
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Box, Server, Network } from "lucide-react";

import DeploymentsTable from "./DeploymentsTable";
import PodsTable from "./PodsTable";
import ServicesTable from "./ServicesTable";

const WorkloadsTabs: React.FC = () => {
  return (
    <Tabs defaultValue="deployments">
      <TabsList className="mb-4">
        <TabsTrigger value="deployments" className="flex items-center gap-1">
          <Box className="h-4 w-4" />
          <span>Deployments</span>
        </TabsTrigger>
        <TabsTrigger value="pods" className="flex items-center gap-1">
          <Server className="h-4 w-4" />
          <span>Pods</span>
        </TabsTrigger>
        <TabsTrigger value="services" className="flex items-center gap-1">
          <Network className="h-4 w-4" />
          <span>Services</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="deployments">
        <DeploymentsTable />
      </TabsContent>
      
      <TabsContent value="pods">
        <PodsTable />
      </TabsContent>
      
      <TabsContent value="services">
        <ServicesTable />
      </TabsContent>
    </Tabs>
  );
};

export default WorkloadsTabs;
