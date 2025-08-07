import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cloud, Shield, DollarSign, Activity, Users, Settings, Bot, 
  BarChart3, AlertTriangle, CheckCircle, Clock, TrendingUp, 
  TrendingDown, Zap, Database, Server, Globe, Lock, Eye, 
  Plus, Search, Filter, Download, RefreshCw, Bell, User, LogOut,
  Building, Target, ShieldCheck, Cpu, HardDrive, Network,
  Key, ExternalLink, Menu, X, ChevronDown, ChevronRight,
  Play, Pause, Square, RotateCcw, MoreHorizontal,
  Edit, Trash, Copy, Share, Star, Bookmark, Calendar, Clock3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import AIChatInterface from './AIChatInterface';
import CloudConnection from './CloudConnection';

interface CloudResource {
  id: string;
  name: string;
  type: string;
  provider: 'AWS' | 'Azure' | 'GCP';
  region: string;
  status: 'running' | 'stopped' | 'terminated' | 'pending';
  cost: number;
  tags: string[];
  cpu: number;
  memory: number;
  lastActivity: string;
}

interface SecurityIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  resource: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  priority: number;
}

interface CostOptimization {
  id: string;
  type: 'rightsizing' | 'idle_cleanup' | 'reserved_instances' | 'spot_instances';
  title: string;
  potentialSavings: number;
  risk: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'implemented' | 'rejected';
  implementationTime: string;
  affectedResources: number;
}

interface AIAgent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'idle' | 'error';
  lastActivity: string;
  tasksCompleted: number;
  efficiency: number;
  currentTask?: string;
}

const UATDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [cloudConnectionOpen, setCloudConnectionOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<CloudResource | null>(null);
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  // Enhanced mock data for UAT testing
  const cloudResources: CloudResource[] = [
    { 
      id: '1', 
      name: 'web-server-01', 
      type: 'EC2', 
      provider: 'AWS', 
      region: 'us-east-1', 
      status: 'running', 
      cost: 245.50, 
      tags: ['production', 'web', 'frontend'],
      cpu: 85,
      memory: 72,
      lastActivity: '2 minutes ago'
    },
    { 
      id: '2', 
      name: 'db-cluster-01', 
      type: 'RDS', 
      provider: 'AWS', 
      region: 'us-east-1', 
      status: 'running', 
      cost: 180.25, 
      tags: ['production', 'database', 'mysql'],
      cpu: 45,
      memory: 60,
      lastActivity: '5 minutes ago'
    },
    { 
      id: '3', 
      name: 'app-service-01', 
      type: 'App Service', 
      provider: 'Azure', 
      region: 'eastus', 
      status: 'running', 
      cost: 320.00, 
      tags: ['production', 'app', 'backend'],
      cpu: 92,
      memory: 88,
      lastActivity: '1 minute ago'
    },
    { 
      id: '4', 
      name: 'compute-instance-01', 
      type: 'Compute Engine', 
      provider: 'GCP', 
      region: 'us-central1', 
      status: 'stopped', 
      cost: 0, 
      tags: ['dev', 'test', 'staging'],
      cpu: 0,
      memory: 0,
      lastActivity: '2 hours ago'
    },
    { 
      id: '5', 
      name: 'load-balancer-01', 
      type: 'ALB', 
      provider: 'AWS', 
      region: 'us-east-1', 
      status: 'running', 
      cost: 45.75, 
      tags: ['production', 'load-balancer'],
      cpu: 15,
      memory: 25,
      lastActivity: '30 seconds ago'
    },
  ];

  const securityIssues: SecurityIssue[] = [
    { 
      id: '1', 
      severity: 'critical', 
      title: 'Unencrypted S3 Bucket', 
      description: 'S3 bucket contains sensitive data without encryption', 
      resource: 's3-bucket-01', 
      status: 'open', 
      createdAt: '2024-01-15',
      priority: 1
    },
    { 
      id: '2', 
      severity: 'high', 
      title: 'Public RDS Instance', 
      description: 'RDS instance is publicly accessible', 
      resource: 'rds-instance-01', 
      status: 'in_progress', 
      createdAt: '2024-01-14',
      priority: 2
    },
    { 
      id: '3', 
      severity: 'medium', 
      title: 'Missing IAM Policy', 
      description: 'IAM user has excessive permissions', 
      resource: 'iam-user-01', 
      status: 'resolved', 
      createdAt: '2024-01-13',
      priority: 3
    },
    { 
      id: '4', 
      severity: 'low', 
      title: 'Outdated SSL Certificate', 
      description: 'SSL certificate expires in 30 days', 
      resource: 'ssl-cert-01', 
      status: 'open', 
      createdAt: '2024-01-12',
      priority: 4
    },
  ];

  const costOptimizations: CostOptimization[] = [
    { 
      id: '1', 
      type: 'rightsizing', 
      title: 'EC2 Instance Rightsizing', 
      potentialSavings: 1250.00, 
      risk: 'low', 
      status: 'pending',
      implementationTime: '15 minutes',
      affectedResources: 3
    },
    { 
      id: '2', 
      type: 'idle_cleanup', 
      title: 'Idle EBS Volumes', 
      potentialSavings: 450.00, 
      risk: 'low', 
      status: 'approved',
      implementationTime: '5 minutes',
      affectedResources: 5
    },
    { 
      id: '3', 
      type: 'reserved_instances', 
      title: 'Reserved Instance Purchase', 
      potentialSavings: 3200.00, 
      risk: 'medium', 
      status: 'implemented',
      implementationTime: '1 hour',
      affectedResources: 8
    },
    { 
      id: '4', 
      type: 'spot_instances', 
      title: 'Spot Instance Migration', 
      potentialSavings: 890.00, 
      risk: 'high', 
      status: 'pending',
      implementationTime: '30 minutes',
      affectedResources: 2
    },
  ];

  const aiAgents: AIAgent[] = [
    { 
      id: '1', 
      name: 'CostGuard AI', 
      type: 'cost_optimization', 
      status: 'active', 
      lastActivity: '2 minutes ago', 
      tasksCompleted: 156,
      efficiency: 94,
      currentTask: 'Analyzing EC2 usage patterns'
    },
    { 
      id: '2', 
      name: 'SecurityBot', 
      type: 'security', 
      status: 'active', 
      lastActivity: '5 minutes ago', 
      tasksCompleted: 89,
      efficiency: 87,
      currentTask: 'Scanning for vulnerabilities'
    },
    { 
      id: '3', 
      name: 'PerformanceMonitor', 
      type: 'performance', 
      status: 'idle', 
      lastActivity: '1 hour ago', 
      tasksCompleted: 234,
      efficiency: 91
    },
    { 
      id: '4', 
      name: 'ComplianceChecker', 
      type: 'compliance', 
      status: 'active', 
      lastActivity: '10 minutes ago', 
      tasksCompleted: 67,
      efficiency: 96,
      currentTask: 'Checking SOC2 compliance'
    },
  ];

  // Calculate metrics
  const totalCost = cloudResources.reduce((sum, resource) => sum + resource.cost, 0);
  const potentialSavings = costOptimizations.reduce((sum, opt) => sum + opt.potentialSavings, 0);
  const criticalIssues = securityIssues.filter(issue => issue.severity === 'critical').length;
  const activeAgents = aiAgents.filter(agent => agent.status === 'active').length;
  const runningResources = cloudResources.filter(resource => resource.status === 'running').length;

  // Filter resources based on search and filters
  const filteredResources = cloudResources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesProvider = filterProvider === 'all' || resource.provider === filterProvider;
    const matchesStatus = filterStatus === 'all' || resource.status === filterStatus;
    
    return matchesSearch && matchesProvider && matchesStatus;
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    // In real implementation, this would trigger API calls to refresh data
  };

  const handleResourceAction = (resourceId: string, action: string) => {
    console.log(`Performing ${action} on resource ${resourceId}`);
    // In real implementation, this would call the appropriate API
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'stopped': return 'bg-yellow-500';
      case 'terminated': return 'bg-red-500';
      case 'pending': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'AWS': return 'bg-orange-500';
      case 'Azure': return 'bg-blue-500';
      case 'GCP': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-4"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">InfraMind</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCloudConnectionOpen(true)}
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Connect Cloud
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Connect your cloud accounts</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setChatOpen(true)}
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      AI Assistant
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Chat with AI agents</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/auth')}
              >
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Bell className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Critical security alert
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Cost optimization available
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Backup completed
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Avatar>
                <AvatarImage src="/avatar.jpg" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold text-gray-900">${totalCost.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">This month</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Potential Savings</p>
                  <p className="text-2xl font-bold text-gray-900">${potentialSavings.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Optimizations available</p>
                </div>
                <TrendingDown className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Security Issues</p>
                  <p className="text-2xl font-bold text-gray-900">{securityIssues.length}</p>
                  <p className="text-xs text-red-500">{criticalIssues} critical</p>
                </div>
                <Shield className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Agents</p>
                  <p className="text-2xl font-bold text-gray-900">{activeAgents}</p>
                  <p className="text-xs text-gray-500">AI agents working</p>
                </div>
                <Bot className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="costs">Costs</TabsTrigger>
            <TabsTrigger value="agents">AI Agents</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Resource Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Resource Status
                    <Button variant="ghost" size="sm" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Running Resources</span>
                      <Badge variant="default">{runningResources}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Stopped Resources</span>
                      <Badge variant="secondary">{cloudResources.filter(r => r.status === 'stopped').length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Resources</span>
                      <Badge variant="outline">{cloudResources.length}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor('running')}`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">EC2 instance started</p>
                        <p className="text-xs text-gray-500">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${getSeverityColor('critical')}`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Security alert triggered</p>
                        <p className="text-xs text-gray-500">5 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Cost optimization applied</p>
                        <p className="text-xs text-gray-500">10 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Input
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
                <Select value={filterProvider} onValueChange={setFilterProvider}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Providers</SelectItem>
                    <SelectItem value="AWS">AWS</SelectItem>
                    <SelectItem value="Azure">Azure</SelectItem>
                    <SelectItem value="GCP">GCP</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="stopped">Stopped</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(resource.status)}`}></div>
                        <div>
                          <h3 className="font-semibold">{resource.name}</h3>
                          <p className="text-sm text-gray-500">{resource.type} • {resource.region}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline" className={`${getProviderColor(resource.provider)} text-white`}>
                          {resource.provider}
                        </Badge>
                        <div className="text-right">
                          <p className="font-semibold">${resource.cost.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">monthly</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleResourceAction(resource.id, 'start')}>
                              <Play className="h-4 w-4 mr-2" />
                              Start
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResourceAction(resource.id, 'stop')}>
                              <Pause className="h-4 w-4 mr-2" />
                              Stop
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResourceAction(resource.id, 'terminate')}>
                              <Square className="h-4 w-4 mr-2" />
                              Terminate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedResource(resource)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Cpu className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{resource.cpu}%</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <HardDrive className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{resource.memory}%</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock3 className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{resource.lastActivity}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      {resource.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {securityIssues.map((issue) => (
                <Card key={issue.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`w-3 h-3 rounded-full ${getSeverityColor(issue.severity)}`}></div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{issue.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-gray-500">Resource: {issue.resource}</span>
                            <span className="text-xs text-gray-500">Created: {issue.createdAt}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant={issue.status === 'resolved' ? 'default' : 'secondary'}>
                          {issue.status}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Mark as Resolved
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share className="h-4 w-4 mr-2" />
                              Share Report
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Costs Tab */}
          <TabsContent value="costs" className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {costOptimizations.map((optimization) => (
                <Card key={optimization.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{optimization.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Potential savings: ${optimization.potentialSavings.toFixed(2)} • 
                          Risk: {optimization.risk} • 
                          Implementation: {optimization.implementationTime}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500">
                            Affected Resources: {optimization.affectedResources}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant={optimization.status === 'implemented' ? 'default' : 'secondary'}>
                          {optimization.status}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Play className="h-4 w-4 mr-2" />
                              Apply Optimization
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Export Report
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aiAgents.map((agent) => (
                <Card key={agent.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <Bot className="h-5 w-5 text-purple-500" />
                          <h3 className="font-semibold">{agent.name}</h3>
                          <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                            {agent.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Type: {agent.type} • Efficiency: {agent.efficiency}%
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Last Activity: {agent.lastActivity}
                        </p>
                        {agent.currentTask && (
                          <p className="text-sm text-blue-600 mt-2">
                            Current: {agent.currentTask}
                          </p>
                        )}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm">
                            <span>Tasks Completed</span>
                            <span className="font-semibold">{agent.tasksCompleted}</span>
                          </div>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Play className="h-4 w-4 mr-2" />
                            Start Agent
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause Agent
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Logs
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Customer Management</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Customer List */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Organizations</CardTitle>
                  <CardDescription>Multi-tenant customer management</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'TechCorp Inc', plan: 'Enterprise', users: 45, status: 'active', cost: 12500 },
                      { name: 'StartupXYZ', plan: 'Professional', users: 12, status: 'active', cost: 3200 },
                      { name: 'GlobalBank', plan: 'Enterprise', users: 120, status: 'active', cost: 45000 },
                      { name: 'DevStudio', plan: 'Starter', users: 5, status: 'trial', cost: 0 },
                    ].map((org, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>{org.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{org.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {org.users} users • {org.plan} plan • ${org.cost}/month
                            </p>
                          </div>
                        </div>
                        <Badge variant={org.status === 'active' ? 'default' : 'secondary'}>
                          {org.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Usage Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle>Usage Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">182</p>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">$45,230</p>
                      <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">98.5%</p>
                      <p className="text-sm text-muted-foreground">Uptime</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Chat Interface */}
      {chatOpen && (
        <AIChatInterface
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          isMinimized={false}
          onToggleMinimize={() => {}}
        />
      )}

      {/* Cloud Connection Dialog */}
      {cloudConnectionOpen && (
        <CloudConnection
          isOpen={cloudConnectionOpen}
          onClose={() => setCloudConnectionOpen(false)}
        />
      )}

      {/* Resource Details Dialog */}
      {selectedResource && (
        <Dialog open={!!selectedResource} onOpenChange={() => setSelectedResource(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedResource.name}</DialogTitle>
              <DialogDescription>
                Detailed information about {selectedResource.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Type</p>
                  <p className="text-sm text-gray-600">{selectedResource.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Provider</p>
                  <p className="text-sm text-gray-600">{selectedResource.provider}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Region</p>
                  <p className="text-sm text-gray-600">{selectedResource.region}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm text-gray-600">{selectedResource.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Monthly Cost</p>
                  <p className="text-sm text-gray-600">${selectedResource.cost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Last Activity</p>
                  <p className="text-sm text-gray-600">{selectedResource.lastActivity}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Tags</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedResource.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UATDashboard; 