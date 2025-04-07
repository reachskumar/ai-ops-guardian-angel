
/**
 * This service provides mock implementations for database operations
 * until the necessary tables are created in Supabase.
 */

import { v4 as uuidv4 } from "uuid";
import { Notification } from "./notificationService";

// Mock data storage
const mockData: Record<string, any[]> = {
  dashboards: [],
  dashboard_widgets: [],
  reports: [],
  cloud_accounts: [],
  cloud_resources: [],
  teams: [],
  team_members: [],
  work_items: [],
  comments: [],
  notifications: [
    {
      id: uuidv4(),
      user_id: "system", // Will be replaced with current user ID when loading
      title: "System Maintenance",
      message: "Scheduled maintenance will be performed tonight at 10:00 PM UTC.",
      type: "system",
      priority: "info",
      read: false,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      metadata: {}
    },
    {
      id: uuidv4(),
      user_id: "system", // Will be replaced with current user ID when loading
      title: "High CPU Usage Detected",
      message: "Server EC2-i-8732x is experiencing unusually high CPU usage (92%).",
      type: "alert",
      priority: "high",
      read: false,
      created_at: new Date(Date.now() - 7200000).toISOString(),
      metadata: { server_id: "EC2-i-8732x", metric: "cpu", value: 92 }
    },
    {
      id: uuidv4(),
      user_id: "system", // Will be replaced with current user ID when loading
      title: "Security Update Required",
      message: "Critical security patches are available for 3 resources.",
      type: "security",
      priority: "critical",
      read: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      metadata: { resources: ["server1", "server2", "database1"] }
    },
    {
      id: uuidv4(),
      user_id: "system", // Will be replaced with current user ID when loading
      title: "Infrastructure Health Check",
      message: "Monthly infrastructure health check completed successfully.",
      type: "infrastructure",
      priority: "low",
      read: true,
      created_at: new Date(Date.now() - 172800000).toISOString(),
      metadata: { report_id: "INF-2023-04" }
    },
    {
      id: uuidv4(),
      user_id: "system", // Will be replaced with current user ID when loading
      title: "Database Performance Alert",
      message: "Slow query detected in the production database. Query ID: SQL-28973.",
      type: "monitoring",
      priority: "medium",
      read: false,
      created_at: new Date(Date.now() - 14400000).toISOString(),
      metadata: { query_id: "SQL-28973", duration: "4.2s" }
    }
  ],
  push_subscriptions: []
};

// Helper function to replace user IDs in notifications
export const initializeMockData = (userId: string) => {
  // Replace system user ID with actual user ID in notifications
  mockData.notifications = mockData.notifications.map(notif => ({
    ...notif,
    user_id: userId
  }));
};

// Generic mock function to insert data
export const mockInsert = (table: string, data: any) => {
  const id = data.id || uuidv4();
  const timestamp = new Date().toISOString();
  
  const newItem = {
    ...data,
    id,
    created_at: data.created_at || timestamp,
    updated_at: data.updated_at || timestamp
  };
  
  if (!mockData[table]) {
    mockData[table] = [];
  }
  
  mockData[table].push(newItem);
  
  return { 
    data: [newItem], 
    error: null
  };
};

// Generic mock function to select data
export const mockSelect = (table: string, filters?: Record<string, any>) => {
  if (!mockData[table]) {
    mockData[table] = [];
  }
  
  let items = [...mockData[table]];
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      items = items.filter(item => {
        if (Array.isArray(value)) {
          return value.includes(item[key]);
        }
        return item[key] === value;
      });
    });
  }
  
  return {
    data: items,
    error: null,
    count: items.length
  };
};

// Generic mock function to update data
export const mockUpdate = (table: string, id: string, updates: any) => {
  if (!mockData[table]) {
    mockData[table] = [];
  }
  
  const index = mockData[table].findIndex(item => item.id === id);
  
  if (index !== -1) {
    mockData[table][index] = {
      ...mockData[table][index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    return {
      data: [mockData[table][index]],
      error: null
    };
  }
  
  return {
    data: null,
    error: { message: `Item with id ${id} not found in ${table}` }
  };
};

// Generic mock function to delete data
export const mockDelete = (table: string, id: string) => {
  if (!mockData[table]) {
    mockData[table] = [];
  }
  
  const index = mockData[table].findIndex(item => item.id === id);
  
  if (index !== -1) {
    const deleted = mockData[table].splice(index, 1);
    
    return {
      data: deleted,
      error: null
    };
  }
  
  return {
    data: null,
    error: { message: `Item with id ${id} not found in ${table}` }
  };
};
