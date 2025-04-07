
import React, { useState } from "react";
import { SidebarWithProvider } from "@/components/Sidebar";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, BarChart, LineChart, PieChart } from "@/components/ui/charts";

import { CalendarIcon, Download, RefreshCw } from "lucide-react";
import { addDays, format, subDays } from "date-fns";
import { DateRange } from "react-day-picker";

const AnalyticsPage: React.FC = () => {
  // Set up default date range for last 7 days
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  // Sample data for charts
  const cpuData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    value: Math.floor(Math.random() * 30) + 40,
  }));

  const storageData = [
    { name: "Used", value: 320 },
    { name: "Available", value: 680 },
  ];

  const costData = [
    { date: "Jan", EC2: 2400, RDS: 1200, S3: 800, ECS: 500 },
    { date: "Feb", EC2: 1982, RDS: 1228, S3: 795, ECS: 510 },
    { date: "Mar", EC2: 2190, RDS: 1100, S3: 950, ECS: 520 },
    { date: "Apr", EC2: 2390, RDS: 1298, S3: 910, ECS: 530 },
    { date: "May", EC2: 2480, RDS: 1280, S3: 880, ECS: 540 },
    { date: "Jun", EC2: 2590, RDS: 1190, S3: 920, ECS: 550 },
  ];

  const errorRatesData = [
    { date: "Mon", "4xx": 45, "5xx": 12 },
    { date: "Tue", "4xx": 38, "5xx": 8 },
    { date: "Wed", "4xx": 52, "5xx": 14 },
    { date: "Thu", "4xx": 40, "5xx": 11 },
    { date: "Fri", "4xx": 37, "5xx": 9 },
    { date: "Sat", "4xx": 25, "5xx": 5 },
    { date: "Sun", "4xx": 22, "5xx": 3 },
  ];
  
  const regionData = [
    { name: "us-east-1", value: 42 },
    { name: "us-west-2", value: 28 },
    { name: "eu-west-1", value: 15 },
    { name: "ap-northeast-1", value: 10 },
    { name: "other", value: 5 },
  ];

  return (
    <SidebarWithProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
              <p className="text-muted-foreground">
                Visualize infrastructure metrics, costs, and usage patterns
              </p>
            </div>
            <div className="flex items-center gap-4">
              <DatePickerWithRange
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
              <Select defaultValue="1h">
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Granularity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5m">5 minutes</SelectItem>
                  <SelectItem value="15m">15 minutes</SelectItem>
                  <SelectItem value="1h">1 hour</SelectItem>
                  <SelectItem value="6h">6 hours</SelectItem>
                  <SelectItem value="1d">1 day</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <Tabs defaultValue="performance">
            <TabsList className="mb-6">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="cost">Cost Analysis</TabsTrigger>
              <TabsTrigger value="usage">Usage Patterns</TabsTrigger>
              <TabsTrigger value="errors">Errors & Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="performance">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* CPU Usage Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>CPU Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AreaChart
                      data={cpuData}
                      categories={["value"]}
                      index="time"
                      colors={["blue"]}
                      valueFormatter={(value) => `${value}%`}
                      className="h-[300px]"
                    />
                  </CardContent>
                </Card>

                {/* Memory Usage Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Memory Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      data={cpuData.map(item => ({ ...item, value: item.value - 10 + Math.floor(Math.random() * 20) }))}
                      categories={["value"]}
                      index="time"
                      colors={["green"]}
                      valueFormatter={(value) => `${value}%`}
                      className="h-[300px]"
                    />
                  </CardContent>
                </Card>

                {/* Disk Usage Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Storage Usage</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <PieChart
                      data={storageData}
                      category="value"
                      index="name"
                      colors={["slate", "blue"]}
                      valueFormatter={(value) => `${value}GB`}
                      className="h-[300px]"
                    />
                  </CardContent>
                </Card>

                {/* Network Throughput Card */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Network Throughput</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      data={[
                        { time: "00:00", ingress: 235, egress: 120 },
                        { time: "04:00", ingress: 187, egress: 95 },
                        { time: "08:00", ingress: 452, egress: 230 },
                        { time: "12:00", ingress: 560, egress: 280 },
                        { time: "16:00", ingress: 480, egress: 240 },
                        { time: "20:00", ingress: 380, egress: 190 },
                        { time: "24:00", ingress: 210, egress: 105 },
                      ]}
                      categories={["ingress", "egress"]}
                      index="time"
                      colors={["blue", "red"]}
                      valueFormatter={(value) => `${value} Mbps`}
                      className="h-[300px]"
                    />
                  </CardContent>
                </Card>

                {/* Response Time Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>API Response Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      data={[
                        { time: "00:00", value: 235 },
                        { time: "04:00", value: 187 },
                        { time: "08:00", value: 452 },
                        { time: "12:00", value: 560 },
                        { time: "16:00", value: 480 },
                        { time: "20:00", value: 380 },
                        { time: "24:00", value: 210 },
                      ]}
                      categories={["value"]}
                      index="time"
                      colors={["purple"]}
                      valueFormatter={(value) => `${value}ms`}
                      className="h-[300px]"
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="cost">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Monthly Cost Breakdown */}
                <Card className="col-span-full">
                  <CardHeader>
                    <CardTitle>Monthly Cost Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BarChart
                      data={costData}
                      categories={["EC2", "RDS", "S3", "ECS"]}
                      index="date"
                      colors={["blue", "green", "yellow", "purple"]}
                      valueFormatter={(value) => `$${value}`}
                      className="h-[400px]"
                    />
                  </CardContent>
                </Card>

                {/* Cost by Service */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cost by Service</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <PieChart
                      data={[
                        { name: "EC2", value: 2590 },
                        { name: "RDS", value: 1190 },
                        { name: "S3", value: 920 },
                        { name: "ECS", value: 550 },
                        { name: "Other", value: 340 },
                      ]}
                      category="value"
                      index="name"
                      colors={["blue", "green", "yellow", "purple", "slate"]}
                      valueFormatter={(value) => `$${value}`}
                      className="h-[300px]"
                    />
                  </CardContent>
                </Card>

                {/* Cost by Region */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cost by Region</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <PieChart
                      data={regionData}
                      category="value"
                      index="name"
                      colors={["blue", "green", "yellow", "purple", "slate"]}
                      valueFormatter={(value) => `${value}%`}
                      className="h-[300px]"
                    />
                  </CardContent>
                </Card>

                {/* Cost Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cost Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      data={[
                        { date: "Jan", value: 4400 },
                        { date: "Feb", value: 4515 },
                        { date: "Mar", value: 4760 },
                        { date: "Apr", value: 5128 },
                        { date: "May", value: 5180 },
                        { date: "Jun", value: 5250 },
                      ]}
                      categories={["value"]}
                      index="date"
                      colors={["blue"]}
                      valueFormatter={(value) => `$${value}`}
                      className="h-[300px]"
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="usage">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Instance Distribution */}
                <Card className="col-span-full md:col-span-1">
                  <CardHeader>
                    <CardTitle>Instance Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BarChart
                      data={[
                        { type: "t2.micro", count: 42 },
                        { type: "t2.small", count: 28 },
                        { type: "t2.medium", count: 15 },
                        { type: "m5.large", count: 8 },
                        { type: "c5.large", count: 5 },
                        { type: "other", count: 2 },
                      ]}
                      categories={["count"]}
                      index="type"
                      colors={["blue"]}
                      className="h-[300px]"
                    />
                  </CardContent>
                </Card>

                {/* Region Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Region Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <PieChart
                      data={regionData}
                      category="value"
                      index="name"
                      colors={["blue", "green", "yellow", "purple", "slate"]}
                      valueFormatter={(value) => `${value}%`}
                      className="h-[300px]"
                    />
                  </CardContent>
                </Card>

                {/* Daily Usage Pattern */}
                <Card className="md:col-span-2 lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Daily Usage Pattern</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      data={Array.from({ length: 24 }, (_, i) => ({
                        hour: `${i}:00`,
                        usage: Math.floor(Math.random() * 50) + 50,
                      }))}
                      categories={["usage"]}
                      index="hour"
                      colors={["blue"]}
                      valueFormatter={(value) => `${value}%`}
                      className="h-[300px]"
                    />
                  </CardContent>
                </Card>

                {/* Resource Utilization */}
                <Card className="col-span-full">
                  <CardHeader>
                    <CardTitle>Resource Utilization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BarChart
                      data={[
                        { resource: "EC2", allocated: 100, utilized: 72 },
                        { resource: "RDS", allocated: 100, utilized: 85 },
                        { resource: "ECS", allocated: 100, utilized: 68 },
                        { resource: "ElastiCache", allocated: 100, utilized: 62 },
                        { resource: "Lambda", allocated: 100, utilized: 45 },
                      ]}
                      categories={["allocated", "utilized"]}
                      index="resource"
                      colors={["blue", "green"]}
                      valueFormatter={(value) => `${value}%`}
                      className="h-[300px]"
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="errors">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Error Rates */}
                <Card className="col-span-full md:col-span-2">
                  <CardHeader>
                    <CardTitle>Error Rates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BarChart
                      data={errorRatesData}
                      categories={["4xx", "5xx"]}
                      index="date"
                      colors={["yellow", "red"]}
                      className="h-[300px]"
                    />
                  </CardContent>
                </Card>

                {/* Error Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Error Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <PieChart
                      data={[
                        { type: "401 Unauthorized", value: 45 },
                        { type: "404 Not Found", value: 28 },
                        { type: "500 Server Error", value: 15 },
                        { type: "503 Service Unavailable", value: 8 },
                        { type: "Other", value: 4 },
                      ]}
                      category="value"
                      index="type"
                      colors={["blue", "green", "red", "yellow", "slate"]}
                      valueFormatter={(value) => `${value}%`}
                      className="h-[300px]"
                    />
                  </CardContent>
                </Card>

                {/* Log Volume */}
                <Card className="col-span-full">
                  <CardHeader>
                    <CardTitle>Log Volume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AreaChart
                      data={[
                        { time: "00:00", info: 1250, warn: 120, error: 30 },
                        { time: "04:00", info: 950, warn: 85, error: 22 },
                        { time: "08:00", info: 2850, warn: 320, error: 85 },
                        { time: "12:00", info: 3250, warn: 280, error: 92 },
                        { time: "16:00", info: 2950, warn: 250, error: 78 },
                        { time: "20:00", info: 1950, warn: 180, error: 45 },
                        { time: "24:00", info: 1050, warn: 95, error: 28 },
                      ]}
                      categories={["info", "warn", "error"]}
                      index="time"
                      colors={["blue", "yellow", "red"]}
                      valueFormatter={(value) => `${value}`}
                      className="h-[300px]"
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SidebarWithProvider>
  );
};

export default AnalyticsPage;
