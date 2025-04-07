
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Search, Download, RefreshCw } from "lucide-react";

import ClustersTab from "./tabs/ClustersTab";
import NodesTab from "./tabs/NodesTab";
import WorkloadsTab from "./tabs/WorkloadsTab";
import ConfigTab from "./tabs/ConfigTab";

interface KubernetesTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const KubernetesTabs: React.FC<KubernetesTabsProps> = ({
  activeTab = "clusters",
  onTabChange
}) => {
  return (
    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={onTabChange}>
      <div className="flex items-center justify-between mb-4">
        <TabsList>
          <TabsTrigger value="clusters">Clusters</TabsTrigger>
          <TabsTrigger value="nodes">Nodes</TabsTrigger>
          <TabsTrigger value="workloads">Workloads</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <Search className="h-4 w-4" />
            Search
          </Button>
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <TabsContent value="clusters">
        <Card>
          <CardHeader>
            <CardTitle>Kubernetes Clusters</CardTitle>
          </CardHeader>
          <CardContent>
            <ClustersTab />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="nodes">
        <Card>
          <CardHeader>
            <CardTitle>Kubernetes Nodes</CardTitle>
          </CardHeader>
          <CardContent>
            <NodesTab />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="workloads">
        <Card>
          <CardHeader>
            <CardTitle>Kubernetes Workloads</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkloadsTab />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="config">
        <Card>
          <CardHeader>
            <CardTitle>Kubernetes Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <ConfigTab />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default KubernetesTabs;
