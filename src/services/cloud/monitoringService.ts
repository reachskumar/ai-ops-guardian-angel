
import { supabase } from "@/integrations/supabase/client";
import { AlertRule, Alert } from "./types";

// Alert Rules Management
export const createAlertRule = async (rule: Omit<AlertRule, 'id' | 'created_at' | 'user_id'>): Promise<{ success: boolean; ruleId?: string; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('alert_rules')
      .insert({
        ...rule,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create alert rule:", error);
      return { success: false, error: 'Failed to create alert rule' };
    }

    return { success: true, ruleId: data.id };
  } catch (error: any) {
    console.error("Create alert rule error:", error);
    return { success: false, error: error.message || 'Failed to create alert rule' };
  }
};

export const getAlertRules = async (): Promise<AlertRule[]> => {
  try {
    const { data, error } = await supabase
      .from('alert_rules')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Failed to fetch alert rules:", error);
      return [];
    }

    // Type cast the database results to match our interface
    return (data || []).map(rule => ({
      ...rule,
      operator: rule.operator as 'gt' | 'lt' | 'eq',
      severity: rule.severity as 'low' | 'medium' | 'high' | 'critical'
    }));
  } catch (error) {
    console.error("Get alert rules error:", error);
    return [];
  }
};

export const updateAlertRule = async (ruleId: string, updates: Partial<AlertRule>): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('alert_rules')
      .update(updates)
      .eq('id', ruleId);

    if (error) {
      console.error("Failed to update alert rule:", error);
      return { success: false, error: 'Failed to update alert rule' };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Update alert rule error:", error);
    return { success: false, error: error.message || 'Failed to update alert rule' };
  }
};

export const deleteAlertRule = async (ruleId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('alert_rules')
      .delete()
      .eq('id', ruleId);

    if (error) {
      console.error("Failed to delete alert rule:", error);
      return { success: false, error: 'Failed to delete alert rule' };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Delete alert rule error:", error);
    return { success: false, error: error.message || 'Failed to delete alert rule' };
  }
};

// Alerts Management
export const getAlerts = async (status?: string): Promise<Alert[]> => {
  try {
    let query = supabase
      .from('alerts')
      .select('*')
      .order('triggered_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Failed to fetch alerts:", error);
      return [];
    }

    // Type cast the database results to match our interface
    return (data || []).map(alert => ({
      ...alert,
      severity: alert.severity as 'low' | 'medium' | 'high' | 'critical',
      status: alert.status as 'active' | 'resolved' | 'acknowledged'
    }));
  } catch (error) {
    console.error("Get alerts error:", error);
    return [];
  }
};

export const acknowledgeAlert = async (alertId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('alerts')
      .update({
        status: 'acknowledged',
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: user.id
      })
      .eq('id', alertId);

    if (error) {
      console.error("Failed to acknowledge alert:", error);
      return { success: false, error: 'Failed to acknowledge alert' };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Acknowledge alert error:", error);
    return { success: false, error: error.message || 'Failed to acknowledge alert' };
  }
};

export const resolveAlert = async (alertId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('alerts')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString()
      })
      .eq('id', alertId);

    if (error) {
      console.error("Failed to resolve alert:", error);
      return { success: false, error: 'Failed to resolve alert' };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Resolve alert error:", error);
    return { success: false, error: error.message || 'Failed to resolve alert' };
  }
};

// Resource Health Monitoring
export const getResourceHealth = async (resourceId: string): Promise<{ health: number; issues: string[]; recommendations: string[] }> => {
  try {
    // Simulate health calculation based on metrics and alerts
    const health = Math.floor(Math.random() * 40) + 60; // 60-100
    const issues = [];
    const recommendations = [];

    if (health < 80) {
      issues.push("High CPU utilization detected");
      recommendations.push("Consider scaling up the instance");
    }

    if (health < 70) {
      issues.push("Memory usage approaching limits");
      recommendations.push("Monitor memory-intensive processes");
    }

    return { health, issues, recommendations };
  } catch (error) {
    console.error("Get resource health error:", error);
    return { health: 0, issues: ["Unable to determine health"], recommendations: [] };
  }
};

// Monitoring Dashboard Data
export const getMonitoringDashboardData = async () => {
  try {
    // Get recent alerts
    const recentAlerts = await getAlerts();
    const activeAlerts = recentAlerts.filter(alert => alert.status === 'active');

    // Get resource count by status
    const { data: resources } = await supabase
      .from('cloud_resources')
      .select('status');

    const statusCounts = (resources || []).reduce((acc, resource) => {
      acc[resource.status] = (acc[resource.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get alert rules count
    const { data: rules } = await supabase
      .from('alert_rules')
      .select('enabled');

    const enabledRules = (rules || []).filter(rule => rule.enabled).length;
    const totalRules = (rules || []).length;

    return {
      activeAlerts: activeAlerts.length,
      totalResources: resources?.length || 0,
      statusCounts,
      enabledRules,
      totalRules,
      recentAlerts: recentAlerts.slice(0, 10)
    };
  } catch (error) {
    console.error("Get monitoring dashboard data error:", error);
    return {
      activeAlerts: 0,
      totalResources: 0,
      statusCounts: {},
      enabledRules: 0,
      totalRules: 0,
      recentAlerts: []
    };
  }
};

// Aggregated metrics function for dashboard
export const getAggregatedMetrics = async () => {
  try {
    const dashboardData = await getMonitoringDashboardData();
    
    return {
      totalResources: dashboardData.totalResources,
      activeAlerts: dashboardData.activeAlerts,
      averageHealth: 85,
      costThisMonth: 0
    };
  } catch (error) {
    console.error("Get aggregated metrics error:", error);
    return {
      totalResources: 0,
      activeAlerts: 0,
      averageHealth: 0,
      costThisMonth: 0
    };
  }
};
