import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
import { useAuth } from '../contexts/AuthContext';
import CutoverPlannerModal from './cloud/CutoverPlannerModal';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

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

  const { user } = useAuth();
  const [toolOutput, setToolOutput] = useState<any | null>(null);
  const [toolLoading, setToolLoading] = useState<string | null>(null);
  const [cleanupDryRun, setCleanupDryRun] = useState<boolean>(true);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize filters from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sev = params.get('sev');
    const dry = params.get('dry');
    if (sev) setSeverityFilter(sev);
    if (dry !== null) setCleanupDryRun(dry === '1' || dry === 'true');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateQuery = (key: string, value: string | null) => {
    const params = new URLSearchParams(location.search);
    if (value === null) params.delete(key); else params.set(key, value);
    navigate({ search: params.toString() }, { replace: true });
  };

  const downloadCsv = (filename: string, rows: Array<Record<string, any>>, headers: Array<{ key: string; label: string }>) => {
    try {
      const escape = (val: any) => {
        if (val === null || val === undefined) return '';
        const s = String(val).replace(/"/g, '""');
        return `"${s}"`;
      };
      const headerLine = headers.map(h => escape(h.label)).join(',');
      const lines = rows.map(r => headers.map(h => escape(r[h.key])).join(','));
      const csv = [headerLine, ...lines].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('CSV export failed', e);
    }
  };

  const runAuditNetwork = async () => {
    if (!user?.tenantId) return;
    setToolLoading('network');
    try {
      const res = await aiServicesAPI.auditNetworkPolicy(user.tenantId);
      setToolOutput({ title: 'Network Policy Audit', data: res.data || res });
      toast.success('Network policy audit completed');
    } finally {
      setToolLoading(null);
    }
  };

  const runBackupPlan = async () => {
    if (!user?.tenantId) return;
    setToolLoading('backup');
    try {
      const res = await aiServicesAPI.backupDR({ tenant_id: user.tenantId, action: 'plan', env: 'staging' });
      setToolOutput({ title: 'Backup & DR Plan', data: res.data || res });
      toast.success('Backup & DR plan generated');
    } finally {
      setToolLoading(null);
    }
  };

  const runCleanupScan = async () => {
    if (!user?.tenantId) return;
    setToolLoading('cleanup');
    try {
      const res = await aiServicesAPI.cleanupScanExecute({ tenant_id: user.tenantId, provider: 'aws', execute: false, dry_run: true });
      setToolOutput({ title: 'Cleanup Scan (Dry Run)', data: res.data || res });
      toast.success('Cleanup scan completed');
    } finally {
      setToolLoading(null);
    }
  };

  const executeCleanupNow = async () => {
    if (!user?.tenantId) return;
    setToolLoading('cleanup-exec');
    try {
      const res = await aiServicesAPI.cleanupScanExecute({ tenant_id: user.tenantId, provider: 'aws', execute: true, dry_run: cleanupDryRun });
      setToolOutput({ title: cleanupDryRun ? 'Cleanup Execute (Dry Run)' : 'Cleanup Execute', data: res.data || res });
      toast.success(cleanupDryRun ? 'Cleanup executed (dry run)' : 'Cleanup executed');
    } finally {
      setToolLoading(null);
    }
  };

  const runMultiRegionPlan = async () => {
    setToolLoading('multi');
    try {
      const res = await aiServicesAPI.multiRegionPlan({ regions: ['us-east-1', 'eu-west-1'], strategy: 'canary', batch_size: 1 });
      setToolOutput({ title: 'Multi-Region Plan', data: res.data || res });
      toast.success('Multi-region plan prepared');
    } finally {
      setToolLoading(null);
    }
  };

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

      {/* Cloud & Infra Tools */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Cloud & Infra Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <button onClick={runAuditNetwork} className="p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors text-left">
            <div className="font-medium">Audit Network Policies</div>
            <div className="text-xs text-muted-foreground">Detect open ports and risky rules</div>
            {toolLoading === 'network' && <div className="text-xs mt-2">Running…</div>}
          </button>
          <button onClick={runBackupPlan} className="p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors text-left">
            <div className="font-medium">Backup & DR Plan</div>
            <div className="text-xs text-muted-foreground">Define retention and DR drills</div>
            {toolLoading === 'backup' && <div className="text-xs mt-2">Running…</div>}
          </button>
          <button onClick={runCleanupScan} className="p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors text-left">
            <div className="font-medium">Cleanup Scan (Dry Run)</div>
            <div className="text-xs text-muted-foreground">Find idle/orphaned assets</div>
            {toolLoading === 'cleanup' && <div className="text-xs mt-2">Running…</div>}
          </button>
          <button onClick={runMultiRegionPlan} className="p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors text-left">
            <div className="font-medium">Multi-Region Plan</div>
            <div className="text-xs text-muted-foreground">Plan canary rollout across regions</div>
            {toolLoading === 'multi' && <div className="text-xs mt-2">Running…</div>}
          </button>
          <div className="p-4 bg-secondary/50 rounded-lg text-left">
            <div className="font-medium mb-2">Safe Cutover</div>
            <div className="text-xs text-muted-foreground mb-2">Plan blue/green or weighted cutover</div>
            <CutoverPlannerModal />
          </div>
        </div>
        {/* Inline trigger for planner */}
        <div className="mt-3">
          {/* Render the planner modal trigger */}
          {/**/}
        </div>
        {toolOutput && (
          <div className="mt-4 p-4 bg-secondary/40 rounded-lg overflow-auto space-y-3">
            <div className="font-medium">{toolOutput.title}</div>
            {/* Network Policy Findings Table */}
            {(() => {
              const findings = toolOutput?.data?.result?.findings || toolOutput?.data?.findings;
              if (Array.isArray(findings) && findings.length) {
                const filtered = findings.filter((f: any) => severityFilter === 'all' || (f.severity || '').toLowerCase() === severityFilter);
                const onExportFindings = () => {
                  const rows = filtered.map((f: any) => {
                    const r = f.rule || {};
                    const cidr = r.cidr || r.cidr_ip || r.source || '';
                    const fromp = r.from_port ?? r.port ?? '';
                    const top = r.to_port ?? r.port ?? '';
                    const proto = r.protocol ?? r.ip_protocol ?? '';
                    return {
                      resource: f.resource,
                      type: f.type,
                      issue: f.issue,
                      severity: f.severity,
                      rule: `${proto} ${fromp}${top && top !== fromp ? '-' + top : ''} ${cidr}`,
                      recommendation: f.recommendation,
                    };
                  });
                  downloadCsv('network_findings.csv', rows, [
                    { key: 'resource', label: 'Resource' },
                    { key: 'type', label: 'Type' },
                    { key: 'issue', label: 'Issue' },
                    { key: 'severity', label: 'Severity' },
                    { key: 'rule', label: 'Rule' },
                    { key: 'recommendation', label: 'Recommendation' },
                  ]);
                };
                return (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm">{filtered.length} risky rule(s) shown</div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span>Severity</span>
                          <Select value={severityFilter} onValueChange={(v) => { setSeverityFilter(v); updateQuery('sev', v === 'all' ? null : v); }}>
                            <SelectTrigger className="h-8 w-32">
                              <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button size="sm" onClick={onExportFindings}>Export CSV</Button>
                      </div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Resource</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Issue</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Rule</TableHead>
                          <TableHead>Recommendation</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.slice(0, 100).map((f: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono text-xs">{f.resource}</TableCell>
                            <TableCell className="text-xs">{f.type}</TableCell>
                            <TableCell className="text-xs">{f.issue}</TableCell>
                            <TableCell className="text-xs capitalize">{f.severity}</TableCell>
                            <TableCell className="text-xs">
                              {(() => {
                                const r = f.rule || {};
                                const cidr = r.cidr || r.cidr_ip || r.source || '';
                                const fromp = r.from_port ?? r.port ?? '';
                                const top = r.to_port ?? r.port ?? '';
                                const proto = r.protocol ?? r.ip_protocol ?? '';
                                return `${proto} ${fromp}${top && top !== fromp ? '-' + top : ''} ${cidr}`;
                              })()}
                            </TableCell>
                            <TableCell className="text-xs">{f.recommendation}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                );
              }
              return null;
            })()}

            {/* Cleanup Candidates Table with Execute Controls */}
            {(() => {
              const candidates = toolOutput?.data?.result?.candidates || toolOutput?.data?.candidates;
              const savings = toolOutput?.data?.result?.savings || toolOutput?.data?.savings;
              if (Array.isArray(candidates) && candidates.length) {
                const onExportCleanup = () => {
                  const rows = candidates.map((c: any) => ({
                    resource_id: c.resource_id,
                    resource_name: c.resource_name,
                    resource_type: c.resource_type,
                    age_days: c.age_days,
                    monthly_cost: c.monthly_cost,
                    reasons: (c.cleanup_reasons || []).join('; '),
                    owner: c.owner || '',
                    team: c.team || '',
                    project: c.project || '',
                  }));
                  downloadCsv('cleanup_candidates.csv', rows, [
                    { key: 'resource_id', label: 'ID' },
                    { key: 'resource_name', label: 'Name' },
                    { key: 'resource_type', label: 'Type' },
                    { key: 'age_days', label: 'Age (days)' },
                    { key: 'monthly_cost', label: 'Monthly Cost' },
                    { key: 'reasons', label: 'Reasons' },
                    { key: 'owner', label: 'Owner' },
                    { key: 'team', label: 'Team' },
                    { key: 'project', label: 'Project' },
                  ]);
                };
                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">{candidates.length} candidate(s) found</div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span>Dry Run</span>
                          <Switch checked={cleanupDryRun} onCheckedChange={(v) => { setCleanupDryRun(v); updateQuery('dry', v ? '1' : '0'); }} />
                        </div>
                        <Button variant="default" onClick={executeCleanupNow} disabled={toolLoading === 'cleanup-exec'}>
                          {toolLoading === 'cleanup-exec' ? 'Executing…' : (cleanupDryRun ? 'Execute (Dry Run)' : 'Execute Cleanup')}
                        </Button>
                        <Button size="sm" variant="secondary" onClick={onExportCleanup}>Export CSV</Button>
                      </div>
                    </div>
                    {savings && (
                      <div className="text-xs text-muted-foreground">
                        Est. Monthly Savings: ${Number(savings.monthly_cost_savings || 0).toFixed(2)} | Storage Saved: {Number(savings.storage_savings_gb || 0).toFixed(1)} GB
                      </div>
                    )}
                    <div className="overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Age (days)</TableHead>
                            <TableHead>Monthly Cost</TableHead>
                            <TableHead>Reasons</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {candidates.slice(0, 200).map((c: any) => (
                            <TableRow key={c.resource_id}>
                              <TableCell className="font-mono text-xs">{c.resource_id}</TableCell>
                              <TableCell className="text-xs">{c.resource_name}</TableCell>
                              <TableCell className="text-xs">{c.resource_type}</TableCell>
                              <TableCell className="text-xs">{c.age_days}</TableCell>
                              <TableCell className="text-xs">${Number(c.monthly_cost || 0).toFixed(2)}</TableCell>
                              <TableCell className="text-xs">{(c.cleanup_reasons || []).join('; ')}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Fallback raw JSON */}
            <div className="text-xs whitespace-pre-wrap">
              <pre>{JSON.stringify(toolOutput.data, null, 2)}</pre>
            </div>
          </div>
        )}
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