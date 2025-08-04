import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bot, 
  Brain, 
  Shield, 
  Users, 
  Workflow, 
  BarChart3, 
  Cloud, 
  Code, 
  Database, 
  Monitor, 
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Package
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'active' | 'idle' | 'error';
  capabilities: string[];
  icon: React.ComponentType<any>;
  path: string;
}

const AIAgentsHub = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const agents: Agent[] = [
    // Core Infrastructure Agents
    {
      id: 'cost-optimization',
      name: 'Cost Optimization Agent',
      category: 'Core Infrastructure',
      description: 'Real-time cost analysis, ML forecasting, rightsizing',
      status: 'active',
      capabilities: ['Cost Analysis', 'ML Forecasting', 'Rightsizing', 'Multi-cloud'],
      icon: TrendingUp,
      path: '/agents/cost-optimization'
    },
    {
      id: 'security-analysis',
      name: 'Security Analysis Agent',
      category: 'Core Infrastructure',
      description: 'Vulnerability scanning, compliance monitoring',
      status: 'active',
      capabilities: ['Vulnerability Scanning', 'Compliance Monitoring', 'Threat Detection'],
      icon: Shield,
      path: '/agents/security-analysis'
    },
    {
      id: 'infrastructure',
      name: 'Infrastructure Agent',
      category: 'Core Infrastructure',
      description: 'Health monitoring, predictive maintenance',
      status: 'active',
      capabilities: ['Health Monitoring', 'Predictive Maintenance', 'Resource Management'],
      icon: Database,
      path: '/agents/infrastructure'
    },
    {
      id: 'devops',
      name: 'DevOps Automation Agent',
      category: 'Core Infrastructure',
      description: 'CI/CD optimization, deployment automation',
      status: 'active',
      capabilities: ['CI/CD Optimization', 'Deployment Automation', 'Workflow Orchestration'],
      icon: Workflow,
      path: '/agents/devops'
    },

    // Advanced AI Agents
    {
      id: 'code-generation',
      name: 'Code Generation Agent',
      category: 'Advanced AI',
      description: 'Terraform, Ansible, K8s manifests',
      status: 'active',
      capabilities: ['Terraform Generation', 'Ansible Playbooks', 'K8s Manifests'],
      icon: Code,
      path: '/agents/code-generation'
    },
    {
      id: 'predictive-analytics',
      name: 'Predictive Analytics Agent',
      category: 'Advanced AI',
      description: 'Failure prediction, capacity forecasting',
      status: 'active',
      capabilities: ['Failure Prediction', 'Capacity Forecasting', 'ML Modeling'],
      icon: Brain,
      path: '/agents/predictive-analytics'
    },
    {
      id: 'root-cause-analysis',
      name: 'Root Cause Analysis Agent',
      category: 'Advanced AI',
      description: 'Incident analysis, correlation detection',
      status: 'active',
      capabilities: ['Incident Analysis', 'Correlation Detection', 'RCA Workflows'],
      icon: AlertTriangle,
      path: '/agents/root-cause-analysis'
    },
    {
      id: 'architecture-design',
      name: 'Architecture Design Agent',
      category: 'Advanced AI',
      description: 'System architecture generation',
      status: 'active',
      capabilities: ['Architecture Design', 'Best Practices', 'Review Automation'],
      icon: Settings,
      path: '/agents/architecture-design'
    },

    // Security & Compliance Agents
    {
      id: 'threat-hunting',
      name: 'Threat Hunting Agent',
      category: 'Security & Compliance',
      description: 'APT detection, behavioral analysis',
      status: 'active',
      capabilities: ['APT Detection', 'Behavioral Analysis', 'Threat Intelligence'],
      icon: Shield,
      path: '/agents/threat-hunting'
    },
    {
      id: 'compliance-automation',
      name: 'Compliance Automation Agent',
      category: 'Security & Compliance',
      description: 'SOC2, HIPAA, PCI-DSS, GDPR',
      status: 'active',
      capabilities: ['SOC2 Compliance', 'HIPAA Compliance', 'PCI-DSS', 'GDPR'],
      icon: CheckCircle,
      path: '/agents/compliance-automation'
    },
    {
      id: 'zero-trust',
      name: 'Zero-Trust Security Agent',
      category: 'Security & Compliance',
      description: 'Dynamic policy enforcement',
      status: 'active',
      capabilities: ['Policy Enforcement', 'Access Control', 'Security Monitoring'],
      icon: Shield,
      path: '/agents/zero-trust'
    },

    // Human-in-Loop Agents
    {
      id: 'approval-workflow',
      name: 'Approval Workflow Agent',
      category: 'Human-in-Loop',
      description: 'Risk-based approval routing',
      status: 'active',
      capabilities: ['Risk-based Routing', 'Approval Management', 'Notification System'],
      icon: Users,
      path: '/agents/approval-workflow'
    },
    {
      id: 'risk-assessment',
      name: 'Risk Assessment Agent',
      category: 'Human-in-Loop',
      description: 'Intelligent risk scoring',
      status: 'active',
      capabilities: ['Risk Scoring', 'Risk Modeling', 'Recommendation Engine'],
      icon: AlertTriangle,
      path: '/agents/risk-assessment'
    },
    {
      id: 'decision-support',
      name: 'Decision Support Agent',
      category: 'Human-in-Loop',
      description: 'Multi-criteria analysis',
      status: 'active',
      capabilities: ['Multi-criteria Analysis', 'Decision Frameworks', 'Impact Analysis'],
      icon: Brain,
      path: '/agents/decision-support'
    },

    // Git & Deployment Agents
    {
      id: 'git-integration',
      name: 'Git Integration Agent',
      category: 'Git & Deployment',
      description: 'Git workflow automation',
      status: 'active',
      capabilities: ['Git Automation', 'Repository Management', 'Workflow Optimization'],
      icon: Code,
      path: '/agents/git-integration'
    },
    {
      id: 'pipeline-generation',
      name: 'Pipeline Generation Agent',
      category: 'Git & Deployment',
      description: 'CI/CD pipeline creation',
      status: 'active',
      capabilities: ['Pipeline Creation', 'Workflow Automation', 'Best Practices'],
      icon: Workflow,
      path: '/agents/pipeline-generation'
    },
    {
      id: 'deployment-orchestration',
      name: 'Deployment Orchestration Agent',
      category: 'Git & Deployment',
      description: 'Multi-environment deployment',
      status: 'active',
      capabilities: ['Multi-env Deployment', 'Rollback Management', 'Deployment Automation'],
      icon: Zap,
      path: '/agents/deployment-orchestration'
    },

    // Analytics & Monitoring Agents
    {
      id: 'business-intelligence',
      name: 'Business Intelligence Agent',
      category: 'Analytics & Monitoring',
      description: 'ROI tracking, impact analysis',
      status: 'active',
      capabilities: ['ROI Tracking', 'Impact Analysis', 'Business Metrics'],
      icon: BarChart3,
      path: '/agents/business-intelligence'
    },
    {
      id: 'anomaly-detection',
      name: 'Anomaly Detection Agent',
      category: 'Analytics & Monitoring',
      description: 'Real-time anomaly detection',
      status: 'active',
      capabilities: ['Real-time Detection', 'Pattern Recognition', 'Alert Generation'],
      icon: Activity,
      path: '/agents/anomaly-detection'
    },
    {
      id: 'capacity-planning',
      name: 'Capacity Planning Agent',
      category: 'Analytics & Monitoring',
      description: 'Growth forecasting, resource planning',
      status: 'active',
      capabilities: ['Growth Forecasting', 'Resource Planning', 'Capacity Modeling'],
      icon: TrendingUp,
      path: '/agents/capacity-planning'
    },

    // MLOps Agents
    {
      id: 'model-training',
      name: 'Model Training Agent',
      category: 'MLOps',
      description: 'ML model training, hyperparameter optimization',
      status: 'active',
      capabilities: ['Model Training', 'Hyperparameter Optimization', 'Model Validation'],
      icon: Brain,
      path: '/agents/model-training'
    },
    {
      id: 'data-pipeline',
      name: 'Data Pipeline Agent',
      category: 'MLOps',
      description: 'Data processing, ETL workflows',
      status: 'active',
      capabilities: ['ETL Workflows', 'Data Processing', 'Pipeline Management'],
      icon: Database,
      path: '/agents/data-pipeline'
    },
    {
      id: 'model-monitoring',
      name: 'Model Monitoring Agent',
      category: 'MLOps',
      description: 'Model performance monitoring, drift detection',
      status: 'active',
      capabilities: ['Performance Monitoring', 'Drift Detection', 'Model Evaluation'],
      icon: Monitor,
      path: '/agents/model-monitoring'
    },

    // Advanced DevOps Agents
    {
      id: 'docker',
      name: 'Docker Agent',
      category: 'Advanced DevOps',
      description: 'Container management, Docker optimization',
      status: 'active',
      capabilities: ['Container Management', 'Image Optimization', 'Docker Automation'],
      icon: Database,
      path: '/agents/docker'
    },
    {
      id: 'kubernetes',
      name: 'Kubernetes Agent',
      category: 'Advanced DevOps',
      description: 'K8s cluster management, deployment',
      status: 'active',
      capabilities: ['Cluster Management', 'Deployment Automation', 'Scaling Optimization'],
      icon: Cloud,
      path: '/agents/kubernetes'
    },

    // Specialized DevOps Agents
    {
      id: 'performance-testing',
      name: 'Performance Testing Agent',
      category: 'Specialized DevOps',
      description: 'Load testing, performance optimization',
      status: 'active',
      capabilities: ['Load Testing', 'Performance Optimization', 'Benchmarking'],
      icon: Activity,
      path: '/agents/performance-testing'
    },
    {
      id: 'artifact-management',
      name: 'Artifact Management Agent',
      category: 'Specialized DevOps',
      description: 'Artifact storage, versioning',
      status: 'active',
      capabilities: ['Artifact Storage', 'Version Management', 'Distribution Automation'],
      icon: Package,
      path: '/agents/artifact-management'
    },

    // Specialized Workflow Agents
    {
      id: 'langgraph-orchestrator',
      name: 'LangGraph Orchestrator',
      category: 'Specialized Workflows',
      description: 'Advanced workflow orchestration',
      status: 'active',
      capabilities: ['Workflow Orchestration', 'RCA Workflows', 'Remediation Workflows'],
      icon: Workflow,
      path: '/agents/langgraph-orchestrator'
    },
    {
      id: 'auto-remediation',
      name: 'Auto-Remediation Agent',
      category: 'Specialized Workflows',
      description: 'HITL approval workflows',
      status: 'active',
      capabilities: ['Approval Workflows', 'Automated Remediation', 'Rollback Management'],
      icon: Users,
      path: '/agents/auto-remediation'
    }
  ];

  const categories = ['all', ...Array.from(new Set(agents.map(agent => agent.category)))];

  const filteredAgents = agents.filter(agent => {
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory;
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10';
      case 'idle': return 'text-yellow-500 bg-yellow-500/10';
      case 'error': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="w-4 h-4" />;
      case 'idle': return <Clock className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Agents Hub</h1>
          <p className="text-muted-foreground">Manage and monitor all 28 AI agents</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 bg-green-500/10 px-3 py-2 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-500">28 Active Agents</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background"
          />
        </div>
        <div className="flex space-x-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {category === 'all' ? 'All' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => {
          const Icon = agent.icon;
          return (
            <Link
              key={agent.id}
              to={agent.path}
              className="group block"
            >
              <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-200 hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {agent.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{agent.category}</p>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                    {getStatusIcon(agent.status)}
                    <span className="capitalize">{agent.status}</span>
                  </div>
                </div>

                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {agent.description}
                </p>

                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.slice(0, 3).map((capability, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
                      >
                        {capability}
                      </span>
                    ))}
                    {agent.capabilities.length > 3 && (
                      <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
                        +{agent.capabilities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>View Details</span>
                    <Bot className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-primary" />
            <span className="font-semibold">Total Agents</span>
          </div>
          <p className="text-2xl font-bold mt-2">28</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-green-500" />
            <span className="font-semibold">Active</span>
          </div>
          <p className="text-2xl font-bold mt-2">28</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold">Idle</span>
          </div>
          <p className="text-2xl font-bold mt-2">0</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="font-semibold">Errors</span>
          </div>
          <p className="text-2xl font-bold mt-2">0</p>
        </div>
      </div>
    </div>
  );
};

export { AIAgentsHub }; 