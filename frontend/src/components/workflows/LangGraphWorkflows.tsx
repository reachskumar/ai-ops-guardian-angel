import React, { useState } from 'react';
import { 
  Workflow, 
  Play, 
  Pause, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  BarChart3,
  Activity,
  Settings,
  Eye,
  EyeOff,
  Download,
  Upload,
  GitBranch,
  Code,
  Shield,
  Brain,
  TrendingUp,
  Users,
  Database,
  Monitor,
  Zap
} from 'lucide-react';

interface WorkflowExecution {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  progress: number;
  startTime: string;
  endTime?: string;
  duration?: number;
  steps: WorkflowStep[];
  metrics: {
    totalSteps: number;
    completedSteps: number;
    failedSteps: number;
    averageStepTime: number;
  };
}

interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
  duration?: number;
  output?: string;
  error?: string;
}

const LangGraphWorkflows = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('all');
  const [showMetrics, setShowMetrics] = useState(true);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([
    {
      id: 'rca-001',
      name: 'Root Cause Analysis',
      type: 'RCA',
      status: 'running',
      progress: 75,
      startTime: '2024-01-15T10:00:00Z',
      steps: [
        { id: 'step-1', name: 'Incident Analysis', status: 'completed', startTime: '2024-01-15T10:00:00Z', endTime: '2024-01-15T10:02:00Z', duration: 120 },
        { id: 'step-2', name: 'Evidence Gathering', status: 'completed', startTime: '2024-01-15T10:02:00Z', endTime: '2024-01-15T10:05:00Z', duration: 180 },
        { id: 'step-3', name: 'Correlation Analysis', status: 'running', startTime: '2024-01-15T10:05:00Z' },
        { id: 'step-4', name: 'Root Cause Identification', status: 'pending' },
        { id: 'step-5', name: 'Remediation Planning', status: 'pending' }
      ],
      metrics: {
        totalSteps: 5,
        completedSteps: 2,
        failedSteps: 0,
        averageStepTime: 150
      }
    },
    {
      id: 'remediation-001',
      name: 'Security Remediation',
      type: 'Remediation',
      status: 'completed',
      progress: 100,
      startTime: '2024-01-15T09:30:00Z',
      endTime: '2024-01-15T09:45:00Z',
      duration: 900,
      steps: [
        { id: 'step-1', name: 'Vulnerability Assessment', status: 'completed', startTime: '2024-01-15T09:30:00Z', endTime: '2024-01-15T09:32:00Z', duration: 120 },
        { id: 'step-2', name: 'Risk Analysis', status: 'completed', startTime: '2024-01-15T09:32:00Z', endTime: '2024-01-15T09:35:00Z', duration: 180 },
        { id: 'step-3', name: 'Remediation Execution', status: 'completed', startTime: '2024-01-15T09:35:00Z', endTime: '2024-01-15T09:40:00Z', duration: 300 },
        { id: 'step-4', name: 'Verification', status: 'completed', startTime: '2024-01-15T09:40:00Z', endTime: '2024-01-15T09:45:00Z', duration: 300 }
      ],
      metrics: {
        totalSteps: 4,
        completedSteps: 4,
        failedSteps: 0,
        averageStepTime: 225
      }
    },
    {
      id: 'iac-001',
      name: 'Infrastructure Generation',
      type: 'IaC',
      status: 'failed',
      progress: 60,
      startTime: '2024-01-15T08:00:00Z',
      endTime: '2024-01-15T08:10:00Z',
      duration: 600,
      steps: [
        { id: 'step-1', name: 'Requirements Analysis', status: 'completed', startTime: '2024-01-15T08:00:00Z', endTime: '2024-01-15T08:02:00Z', duration: 120 },
        { id: 'step-2', name: 'Architecture Design', status: 'completed', startTime: '2024-01-15T08:02:00Z', endTime: '2024-01-15T08:05:00Z', duration: 180 },
        { id: 'step-3', name: 'Code Generation', status: 'failed', startTime: '2024-01-15T08:05:00Z', endTime: '2024-01-15T08:10:00Z', duration: 300, error: 'Template validation failed' },
        { id: 'step-4', name: 'Validation', status: 'pending' },
        { id: 'step-5', name: 'Deployment', status: 'pending' }
      ],
      metrics: {
        totalSteps: 5,
        completedSteps: 2,
        failedSteps: 1,
        averageStepTime: 200
      }
    }
  ]);

  const workflowTypes = [
    { id: 'all', name: 'All Workflows', icon: Workflow },
    { id: 'RCA', name: 'Root Cause Analysis', icon: Brain },
    { id: 'Remediation', name: 'Remediation', icon: Shield },
    { id: 'IaC', name: 'Infrastructure as Code', icon: Code },
    { id: 'Incident', name: 'Incident Response', icon: AlertTriangle },
    { id: 'Cost', name: 'Cost Optimization', icon: TrendingUp },
    { id: 'Security', name: 'Security Audit', icon: Shield }
  ];

  const filteredExecutions = executions.filter(execution => 
    selectedWorkflow === 'all' || execution.type === selectedWorkflow
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-500 bg-blue-500/10';
      case 'completed': return 'text-green-500 bg-green-500/10';
      case 'failed': return 'text-red-500 bg-red-500/10';
      case 'pending': return 'text-yellow-500 bg-yellow-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-500';
      case 'completed': return 'text-green-500';
      case 'failed': return 'text-red-500';
      case 'pending': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">LangGraph Workflows</h1>
          <p className="text-muted-foreground">Advanced workflow orchestration with LangGraph</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <Play className="w-4 h-4" />
            <span>New Workflow</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </button>
        </div>
      </div>

      {/* Workflow Type Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {workflowTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => setSelectedWorkflow(type.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                selectedWorkflow === type.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{type.name}</span>
            </button>
          );
        })}
      </div>

      {/* Metrics Overview */}
      {showMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Workflow className="w-5 h-5 text-primary" />
              <span className="font-semibold">Total Workflows</span>
            </div>
            <p className="text-2xl font-bold mt-2">{executions.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">Running</span>
            </div>
            <p className="text-2xl font-bold mt-2">{executions.filter(e => e.status === 'running').length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-semibold">Completed</span>
            </div>
            <p className="text-2xl font-bold mt-2">{executions.filter(e => e.status === 'completed').length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="font-semibold">Failed</span>
            </div>
            <p className="text-2xl font-bold mt-2">{executions.filter(e => e.status === 'failed').length}</p>
          </div>
        </div>
      )}

      {/* Workflow Executions */}
      <div className="space-y-4">
        {filteredExecutions.map((execution) => (
          <div key={execution.id} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Workflow className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{execution.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {execution.id}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(execution.status)}`}>
                  {getStatusIcon(execution.status)}
                  <span className="capitalize">{execution.status}</span>
                </div>
                <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{execution.progress}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    execution.status === 'completed' ? 'bg-green-500' :
                    execution.status === 'failed' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`}
                  style={{ width: `${execution.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Workflow Steps */}
            <div className="space-y-3">
              <h4 className="font-medium">Workflow Steps</h4>
              {execution.steps.map((step) => (
                <div key={step.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${getStepStatusColor(step.status).replace('text-', 'bg-')}`}></div>
                    <div>
                      <div className="font-medium">{step.name}</div>
                      {step.duration && (
                        <div className="text-sm text-muted-foreground">
                          Duration: {formatDuration(step.duration)}
                        </div>
                      )}
                      {step.error && (
                        <div className="text-sm text-red-500">
                          Error: {step.error}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {step.status}
                  </div>
                </div>
              ))}
            </div>

            {/* Metrics */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Steps:</span>
                  <span className="ml-2 font-medium">{execution.metrics.totalSteps}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Completed:</span>
                  <span className="ml-2 font-medium text-green-500">{execution.metrics.completedSteps}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Failed:</span>
                  <span className="ml-2 font-medium text-red-500">{execution.metrics.failedSteps}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Avg Time:</span>
                  <span className="ml-2 font-medium">{formatDuration(execution.metrics.averageStepTime)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Started: {new Date(execution.startTime).toLocaleTimeString()}</span>
                {execution.endTime && (
                  <>
                    <span>•</span>
                    <span>Duration: {formatDuration(execution.duration || 0)}</span>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                {execution.status === 'running' && (
                  <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                    <Pause className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredExecutions.length === 0 && (
        <div className="text-center py-12">
          <Workflow className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Workflows Found</h3>
          <p className="text-muted-foreground mb-4">
            No workflows match the current filter criteria.
          </p>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            Create New Workflow
          </button>
        </div>
      )}
    </div>
  );
};

export { LangGraphWorkflows }; 