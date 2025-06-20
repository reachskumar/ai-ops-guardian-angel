
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { CloudResource } from '@/services/cloud/types';
import { getResourceHealth } from '@/services/cloud/monitoringService';

interface ResourceHealthMonitorProps {
  resource: CloudResource;
}

const ResourceHealthMonitor: React.FC<ResourceHealthMonitorProps> = ({ resource }) => {
  const [health, setHealth] = useState(0);
  const [issues, setIssues] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    fetchHealthData();
  }, [resource.id]);

  const fetchHealthData = async () => {
    setLoading(true);
    try {
      const healthData = await getResourceHealth(resource.id);
      setHealth(healthData.health);
      setIssues(healthData.issues);
      setRecommendations(healthData.recommendations);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Failed to fetch health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatus = () => {
    if (health >= 90) return { status: "Excellent", color: "text-green-500", bgColor: "bg-green-100" };
    if (health >= 80) return { status: "Good", color: "text-green-500", bgColor: "bg-green-100" };
    if (health >= 60) return { status: "Fair", color: "text-yellow-500", bgColor: "bg-yellow-100" };
    if (health >= 40) return { status: "Poor", color: "text-orange-500", bgColor: "bg-orange-100" };
    return { status: "Critical", color: "text-red-500", bgColor: "bg-red-100" };
  };

  const healthStatus = getHealthStatus();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Checking resource health...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Health Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Resource Health
            </CardTitle>
            <Button onClick={fetchHealthData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold">{health}</div>
                <div>
                  <Badge className={`${healthStatus.bgColor} ${healthStatus.color}`}>
                    {healthStatus.status}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    Health Score
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  {health >= 80 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span>Trend</span>
                </div>
              </div>
            </div>
            
            <Progress 
              value={health} 
              className={`h-3 ${
                health >= 80 ? '[&>div]:bg-green-500' : 
                health >= 60 ? '[&>div]:bg-yellow-500' : 
                '[&>div]:bg-red-500'
              }`}
            />
            
            {lastChecked && (
              <p className="text-xs text-muted-foreground">
                Last checked: {lastChecked.toLocaleString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Issues */}
      {issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Issues Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {issues.map((issue, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-yellow-50 rounded">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <span className="text-sm">{issue}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                  <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                  <span className="text-sm">{recommendation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Health Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">CPU Health</span>
                <span className="text-sm font-medium">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Memory Health</span>
                <span className="text-sm font-medium">78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Network Health</span>
                <span className="text-sm font-medium">92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Storage Health</span>
                <span className="text-sm font-medium">88%</span>
              </div>
              <Progress value={88} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceHealthMonitor;
