import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bot, 
  Activity, 
  Clock, 
  AlertTriangle, 
  Settings, 
  Play, 
  Pause, 
  RefreshCw,
  BarChart3,
  Code,
  Shield,
  Users,
  Workflow,
  Brain,
  TrendingUp,
  CheckCircle,
  Database,
  Monitor,
  Zap,
  Package,
  GitBranch,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';

interface AgentConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'active' | 'idle' | 'error';
  capabilities: string[];
  tools: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeout: number;
  icon: React.ComponentType<any>;
  metrics: {
    requestsPerMinute: number;
    averageResponseTime: number;
    successRate: number;
    errorRate: number;
  };
  recentActivity: {
    timestamp: string;
    action: string;
    details: string;
    status: 'success' | 'warning' | 'error';
  }[];
}

const AgentDetails = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const [agent, setAgent] = useState<AgentConfig | null>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [showMetrics, setShowMetrics] = useState(true);

  // Mock agent data - in real app, this would come from API
  const mockAgents: Record<string, AgentConfig> = {
    'cost-optimization': {
      id: 'cost-optimization',
      name: 'Cost Optimization Agent',
      category: 'Core Infrastructure',
      description: 'Advanced cost analysis and optimization agent that uses machine learning to forecast spending, identify cost-saving opportunities, and provide automated rightsizing recommendations across multiple cloud providers.',
      status: 'active',
      capabilities: ['Cost Analysis', 'ML Forecasting', 'Rightsizing', 'Multi-cloud Optimization', 'Budget Management'],
      tools: ['cost_analyzer', 'forecasting_engine', 'rightsizing_tool', 'budget_tracker'],
      priority: 'high',
      timeout: 300,
      icon: TrendingUp,
      metrics: {
        requestsPerMinute: 45,
        averageResponseTime: 2.3,
        successRate: 98.5,
        errorRate: 1.5
      },
      recentActivity: [
        { timestamp: '2024-01-15T10:30:00Z', action: 'Cost Analysis', details: 'Analyzed AWS EC2 instances for optimization', status: 'success' },
        { timestamp: '2024-01-15T10:25:00Z', action: 'Forecasting', details: 'Generated 30-day cost forecast', status: 'success' },
        { timestamp: '2024-01-15T10:20:00Z', action: 'Rightsizing', details: 'Recommended 3 instance downsizes', status: 'warning' }
      ]
    },
    'security-analysis': {
      id: 'security-analysis',
      name: 'Security Analysis Agent',
      category: 'Security & Compliance',
      description: 'Comprehensive security monitoring and analysis agent that performs vulnerability scanning, compliance checking, and threat detection across all infrastructure components.',
      status: 'active',
      capabilities: ['Vulnerability Scanning', 'Compliance Monitoring', 'Threat Detection', 'Security Auditing', 'Incident Response'],
      tools: ['vulnerability_scanner', 'compliance_checker', 'threat_detector', 'security_auditor'],
      priority: 'critical',
      timeout: 600,
      icon: Shield,
      metrics: {
        requestsPerMinute: 32,
        averageResponseTime: 4.1,
        successRate: 99.2,
        errorRate: 0.8
      },
      recentActivity: [
        { timestamp: '2024-01-15T10:35:00Z', action: 'Vulnerability Scan', details: 'Completed security scan of 150 resources', status: 'success' },
        { timestamp: '2024-01-15T10:30:00Z', action: 'Compliance Check', details: 'SOC2 compliance validation passed', status: 'success' },
        { timestamp: '2024-01-15T10:25:00Z', action: 'Threat Detection', details: 'Detected suspicious activity pattern', status: 'warning' }
      ]
    },
    'langgraph-orchestrator': {
      id: 'langgraph-orchestrator',
      name: 'LangGraph Orchestrator',
      category: 'Specialized Workflows',
      description: 'Advanced workflow orchestration agent that manages complex multi-step processes using LangGraph, including root cause analysis, remediation workflows, and incident response automation.',
      status: 'active',
      capabilities: ['Workflow Orchestration', 'RCA Workflows', 'Remediation Workflows', 'Process Automation', 'State Management'],
      tools: ['workflow_orchestrator', 'rca_workflow', 'remediation_workflow', 'state_manager'],
      priority: 'critical',
      timeout: 600,
      icon: Workflow,
      metrics: {
        requestsPerMinute: 18,
        averageResponseTime: 8.5,
        successRate: 97.8,
        errorRate: 2.2
      },
      recentActivity: [
        { timestamp: '2024-01-15T10:40:00Z', action: 'Workflow Execution', details: 'Completed RCA workflow for incident #1234', status: 'success' },
        { timestamp: '2024-01-15T10:35:00Z', action: 'Remediation', details: 'Automated remediation for 3 security issues', status: 'success' },
        { timestamp: '2024-01-15T10:30:00Z', action: 'Process Automation', details: 'Orchestrated deployment workflow', status: 'success' }
      ]
    }
  };

  useEffect(() => {
    if (agentId && mockAgents[agentId]) {
      setAgent(mockAgents[agentId]);
    }
  }, [agentId]);

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Agent Not Found</h2>
          <p className="text-muted-foreground">The requested agent could not be found.</p>
          <Link to="/agents" className="text-primary hover:underline mt-4 inline-block">
            Back to Agents Hub
          </Link>
        </div>
      </div>
    );
  }

  const Icon = agent.icon;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10';
      case 'idle': return 'text-yellow-500 bg-yellow-500/10';
      case 'error': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'low': return 'text-green-500 bg-green-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/agents" className="p-2 hover:bg-accent rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Icon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{agent.name}</h1>
              <p className="text-muted-foreground">{agent.category}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isRunning 
                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? 'Stop' : 'Start'}</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span>Restart</span>
          </button>
        </div>
      </div>

      {/* Status and Priority */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Status</span>
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
              <Activity className="w-3 h-3" />
              <span className="capitalize">{agent.status}</span>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Priority</span>
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(agent.priority)}`}>
              <span className="capitalize">{agent.priority}</span>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Timeout</span>
            <span className="text-sm font-medium">{agent.timeout}s</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Description</h3>
        <p className="text-muted-foreground leading-relaxed">{agent.description}</p>
      </div>

      {/* Capabilities and Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Capabilities</h3>
          <div className="space-y-2">
            {agent.capabilities.map((capability, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">{capability}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Tools</h3>
          <div className="space-y-2">
            {agent.tools.map((tool, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-mono">{tool}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics */}
      {showMetrics && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Performance Metrics</h3>
            <button
              onClick={() => setShowMetrics(false)}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{agent.metrics.requestsPerMinute}</div>
              <div className="text-sm text-muted-foreground">Requests/min</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{agent.metrics.averageResponseTime}s</div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{agent.metrics.successRate}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{agent.metrics.errorRate}%</div>
              <div className="text-sm text-muted-foreground">Error Rate</div>
            </div>
          </div>
        </div>
      )}

      {!showMetrics && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Performance Metrics</h3>
            <button
              onClick={() => setShowMetrics(true)}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
          <p className="text-muted-foreground">Metrics are hidden</p>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {agent.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${getActivityStatusColor(activity.status).replace('text-', 'bg-')}`}></div>
                <div>
                  <div className="font-medium">{activity.action}</div>
                  <div className="text-sm text-muted-foreground">{activity.details}</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(activity.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Agent ID</label>
            <div className="font-mono text-sm mt-1">{agent.id}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Category</label>
            <div className="text-sm mt-1">{agent.category}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Priority</label>
            <div className="text-sm mt-1 capitalize">{agent.priority}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Timeout</label>
            <div className="text-sm mt-1">{agent.timeout} seconds</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { AgentDetails }; 