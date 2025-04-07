
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, BarChart, PieChart } from "@/components/ui/charts";

export const ErrorsLogsTab: React.FC = () => {
  const errorRatesData = [
    { date: "Mon", "4xx": 45, "5xx": 12 },
    { date: "Tue", "4xx": 38, "5xx": 8 },
    { date: "Wed", "4xx": 52, "5xx": 14 },
    { date: "Thu", "4xx": 40, "5xx": 11 },
    { date: "Fri", "4xx": 37, "5xx": 9 },
    { date: "Sat", "4xx": 25, "5xx": 5 },
    { date: "Sun", "4xx": 22, "5xx": 3 },
  ];

  return (
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
  );
};

export default ErrorsLogsTab;
