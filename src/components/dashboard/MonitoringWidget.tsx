
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, PieChart as PieChartIcon, LineChart, MoreVertical } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AreaChart, BarChart, PieChart } from "@/components/ui/charts";

interface MonitoringWidgetProps {
  title: string;
  type: "area" | "bar" | "pie";
  data: any[];
  height?: number;
}

const MonitoringWidget: React.FC<MonitoringWidgetProps> = ({ 
  title, 
  type,
  data,
  height = 180
}) => {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  const renderChart = () => {
    switch (type) {
      case "area":
        return (
          <AreaChart
            data={data}
            categories={["value"]}
            index="time"
            colors={["blue"]}
            valueFormatter={(value) => `${value}%`}
            className="h-full"
          />
        );
      case "bar":
        return (
          <BarChart
            data={data}
            categories={["value"]}
            index="name"
            colors={["blue"]}
            valueFormatter={(value) => `${value}`}
            className="h-full"
          />
        );
      case "pie":
        return (
          <PieChart
            data={data}
            category="value"
            index="name"
            colors={COLORS}
            valueFormatter={(value) => `${value}`}
            className="h-full"
          />
        );
      default:
        return null;
    }
  };
  
  const getChartIcon = () => {
    switch (type) {
      case "area":
        return <LineChart className="h-4 w-4 text-muted-foreground" />;
      case "bar":
        return <BarChart3 className="h-4 w-4 text-muted-foreground" />;
      case "pie":
        return <PieChartIcon className="h-4 w-4 text-muted-foreground" />;
      default:
        return <BarChart3 className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {getChartIcon()}
          {title}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Last 1 hour</DropdownMenuItem>
            <DropdownMenuItem>Last 24 hours</DropdownMenuItem>
            <DropdownMenuItem>Last 7 days</DropdownMenuItem>
            <DropdownMenuItem>Export data</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div style={{ height: `${height}px` }}>
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  );
};

export default MonitoringWidget;
