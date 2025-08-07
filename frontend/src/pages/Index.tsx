import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Cloud, Shield, DollarSign, Activity, Users, Settings, Bot, 
  BarChart3, AlertTriangle, CheckCircle, Clock, TrendingUp, 
  TrendingDown, Zap, Database, Server, Globe, Lock, Eye, 
  Plus, Search, Filter, Download, RefreshCw, Bell, User, LogOut,
  Building, Target, ShieldCheck, Cpu, HardDrive, Network,
  ArrowRight, Play, Sparkles, Brain, ShieldX, FileText
} from "lucide-react";
import FeatureShowcase from "@/components/FeatureShowcase";

const Index = () => {
  const navigate = useNavigate();
  const [showFeatures, setShowFeatures] = useState(false);

  if (showFeatures) {
    return <FeatureShowcase />;
  }

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
            <div className="flex flex-wrap justify-center gap-4 mb-8">
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <User className="w-4 h-4 mr-2" />
                Login / Register
              </Button>
              <Button 
                size="lg" 
                onClick={() => navigate("/dashboard")}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <Play className="w-4 h-4 mr-2" />
                Launch Dashboard
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => setShowFeatures(true)}
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                View All Features
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate("/test")}
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Test Integration
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate("/simple-test")}
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Simple Test
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate("/debug")}
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Debug Test
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Complete AI Ops Platform
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need for modern cloud operations in one platform
          </p>
        </div>

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16">
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

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Cloud Operations?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Experience the power of AI-driven cloud management
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <User className="w-4 h-4 mr-2" />
              Login / Register
            </Button>
            <Button 
              size="lg" 
              onClick={() => navigate("/dashboard")}
              className="bg-green-600 hover:bg-green-700"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Launch Dashboard
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setShowFeatures(true)}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Explore All Features
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
