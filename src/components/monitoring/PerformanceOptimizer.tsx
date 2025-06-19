
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle,
  Settings,
  BarChart3
} from "lucide-react";
import { AreaChart, BarChart } from "@/components/ui/charts";

interface OptimizationRule {
  id: string;
  name: string;
  description: string;
  category: 'cost' | 'performance' | 'security' | 'reliability';
  enabled: boolean;
  threshold: number;
  action: string;
}

interface OptimizationResult {
  id: string;
  rule: string;
  applied: boolean;
  impact: {
    cost: number;
    performance: number;
    reliability: number;
  };
  timestamp: string;
  details: string;
}

const PerformanceOptimizer: React.FC = () => {
  const [rules, setRules] = useState<OptimizationRule[]>([
    {
      id: '1',
      name: 'Auto-scale CPU',
      description: 'Automatically scale CPU resources based on usage patterns',
      category: 'performance',
      enabled: true,
      threshold: 80,
      action: 'Scale up when CPU > 80% for 5 minutes'
    },
    {
      id: '2',
      name: 'Memory Optimization',
      description: 'Optimize memory allocation and garbage collection',
      category: 'performance',
      enabled: true,
      threshold: 75,
      action: 'Clear cache when memory > 75%'
    },
    {
      id: '3',
      name: 'Cost Optimization',
      description: 'Shutdown unused resources during off-peak hours',
      category: 'cost',
      enabled: false,
      threshold: 10,
      action: 'Stop instances with < 10% CPU for 1 hour'
    },
    {
      id: '4',
      name: 'Database Query Optimization',
      description: 'Optimize slow database queries automatically',
      category: 'performance',
      enabled: true,
      threshold: 1000,
      action: 'Add indexes for queries > 1000ms'
    }
  ]);

  const [results, setResults] = useState<OptimizationResult[]>([
    {
      id: '1',
      rule: 'Auto-scale CPU',
      applied: true,
      impact: { cost: -15, performance: 25, reliability: 10 },
      timestamp: new Date().toISOString(),
      details: 'Scaled up 2 instances during peak traffic'
    },
    {
      id: '2',
      rule: 'Memory Optimization',
      applied: true,
      impact: { cost: 0, performance: 15, reliability: 5 },
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      details: 'Cleared 2.3GB of unused cache'
    }
  ]);

  const [optimizationScore, setOptimizationScore] = useState(78);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Mock optimization data
  const optimizationTrends = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    score: Math.floor(Math.random() * 20) + 70
  }));

  const impactData = [
    { category: 'Cost Savings', value: 25 },
    { category: 'Performance', value: 35 },
    { category: 'Reliability', value: 15 }
  ];

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const runOptimization = async () => {
    setIsOptimizing(true);
    
    // Simulate optimization process
    setTimeout(() => {
      const newResult: OptimizationResult = {
        id: Date.now().toString(),
        rule: 'Manual Optimization',
        applied: true,
        impact: { 
          cost: Math.floor(Math.random() * 20) - 10, 
          performance: Math.floor(Math.random() * 30) + 10,
          reliability: Math.floor(Math.random() * 15) + 5
        },
        timestamp: new Date().toISOString(),
        details: 'Manual optimization completed successfully'
      };
      
      setResults(prev => [newResult, ...prev.slice(0, 9)]);
      setOptimizationScore(prev => Math.min(100, prev + Math.floor(Math.random() * 10) + 2));
      setIsOptimizing(false);
    }, 3000);
  };

  const getCategoryColor = (category: OptimizationRule['category']) => {
    switch (category) {
      case 'cost': return 'bg-green-500';
      case 'performance': return 'bg-blue-500';
      case 'security': return 'bg-red-500';
      case 'reliability': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getImpactColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Optimization Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Optimization Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{optimizationScore}/100</span>
                <Button 
                  onClick={runOptimization}
                  disabled={isOptimizing}
                  className="flex items-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  {isOptimizing ? 'Optimizing...' : 'Run Optimization'}
                </Button>
              </div>
              <Progress value={optimizationScore} className="h-3" />
              <p className="text-sm text-muted-foreground">
                Your infrastructure is performing well with room for improvement
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {rules.filter(r => r.enabled).length}/{rules.length}
              </div>
              <p className="text-sm text-muted-foreground">Rules Enabled</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Optimization Rules</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Automation Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div key={rule.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{rule.name}</h4>
                        <Badge className={getCategoryColor(rule.category)}>
                          {rule.category}
                        </Badge>
                        {rule.enabled && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                      <p className="text-xs text-blue-600">{rule.action}</p>
                    </div>
                    <Button
                      variant={rule.enabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleRule(rule.id)}
                    >
                      {rule.enabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result) => (
                  <div key={result.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{result.rule}</h4>
                          <Badge variant={result.applied ? "default" : "secondary"}>
                            {result.applied ? 'Applied' : 'Pending'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{result.details}</p>
                        <div className="flex items-center gap-4 text-xs">
                          <span className={getImpactColor(result.impact.cost)}>
                            <DollarSign className="h-3 w-3 inline mr-1" />
                            Cost: {result.impact.cost > 0 ? '+' : ''}{result.impact.cost}%
                          </span>
                          <span className={getImpactColor(result.impact.performance)}>
                            <TrendingUp className="h-3 w-3 inline mr-1" />
                            Performance: +{result.impact.performance}%
                          </span>
                          <span className={getImpactColor(result.impact.reliability)}>
                            <CheckCircle className="h-3 w-3 inline mr-1" />
                            Reliability: +{result.impact.reliability}%
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {new Date(result.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Optimization Score Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <AreaChart
                  data={optimizationTrends}
                  categories={["score"]}
                  index="time"
                  colors={["green"]}
                  valueFormatter={(value) => `${value}/100`}
                  className="h-64"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impact by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={impactData}
                  categories={["value"]}
                  index="category"
                  colors={["blue"]}
                  valueFormatter={(value) => `${value}%`}
                  className="h-64"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceOptimizer;
