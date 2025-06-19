
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Zap,
  Play,
  Pause
} from "lucide-react";
import { LineChart, AreaChart } from "@/components/ui/charts";
import { useRealtimeData } from "@/services/realtime";

interface PerformanceMetric {
  timestamp: string;
  cpu: number;
  memory: number;
  network: number;
  responseTime: number;
  errorRate: number;
}

interface OptimizationSuggestion {
  id: string;
  type: 'cpu' | 'memory' | 'network' | 'database';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  estimatedSavings: string;
  implementationEffort: 'low' | 'medium' | 'high';
}

const RealTimeMonitoring: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [optimizations, setOptimizations] = useState<OptimizationSuggestion[]>([]);
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: 'warning' | 'critical';
    message: string;
    timestamp: string;
  }>>([]);

  // Mock WebSocket data source for real-time metrics
  const dataSource = {
    type: 'websocket' as const,
    name: 'performance-metrics',
    url: 'wss://your-websocket-endpoint.com/metrics',
    enabled: true,
    reconnectAttempts: 5,
    reconnectInterval: 5000
  };

  const { messages: realtimeMessages, isConnected } = useRealtimeData(
    dataSource,
    {
      mockData: true,
      onMessage: (message) => {
        // Process real-time metric data
        if (message.data && typeof message.data === 'object') {
          const newMetric: PerformanceMetric = {
            timestamp: new Date().toISOString(),
            cpu: Math.random() * 100,
            memory: Math.random() * 100,
            network: Math.random() * 1000,
            responseTime: Math.random() * 2000 + 100,
            errorRate: Math.random() * 5
          };
          
          setMetrics(prev => [...prev.slice(-49), newMetric]);
          checkForAlerts(newMetric);
          generateOptimizations(newMetric);
        }
      }
    }
  );

  const checkForAlerts = useCallback((metric: PerformanceMetric) => {
    const newAlerts: typeof alerts = [];
    
    if (metric.cpu > 90) {
      newAlerts.push({
        id: `cpu-${Date.now()}`,
        type: 'critical',
        message: `Critical CPU usage: ${metric.cpu.toFixed(1)}%`,
        timestamp: metric.timestamp
      });
    }
    
    if (metric.memory > 85) {
      newAlerts.push({
        id: `memory-${Date.now()}`,
        type: 'warning',
        message: `High memory usage: ${metric.memory.toFixed(1)}%`,
        timestamp: metric.timestamp
      });
    }
    
    if (metric.responseTime > 1500) {
      newAlerts.push({
        id: `response-${Date.now()}`,
        type: 'warning',
        message: `Slow response time: ${metric.responseTime.toFixed(0)}ms`,
        timestamp: metric.timestamp
      });
    }
    
    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev.slice(0, 9)]);
    }
  }, []);

  const generateOptimizations = useCallback((metric: PerformanceMetric) => {
    const suggestions: OptimizationSuggestion[] = [];
    
    if (metric.cpu > 80) {
      suggestions.push({
        id: `cpu-opt-${Date.now()}`,
        type: 'cpu',
        severity: 'high',
        title: 'Scale CPU Resources',
        description: 'Consider upgrading to a higher CPU tier or implementing auto-scaling',
        estimatedSavings: '15% performance improvement',
        implementationEffort: 'medium'
      });
    }
    
    if (metric.memory > 75) {
      suggestions.push({
        id: `memory-opt-${Date.now()}`,
        type: 'memory',
        severity: 'medium',
        title: 'Optimize Memory Usage',
        description: 'Implement memory caching or increase RAM allocation',
        estimatedSavings: '20% memory reduction',
        implementationEffort: 'low'
      });
    }
    
    if (suggestions.length > 0) {
      setOptimizations(prev => {
        const existing = prev.filter(opt => 
          !suggestions.some(sug => sug.type === opt.type)
        );
        return [...suggestions, ...existing].slice(0, 5);
      });
    }
  }, []);

  // Simulate real-time data when monitoring is active
  useEffect(() => {
    if (!isMonitoring) return;
    
    const interval = setInterval(() => {
      const newMetric: PerformanceMetric = {
        timestamp: new Date().toISOString(),
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        network: Math.random() * 1000,
        responseTime: Math.random() * 2000 + 100,
        errorRate: Math.random() * 5
      };
      
      setMetrics(prev => [...prev.slice(-49), newMetric]);
      checkForAlerts(newMetric);
      generateOptimizations(newMetric);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isMonitoring, checkForAlerts, generateOptimizations]);

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    if (!isMonitoring) {
      setMetrics([]);
      setAlerts([]);
    }
  };

  const getLatestMetric = () => {
    return metrics[metrics.length - 1] || {
      cpu: 0, memory: 0, network: 0, responseTime: 0, errorRate: 0
    };
  };

  const formatChartData = (metricKey: keyof PerformanceMetric) => {
    return metrics.slice(-20).map((metric, index) => ({
      time: index.toString(),
      value: typeof metric[metricKey] === 'number' ? metric[metricKey] : 0
    }));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const currentMetric = getLatestMetric();

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Real-Time Performance Monitoring
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Live metrics and automated optimization suggestions
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            <Button 
              onClick={toggleMonitoring}
              variant={isMonitoring ? "destructive" : "default"}
            >
              {isMonitoring ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Stop Monitoring
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Monitoring
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">CPU Usage</p>
                <p className="text-2xl font-bold">{currentMetric.cpu.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Memory</p>
                <p className="text-2xl font-bold">{currentMetric.memory.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Response Time</p>
                <p className="text-2xl font-bold">{currentMetric.responseTime.toFixed(0)}ms</p>
              </div>
              <TrendingDown className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Error Rate</p>
                <p className="text-2xl font-bold">{currentMetric.errorRate.toFixed(2)}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>CPU & Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={formatChartData('cpu')}
              categories={["value"]}
              index="time"
              colors={["blue"]}
              valueFormatter={(value) => `${value}%`}
              className="h-64"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              data={formatChartData('responseTime')}
              categories={["value"]}
              index="time"
              colors={["purple"]}
              valueFormatter={(value) => `${value}ms`}
              className="h-64"
            />
          </CardContent>
        </Card>
      </div>

      {/* Alerts Panel */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.slice(0, 5).map((alert) => (
              <Alert key={alert.id} variant={alert.type === 'critical' ? 'destructive' : 'default'}>
                <AlertDescription className="flex justify-between items-center">
                  <span>{alert.message}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Optimization Suggestions */}
      {optimizations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Performance Optimization Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {optimizations.map((suggestion) => (
              <div key={suggestion.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{suggestion.title}</h4>
                      <Badge className={getSeverityColor(suggestion.severity)}>
                        {suggestion.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {suggestion.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-green-600">
                        💰 {suggestion.estimatedSavings}
                      </span>
                      <span className="text-blue-600">
                        🔧 {suggestion.implementationEffort} effort
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Apply
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealTimeMonitoring;
