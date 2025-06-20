
import React, { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import { getAggregatedMetrics } from "@/services/cloud";

const Index = () => {
  const { user, profile } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalResources: 0,
    activeAlerts: 0,
    averageHealth: 0,
    costThisMonth: 0
  });
  const [loading, setLoading] = useState(true);

  // Mock data for charts
  const cpuData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    value: Math.floor(Math.random() * 100)
  }));

  const memoryData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    value: Math.floor(Math.random() * 100)
  }));

  const networkData = [
    { name: "Inbound", value: 450 },
    { name: "Outbound", value: 320 }
  ];

  const storageData = [
    { name: "Used", value: 65 },
    { name: "Available", value: 35 }
  ];

  const infrastructureResources = [
    { id: "1", type: "Server", status: "Running", region: "us-east-1", provider: "AWS" },
    { id: "2", type: "Database", status: "Running", region: "us-west-2", provider: "AWS" },
    { id: "3", type: "Load Balancer", status: "Active", region: "eu-west-1", provider: "Azure" }
  ];

  const securityFindings = [
    { id: "1", severity: "High", description: "Unencrypted storage detected", asset: "Database-01", date: "2024-01-15" },
    { id: "2", severity: "Medium", description: "Weak password policy", asset: "Server-03", date: "2024-01-14" },
    { id: "3", severity: "Low", description: "Outdated SSL certificate", asset: "Load Balancer", date: "2024-01-13" }
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const metrics = await getAggregatedMetrics();
        setDashboardData(metrics);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const refreshData = () => {
    setLoading(true);
    // Simulate data refresh
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader 
          user={user}
          profile={profile}
          totalResources={dashboardData.totalResources}
          activeAlerts={dashboardData.activeAlerts}
          averageHealth={dashboardData.averageHealth}
          costThisMonth={dashboardData.costThisMonth}
          onRefresh={refreshData}
        />
        <DashboardTabs 
          cpuData={cpuData}
          memoryData={memoryData}
          networkData={networkData}
          storageData={storageData}
          infrastructureResources={infrastructureResources}
          securityFindings={securityFindings}
          refreshData={refreshData}
        />
      </div>
    </div>
  );
};

export default Index;
