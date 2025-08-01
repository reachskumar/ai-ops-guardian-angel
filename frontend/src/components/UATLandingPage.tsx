import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, Shield, DollarSign, Activity, Users, Settings, 
  Cloud, BarChart3, AlertTriangle, CheckCircle, Clock, 
  TrendingUp, TrendingDown, Zap, Database, Server, 
  Globe, Lock, Eye, Plus, Search, Filter, Download, 
  RefreshCw, Bell, User, LogOut, Building, Target, 
  ShieldCheck, Cpu, HardDrive, Network, Key, ExternalLink,
  ArrowRight, Play, Pause, Square, RotateCcw, Star,
  CheckCircle2, XCircle, AlertCircle, Info, Zap as ZapIcon
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const UATLandingPage: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState('overview');
  const [showDemo, setShowDemo] = useState(false);
  const navigate = useNavigate();

  // Demo data for UAT testing
  const demoMetrics = {
    totalCost: 1245.75,
    potentialSavings: 2340.50,
    securityIssues: 8,
    criticalIssues: 2,
    activeAgents: 4,
    uptime: 99.8,
    resources: 23,
    runningResources: 18
  };

  const demoAgents = [
    { id: '1', name: 'CostGuard AI', type: 'Cost Optimization', status: 'active', efficiency: 94, tasks: 156 },
    { id: '2', name: 'SecurityBot', type: 'Security', status: 'active', efficiency: 87, tasks: 89 },
    { id: '3', name: 'PerformanceMonitor', type: 'Performance', status: 'idle', efficiency: 91, tasks: 234 },
    { id: '4', name: 'ComplianceChecker', type: 'Compliance', status: 'active', efficiency: 96, tasks: 67 }
  ];

  const demoResources = [
    { name: 'web-server-01', provider: 'AWS', type: 'EC2', status: 'running', cost: 245.50, cpu: 85, memory: 72 },
    { name: 'db-cluster-01', provider: 'AWS', type: 'RDS', status: 'running', cost: 180.25, cpu: 45, memory: 60 },
    { name: 'app-service-01', provider: 'Azure', type: 'App Service', status: 'running', cost: 320.00, cpu: 92, memory: 88 },
    { name: 'compute-instance-01', provider: 'GCP', type: 'Compute Engine', status: 'stopped', cost: 0, cpu: 0, memory: 0 }
  ];

  const demoIssues = [
    { severity: 'critical', title: 'Unencrypted S3 Bucket', status: 'open', resource: 's3-bucket-01' },
    { severity: 'high', title: 'Public RDS Instance', status: 'in_progress', resource: 'rds-instance-01' },
    { severity: 'medium', title: 'Missing IAM Policy', status: 'resolved', resource: 'iam-user-01' }
  ];

  const demoOptimizations = [
    { title: 'EC2 Instance Rightsizing', savings: 1250.00, risk: 'low', status: 'pending' },
    { title: 'Idle EBS Volumes', savings: 450.00, risk: 'low', status: 'approved' },
    { title: 'Reserved Instance Purchase', savings: 3200.00, risk: 'medium', status: 'implemented' }
  ];

  const features = [
    {
      icon: <Bot className="h-8 w-8 text-purple-500" />,
      title: "28 AI Agents",
      description: "Specialized AI agents for cost optimization, security, performance, and compliance",
      demo: "See AI agents in action"
    },
    {
      icon: <Shield className="h-8 w-8 text-red-500" />,
      title: "Security Monitoring",
      description: "Real-time security scanning and vulnerability detection across all cloud providers",
      demo: "View security dashboard"
    },
    {
      icon: <DollarSign className="h-8 w-8 text-green-500" />,
      title: "Cost Optimization",
      description: "Automated cost analysis and optimization recommendations with potential savings",
      demo: "Explore cost savings"
    },
    {
      icon: <Activity className="h-8 w-8 text-blue-500" />,
      title: "Performance Monitoring",
      description: "Real-time performance monitoring and automated scaling recommendations",
      demo: "Monitor performance"
    },
    {
      icon: <Users className="h-8 w-8 text-orange-500" />,
      title: "Multi-Tenant SaaS",
      description: "Complete multi-tenant architecture with role-based access and organization isolation",
      demo: "Manage organizations"
    },
    {
      icon: <Cloud className="h-8 w-8 text-cyan-500" />,
      title: "Multi-Cloud Support",
      description: "Unified management across AWS, Azure, and Google Cloud Platform",
      demo: "Connect cloud accounts"
    }
  ];

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
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
                variant="default" 
                size="sm"
                onClick={() => setShowDemo(true)}
              >
                <Play className="h-4 w-4 mr-2" />
                Live Demo
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              AI-Powered Cloud Operations
              <span className="text-blue-600"> Made Simple</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your multi-cloud infrastructure management with 28 specialized AI agents. 
              Automate cost optimization, security monitoring, and performance management across AWS, Azure, and GCP.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => setShowDemo(true)}>
                <Play className="h-5 w-5 mr-2" />
                Start Free Demo
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/auth')}>
                <User className="h-5 w-5 mr-2" />
                Sign Up Free
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">28</div>
                <div className="text-sm text-gray-600">AI Agents</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">$2.3M</div>
                <div className="text-sm text-gray-600">Saved by Users</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">99.8%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">500+</div>
                <div className="text-sm text-gray-600">Organizations</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Cloud Operations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From cost optimization to security monitoring, our AI agents handle the complex tasks 
              so you can focus on what matters most.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    {feature.icon}
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    {feature.demo}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      {showDemo && (
        <Dialog open={showDemo} onOpenChange={setShowDemo}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Live Platform Demo</DialogTitle>
              <DialogDescription>
                Experience the AI Ops Guardian Angel platform in action. Explore all features and capabilities.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Demo Navigation */}
              <Tabs value={activeDemo} onValueChange={setActiveDemo}>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total Cost</p>
                            <p className="text-2xl font-bold text-gray-900">${demoMetrics.totalCost.toFixed(2)}</p>
                          </div>
                          <DollarSign className="h-8 w-8 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Potential Savings</p>
                            <p className="text-2xl font-bold text-gray-900">${demoMetrics.potentialSavings.toFixed(2)}</p>
                          </div>
                          <TrendingDown className="h-8 w-8 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Security Issues</p>
                            <p className="text-2xl font-bold text-gray-900">{demoMetrics.securityIssues}</p>
                            <p className="text-xs text-red-500">{demoMetrics.criticalIssues} critical</p>
                          </div>
                          <Shield className="h-8 w-8 text-red-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Active Agents</p>
                            <p className="text-2xl font-bold text-gray-900">{demoMetrics.activeAgents}</p>
                          </div>
                          <Bot className="h-8 w-8 text-purple-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Resource Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Running Resources</span>
                            <Badge variant="default">{demoMetrics.runningResources}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Total Resources</span>
                            <Badge variant="outline">{demoMetrics.resources}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Uptime</span>
                            <Badge variant="secondary">{demoMetrics.uptime}%</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">EC2 instance started</p>
                              <p className="text-xs text-gray-500">2 minutes ago</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
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
                <TabsContent value="resources" className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {demoResources.map((resource, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-3 h-3 rounded-full ${getStatusColor(resource.status)}`}></div>
                              <div>
                                <h3 className="font-semibold">{resource.name}</h3>
                                <p className="text-sm text-gray-500">{resource.type} • {resource.provider}</p>
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
                            </div>
                          </div>
                          <div className="mt-3 flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Cpu className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{resource.cpu}%</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <HardDrive className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{resource.memory}%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {demoIssues.map((issue, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <div className={`w-3 h-3 rounded-full ${getSeverityColor(issue.severity)}`}></div>
                              <div className="flex-1">
                                <h3 className="font-semibold">{issue.title}</h3>
                                <p className="text-sm text-gray-600">Resource: {issue.resource}</p>
                              </div>
                            </div>
                            <Badge variant={issue.status === 'resolved' ? 'default' : 'secondary'}>
                              {issue.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Costs Tab */}
                <TabsContent value="costs" className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {demoOptimizations.map((optimization, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold">{optimization.title}</h3>
                              <p className="text-sm text-gray-600">
                                Potential savings: ${optimization.savings.toFixed(2)} • Risk: {optimization.risk}
                              </p>
                            </div>
                            <Badge variant={optimization.status === 'implemented' ? 'default' : 'secondary'}>
                              {optimization.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* AI Agents Tab */}
                <TabsContent value="agents" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {demoAgents.map((agent, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
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
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-sm">
                                  <span>Tasks Completed</span>
                                  <span className="font-semibold">{agent.tasks}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Customers Tab */}
                <TabsContent value="customers" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
          </DialogContent>
        </Dialog>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Cloud Operations?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of organizations already using AI Ops Guardian Angel 
            to optimize costs, enhance security, and improve performance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => navigate('/auth')}>
              <User className="h-5 w-5 mr-2" />
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" onClick={() => setShowDemo(true)}>
              <Play className="h-5 w-5 mr-2" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">AI Ops Guardian Angel</h3>
              <p className="text-gray-400">
                AI-powered cloud operations platform for modern enterprises.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Documentation</li>
                <li>API Reference</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Community</li>
                <li>Status</li>
                <li>Security</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI Ops Guardian Angel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UATLandingPage; 