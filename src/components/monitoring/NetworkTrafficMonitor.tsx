
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "@/components/ui/charts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Network } from "lucide-react";

interface TrafficData {
  name: string;
  inbound: number;
  outbound: number;
}

interface NetworkTrafficMonitorProps {
  data: TrafficData[];
  className?: string;
}

const NetworkTrafficMonitor: React.FC<NetworkTrafficMonitorProps> = ({
  data,
  className
}) => {
  const [activeTab, setActiveTab] = useState("combined");

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-md font-medium flex items-center">
            <Network className="h-5 w-5 text-primary mr-2" />
            Network Traffic
          </CardTitle>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[300px]">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="combined">Combined</TabsTrigger>
              <TabsTrigger value="inbound">Inbound</TabsTrigger>
              <TabsTrigger value="outbound">Outbound</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <TabsContent value="combined" className="mt-0">
          <BarChart
            data={data}
            index="name"
            categories={["inbound", "outbound"]}
            colors={["blue", "green"]}
            valueFormatter={(value) => `${value} Mbps`}
            className="h-64"
          />
        </TabsContent>
        <TabsContent value="inbound" className="mt-0">
          <BarChart
            data={data}
            index="name"
            categories={["inbound"]}
            colors={["blue"]}
            valueFormatter={(value) => `${value} Mbps`}
            className="h-64"
          />
        </TabsContent>
        <TabsContent value="outbound" className="mt-0">
          <BarChart
            data={data}
            index="name"
            categories={["outbound"]}
            colors={["green"]}
            valueFormatter={(value) => `${value} Mbps`}
            className="h-64"
          />
        </TabsContent>
      </CardContent>
    </Card>
  );
};

export default NetworkTrafficMonitor;
