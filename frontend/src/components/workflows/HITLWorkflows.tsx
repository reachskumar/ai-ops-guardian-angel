import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Eye, 
  EyeOff,
  Settings,
  Download,
  Upload,
  Play,
  Pause,
  RefreshCw,
  Shield,
  Brain,
  TrendingUp,
  Code,
  Database,
  Monitor,
  Zap,
  Activity,
  UserCheck,
  UserX,
  FileText,
  Send,
  Bell
} from 'lucide-react';

interface ApprovalRequest {
  id: string;
  title: string;
  description: string;
  type: 'security' | 'cost' | 'deployment' | 'compliance' | 'remediation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  requester: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  approvers: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'pending' | 'approved' | 'rejected';
    comment?: string;
    timestamp?: string;
  }[];
  createdAt: string;
  expiresAt: string;
  autoApprove: boolean;
  riskScore: number;
  impact: {
    resources: number;
    cost: number;
    security: string;
    downtime: string;
  };
  details: {
    action: string;
    resources: string[];
    justification: string;
    rollbackPlan: string;
  };
}

const HITLWorkflows = () => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([
    {
      id: 'req-001',
      title: 'Security Remediation - Critical Vulnerability',
      description: 'Automated remediation for critical security vulnerability CVE-2024-001 in production environment',
      type: 'security',
      severity: 'critical',
      status: 'pending',
      requester: {
        id: 'user-001',
        name: 'Security Bot',
        email: 'security@aiops.com',
        role: 'Security Agent'
      },
      approvers: [
        {
          id: 'user-002',
          name: 'John Smith',
          email: 'john.smith@company.com',
          role: 'Security Lead',
          status: 'pending'
        },
        {
          id: 'user-003',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@company.com',
          role: 'DevOps Lead',
          status: 'pending'
        }
      ],
      createdAt: '2024-01-15T10:00:00Z',
      expiresAt: '2024-01-15T12:00:00Z',
      autoApprove: false,
      riskScore: 95,
      impact: {
        resources: 15,
        cost: 0,
        security: 'High',
        downtime: '5 minutes'
      },
      details: {
        action: 'Apply security patch and restart affected services',
        resources: ['web-server-01', 'web-server-02', 'load-balancer'],
        justification: 'Critical vulnerability affecting production systems. Immediate action required.',
        rollbackPlan: 'Automated rollback to previous version if issues detected'
      }
    },
    {
      id: 'req-002',
      title: 'Cost Optimization - Instance Rightsizing',
      description: 'Automated rightsizing of EC2 instances to optimize costs',
      type: 'cost',
      severity: 'medium',
      status: 'approved',
      requester: {
        id: 'user-004',
        name: 'Cost Optimization Bot',
        email: 'cost@aiops.com',
        role: 'Cost Agent'
      },
      approvers: [
        {
          id: 'user-005',
          name: 'Mike Wilson',
          email: 'mike.wilson@company.com',
          role: 'Finance Manager',
          status: 'approved',
          comment: 'Approved - Good cost savings opportunity',
          timestamp: '2024-01-15T09:30:00Z'
        }
      ],
      createdAt: '2024-01-15T09:00:00Z',
      expiresAt: '2024-01-15T15:00:00Z',
      autoApprove: false,
      riskScore: 25,
      impact: {
        resources: 8,
        cost: -1500,
        security: 'Low',
        downtime: 'None'
      },
      details: {
        action: 'Downsize EC2 instances from t3.large to t3.medium',
        resources: ['app-server-01', 'app-server-02', 'app-server-03'],
        justification: 'CPU utilization consistently below 30%. Potential monthly savings of $1,500.',
        rollbackPlan: 'Auto-scale up if CPU usage exceeds 80%'
      }
    },
    {
      id: 'req-003',
      title: 'Deployment - New Feature Release',
      description: 'Deploy new user authentication feature to production',
      type: 'deployment',
      severity: 'high',
      status: 'pending',
      requester: {
        id: 'user-006',
        name: 'Deployment Bot',
        email: 'deploy@aiops.com',
        role: 'Deployment Agent'
      },
      approvers: [
        {
          id: 'user-007',
          name: 'Alex Chen',
          email: 'alex.chen@company.com',
          role: 'Engineering Lead',
          status: 'pending'
        },
        {
          id: 'user-008',
          name: 'Lisa Brown',
          email: 'lisa.brown@company.com',
          role: 'Product Manager',
          status: 'pending'
        }
      ],
      createdAt: '2024-01-15T08:00:00Z',
      expiresAt: '2024-01-15T14:00:00Z',
      autoApprove: false,
      riskScore: 65,
      impact: {
        resources: 25,
        cost: 0,
        security: 'Medium',
        downtime: '10 minutes'
      },
      details: {
        action: 'Deploy new authentication system with blue-green deployment',
        resources: ['auth-service', 'api-gateway', 'user-database'],
        justification: 'New feature release with enhanced security features',
        rollbackPlan: 'Automatic rollback to previous version if health checks fail'
      }
    }
  ]);

  const requestTypes = [
    { id: 'all', name: 'All Requests', icon: Users },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'cost', name: 'Cost', icon: TrendingUp },
    { id: 'deployment', name: 'Deployment', icon: Code },
    { id: 'compliance', name: 'Compliance', icon: CheckCircle },
    { id: 'remediation', name: 'Remediation', icon: AlertTriangle }
  ];

  const severityLevels = [
    { id: 'all', name: 'All Severities', color: 'text-gray-500' },
    { id: 'low', name: 'Low', color: 'text-green-500' },
    { id: 'medium', name: 'Medium', color: 'text-yellow-500' },
    { id: 'high', name: 'High', color: 'text-orange-500' },
    { id: 'critical', name: 'Critical', color: 'text-red-500' }
  ];

  const filteredRequests = approvalRequests.filter(request => {
    const matchesType = selectedType === 'all' || request.type === selectedType;
    const matchesSeverity = selectedSeverity === 'all' || request.severity === selectedSeverity;
    return matchesType && matchesSeverity;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-500 bg-yellow-500/10';
      case 'approved': return 'text-green-500 bg-green-500/10';
      case 'rejected': return 'text-red-500 bg-red-500/10';
      case 'expired': return 'text-gray-500 bg-gray-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'expired': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-500 bg-green-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'critical': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security': return <Shield className="w-4 h-4" />;
      case 'cost': return <TrendingUp className="w-4 h-4" />;
      case 'deployment': return <Code className="w-4 h-4" />;
      case 'compliance': return <CheckCircle className="w-4 h-4" />;
      case 'remediation': return <AlertTriangle className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diff < 0) return 'Expired';
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleApprove = (requestId: string, approverId: string) => {
    setApprovalRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'approved',
          approvers: req.approvers.map(approver => 
            approver.id === approverId 
              ? { ...approver, status: 'approved', timestamp: new Date().toISOString() }
              : approver
          )
        };
      }
      return req;
    }));
  };

  const handleReject = (requestId: string, approverId: string) => {
    setApprovalRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'rejected',
          approvers: req.approvers.map(approver => 
            approver.id === approverId 
              ? { ...approver, status: 'rejected', timestamp: new Date().toISOString() }
              : approver
          )
        };
      }
      return req;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Human-in-the-Loop Workflows</h1>
          <p className="text-muted-foreground">Manage approval workflows and human oversight</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex space-x-2">
          {requestTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === type.id
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
        <div className="flex space-x-2">
          {severityLevels.map((severity) => (
            <button
              key={severity.id}
              onClick={() => setSelectedSeverity(severity.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedSeverity === severity.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {severity.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold">Pending</span>
          </div>
          <p className="text-2xl font-bold mt-2">{approvalRequests.filter(r => r.status === 'pending').length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-semibold">Approved</span>
          </div>
          <p className="text-2xl font-bold mt-2">{approvalRequests.filter(r => r.status === 'approved').length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="font-semibold">Rejected</span>
          </div>
          <p className="text-2xl font-bold mt-2">{approvalRequests.filter(r => r.status === 'rejected').length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span className="font-semibold">Critical</span>
          </div>
          <p className="text-2xl font-bold mt-2">{approvalRequests.filter(r => r.severity === 'critical').length}</p>
        </div>
      </div>

      {/* Approval Requests */}
      <div className="space-y-4">
        {filteredRequests.map((request) => {
          const TypeIcon = getTypeIcon(request.type);
          return (
            <div key={request.id} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TypeIcon />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">{request.title}</h3>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="capitalize">{request.status}</span>
                      </div>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(request.severity)}`}>
                        <span className="capitalize">{request.severity}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-2">{request.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Risk Score: {request.riskScore}</span>
                      <span>•</span>
                      <span>Expires: {formatTimeRemaining(request.expiresAt)}</span>
                      <span>•</span>
                      <span>Auto-approve: {request.autoApprove ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowDetails(showDetails === request.id ? null : request.id)}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    {showDetails === request.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Request Details */}
              {showDetails === request.id && (
                <div className="mt-4 pt-4 border-t border-border space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Impact Analysis</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Resources Affected:</span>
                          <span className="font-medium">{request.impact.resources}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cost Impact:</span>
                          <span className={`font-medium ${request.impact.cost >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ${request.impact.cost}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Security Risk:</span>
                          <span className="font-medium">{request.impact.security}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Downtime:</span>
                          <span className="font-medium">{request.impact.downtime}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Action Details</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Action:</span>
                          <p className="text-muted-foreground mt-1">{request.details.action}</p>
                        </div>
                        <div>
                          <span className="font-medium">Resources:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {request.details.resources.map((resource, index) => (
                              <span key={index} className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                                {resource}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Justification:</span>
                          <p className="text-muted-foreground mt-1">{request.details.justification}</p>
                        </div>
                        <div>
                          <span className="font-medium">Rollback Plan:</span>
                          <p className="text-muted-foreground mt-1">{request.details.rollbackPlan}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Approvers */}
                  <div>
                    <h4 className="font-medium mb-3">Approvers</h4>
                    <div className="space-y-3">
                      {request.approvers.map((approver) => (
                        <div key={approver.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${
                              approver.status === 'approved' ? 'bg-green-500' :
                              approver.status === 'rejected' ? 'bg-red-500' :
                              'bg-yellow-500'
                            }`}></div>
                            <div>
                              <div className="font-medium">{approver.name}</div>
                              <div className="text-sm text-muted-foreground">{approver.role}</div>
                              {approver.comment && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  Comment: {approver.comment}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {approver.status === 'pending' && request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(request.id, approver.id)}
                                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(request.id, approver.id)}
                                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            <span className={`text-sm capitalize ${
                              approver.status === 'approved' ? 'text-green-500' :
                              approver.status === 'rejected' ? 'text-red-500' :
                              'text-yellow-500'
                            }`}>
                              {approver.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              {request.status === 'pending' && (
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Requested by {request.requester.name} ({request.requester.role})
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve All
                    </button>
                    <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject All
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Approval Requests</h3>
          <p className="text-muted-foreground mb-4">
            No approval requests match the current filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export { HITLWorkflows }; 