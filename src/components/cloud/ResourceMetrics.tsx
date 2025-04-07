
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock, AlertTriangle, Bell } from 'lucide-react';
import { ResourceMetric } from '@/services/cloud';
import { AreaChart } from '@/components/ui/charts';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

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
  const [alertThreshold, setAlertThreshold] = useState<number | null>(80);
  const { toast } = useToast();
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const handleSetAlert = (metricName: string) => {
    if (!alertThreshold) return;
    
    toast({
      title: "Alert set",
      description: `You'll be notified when ${metricName} exceeds ${alertThreshold}%`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-semibold flex items-center">
          <Clock className="mr-2 h-4 w-4" />
          Real-Time Resource Metrics
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
          {metrics.map((metric) => {
            const latestValue = metric.data[metric.data.length - 1]?.value;
            return (
              <Card key={metric.name} className={
                metric.status === 'warning' ? 'border-yellow-500 dark:border-yellow-700' :
                metric.status === 'critical' ? 'border-red-500 dark:border-red-700' : ''
              }>
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <span>{metric.name.toUpperCase()}</span>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        metric.status === 'warning' ? 'warning' :
                        metric.status === 'critical' ? 'destructive' : 
                        'default'
                      }>
                        {latestValue !== undefined ? `${latestValue.toFixed(1)} ${metric.unit}` : 'No data'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSetAlert(metric.name)}
                        title="Set alert threshold"
                      >
                        <Bell className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="h-[120px]">
                    <AreaChart
                      data={metric.data.map(d => ({
                        time: formatTime(d.timestamp),
                        value: d.value
                      }))}
                      categories={["value"]}
                      index="time"
                      colors={[
                        metric.status === 'critical' ? 'red' :
                        metric.status === 'warning' ? 'amber' : 
                        'blue'
                      ]}
                      valueFormatter={(value) => `${value}${metric.unit}`}
                      className="h-full"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResourceMetrics;
