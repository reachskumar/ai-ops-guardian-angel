import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bot, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Users,
  Database,
  Cloud,
  Code,
  Workflow,
  Brain,
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  BarChart3,
  DollarSign,
  Zap,
  Monitor,
  Package,
  BookOpen,
  Puzzle,
  GitBranch,
  FileText,
  Upload,
  Download,
  Play,
  Pause,
  Settings as SettingsIcon,
  Bell,
  Search,
  Filter
} from 'lucide-react';
import aiServicesAPI from '../lib/api';

interface SystemMetric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  status: 'healthy' | 'warning' | 'critical';
  icon: React.ComponentType<any>;
}

interface AgentStatus {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'error';
  category: string;
  lastActivity: string;
  performance: number;
}

interface RecentActivity {
  id: string;
  type: 'workflow' | 'security' | 'cost' | 'deployment' | 'compliance';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'pending';
  agent: string;
}

const Dashboard = () => {
  const [showMetrics, setShowMetrics] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [summary, setSummary] = useState<any | null>(null);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    {
      name: 'Active AI Agents',
      value: 28,
      change: 2,
      trend: 'up',
      status: 'healthy',
      icon: Bot
    },
    {
      name: 'System Health',
      value: 98.5,
      change: -0.5,
      trend: 'down',
      status: 'healthy',
      icon: Activity
    },
    {
      name: 'Security Score',
      value: 94.2,
      change: 1.8,
      trend: 'up',
      status: 'healthy',
      icon: Shield
    },
    {
      name: 'Cost Savings',
      value: 15420,
      change: 1250,
      trend: 'up',
      status: 'healthy',
      icon: DollarSign
    },
    {
      name: 'Workflows Active',
      value: 12,
      change: 3,
      trend: 'up',
      status: 'healthy',
      icon: Workflow
    },
    {
      name: 'Response Time',
      value: 2.3,
      change: -0.4,
      trend: 'down',
      status: 'healthy',
      icon: Clock
    }
  ]);

  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([
    { id: 'cost-opt', name: 'Cost Optimization Agent', status: 'active', category: 'Core Infrastructure', lastActivity: '2 minutes ago', performance: 98 },
    { id: 'security', name: 'Security Analysis Agent', status: 'active', category: 'Security & Compliance', lastActivity: '1 minute ago', performance: 99 },
    { id: 'infra', name: 'Infrastructure Agent', status: 'active', category: 'Core Infrastructure', lastActivity: '3 minutes ago', performance: 97 },
    { id: 'devops', name: 'DevOps Automation Agent', status: 'active', category: 'Core Infrastructure', lastActivity: '5 minutes ago', performance: 96 },
    { id: 'langgraph', name: 'LangGraph Orchestrator', status: 'active', category: 'Specialized Workflows', lastActivity: '1 minute ago', performance: 95 },
    { id: 'hitl', name: 'Auto-Remediation Agent', status: 'active', category: 'Human-in-Loop', lastActivity: '4 minutes ago', performance: 94 }
  ]);

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([
    {
      id: 'act-001',
      type: 'security',
      title: 'Critical Vulnerability Remediated',
      description: 'Automated remediation of CVE-2024-001 in production environment',
      timestamp: '2 minutes ago',
      status: 'success',
      agent: 'Security Analysis Agent'
    },
    {
      id: 'act-002',
      type: 'cost',
      title: 'Cost Optimization Completed',
      description: 'Rightsized 8 EC2 instances, saving $1,500/month',
      timestamp: '5 minutes ago',
      status: 'success',
      agent: 'Cost Optimization Agent'
    },
    {
      id: 'act-003',
      type: 'workflow',
      title: 'Root Cause Analysis Workflow',
      description: 'Completed RCA workflow for incident #1234',
      timestamp: '8 minutes ago',
      status: 'success',
      agent: 'LangGraph Orchestrator'
    },
    {
      id: 'act-004',
      type: 'deployment',
      title: 'New Feature Deployment',
      description: 'Deployed authentication system to production',
      timestamp: '12 minutes ago',
      status: 'success',
      agent: 'DevOps Automation Agent'
    },
    {
      id: 'act-005',
      type: 'compliance',
      title: 'SOC2 Compliance Check',
      description: 'Completed quarterly SOC2 compliance validation',
      timestamp: '15 minutes ago',
      status: 'success',
      agent: 'Compliance Automation Agent'
    }
  ]);

  const quickActions = [
    { name: 'AI Chat', path: '/chat', icon: Bot, color: 'bg-blue-500' },
    { name: 'AI Agents', path: '/agents', icon: Brain, color: 'bg-purple-500' },
    { name: 'LangGraph Workflows', path: '/workflows/langgraph', icon: Workflow, color: 'bg-green-500' },
    { name: 'HITL Workflows', path: '/workflows/hitl', icon: Users, color: 'bg-orange-500' },
    { name: 'Plugin Marketplace', path: '/plugins/marketplace', icon: Package, color: 'bg-indigo-500' },
    { name: 'Knowledge Base', path: '/knowledge', icon: BookOpen, color: 'bg-teal-500' },
    { name: 'IaC Generator', path: '/iac/generator', icon: Code, color: 'bg-red-500' },
    { name: 'Security Dashboard', path: '/security', icon: Shield, color: 'bg-yellow-500' }
  ];

  const systemModules = [
    { name: 'Core Infrastructure', status: 'healthy', agents: 8, icon: Database },
    { name: 'Security & Compliance', status: 'healthy', agents: 6, icon: Shield },
    { name: 'Advanced AI', status: 'healthy', agents: 4, icon: Brain },
    { name: 'Human-in-Loop', status: 'healthy', agents: 3, icon: Users },
    { name: 'Git & Deployment', status: 'healthy', agents: 3, icon: GitBranch },
    { name: 'Analytics & Monitoring', status: 'healthy', agents: 3, icon: BarChart3 },
    { name: 'MLOps', status: 'healthy', agents: 3, icon: TrendingUp },
    { name: 'Advanced DevOps', status: 'healthy', agents: 2, icon: Code }
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadSummary();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const loadSummary = async () => {
    try {
      setLoadingSummary(true);
      setSummaryError(null);
      const res = await aiServicesAPI.getDashboardSummary();
      if (res.success && res.data) {
        const data = res.data as any;
        setSummary(data);
        // Optionally update one or two metric cards from summary
        setSystemMetrics((prev) => prev.map((m) => {
          if (m.name === 'Cost Savings' && data?.costs?.total_cost !== undefined) {
            return { ...m, value: Number(data.costs.total_cost) };
          }
          if (m.name === 'Active AI Agents') {
            return m; // keep static unless backend exposes agents count
          }
          return m;
        }));
      } else {
        setSummaryError(res.error || 'Failed to load summary');
      }
    } catch (e: any) {
      setSummaryError(e?.message || 'Failed to load summary');
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500 bg-green-500/10';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10';
      case 'critical': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      case 'pending': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'workflow': return <Workflow className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'cost': return <DollarSign className="w-4 h-4" />;
      case 'deployment': return <Code className="w-4 h-4" />;
      case 'compliance': return <CheckCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">InfraMind Dashboard</h1>
          <p className="text-muted-foreground">Real-time monitoring and control center</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className={`p-2 hover:bg-accent rounded-lg transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowMetrics(!showMetrics)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            {showMetrics ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button className="p-2 hover:bg-accent rounded-lg transition-colors">
            <Bell className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-accent rounded-lg transition-colors">
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* System Metrics */}
      {showMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.name} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium">{metric.name}</span>
                  </div>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                    <span className="capitalize">{metric.status}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {metric.name.includes('Cost') ? `$${metric.value.toLocaleString()}` : metric.value}
                    {metric.name.includes('Response Time') && 's'}
                    {metric.name.includes('System Health') && '%'}
                  </div>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(metric.trend)}
                    <span className={`text-sm font-medium ${
                      metric.trend === 'up' ? 'text-green-500' : 
                      metric.trend === 'down' ? 'text-red-500' : 'text-blue-500'
                    }`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}
                      {metric.name.includes('Cost') ? '$' : ''}
                      {metric.name.includes('Response Time') ? 's' : ''}
                      {metric.name.includes('System Health') && '%'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Backend Summary Snapshot */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Environment Summary</h2>
          {loadingSummary && <span className="text-xs text-muted-foreground">Loading…</span>}
        </div>
        {summaryError && (
          <div className="text-sm text-red-500 mb-3">{summaryError}</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="text-sm text-muted-foreground">Total Resources</div>
            <div className="text-2xl font-bold">{summary?.resources_total ?? '—'}</div>
          </div>
          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="text-sm text-muted-foreground">Open Incidents</div>
            <div className="text-2xl font-bold">{summary?.incidents_open ?? '—'}</div>
          </div>
          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="text-sm text-muted-foreground">Providers</div>
            <div className="text-2xl font-bold">{summary?.by_provider ? Object.keys(summary.by_provider).length : '—'}</div>
          </div>
          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="text-sm text-muted-foreground">Monthly Cost</div>
            <div className="text-2xl font-bold">{summary?.costs?.total_cost !== undefined ? `$${Number(summary.costs.total_cost).toFixed(2)}` : '—'}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.name}
                to={action.path}
                className="group block"
              >
                <div className="flex items-center space-x-3 p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors">
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium group-hover:text-primary transition-colors">
                    {action.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* System Modules Status */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">System Modules Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemModules.map((module) => {
            const Icon = module.icon;
            return (
              <div key={module.name} className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-lg">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{module.name}</div>
                  <div className="text-sm text-muted-foreground">{module.agents} agents</div>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  module.status === 'healthy' ? 'bg-green-500' :
                  module.status === 'warning' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agent Status and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Status */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">AI Agent Status</h2>
            <Link to="/agents" className="text-primary hover:underline text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {agentStatuses.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    agent.status === 'active' ? 'bg-green-500' :
                    agent.status === 'idle' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  <div>
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-sm text-muted-foreground">{agent.category}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{agent.performance}%</div>
                  <div className="text-xs text-muted-foreground">{agent.lastActivity}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <button className="text-primary hover:underline text-sm">
              View All
            </button>
          </div>
          <div className="space-y-3">
                         {recentActivities.map((activity) => {
               return (
                 <div key={activity.id} className="flex items-start space-x-3 p-3 bg-secondary/50 rounded-lg">
                   <div className="p-1 bg-primary/10 rounded">
                     {getActivityTypeIcon(activity.type)}
                   </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{activity.title}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getActivityStatusColor(activity.status).replace('text-', 'bg-')} bg-opacity-10`}>
                        {activity.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                      <span className="text-xs text-muted-foreground">{activity.agent}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">System Health Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-500/10 rounded-lg">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-500">28</div>
            <div className="text-sm text-muted-foreground">Healthy Agents</div>
          </div>
          <div className="text-center p-4 bg-blue-500/10 rounded-lg">
            <Activity className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-500">12</div>
            <div className="text-sm text-muted-foreground">Active Workflows</div>
          </div>
          <div className="text-center p-4 bg-purple-500/10 rounded-lg">
            <Shield className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-500">94.2%</div>
            <div className="text-sm text-muted-foreground">Security Score</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;