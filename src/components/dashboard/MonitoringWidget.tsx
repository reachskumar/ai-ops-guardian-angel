
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { BarChart3, PieChart as PieChartIcon, LineChart, MoreVertical } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart
              data={data}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10, fill: '#9CA3AF' }} 
                tickLine={{ stroke: '#374151' }} 
                axisLine={{ stroke: '#374151' }}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: '#9CA3AF' }} 
                tickLine={{ stroke: '#374151' }} 
                axisLine={{ stroke: '#374151' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222 47% 14%)', 
                  borderColor: 'hsl(215 25% 22%)',
                  color: '#F3F4F6'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorMetric)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={data}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10, fill: '#9CA3AF' }} 
                tickLine={{ stroke: '#374151' }} 
                axisLine={{ stroke: '#374151' }}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: '#9CA3AF' }} 
                tickLine={{ stroke: '#374151' }} 
                axisLine={{ stroke: '#374151' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222 47% 14%)', 
                  borderColor: 'hsl(215 25% 22%)',
                  color: '#F3F4F6'
                }} 
              />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        );
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                innerRadius={45}
                outerRadius={60}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222 47% 14%)', 
                  borderColor: 'hsl(215 25% 22%)',
                  color: '#F3F4F6'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
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
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default MonitoringWidget;
