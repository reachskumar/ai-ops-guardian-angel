
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Activity, RefreshCw } from "lucide-react";
import { ResourceMetric, getResourceMetrics } from "@/services/cloud";
import { useToast } from "@/hooks/use-toast";
import { MetricsOverviewPanel, MetricDetailPanel } from "./metrics";

interface ResourceMetricsDashboardProps {
  resourceId: string;
  resourceType: string;
}

const ResourceMetricsDashboard: React.FC<ResourceMetricsDashboardProps> = ({
  resourceId,
  resourceType,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("1h");
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<ResourceMetric[]>([]);
  const { toast } = useToast();
  
  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      // Fixed function call with just one argument
      const metricsData = await getResourceMetrics(resourceId);
      setMetrics(metricsData);
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
      toast({
        title: "Failed to load metrics",
        description: "Could not retrieve resource metrics data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMetrics();
  }, [resourceId, timeRange]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Activity className="h-5 w-5 mr-2 text-primary" />
            Resource Metrics
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last hour</SelectItem>
                <SelectItem value="6h">Last 6 hours</SelectItem>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchMetrics} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cpu">CPU</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
            <TabsTrigger value="disk">Storage</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <MetricsOverviewPanel metrics={metrics} />
          </TabsContent>
          
          <TabsContent value="cpu">
            <MetricDetailPanel metricName="cpu" metrics={metrics} />
          </TabsContent>
          
          <TabsContent value="memory">
            <MetricDetailPanel metricName="memory" metrics={metrics} />
          </TabsContent>
          
          <TabsContent value="disk">
            <MetricDetailPanel metricName="disk" metrics={metrics} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ResourceMetricsDashboard;
