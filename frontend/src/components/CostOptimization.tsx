import { useState } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target,
  Calendar,
  PieChart,
  BarChart3,
  Download,
  Settings
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Removed recharts import to fix build issues - using simple visualizations instead

const CostOptimization = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [chartType, setChartType] = useState("trend");

  const costData = [
    { month: 'Jan', aws: 2400, azure: 1800, gcp: 1200, total: 5400 },
    { month: 'Feb', aws: 2100, azure: 1900, gcp: 1100, total: 5100 },
    { month: 'Mar', aws: 2300, azure: 1700, gcp: 1300, total: 5300 },
    { month: 'Apr', aws: 2000, azure: 1600, gcp: 1000, total: 4600 },
    { month: 'May', aws: 1900, azure: 1500, gcp: 950, total: 4350 },
    { month: 'Jun', aws: 1800, azure: 1400, gcp: 900, total: 4100 },
  ];

  const providerCostData = [
    { name: 'AWS', value: 1800, color: '#FF9900' },
    { name: 'Azure', value: 1400, color: '#0078D4' },
    { name: 'GCP', value: 900, color: '#4285F4' },
  ];

  const savingsOpportunities = [
    {
      id: 1,
      title: "Right-size EC2 Instances",
      description: "12 instances are overprovisioned and can be downsized",
      impact: "$890/month",
      effort: "Low",
      priority: "High",
      category: "Compute",
      provider: "AWS",
      status: "pending"
    },
    {
      id: 2,
      title: "Move to Reserved Instances",
      description: "Convert 8 on-demand instances to 1-year reserved pricing",
      impact: "$1,240/month",
      effort: "Medium",
      priority: "High",
      category: "Compute",
      provider: "AWS", 
      status: "pending"
    },
    {
      id: 3,
      title: "Storage Lifecycle Management",
      description: "Automatically tier 450GB of infrequently accessed data",
      impact: "$340/month",
      effort: "Low",
      priority: "Medium",
      category: "Storage",
      provider: "Azure",
      status: "pending"
    },
    {
      id: 4,
      title: "Clean Up Unused Resources",
      description: "Remove 15 orphaned volumes and 6 unused load balancers",
      impact: "$156/month",
      effort: "Low",
      priority: "Medium",
      category: "Infrastructure",
      provider: "GCP",
      status: "pending"
    },
    {
      id: 5,
      title: "Enable Auto-Scaling",
      description: "Configure dynamic scaling for web application tier",
      impact: "$445/month",
      effort: "High",
      priority: "Low",
      category: "Compute",
      provider: "Azure",
      status: "pending"
    }
  ];

  const budgetAlerts = [
    {
      id: 1,
      name: "Production Environment",
      budget: 5000,
      spent: 4350,
      forecast: 4800,
      status: "warning",
      daysLeft: 8
    },
    {
      id: 2,
      name: "Development Environment", 
      budget: 1200,
      spent: 890,
      forecast: 1150,
      status: "healthy",
      daysLeft: 8
    },
    {
      id: 3,
      name: "Staging Environment",
      budget: 800,
      spent: 820,
      forecast: 920,
      status: "exceeded",
      daysLeft: 8
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-destructive text-destructive-foreground';
      case 'Medium': return 'bg-warning text-warning-foreground';
      case 'Low': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-success';
      case 'warning': return 'text-warning';
      case 'exceeded': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const totalSavingsPotential = savingsOpportunities.reduce(
    (total, opp) => total + parseFloat(opp.impact.replace(/[$,/month]/g, '')), 0
  );

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Cost Optimization</h2>
          <p className="text-muted-foreground">AI-powered insights and recommendations</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="infra-card hover-glow infra-transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-success" />
              <TrendingDown className="w-5 h-5 text-success" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">$4,100</div>
            <div className="text-sm text-muted-foreground">Current Month</div>
            <div className="text-xs text-success mt-2">↓ 22% vs last month</div>
          </CardContent>
        </Card>

        <Card className="infra-card hover-glow infra-transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-primary" />
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">${totalSavingsPotential.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Savings Potential</div>
            <div className="text-xs text-primary mt-2">+5 new opportunities</div>
          </CardContent>
        </Card>

        <Card className="infra-card hover-glow infra-transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-8 h-8 text-warning" />
              <span className="text-sm bg-warning/20 text-warning px-2 py-1 rounded">Active</span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">3</div>
            <div className="text-sm text-muted-foreground">Budget Alerts</div>
            <div className="text-xs text-warning mt-2">1 budget exceeded</div>
          </CardContent>
        </Card>

        <Card className="infra-card hover-glow infra-transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <PieChart className="w-8 h-8 text-accent" />
              <span className="text-sm bg-success/20 text-success px-2 py-1 rounded">Optimized</span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">87%</div>
            <div className="text-sm text-muted-foreground">Cost Efficiency</div>
            <div className="text-xs text-success mt-2">↑ 12% improvement</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Trends Chart */}
        <Card className="infra-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Cost Trends
              </CardTitle>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trend">Trend</SelectItem>
                  <SelectItem value="breakdown">Breakdown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {chartType === 'trend' ? (
                <div className="space-y-4">
                  <div className="text-sm font-medium mb-4">Monthly Cost Trends</div>
                  {costData.map((data, index) => (
                    <div key={data.month} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="font-medium">{data.month}</span>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                          <span className="text-sm">AWS: ${data.aws}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="text-sm">Azure: ${data.azure}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-sm">GCP: ${data.gcp}</span>
                        </div>
                        <span className="font-semibold">Total: ${data.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <div className="grid grid-cols-3 gap-4 max-w-sm">
                      {providerCostData.map((provider) => (
                        <div key={provider.name} className="text-center">
                          <div 
                            className="w-16 h-16 rounded-full mx-auto mb-2"
                            style={{ backgroundColor: provider.color }}
                          />
                          <div className="text-sm font-medium">{provider.name}</div>
                          <div className="text-xs text-muted-foreground">${provider.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Budget Alerts */}
        <Card className="infra-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Budget Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetAlerts.map((alert) => (
                <div key={alert.id} className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{alert.name}</h4>
                    <Badge className={getPriorityColor(alert.status === 'exceeded' ? 'High' : alert.status === 'warning' ? 'Medium' : 'Low')}>
                      {alert.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Spent: ${alert.spent.toLocaleString()}</span>
                      <span>Budget: ${alert.budget.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          alert.status === 'exceeded' ? 'bg-destructive' :
                          alert.status === 'warning' ? 'bg-warning' : 'bg-success'
                        }`}
                        style={{ width: `${Math.min((alert.spent / alert.budget) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Forecast: ${alert.forecast.toLocaleString()}</span>
                      <span>{alert.daysLeft} days left</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Opportunities */}
      <Card className="infra-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            AI Savings Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {savingsOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="p-4 hover-lift infra-transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold">{opportunity.title}</h4>
                      <Badge className={getPriorityColor(opportunity.priority)}>
                        {opportunity.priority}
                      </Badge>
                      <Badge variant="outline">{opportunity.category}</Badge>
                      <Badge variant="outline">{opportunity.provider}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{opportunity.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="flex items-center text-success font-semibold">
                        <DollarSign className="w-4 h-4 mr-1" />
                        Save {opportunity.impact}
                      </span>
                      <span className="text-muted-foreground">Effort: {opportunity.effort}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-1" />
                      Configure
                    </Button>
                    <Button variant="gradient" size="sm">
                      Apply Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostOptimization;