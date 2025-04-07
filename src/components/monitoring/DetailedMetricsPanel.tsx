
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AreaChart, 
  BarChart,
  LineChart
} from "@/components/ui/charts";
import { Activity, Cpu, MemoryStick, HardDrive, Network } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DetailedMetricsPanelProps {
  serverName: string;
  serverId: string;
  className?: string;
}

const DetailedMetricsPanel: React.FC<DetailedMetricsPanelProps> = ({
  serverName,
  serverId,
  className
}) => {
  const [activeTab, setActiveTab] = useState("cpu");
  const [timeRange, setTimeRange] = useState("1h");
  
  // Generate mock data for each metric type
  const generateTimeSeriesData = (count: number, min: number, max: number) => {
    const now = new Date();
    return Array.from({ length: count }, (_, i) => {
      const time = new Date(now.getTime() - (count - i) * 60000);
      return { 
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        value: Math.floor(Math.random() * (max - min + 1)) + min
      };
    });
  };
  
  const cpuData = generateTimeSeriesData(60, 20, 85);
  const memoryData = generateTimeSeriesData(60, 40, 75);
  const diskIOData = generateTimeSeriesData(60, 5, 50);
  const networkData = generateTimeSeriesData(60, 10, 120);
  
  const getDataByTab = () => {
    switch (activeTab) {
      case "cpu":
        return cpuData;
      case "memory":
        return memoryData;
      case "disk":
        return diskIOData;
      case "network":
        return networkData;
      default:
        return cpuData;
    }
  };
  
  const getTabIcon = () => {
    switch (activeTab) {
      case "cpu":
        return <Cpu className="h-4 w-4 mr-2 text-blue-500" />;
      case "memory":
        return <MemoryStick className="h-4 w-4 mr-2 text-green-500" />;
      case "disk":
        return <HardDrive className="h-4 w-4 mr-2 text-amber-500" />;
      case "network":
        return <Network className="h-4 w-4 mr-2 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 mr-2" />;
    }
  };
  
  const getMetricUnit = () => {
    switch (activeTab) {
      case "cpu":
        return "%";
      case "memory":
        return "%";
      case "disk":
        return "IOPS";
      case "network":
        return "Mbps";
      default:
        return "";
    }
  };
  
  const getCurrentValue = () => {
    const data = getDataByTab();
    return data[data.length - 1].value;
  };
  
  const getAverageValue = () => {
    const data = getDataByTab();
    const sum = data.reduce((acc, curr) => acc + curr.value, 0);
    return Math.round(sum / data.length);
  };
  
  const getMaxValue = () => {
    return Math.max(...getDataByTab().map(d => d.value));
  };
  
  const getStatus = () => {
    const current = getCurrentValue();
    const metric = activeTab;
    
    if (metric === "cpu" && current > 80) return { label: "High", color: "bg-red-500" };
    if (metric === "memory" && current > 80) return { label: "High", color: "bg-red-500" };
    if (metric === "cpu" && current > 60) return { label: "Moderate", color: "bg-amber-500" };
    if (metric === "memory" && current > 60) return { label: "Moderate", color: "bg-amber-500" };
    
    return { label: "Normal", color: "bg-green-500" };
  };
  
  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "1h":
        return "Last Hour";
      case "6h":
        return "Last 6 Hours";
      case "24h":
        return "Last 24 Hours";
      case "7d":
        return "Last 7 Days";
      default:
        return "Last Hour";
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex flex-col space-y-1.5">
          <CardTitle className="text-md font-medium flex items-center">
            <Activity className="h-5 w-5 text-primary mr-2" />
            {serverName} Performance Metrics
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {getTimeRangeLabel()} • Updated 2 minutes ago
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Select Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last hour</SelectItem>
            <SelectItem value="6h">Last 6 hours</SelectItem>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="cpu">
              <Cpu className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">CPU</span>
            </TabsTrigger>
            <TabsTrigger value="memory">
              <MemoryStick className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Memory</span>
            </TabsTrigger>
            <TabsTrigger value="disk">
              <HardDrive className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Disk</span>
            </TabsTrigger>
            <TabsTrigger value="network">
              <Network className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Network</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground mb-1">Current</span>
              <div className="flex items-center">
                {getTabIcon()}
                <span className="text-2xl font-bold">
                  {getCurrentValue()}{getMetricUnit()}
                </span>
              </div>
              <Badge className={`mt-2 ${getStatus().color}`}>
                {getStatus().label}
              </Badge>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground mb-1">Average</span>
              <span className="text-2xl font-bold">
                {getAverageValue()}{getMetricUnit()}
              </span>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground mb-1">Maximum</span>
              <span className="text-2xl font-bold">
                {getMaxValue()}{getMetricUnit()}
              </span>
            </div>
          </div>
          
          <TabsContent value="cpu" className="mt-0 pt-0">
            <AreaChart
              data={cpuData}
              index="time"
              categories={["value"]}
              colors={["blue"]}
              valueFormatter={(value) => `${value}%`}
              className="h-[300px]"
            />
          </TabsContent>
          
          <TabsContent value="memory" className="mt-0 pt-0">
            <AreaChart
              data={memoryData}
              index="time"
              categories={["value"]}
              colors={["green"]}
              valueFormatter={(value) => `${value}%`}
              className="h-[300px]"
            />
          </TabsContent>
          
          <TabsContent value="disk" className="mt-0 pt-0">
            <LineChart
              data={diskIOData}
              index="time"
              categories={["value"]}
              colors={["amber"]}
              valueFormatter={(value) => `${value} IOPS`}
              className="h-[300px]"
            />
          </TabsContent>
          
          <TabsContent value="network" className="mt-0 pt-0">
            <LineChart
              data={networkData}
              index="time"
              categories={["value"]}
              colors={["purple"]}
              valueFormatter={(value) => `${value} Mbps`}
              className="h-[300px]"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DetailedMetricsPanel;
