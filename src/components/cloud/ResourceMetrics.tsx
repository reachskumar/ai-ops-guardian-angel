
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock, AlertTriangle } from 'lucide-react';
import { ResourceMetric } from '@/services/cloudProviderService';

interface ResourceMetricsProps {
  metrics: ResourceMetric[];
  onRefresh: () => void;
  loading: boolean;
}

const ResourceMetrics: React.FC<ResourceMetricsProps> = ({
  metrics,
  onRefresh,
  loading,
}) => {
  const [timeRange, setTimeRange] = useState('1h');
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-semibold flex items-center">
          <Clock className="mr-2 h-4 w-4" />
          Resource Metrics
        </h3>
        <div className="flex items-center gap-2">
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      {metrics.length === 0 ? (
        <Card className="border border-dashed">
          <CardContent className="py-6 flex flex-col items-center justify-center text-center text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mb-2" />
            <p>No metrics available for this resource</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric) => (
            <Card key={metric.name} className={
              metric.status === 'warning' ? 'border-yellow-500 dark:border-yellow-700' :
              metric.status === 'critical' ? 'border-red-500 dark:border-red-700' : ''
            }>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>{metric.name}</span>
                  <span className={
                    metric.status === 'warning' ? 'text-yellow-500 dark:text-yellow-400' :
                    metric.status === 'critical' ? 'text-red-500 dark:text-red-400' : 
                    'text-green-500 dark:text-green-400'
                  }>
                    {metric.data[metric.data.length - 1]?.value.toFixed(1)} {metric.unit}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={metric.data}
                      margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id={`color${metric.name}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={formatTime}
                        tick={{ fontSize: 10, fill: '#9CA3AF' }}
                        tickLine={{ stroke: '#374151' }}
                        axisLine={{ stroke: '#374151' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fill: '#9CA3AF' }}
                        tickLine={{ stroke: '#374151' }}
                        axisLine={{ stroke: '#374151' }}
                        domain={[0, 'auto']}
                        tickFormatter={(value) => `${value}${metric.unit === '%' ? '%' : ''}`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${value} ${metric.unit}`, metric.name]}
                        labelFormatter={(label) => `Time: ${formatTime(label)}`}
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
                        fill={`url(#color${metric.name})` as string} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceMetrics;
