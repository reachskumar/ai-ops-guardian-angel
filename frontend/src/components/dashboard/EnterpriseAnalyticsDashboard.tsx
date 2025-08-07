import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Shield, Cloud, 
  Activity, Users, Database, Server, AlertTriangle
} from 'lucide-react';

interface MetricCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

const EnterpriseAnalyticsDashboard: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - in production would come from real APIs
  const metricCards: MetricCard[] = [
    {
      title: 'Total Infrastructure Cost',
      value: '$47,329/month',
      change: '-12.3%',
      trend: 'down',
      icon: <DollarSign className="w-6 h-6" />
    },
    {
      title: 'Security Score',
      value: '94.2%',
      change: '+5.1%',
      trend: 'up',
      icon: <Shield className="w-6 h-6" />
    },
    {
      title: 'Multi-Cloud Resources',
      value: '1,247',
      change: '+18.7%',
      trend: 'up',
      icon: <Cloud className="w-6 h-6" />
    },
    {
      title: 'System Uptime',
      value: '99.97%',
      change: '+0.12%',
      trend: 'up',
      icon: <Activity className="w-6 h-6" />
    },
    {
      title: 'Active Users',
      value: '8,429',
      change: '+23.4%',
      trend: 'up',
      icon: <Users className="w-6 h-6" />
    },
    {
      title: 'Data Processing',
      value: '2.8TB/day',
      change: '+15.2%',
      trend: 'up',
      icon: <Database className="w-6 h-6" />
    }
  ];

  const costTrendData: ChartData[] = [
    { name: 'Jan', aws: 15400, azure: 8200, gcp: 5800, total: 29400 },
    { name: 'Feb', aws: 16200, azure: 8900, gcp: 6100, total: 31200 },
    { name: 'Mar', aws: 14800, azure: 9400, gcp: 6300, total: 30500 },
    { name: 'Apr', aws: 15600, azure: 9100, gcp: 6800, total: 31500 },
    { name: 'May', aws: 14200, azure: 8800, gcp: 7200, total: 30200 },
    { name: 'Jun', aws: 13800, azure: 8600, gcp: 7400, total: 29800 },
    { name: 'Jul', aws: 13200, azure: 8400, gcp: 7600, total: 29200 }
  ];

  const resourceDistributionData: ChartData[] = [
    { name: 'AWS', value: 52, color: '#FF8042' },
    { name: 'Azure', value: 28, color: '#00C49F' },
    { name: 'GCP', value: 20, color: '#0088FE' }
  ];

  const performanceData: ChartData[] = [
    { name: '00:00', cpu: 45, memory: 62, network: 34, latency: 23 },
    { name: '04:00', cpu: 32, memory: 58, network: 28, latency: 18 },
    { name: '08:00', cpu: 78, memory: 84, network: 65, latency: 45 },
    { name: '12:00', cpu: 82, memory: 88, network: 72, latency: 52 },
    { name: '16:00', cpu: 75, memory: 82, network: 68, latency: 48 },
    { name: '20:00', cpu: 68, memory: 76, network: 58, latency: 38 },
    { name: '24:00', cpu: 42, memory: 64, network: 32, latency: 22 }
  ];

  const securityAlertsData: ChartData[] = [
    { name: 'Mon', critical: 2, high: 8, medium: 15, low: 23 },
    { name: 'Tue', critical: 1, high: 5, medium: 12, low: 28 },
    { name: 'Wed', critical: 0, high: 3, medium: 18, low: 32 },
    { name: 'Thu', critical: 1, high: 7, medium: 14, low: 25 },
    { name: 'Fri', critical: 0, high: 4, medium: 16, low: 29 },
    { name: 'Sat', critical: 0, high: 2, medium: 8, low: 18 },
    { name: 'Sun', critical: 0, high: 1, medium: 6, low: 15 }
  ];

  const deploymentSuccessData: ChartData[] = [
    { name: 'Week 1', success: 94, failed: 6 },
    { name: 'Week 2', success: 96, failed: 4 },
    { name: 'Week 3', success: 98, failed: 2 },
    { name: 'Week 4', success: 97, failed: 3 }
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const renderMetricCard = (metric: MetricCard, index: number) => (
    <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
          <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
          <div className="flex items-center mt-2">
            {metric.trend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : metric.trend === 'down' ? (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            ) : (
              <div className="w-4 h-4 mr-1" />
            )}
            <span className={`text-sm font-medium ${
              metric.trend === 'up' ? 'text-green-600' : 
              metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {metric.change}
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </div>
        <div className={`p-3 rounded-full ${
          metric.trend === 'up' ? 'bg-green-100 text-green-600' :
          metric.trend === 'down' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
        }`}>
          {metric.icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enterprise Analytics</h1>
            <p className="text-gray-600 mt-1">Comprehensive multi-cloud infrastructure insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Activity className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {metricCards.map(renderMetricCard)}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Cost Trends */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Multi-Cloud Cost Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={costTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
              <Legend />
              <Area type="monotone" dataKey="aws" stackId="1" stroke="#FF8042" fill="#FF8042" fillOpacity={0.6} />
              <Area type="monotone" dataKey="azure" stackId="1" stroke="#00C49F" fill="#00C49F" fillOpacity={0.6} />
              <Area type="monotone" dataKey="gcp" stackId="1" stroke="#0088FE" fill="#0088FE" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Resource Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={resourceDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {resourceDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="cpu" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="memory" stroke="#82ca9d" strokeWidth={2} />
              <Line type="monotone" dataKey="network" stroke="#ffc658" strokeWidth={2} />
              <Line type="monotone" dataKey="latency" stroke="#ff7300" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Security Alerts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Alerts Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={securityAlertsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="critical" stackId="a" fill="#dc2626" />
              <Bar dataKey="high" stackId="a" fill="#ea580c" />
              <Bar dataKey="medium" stackId="a" fill="#ca8a04" />
              <Bar dataKey="low" stackId="a" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row - Wide Charts */}
      <div className="grid grid-cols-1 gap-6">
        {/* Deployment Success Rate */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Deployment Success Rate</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deploymentSuccessData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="success" fill="#10b981" />
              <Bar dataKey="failed" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Real-time Alerts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
              <div>
                <p className="font-medium text-red-800">Critical: High CPU usage detected</p>
                <p className="text-sm text-red-600">AWS EC2 instance i-0123456789abcdef0 - 95% CPU usage</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Server className="w-5 h-5 text-yellow-500 mr-3" />
              <div>
                <p className="font-medium text-yellow-800">Warning: Disk space running low</p>
                <p className="text-sm text-yellow-600">Azure VM vm-prod-web-01 - 85% disk usage</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Cloud className="w-5 h-5 text-blue-500 mr-3" />
              <div>
                <p className="font-medium text-blue-800">Info: Auto-scaling triggered</p>
                <p className="text-sm text-blue-600">GCP instance group scaled from 3 to 5 instances</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseAnalyticsDashboard;