
/**
 * This service provides mock implementations for database operations
 * until the necessary tables are created in Supabase.
 */

import { v4 as uuidv4 } from "uuid";

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
  notifications: [],
  push_subscriptions: []
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
  
  mockData[table].push(newItem);
  
  return { 
    data: [newItem], 
    error: null
  };
};

// Generic mock function to select data
export const mockSelect = (table: string, filters?: Record<string, any>) => {
  let items = [...mockData[table]];
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      items = items.filter(item => item[key] === value);
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
