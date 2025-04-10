
import { useState, useCallback } from "react";
import { 
  DatabaseMetric,
  getDatabaseMetrics
} from "@/services/databaseService";

/**
 * Hook for managing database metrics
 */
export const useDatabaseMetrics = () => {
  const [cpuMetrics, setCpuMetrics] = useState<DatabaseMetric[]>([]);
  const [memoryMetrics, setMemoryMetrics] = useState<DatabaseMetric[]>([]);
  const [connectionMetrics, setConnectionMetrics] = useState<DatabaseMetric[]>([]);
  const [diskMetrics, setDiskMetrics] = useState<DatabaseMetric[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [timeRange, setTimeRange] = useState<string>("24h");

  // Fetch database metrics
  const fetchMetrics = useCallback(async (databaseId: string) => {
    setIsLoadingMetrics(true);
    try {
      const [cpu, memory, connections, disk] = await Promise.all([
        getDatabaseMetrics(databaseId, "cpu", timeRange),
        getDatabaseMetrics(databaseId, "memory", timeRange),
        getDatabaseMetrics(databaseId, "connections", timeRange),
        getDatabaseMetrics(databaseId, "disk_io", timeRange)
      ]);
      
      setCpuMetrics(cpu);
      setMemoryMetrics(memory);
      setConnectionMetrics(connections);
      setDiskMetrics(disk);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setIsLoadingMetrics(false);
    }
  }, [timeRange]);

  // Handle time range change
  const handleTimeRangeChange = useCallback((range: string) => {
    setTimeRange(range);
  }, []);

  return {
    cpuMetrics,
    memoryMetrics,
    connectionMetrics,
    diskMetrics,
    isLoadingMetrics,
    timeRange,
    fetchMetrics,
    handleTimeRangeChange
  };
};
