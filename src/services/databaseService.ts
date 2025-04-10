
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DatabaseInstance {
  id: string;
  name: string;
  type: string;
  status: "Running" | "Stopped" | "Maintenance";
  region: string;
  version: string;
  connectionString?: string;
  createdAt: string;
  resources?: {
    cpu: number;
    memory: number;
    storage: number;
  };
}

export interface DatabaseBackup {
  id: string;
  databaseId: string;
  name: string;
  size: string;
  createdAt: string;
  status: "Completed" | "In Progress" | "Failed";
}

export interface DatabaseMetric {
  timestamp: string;
  value: number;
  metric: string;
}

// Get all database instances
export const getDatabaseInstances = async (): Promise<DatabaseInstance[]> => {
  try {
    const { data, error } = await supabase
      .from('database_instances')
      .select('*');
    
    if (error) throw error;
    
    // Map the data to our interface
    return data.map(db => ({
      id: db.id,
      name: db.name,
      type: db.type,
      status: db.status,
      region: db.region,
      version: db.version,
      connectionString: db.connection_string,
      createdAt: db.created_at,
      resources: db.resources
    }));
  } catch (error) {
    console.error("Error fetching database instances:", error);
    toast.error("Failed to fetch database instances");
    
    // Return empty array on error
    return [];
  }
};

// Get a specific database instance by ID
export const getDatabaseInstance = async (id: string): Promise<DatabaseInstance | null> => {
  try {
    const { data, error } = await supabase
      .from('database_instances')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      status: data.status,
      region: data.region,
      version: data.version,
      connectionString: data.connection_string,
      createdAt: data.created_at,
      resources: data.resources
    };
  } catch (error) {
    console.error(`Error fetching database instance ${id}:`, error);
    toast.error("Failed to fetch database instance");
    return null;
  }
};

// Create a new database instance
export const createDatabaseInstance = async (database: Omit<DatabaseInstance, 'id' | 'createdAt'>): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('database_instances')
      .insert({
        name: database.name,
        type: database.type,
        status: database.status,
        region: database.region,
        version: database.version,
        connection_string: database.connectionString,
        resources: database.resources
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, id: data.id };
  } catch (error: any) {
    console.error("Error creating database instance:", error);
    return { success: false, error: error.message || "Failed to create database instance" };
  }
};

// Update a database instance
export const updateDatabaseInstance = async (id: string, updates: Partial<DatabaseInstance>): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('database_instances')
      .update({
        name: updates.name,
        status: updates.status,
        version: updates.version,
        connection_string: updates.connectionString,
        resources: updates.resources
      })
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error(`Error updating database instance ${id}:`, error);
    return { success: false, error: error.message || "Failed to update database instance" };
  }
};

// Delete a database instance
export const deleteDatabaseInstance = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('database_instances')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error(`Error deleting database instance ${id}:`, error);
    return { success: false, error: error.message || "Failed to delete database instance" };
  }
};

// Start a database instance
export const startDatabaseInstance = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('database_instances')
      .update({ status: 'Running' })
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error(`Error starting database instance ${id}:`, error);
    return { success: false, error: error.message || "Failed to start database instance" };
  }
};

// Stop a database instance
export const stopDatabaseInstance = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('database_instances')
      .update({ status: 'Stopped' })
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error(`Error stopping database instance ${id}:`, error);
    return { success: false, error: error.message || "Failed to stop database instance" };
  }
};

// Get database performance metrics
export const getDatabaseMetrics = async (databaseId: string, metric: string, timeRange: string): Promise<DatabaseMetric[]> => {
  try {
    const { data, error } = await supabase
      .from('database_metrics')
      .select('*')
      .eq('database_id', databaseId)
      .eq('metric', metric)
      .gte('timestamp', getTimeRangeStart(timeRange));
    
    if (error) throw error;
    
    return data.map(item => ({
      timestamp: item.timestamp,
      value: item.value,
      metric: item.metric
    }));
  } catch (error) {
    console.error(`Error fetching metrics for database ${databaseId}:`, error);
    return [];
  }
};

// Helper function to calculate timestamp for time range
const getTimeRangeStart = (timeRange: string): string => {
  const now = new Date();
  
  switch (timeRange) {
    case '1h':
      return new Date(now.setHours(now.getHours() - 1)).toISOString();
    case '24h':
      return new Date(now.setDate(now.getDate() - 1)).toISOString();
    case '7d':
      return new Date(now.setDate(now.getDate() - 7)).toISOString();
    case '30d':
      return new Date(now.setDate(now.getDate() - 30)).toISOString();
    default:
      return new Date(now.setHours(now.getHours() - 24)).toISOString();
  }
};

// Get database backups
export const getDatabaseBackups = async (databaseId: string): Promise<DatabaseBackup[]> => {
  try {
    const { data, error } = await supabase
      .from('database_backups')
      .select('*')
      .eq('database_id', databaseId);
    
    if (error) throw error;
    
    return data.map(backup => ({
      id: backup.id,
      databaseId: backup.database_id,
      name: backup.name,
      size: backup.size,
      createdAt: backup.created_at,
      status: backup.status
    }));
  } catch (error) {
    console.error(`Error fetching backups for database ${databaseId}:`, error);
    return [];
  }
};

// Create a database backup
export const createDatabaseBackup = async (databaseId: string, name: string): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('database_backups')
      .insert({
        database_id: databaseId,
        name,
        status: 'In Progress',
        size: '0 MB'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Simulate backup completion after a delay
    setTimeout(async () => {
      const size = `${Math.floor(Math.random() * 1000) + 100} MB`;
      
      await supabase
        .from('database_backups')
        .update({
          status: 'Completed',
          size
        })
        .eq('id', data.id);
    }, 5000);
    
    return { success: true, id: data.id };
  } catch (error: any) {
    console.error(`Error creating backup for database ${databaseId}:`, error);
    return { success: false, error: error.message || "Failed to create backup" };
  }
};
