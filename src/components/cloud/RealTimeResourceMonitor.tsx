import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CloudResource } from '@/services/cloud/types';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Network, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RealTimeResourceMonitorProps {
  resources: CloudResource[];
}

interface MetricData {
  timestamp: string;
  cpu: number;
  memory: number;
  network: number;
  disk: number;
}

const RealTimeResourceMonitor: React.FC<RealTimeResourceMonitorProps> = ({ resources }) => {
  const [metrics, setMetrics] = useState<Record<string, MetricData[]>>({});
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);

  // Simulate real-time metrics
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const now = new Date().toISOString();
      
      setMetrics(prev => {
        const newMetrics = { ...prev };
        
        resources.forEach(resource => {
          if (!newMetrics[resource.id]) {
            newMetrics[resource.id] = [];
          }
          
          // Generate random but realistic metrics
          const newDataPoint: MetricData = {
            timestamp: now,
            cpu: Math.max(0, Math.min(100, 20 + Math.random() * 40 + Math.sin(Date.now() / 10000) * 10)),
            memory: Math.max(0, Math.min(100, 30 + Math.random() * 30 + Math.cos(Date.now() / 8000) * 15)),
            network: Math.max(0, Math.random() * 50 + Math.sin(Date.now() / 12000) * 20),
            disk: Math.max(0, Math.min(100, 15 + Math.random() * 20))
          };
          
          // Keep only last 20 data points
          newMetrics[resource.id] = [...newMetrics[resource.id], newDataPoint].slice(-20);
        });
        
        return newMetrics;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [resources, isLive]);

  const getLatestMetric = (resourceId: string, metric: keyof MetricData) => {
    const resourceMetrics = metrics[resourceId];
    if (!resourceMetrics || resourceMetrics.length === 0) return 0;
    const latest = resourceMetrics[resourceMetrics.length - 1];
    return typeof latest[metric] === 'number' ? latest[metric] : 0;
  };

  const getTrend = (resourceId: string, metric: keyof MetricData) => {
    const resourceMetrics = metrics[resourceId];
    if (!resourceMetrics || resourceMetrics.length < 2) return 'stable';
    
    const latest = resourceMetrics[resourceMetrics.length - 1];
    const previous = resourceMetrics[resourceMetrics.length - 2];
    
    const latestValue = typeof latest[metric] === 'number' ? latest[metric] : 0;
    const prevValue = typeof previous[metric] === 'number' ? previous[metric] : 0;
    
    const diff = latestValue - prevValue;
    if (diff > 2) return 'up';
    if (diff < -2) return 'down';
    return 'stable';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-green-500" />;
      default: return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  const selectedResourceData = selectedResource ? metrics[selectedResource] || [] : [];

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Real-Time Resource Monitor
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isLive ? "default" : "secondary"} className="flex items-center gap-1">
                {isLive && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                {isLive ? 'Live' : 'Paused'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLive(!isLive)}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLive ? 'animate-spin' : ''}`} />
                {isLive ? 'Pause' : 'Resume'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource) => (
          <Card 
            key={resource.id} 
            className={`cursor-pointer transition-all ${
              selectedResource === resource.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedResource(resource.id)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>{resource.name}</span>
                <Badge variant={resource.status === 'running' ? 'default' : 'secondary'}>
                  {resource.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Cpu className="h-3 w-3" />
                    <span>CPU</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{getLatestMetric(resource.id, 'cpu').toFixed(1)}%</span>
                    {getTrendIcon(getTrend(resource.id, 'cpu'))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    <span>Memory</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{getLatestMetric(resource.id, 'memory').toFixed(1)}%</span>
                    {getTrendIcon(getTrend(resource.id, 'memory'))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Network className="h-3 w-3" />
                    <span>Network</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{getLatestMetric(resource.id, 'network').toFixed(1)} MB/s</span>
                    {getTrendIcon(getTrend(resource.id, 'network'))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3" />
                    <span>Disk</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{getLatestMetric(resource.id, 'disk').toFixed(1)}%</span>
                    {getTrendIcon(getTrend(resource.id, 'disk'))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Chart for Selected Resource */}
      {selectedResource && selectedResourceData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Detailed Metrics - {resources.find(r => r.id === selectedResource)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={selectedResourceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(1)}${name === 'network' ? ' MB/s' : '%'}`,
                    name.charAt(0).toUpperCase() + name.slice(1)
                  ]}
                />
                <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU" />
                <Line type="monotone" dataKey="memory" stroke="#82ca9d" name="Memory" />
                <Line type="monotone" dataKey="network" stroke="#ffc658" name="Network" />
                <Line type="monotone" dataKey="disk" stroke="#ff7300" name="Disk" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealTimeResourceMonitor;
