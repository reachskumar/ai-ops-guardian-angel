import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cloud, Shield, DollarSign, Activity, Users, Settings, Bot, 
  BarChart3, AlertTriangle, CheckCircle, Clock, TrendingUp, 
  TrendingDown, Zap, Database, Server, Globe, Lock, Eye, 
  Plus, Search, Filter, Download, RefreshCw, Bell, User, LogOut,
  Building, Target, ShieldCheck, Cpu, HardDrive, Network,
  Key, ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import CloudConnection from './CloudConnection';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  // Mock data for demonstration
  const cloudResources = [
    { id: '1', name: 'web-server-01', type: 'EC2', provider: 'AWS', region: 'us-east-1', status: 'running', cost: 245.50, tags: ['production', 'web'] },
    { id: '2', name: 'db-cluster-01', type: 'RDS', provider: 'AWS', region: 'us-east-1', status: 'running', cost: 180.25, tags: ['production', 'database'] },
    { id: '3', name: 'app-service-01', type: 'App Service', provider: 'Azure', region: 'eastus', status: 'running', cost: 320.00, tags: ['production', 'app'] },
    { id: '4', name: 'compute-instance-01', type: 'Compute Engine', provider: 'GCP', region: 'us-central1', status: 'stopped', cost: 0, tags: ['dev', 'test'] },
  ];

  const securityIssues = [
    { id: '1', severity: 'critical', title: 'Unencrypted S3 Bucket', description: 'S3 bucket contains sensitive data without encryption', resource: 's3-bucket-01', status: 'open', createdAt: '2024-01-15' },
    { id: '2', severity: 'high', title: 'Public RDS Instance', description: 'RDS instance is publicly accessible', resource: 'rds-instance-01', status: 'in_progress', createdAt: '2024-01-14' },
    { id: '3', severity: 'medium', title: 'Missing IAM Policy', description: 'IAM user has excessive permissions', resource: 'iam-user-01', status: 'resolved', createdAt: '2024-01-13' },
  ];

  const costOptimizations = [
    { id: '1', type: 'rightsizing', title: 'EC2 Instance Rightsizing', potentialSavings: 1250.00, risk: 'low', status: 'pending' },
    { id: '2', type: 'idle_cleanup', title: 'Idle EBS Volumes', potentialSavings: 450.00, risk: 'low', status: 'approved' },
    { id: '3', type: 'reserved_instances', title: 'Reserved Instance Purchase', potentialSavings: 3200.00, risk: 'medium', status: 'implemented' },
  ];

  const aiAgents = [
    { id: '1', name: 'CostGuard AI', type: 'cost_optimization', status: 'active', lastActivity: '2 minutes ago', tasksCompleted: 156 },
    { id: '2', name: 'SecurityBot', type: 'security', status: 'active', lastActivity: '5 minutes ago', tasksCompleted: 89 },
    { id: '3', name: 'PerformanceMonitor', type: 'performance', status: 'idle', lastActivity: '1 hour ago', tasksCompleted: 234 },
    { id: '4', name: 'ComplianceChecker', type: 'compliance', status: 'active', lastActivity: '10 minutes ago', tasksCompleted: 67 },
  ];

  const totalCost = cloudResources.reduce((sum, resource) => sum + resource.cost, 0);
  const potentialSavings = costOptimizations.reduce((sum, opt) => sum + opt.potentialSavings, 0);
  const criticalIssues = securityIssues.filter(issue => issue.severity === 'critical').length;
  const activeAgents = aiAgents.filter(agent => agent.status === 'active').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">AI Ops Guardian Angel</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/auth')}
              >
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveTab('cloud-connection')}
              >
                <Key className="h-4 w-4 mr-2" />
                Connect Cloud
              </Button>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">+2.1% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
              <TrendingDown className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${potentialSavings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Available optimizations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{criticalIssues}</div>
              <p className="text-xs text-muted-foreground">Critical issues to resolve</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active AI Agents</CardTitle>
              <Bot className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{activeAgents}</div>
              <p className="text-xs text-muted-foreground">Monitoring & optimizing</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cloud">Multi-Cloud</TabsTrigger>
            <TabsTrigger value="ai-copilot">AI Copilot</TabsTrigger>
            <TabsTrigger value="finops">FinOps</TabsTrigger>
            <TabsTrigger value="security">DevSecOps</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="cloud-connection">Cloud Connection</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cloud Resources Map */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    Multi-Cloud Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['AWS', 'Azure', 'GCP', 'OCI'].map((provider) => (
                      <div key={provider} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            provider === 'AWS' ? 'bg-orange-500' :
                            provider === 'Azure' ? 'bg-blue-500' :
                            provider === 'GCP' ? 'bg-red-500' : 'bg-green-500'
                          }`} />
                          <span className="font-medium">{provider}</span>
                        </div>
                        <Badge variant="secondary">
                          {cloudResources.filter(r => r.provider === provider).length} resources
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Agents Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bot className="h-5 w-5 mr-2" />
                    AI Agents Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aiAgents.map((agent) => (
                      <div key={agent.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <p className="text-sm text-muted-foreground">{agent.lastActivity}</p>
                        </div>
                        <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                          {agent.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="font-medium">Cost optimization applied</p>
                      <p className="text-sm text-muted-foreground">EC2 instance rightsized - $1250 saved</p>
                    </div>
                    <span className="text-sm text-muted-foreground ml-auto">2 min ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="font-medium">Security issue detected</p>
                      <p className="text-sm text-muted-foreground">Unencrypted S3 bucket found</p>
                    </div>
                    <span className="text-sm text-muted-foreground ml-auto">5 min ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="font-medium">AI agent deployed</p>
                      <p className="text-sm text-muted-foreground">PerformanceMonitor agent activated</p>
                    </div>
                    <span className="text-sm text-muted-foreground ml-auto">10 min ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Multi-Cloud Tab */}
          <TabsContent value="cloud" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Multi-Cloud Management</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Resource
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cloud Resources */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Cloud Resources</CardTitle>
                  <CardDescription>Manage resources across all cloud providers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cloudResources.map((resource) => (
                      <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            resource.status === 'running' ? 'bg-green-500' :
                            resource.status === 'stopped' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <div>
                            <p className="font-medium">{resource.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {resource.type} • {resource.provider} • {resource.region}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${resource.cost.toFixed(2)}/month</p>
                          <Badge variant="outline">{resource.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Resource Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Resource Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['AWS', 'Azure', 'GCP', 'OCI'].map((provider) => {
                      const count = cloudResources.filter(r => r.provider === provider).length;
                      const percentage = (count / cloudResources.length) * 100;
                      return (
                        <div key={provider}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{provider}</span>
                            <span>{count} resources</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Copilot Tab */}
          <TabsContent value="ai-copilot" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">AI Copilot & Orchestration</h2>
              <Button>
                <Bot className="h-4 w-4 mr-2" />
                New AI Agent
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Agents */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Agents</CardTitle>
                  <CardDescription>LangGraph-powered intelligent agents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {aiAgents.map((agent) => (
                      <div key={agent.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{agent.name}</h3>
                          <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                            {agent.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Type: {agent.type.replace('_', ' ')}
                        </p>
                        <div className="flex justify-between text-sm">
                          <span>Tasks: {agent.tasksCompleted}</span>
                          <span>{agent.lastActivity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Conversational Commands */}
              <Card>
                <CardHeader>
                  <CardTitle>Conversational Commands</CardTitle>
                  <CardDescription>Natural language to executable workflows</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="font-medium">"Optimize costs for production environment"</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        → Analyzed 15 resources, identified 3 optimizations
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="font-medium">"Deploy security patches to all servers"</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        → Patched 23 servers across 3 regions
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="font-medium">"Scale up web tier for high traffic"</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        → Scaled 5 instances, monitoring performance
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* FinOps Tab */}
          <TabsContent value="finops" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">FinOps & Cost Optimization</h2>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cost Optimizations */}
              <Card>
                <CardHeader>
                  <CardTitle>Cost Optimizations</CardTitle>
                  <CardDescription>AI-recommended cost savings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {costOptimizations.map((optimization) => (
                      <div key={optimization.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{optimization.title}</h3>
                          <Badge variant={
                            optimization.risk === 'low' ? 'default' :
                            optimization.risk === 'medium' ? 'secondary' : 'destructive'
                          }>
                            {optimization.risk} risk
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold text-green-600 mb-2">
                          ${optimization.potentialSavings.toFixed(2)}
                        </p>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">{optimization.status}</Badge>
                          <Button size="sm">Apply</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Cost Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Compute', 'Storage', 'Network', 'Database', 'Other'].map((category) => (
                      <div key={category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{category}</span>
                          <span>${(Math.random() * 1000).toFixed(2)}</span>
                        </div>
                        <Progress value={Math.random() * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* DevSecOps Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">DevSecOps & Compliance</h2>
              <Button>
                <Shield className="h-4 w-4 mr-2" />
                Security Scan
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Security Issues */}
              <Card>
                <CardHeader>
                  <CardTitle>Security Issues</CardTitle>
                  <CardDescription>IaC scanning, CVE detection, compliance checks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {securityIssues.map((issue) => (
                      <div key={issue.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{issue.title}</h3>
                          <Badge variant={
                            issue.severity === 'critical' ? 'destructive' :
                            issue.severity === 'high' ? 'default' :
                            issue.severity === 'medium' ? 'secondary' : 'outline'
                          }>
                            {issue.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {issue.description}
                        </p>
                        <div className="flex justify-between items-center text-sm">
                          <span>Resource: {issue.resource}</span>
                          <Badge variant="outline">{issue.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Compliance Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['CIS', 'NIST', 'SOC2', 'PCI-DSS'].map((framework) => (
                      <div key={framework} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{framework}</p>
                          <p className="text-sm text-muted-foreground">
                            {Math.floor(Math.random() * 20) + 80}% compliant
                          </p>
                        </div>
                        <Badge variant="default">
                          {Math.random() > 0.3 ? 'Pass' : 'Fail'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
                      { name: 'TechCorp Inc', plan: 'Enterprise', users: 45, status: 'active' },
                      { name: 'StartupXYZ', plan: 'Professional', users: 12, status: 'active' },
                      { name: 'GlobalBank', plan: 'Enterprise', users: 120, status: 'active' },
                      { name: 'DevStudio', plan: 'Starter', users: 5, status: 'trial' },
                    ].map((org, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>{org.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{org.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {org.users} users • {org.plan} plan
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

          {/* Cloud Connection Tab */}
          <TabsContent value="cloud-connection" className="space-y-6">
            <CloudConnection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;