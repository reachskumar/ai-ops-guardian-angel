
import { supabase } from "@/integrations/supabase/client";
import { mockInsert, mockSelect, mockUpdate, mockDelete } from "./mockDatabaseService";

export interface MetricDataPoint {
  timestamp: string;
  value: number;
  unit?: string;
}

export interface MetricSeries {
  id: string;
  name: string;
  description?: string;
  data: MetricDataPoint[];
  metadata?: Record<string, any>;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  created_by: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
}

export interface DashboardWidget {
  id: string;
  dashboard_id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'status' | 'table' | 'number' | 'text';
  position: { x: number; y: number; w: number; h: number };
  query: string;
  config: Record<string, any>;
  last_updated?: string;
}

export interface Report {
  id: string;
  name: string;
  description?: string;
  type: 'pdf' | 'csv' | 'excel';
  created_by: string;
  created_at: string;
  schedule?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | null;
  last_generated?: string;
  config: Record<string, any>;
}

// Fetch metrics with filtering and aggregation options
export const fetchMetrics = async (
  query: {
    metrics: string[];
    resourceId?: string;
    resourceType?: string;
    startTime: string;
    endTime: string;
    aggregation?: 'avg' | 'max' | 'min' | 'sum' | 'count';
    period?: string;
  }
): Promise<{ series: MetricSeries[]; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-metrics', {
      body: query
    });

    if (error) throw error;
    
    return { series: data.series };
  } catch (error: any) {
    console.error("Fetch metrics error:", error);
    return { 
      series: [],
      error: error.message || 'Failed to fetch metrics' 
    };
  }
};

// Create a new dashboard
export const createDashboard = async (
  dashboard: Omit<Dashboard, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; dashboardId?: string; error?: string }> => {
  try {
    // Use mock service instead of Supabase until the table is created
    const { data, error } = mockInsert('dashboards', dashboard);
    
    if (error) throw error;
    
    return { 
      success: true, 
      dashboardId: data?.[0]?.id
    };
  } catch (error: any) {
    console.error("Create dashboard error:", error);
    return { success: false, error: error.message };
  }
};

// Get dashboards
export const getDashboards = async (
  options?: {
    userId?: string;
    includePublic?: boolean;
  }
): Promise<Dashboard[]> => {
  try {
    const { userId, includePublic = true } = options || {};
    
    // Use mock service
    let filters = {};
    if (userId && !includePublic) {
      filters = { created_by: userId };
    }
    
    const { data, error } = mockSelect('dashboards', filters);
    
    if (error) throw error;
    
    return data as Dashboard[];
  } catch (error) {
    console.error("Get dashboards error:", error);
    return [];
  }
};

// Get dashboard by ID
export const getDashboardById = async (
  dashboardId: string
): Promise<{ dashboard: Dashboard | null; widgets: DashboardWidget[]; error?: string }> => {
  try {
    // Use mock service for both dashboard and widgets
    const { data: dashboard, error: dashboardError } = mockSelect('dashboards', { id: dashboardId });
    if (dashboardError) throw dashboardError;
    
    const { data: widgets, error: widgetsError } = mockSelect('dashboard_widgets', { dashboard_id: dashboardId });
    if (widgetsError) throw widgetsError;
    
    return {
      dashboard: dashboard[0] as Dashboard || null,
      widgets: widgets as DashboardWidget[]
    };
  } catch (error: any) {
    console.error("Get dashboard error:", error);
    return { 
      dashboard: null, 
      widgets: [],
      error: error.message
    };
  }
};

// Update dashboard widget
export const updateDashboardWidget = async (
  widgetId: string,
  updates: Partial<DashboardWidget>
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Use mock service
    const { error } = mockUpdate('dashboard_widgets', widgetId, updates);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error("Update dashboard widget error:", error);
    return { success: false, error: error.message };
  }
};

// Create a report
export const createReport = async (
  report: Omit<Report, 'id' | 'created_at'>
): Promise<{ success: boolean; reportId?: string; error?: string }> => {
  try {
    // Use mock service
    const { data, error } = mockInsert('reports', report);
    
    if (error) throw error;
    
    return { 
      success: true,
      reportId: data?.[0]?.id
    };
  } catch (error: any) {
    console.error("Create report error:", error);
    return { success: false, error: error.message };
  }
};

// Get reports
export const getReports = async (
  userId?: string
): Promise<Report[]> => {
  try {
    // Use mock service
    let filters = userId ? { created_by: userId } : {};
    
    const { data, error } = mockSelect('reports', filters);
    
    if (error) throw error;
    
    return data as Report[];
  } catch (error) {
    console.error("Get reports error:", error);
    return [];
  }
};

// Generate report
export const generateReport = async (
  reportId: string
): Promise<{ success: boolean; downloadUrl?: string; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-report', {
      body: { reportId }
    });

    if (error) throw error;
    
    return { 
      success: data.success,
      downloadUrl: data.downloadUrl,
      error: data.error
    };
  } catch (error: any) {
    console.error("Generate report error:", error);
    return { success: false, error: error.message || 'Failed to generate report' };
  }
};

// Get system health overview
export const getSystemHealthOverview = async (): Promise<{
  services: { name: string; status: string; health: number }[];
  regions: { name: string; status: string; serviceCount: number }[];
  alerts: { priority: string; count: number }[];
  error?: string;
}> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-system-health', {
      body: {}
    });

    if (error) throw error;
    
    return data;
  } catch (error: any) {
    console.error("Get system health overview error:", error);
    return { 
      services: [],
      regions: [],
      alerts: [],
      error: error.message || 'Failed to get system health'
    };
  }
};
