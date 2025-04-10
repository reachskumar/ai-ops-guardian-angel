
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

// Mock data for database instances
const mockDatabaseInstances: DatabaseInstance[] = [
  {
    id: "db-1",
    name: "Production DB",
    type: "PostgreSQL",
    status: "Running",
    region: "us-west-1",
    version: "14.5",
    connectionString: "postgresql://user:password@hostname:5432/dbname",
    createdAt: "2023-01-15T08:30:00Z",
    resources: {
      cpu: 4,
      memory: 16,
      storage: 500
    }
  },
  {
    id: "db-2",
    name: "Development DB",
    type: "MySQL",
    status: "Running",
    region: "eu-central-1",
    version: "8.0",
    connectionString: "mysql://user:password@hostname:3306/dbname",
    createdAt: "2023-03-22T14:15:30Z",
    resources: {
      cpu: 2,
      memory: 8,
      storage: 250
    }
  },
  {
    id: "db-3",
    name: "Testing DB",
    type: "PostgreSQL",
    status: "Stopped",
    region: "ap-southeast-2",
    version: "15.2",
    connectionString: "postgresql://user:password@hostname:5432/testdb",
    createdAt: "2023-06-10T11:45:20Z",
    resources: {
      cpu: 1,
      memory: 4,
      storage: 100
    }
  }
];

// Mock data for backups
const generateMockBackups = (databaseId: string): DatabaseBackup[] => {
  const count = Math.floor(Math.random() * 4) + 1; // 1-4 backups per database
  const result: DatabaseBackup[] = [];
  
  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i * 5);
    
    result.push({
      id: `backup-${databaseId}-${i}`,
      databaseId,
      name: `${databaseId}-backup-${date.toISOString().split('T')[0]}`,
      size: `${Math.floor(Math.random() * 500) + 50} MB`,
      createdAt: date.toISOString(),
      status: "Completed"
    });
  }
  
  return result;
};

// Generate mock metrics data
const generateMockMetrics = (metric: string, hours = 24): DatabaseMetric[] => {
  const result: DatabaseMetric[] = [];
  const now = new Date();
  
  for (let i = 0; i < hours; i++) {
    const time = new Date(now);
    time.setHours(now.getHours() - i);
    
    let value: number;
    switch (metric) {
      case "cpu":
        value = Math.floor(Math.random() * 70) + 10; // 10-80%
        break;
      case "memory":
        value = Math.floor(Math.random() * 60) + 20; // 20-80%
        break;
      case "connections":
        value = Math.floor(Math.random() * 50); // 0-50 connections
        break;
      case "disk_io":
        value = Math.floor(Math.random() * 15) + 1; // 1-16 MB/s
        break;
      default:
        value = Math.floor(Math.random() * 100);
    }
    
    result.push({
      timestamp: time.toISOString(),
      value,
      metric
    });
  }
  
  // Sort by timestamp
  return result.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
};

// Get all database instances
export const getDatabaseInstances = async (): Promise<DatabaseInstance[]> => {
  try {
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return [...mockDatabaseInstances];
  } catch (error) {
    console.error("Error fetching database instances:", error);
    toast.error("Failed to fetch database instances");
    return [];
  }
};

// Get a specific database instance by ID
export const getDatabaseInstance = async (id: string): Promise<DatabaseInstance | null> => {
  try {
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const database = mockDatabaseInstances.find(db => db.id === id);
    return database ? { ...database } : null;
  } catch (error) {
    console.error(`Error fetching database instance ${id}:`, error);
    toast.error("Failed to fetch database instance");
    return null;
  }
};

// Create a new database instance
export const createDatabaseInstance = async (database: Omit<DatabaseInstance, 'id' | 'createdAt'>): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    const newId = `db-${mockDatabaseInstances.length + 1}`;
    const newDb: DatabaseInstance = {
      ...database,
      id: newId,
      createdAt: new Date().toISOString()
    };
    
    mockDatabaseInstances.push(newDb);
    return { success: true, id: newId };
  } catch (error: any) {
    console.error("Error creating database instance:", error);
    return { success: false, error: error.message || "Failed to create database instance" };
  }
};

// Update a database instance
export const updateDatabaseInstance = async (id: string, updates: Partial<DatabaseInstance>): Promise<{ success: boolean; error?: string }> => {
  try {
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const dbIndex = mockDatabaseInstances.findIndex(db => db.id === id);
    if (dbIndex === -1) {
      return { success: false, error: "Database instance not found" };
    }
    
    mockDatabaseInstances[dbIndex] = {
      ...mockDatabaseInstances[dbIndex],
      ...updates
    };
    
    return { success: true };
  } catch (error: any) {
    console.error(`Error updating database instance ${id}:`, error);
    return { success: false, error: error.message || "Failed to update database instance" };
  }
};

// Start a database instance
export const startDatabaseInstance = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const dbIndex = mockDatabaseInstances.findIndex(db => db.id === id);
    if (dbIndex === -1) {
      return { success: false, error: "Database instance not found" };
    }
    
    mockDatabaseInstances[dbIndex].status = "Running";
    return { success: true };
  } catch (error: any) {
    console.error(`Error starting database instance ${id}:`, error);
    return { success: false, error: error.message || "Failed to start database instance" };
  }
};

// Stop a database instance
export const stopDatabaseInstance = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const dbIndex = mockDatabaseInstances.findIndex(db => db.id === id);
    if (dbIndex === -1) {
      return { success: false, error: "Database instance not found" };
    }
    
    mockDatabaseInstances[dbIndex].status = "Stopped";
    return { success: true };
  } catch (error: any) {
    console.error(`Error stopping database instance ${id}:`, error);
    return { success: false, error: error.message || "Failed to stop database instance" };
  }
};

// Get database performance metrics
export const getDatabaseMetrics = async (databaseId: string, metric: string, timeRange: string): Promise<DatabaseMetric[]> => {
  try {
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock metrics data
    const hours = getHoursForTimeRange(timeRange);
    return generateMockMetrics(metric, hours);
  } catch (error) {
    console.error(`Error fetching metrics for database ${databaseId}:`, error);
    return [];
  }
};

// Helper function to calculate hours for time range
const getHoursForTimeRange = (timeRange: string): number => {
  switch (timeRange) {
    case '1h':
      return 12; // 12 data points for 1 hour (5 min intervals)
    case '24h':
      return 24; // 24 data points for 24 hours (1 hour intervals)
    case '7d':
      return 24 * 7; // 7 days (1 data point per hour)
    case '30d':
      return 30; // 30 data points for 30 days (1 day intervals)
    default:
      return 24;
  }
};

// Get database backups
export const getDatabaseBackups = async (databaseId: string): Promise<DatabaseBackup[]> => {
  try {
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return generateMockBackups(databaseId);
  } catch (error) {
    console.error(`Error fetching backups for database ${databaseId}:`, error);
    return [];
  }
};

// Create a database backup
export const createDatabaseBackup = async (databaseId: string, name: string): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const backupId = `backup-${databaseId}-${Date.now()}`;
    
    // Simulate backup completion after a delay
    setTimeout(() => {
      // This would typically update a real database record
      console.log(`Backup ${backupId} completed`);
    }, 5000);
    
    return { success: true, id: backupId };
  } catch (error: any) {
    console.error(`Error creating backup for database ${databaseId}:`, error);
    return { success: false, error: error.message || "Failed to create backup" };
  }
};
