
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Plus,
  Settings,
  Eye,
  Trash2
} from 'lucide-react';
import { Alert, AlertRule } from '@/services/cloud/types';
import { 
  getAlerts, 
  getAlertRules, 
  acknowledgeAlert, 
  resolveAlert,
  getMonitoringDashboardData,
  deleteAlertRule
} from '@/services/cloud/monitoringService';
import { useToast } from '@/hooks/use-toast';
import CreateAlertRuleDialog from './CreateAlertRuleDialog';

const MonitoringAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [dashboardData, setDashboardData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [alertsData, rulesData, dashboardInfo] = await Promise.all([
        getAlerts(),
        getAlertRules(),
        getMonitoringDashboardData()
      ]);
      
      setAlerts(alertsData);
      setAlertRules(rulesData);
      setDashboardData(dashboardInfo);
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
      toast({
        title: "Error",
        description: "Failed to load monitoring data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    const result = await acknowledgeAlert(alertId);
    if (result.success) {
      toast({
        title: "Alert Acknowledged",
        description: "The alert has been acknowledged"
      });
      fetchData();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to acknowledge alert",
        variant: "destructive"
      });
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    const result = await resolveAlert(alertId);
    if (result.success) {
      toast({
        title: "Alert Resolved",
        description: "The alert has been resolved"
      });
      fetchData();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to resolve alert",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    const result = await deleteAlertRule(ruleId);
    if (result.success) {
      toast({
        title: "Alert Rule Deleted",
        description: "The alert rule has been deleted"
      });
      fetchData();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete alert rule",
        variant: "destructive"
      });
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[severity as keyof typeof colors] || colors.low}>{severity}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'acknowledged':
        return <Eye className="h-4 w-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboardData.activeAlerts || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalResources || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Alert Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.enabledRules || 0}/{dashboardData.totalRules || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Good</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Alert Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Alerts</CardTitle>
                <Button onClick={fetchData} variant="outline" size="sm">
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto opacity-50 mb-4" />
                  <p>No alerts at this time</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getStatusIcon(alert.status)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getSeverityBadge(alert.severity)}
                              <span className="text-sm text-muted-foreground">
                                {new Date(alert.triggered_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="font-medium">{alert.message}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Resource: {alert.resource_id}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {alert.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAcknowledgeAlert(alert.id)}
                            >
                              Acknowledge
                            </Button>
                          )}
                          {alert.status !== 'resolved' && (
                            <Button
                              size="sm"
                              onClick={() => handleResolveAlert(alert.id)}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Alert Rules</CardTitle>
                <Button className="flex items-center gap-2" onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Create Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {alertRules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto opacity-50 mb-4" />
                  <p>No alert rules configured</p>
                  <Button className="mt-4" variant="outline" onClick={() => setCreateDialogOpen(true)}>
                    Create Your First Rule
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {alertRules.map((rule) => (
                    <div key={rule.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{rule.name}</h3>
                            <Badge variant={rule.enabled ? "default" : "secondary"}>
                              {rule.enabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{rule.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {rule.metric} {rule.operator} {rule.threshold} for {rule.duration}s
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteRule(rule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateAlertRuleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default MonitoringAlerts;
