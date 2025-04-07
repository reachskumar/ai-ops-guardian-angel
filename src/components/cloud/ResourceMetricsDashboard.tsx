
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AreaChart, LineChart } from "@/components/ui/charts";
import { Activity, Cpu, HardDrive, Network, RefreshCw } from "lucide-react";
import { ResourceMetric, getResourceMetrics } from "@/services/cloudProviderService";
import { useToast } from "@/hooks/use-toast";

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
      const metricsData = await getResourceMetrics(resourceId, ['cpu', 'memory', 'network', 'disk'], timeRange);
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
  
  // Transform metric data for charts
  const transformMetricData = (metricName: string) => {
    const metric = metrics.find(m => m.name.toLowerCase() === metricName.toLowerCase());
    if (!metric) return [];
    
    return metric.data.map(point => ({
      time: new Date(point.timestamp).toLocaleTimeString(),
      value: point.value
    }));
  };
  
  // Get the status of a specific metric
  const getMetricStatus = (metricName: string) => {
    const metric = metrics.find(m => m.name.toLowerCase() === metricName.toLowerCase());
    return metric?.status || "normal";
  };
  
  // Get badge variant based on status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "critical": return "destructive";
      case "warning": return "warning";
      case "normal":
      default: return "default";
    }
  };

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* CPU Status Card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Cpu className="h-4 w-4 mr-2 text-blue-500" />
                      CPU
                    </CardTitle>
                    <Badge variant={getStatusBadgeVariant(getMetricStatus("cpu"))}>
                      {getMetricStatus("cpu")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {metrics.find(m => m.name.toLowerCase() === "cpu") ? (
                    <div className="text-2xl font-bold">
                      {metrics.find(m => m.name.toLowerCase() === "cpu")?.data.slice(-1)[0].value}%
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No data available</div>
                  )}
                </CardContent>
              </Card>
              
              {/* Memory Status Card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <div className="h-4 w-4 mr-2 bg-green-500 rounded-full" />
                      Memory
                    </CardTitle>
                    <Badge variant={getStatusBadgeVariant(getMetricStatus("memory"))}>
                      {getMetricStatus("memory")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {metrics.find(m => m.name.toLowerCase() === "memory") ? (
                    <div className="text-2xl font-bold">
                      {metrics.find(m => m.name.toLowerCase() === "memory")?.data.slice(-1)[0].value}%
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No data available</div>
                  )}
                </CardContent>
              </Card>
              
              {/* Disk Status Card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <HardDrive className="h-4 w-4 mr-2 text-amber-500" />
                      Disk
                    </CardTitle>
                    <Badge variant={getStatusBadgeVariant(getMetricStatus("disk"))}>
                      {getMetricStatus("disk")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {metrics.find(m => m.name.toLowerCase() === "disk") ? (
                    <div className="text-2xl font-bold">
                      {metrics.find(m => m.name.toLowerCase() === "disk")?.data.slice(-1)[0].value} IOPS
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No data available</div>
                  )}
                </CardContent>
              </Card>
              
              {/* Network Status Card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Network className="h-4 w-4 mr-2 text-purple-500" />
                      Network
                    </CardTitle>
                    <Badge variant={getStatusBadgeVariant(getMetricStatus("network"))}>
                      {getMetricStatus("network")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {metrics.find(m => m.name.toLowerCase() === "network") ? (
                    <div className="text-2xl font-bold">
                      {metrics.find(m => m.name.toLowerCase() === "network")?.data.slice(-1)[0].value} Mbps
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No data available</div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CPU Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">CPU Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                  <AreaChart
                    data={transformMetricData("cpu")}
                    index="time"
                    categories={["value"]}
                    colors={["blue"]}
                    valueFormatter={(value) => `${value}%`}
                    className="h-48"
                  />
                </CardContent>
              </Card>
              
              {/* Memory Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Memory Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                  <AreaChart
                    data={transformMetricData("memory")}
                    index="time"
                    categories={["value"]}
                    colors={["green"]}
                    valueFormatter={(value) => `${value}%`}
                    className="h-48"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="cpu">
            <Card>
              <CardHeader>
                <CardTitle>CPU Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={transformMetricData("cpu")}
                  index="time"
                  categories={["value"]}
                  colors={["blue"]}
                  valueFormatter={(value) => `${value}%`}
                  className="h-80"
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="memory">
            <Card>
              <CardHeader>
                <CardTitle>Memory Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={transformMetricData("memory")}
                  index="time"
                  categories={["value"]}
                  colors={["green"]}
                  valueFormatter={(value) => `${value}%`}
                  className="h-80"
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="disk">
            <Card>
              <CardHeader>
                <CardTitle>Storage Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={transformMetricData("disk")}
                  index="time"
                  categories={["value"]}
                  colors={["amber"]}
                  valueFormatter={(value) => `${value} IOPS`}
                  className="h-80"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ResourceMetricsDashboard;
