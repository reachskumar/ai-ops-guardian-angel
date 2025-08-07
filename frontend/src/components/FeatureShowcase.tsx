import React from 'react';
import { 
  Cloud, Shield, DollarSign, Activity, Users, Settings, Bot, 
  BarChart3, AlertTriangle, CheckCircle, Clock, TrendingUp, 
  TrendingDown, Zap, Database, Server, Globe, Lock, Eye, 
  Plus, Search, Filter, Download, RefreshCw, Bell, User, LogOut,
  Building, Target, ShieldCheck, Cpu, HardDrive, Network,
  Code, GitBranch, Workflow, MessageSquare, Brain, Sparkles,
  ShieldX, FileText, AlertCircle, Settings2, Palette
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';

const FeatureShowcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              InfraMind
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              The Complete AI-Powered Multi-Cloud Operations Platform
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Cloud className="w-4 h-4 mr-2" />
                Multi-Cloud Management
              </Badge>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Bot className="w-4 h-4 mr-2" />
                AI Copilot
              </Badge>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <DollarSign className="w-4 h-4 mr-2" />
                FinOps
              </Badge>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                DevSecOps
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Complete Feature Set
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need for modern cloud operations
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="multicloud">Multi-Cloud</TabsTrigger>
            <TabsTrigger value="ai-copilot">AI Copilot</TabsTrigger>
            <TabsTrigger value="finops">FinOps</TabsTrigger>
            <TabsTrigger value="devsecops">DevSecOps</TabsTrigger>
            <TabsTrigger value="saas">SaaS Platform</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Multi-Cloud Management */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Globe className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle>Multi-Cloud Management</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      AWS, Azure, GCP, OCI Integration
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Unified Resource Dashboard
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Resource Tagging & Grouping
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Cross-Cloud RBAC
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* AI Copilot */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Brain className="h-6 w-6 text-purple-600" />
                    </div>
                    <CardTitle>AI Copilot & Orchestration</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      LangGraph Agent Orchestration
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Natural Language Commands
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Conversational Workflows
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      AI Explanations & Insights
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* FinOps */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle>FinOps & Cost Optimization</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Cross-Cloud Cost Dashboard
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      AI Cost Recommendations
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Budget Thresholds & Alerts
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Anomaly Detection
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* DevSecOps */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Shield className="h-6 w-6 text-red-600" />
                    </div>
                    <CardTitle>DevSecOps & Compliance</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      IaC Security Scanning
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Container CVE Detection
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Secrets Scanning
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Compliance Automation
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* SRE & Observability */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Activity className="h-6 w-6 text-orange-600" />
                    </div>
                    <CardTitle>SRE & Observability</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Incident Ingestion
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      AI Root Cause Analysis
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Smart Escalation
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Auto-Remediation
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* SaaS Platform */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Building className="h-6 w-6 text-indigo-600" />
                    </div>
                    <CardTitle>SaaS Platform</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Multi-Tenant Architecture
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Customer Management
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Usage Analytics
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Billing & Subscriptions
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="text-center py-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">4</div>
                  <div className="text-sm text-gray-600">Cloud Providers</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="text-center py-6">
                  <div className="text-3xl font-bold text-purple-600 mb-2">12+</div>
                  <div className="text-sm text-gray-600">AI Agents</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="text-center py-6">
                  <div className="text-3xl font-bold text-green-600 mb-2">$50K+</div>
                  <div className="text-sm text-gray-600">Monthly Savings</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="text-center py-6">
                  <div className="text-3xl font-bold text-red-600 mb-2">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime SLA</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Multi-Cloud Tab */}
          <TabsContent value="multicloud" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-6 w-6 mr-2" />
                    Cloud Provider Integration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'AWS', color: 'bg-orange-500', resources: 1247, cost: '$8,450' },
                      { name: 'Azure', color: 'bg-blue-500', resources: 892, cost: '$6,230' },
                      { name: 'GCP', color: 'bg-red-500', resources: 708, cost: '$4,820' },
                      { name: 'OCI', color: 'bg-green-500', resources: 456, cost: '$3,120' },
                    ].map((provider) => (
                      <div key={provider.name} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${provider.color}`} />
                          <div>
                            <p className="font-medium">{provider.name}</p>
                            <p className="text-sm text-gray-600">{provider.resources} resources</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{provider.cost}</p>
                          <p className="text-sm text-gray-600">monthly</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resource Management Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Code className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Infrastructure as Code</p>
                        <p className="text-sm text-gray-600">Terraform & Pulumi support</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <GitBranch className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">GitOps Integration</p>
                        <p className="text-sm text-gray-600">One-click apply & rollback</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Workflow className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Drift Detection</p>
                        <p className="text-sm text-gray-600">Automated infrastructure monitoring</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Settings className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium">Multi-Cloud Provisioning</p>
                        <p className="text-sm text-gray-600">Cross-cloud resource deployment</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Copilot Tab */}
          <TabsContent value="ai-copilot" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-6 w-6 mr-2" />
                    AI Agents & Orchestration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'CostGuard AI', type: 'Cost Optimization', status: 'Active', tasks: 156 },
                      { name: 'SecurityBot', type: 'Security Monitoring', status: 'Active', tasks: 89 },
                      { name: 'PerformanceMonitor', type: 'Performance Analysis', status: 'Idle', tasks: 234 },
                      { name: 'ComplianceChecker', type: 'Compliance Audit', status: 'Active', tasks: 67 },
                    ].map((agent) => (
                      <div key={agent.name} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{agent.name}</h3>
                          <Badge variant={agent.status === 'Active' ? 'default' : 'secondary'}>
                            {agent.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{agent.type}</p>
                        <div className="flex justify-between text-sm">
                          <span>Tasks completed: {agent.tasks}</span>
                          <span>Last activity: 2 min ago</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conversational Commands</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="font-medium">"Optimize costs for production environment"</p>
                      <p className="text-sm text-gray-600 mt-1">
                        → Analyzed 15 resources, identified 3 optimizations
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="font-medium">"Deploy security patches to all servers"</p>
                      <p className="text-sm text-gray-600 mt-1">
                        → Patched 23 servers across 3 regions
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="font-medium">"Scale up web tier for high traffic"</p>
                      <p className="text-sm text-gray-600 mt-1">
                        → Scaled 5 instances, monitoring performance
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <p className="font-medium">"Generate compliance report for Q4"</p>
                      <p className="text-sm text-gray-600 mt-1">
                        → Generated comprehensive compliance report
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* FinOps Tab */}
          <TabsContent value="finops" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Cost Optimization Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { title: 'Rightsizing', savings: '$1,250', risk: 'Low', status: 'Pending' },
                      { title: 'Idle Resource Cleanup', savings: '$450', risk: 'Low', status: 'Approved' },
                      { title: 'Reserved Instance Planning', savings: '$3,200', risk: 'Medium', status: 'Implemented' },
                      { title: 'Spot Instance Optimization', savings: '$890', risk: 'Medium', status: 'Pending' },
                    ].map((opt) => (
                      <div key={opt.title} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{opt.title}</h3>
                          <Badge variant={opt.risk === 'Low' ? 'default' : 'secondary'}>
                            {opt.risk} risk
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold text-green-600 mb-2">
                          {opt.savings}
                        </p>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">{opt.status}</Badge>
                          <Button size="sm">Apply</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Budget & Anomaly Detection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Production Budget</span>
                        <span className="text-green-600">$12,450 / $15,000</span>
                      </div>
                      <Progress value={83} className="mt-2" />
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Development Budget</span>
                        <span className="text-yellow-600">$8,200 / $7,000</span>
                      </div>
                      <Progress value={117} className="mt-2" />
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="font-medium">Cost Anomaly Detected</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Unusual spike in database costs - 45% increase
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* DevSecOps Tab */}
          <TabsContent value="devsecops" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Security & Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { title: 'Unencrypted S3 Bucket', severity: 'Critical', status: 'Open' },
                      { title: 'Public RDS Instance', severity: 'High', status: 'In Progress' },
                      { title: 'Missing IAM Policy', severity: 'Medium', status: 'Resolved' },
                      { title: 'Container CVE Found', severity: 'High', status: 'Open' },
                    ].map((issue) => (
                      <div key={issue.title} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{issue.title}</h3>
                          <Badge variant={
                            issue.severity === 'Critical' ? 'destructive' :
                            issue.severity === 'High' ? 'default' : 'secondary'
                          }>
                            {issue.severity}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Resource: s3-bucket-01</span>
                          <Badge variant="outline">{issue.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance Frameworks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { framework: 'CIS', compliance: 95, status: 'Pass' },
                      { framework: 'NIST', compliance: 88, status: 'Pass' },
                      { framework: 'SOC2', compliance: 92, status: 'Pass' },
                      { framework: 'PCI-DSS', compliance: 78, status: 'Fail' },
                    ].map((item) => (
                      <div key={item.framework} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{item.framework}</p>
                          <p className="text-sm text-gray-600">{item.compliance}% compliant</p>
                        </div>
                        <Badge variant={item.status === 'Pass' ? 'default' : 'destructive'}>
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SaaS Platform Tab */}
          <TabsContent value="saas" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'TechCorp Inc', plan: 'Enterprise', users: 45, status: 'Active' },
                      { name: 'StartupXYZ', plan: 'Professional', users: 12, status: 'Active' },
                      { name: 'GlobalBank', plan: 'Enterprise', users: 120, status: 'Active' },
                      { name: 'DevStudio', plan: 'Starter', users: 5, status: 'Trial' },
                    ].map((org) => (
                      <div key={org.name} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>{org.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{org.name}</p>
                            <p className="text-sm text-gray-600">
                              {org.users} users • {org.plan} plan
                            </p>
                          </div>
                        </div>
                        <Badge variant={org.status === 'Active' ? 'default' : 'secondary'}>
                          {org.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">182</p>
                      <p className="text-sm text-gray-600">Total Users</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">$45,230</p>
                      <p className="text-sm text-gray-600">Monthly Revenue</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-600">98.5%</p>
                      <p className="text-sm text-gray-600">Uptime SLA</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-orange-600">4.9/5</p>
                      <p className="text-sm text-gray-600">Customer Satisfaction</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FeatureShowcase; 