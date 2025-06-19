
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Server,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  RefreshCw
} from "lucide-react";
import { AreaChart, BarChart } from "@/components/ui/charts";

interface ResourceAnalysis {
  id: string;
  name: string;
  type: string;
  currentSize: string;
  recommendedSize: string;
  utilizationScore: number;
  costSavings: number;
  performanceImpact: 'none' | 'minimal' | 'moderate' | 'significant';
  confidence: number;
  metrics: {
    avgCpu: number;
    avgMemory: number;
    avgNetwork: number;
    peakCpu: number;
    peakMemory: number;
  };
  recommendation: 'downsize' | 'upsize' | 'maintain';
  reason: string;
}

const RightSizingAnalyzer: React.FC = () => {
  const [analyses, setAnalyses] = useState<ResourceAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [totalSavings, setTotalSavings] = useState(0);
  const [activeTab, setActiveTab] = useState('recommendations');

  useEffect(() => {
    generateAnalyses();
  }, [selectedTimeRange]);

  const generateAnalyses = () => {
    const mockAnalyses: ResourceAnalysis[] = [
      {
        id: 'server-1',
        name: 'Web Server 01',
        type: 'EC2 Instance',
        currentSize: 't3.large',
        recommendedSize: 't3.medium',
        utilizationScore: 35,
        costSavings: 45.20,
        performanceImpact: 'minimal',
        confidence: 92,
        metrics: {
          avgCpu: 25,
          avgMemory: 40,
          avgNetwork: 15,
          peakCpu: 65,
          peakMemory: 70
        },
        recommendation: 'downsize',
        reason: 'Consistently low CPU and memory utilization over the past 30 days'
      },
      {
        id: 'server-2',
        name: 'Database Server',
        type: 'RDS Instance',
        currentSize: 'db.t3.medium',
        recommendedSize: 'db.t3.large',
        utilizationScore: 85,
        costSavings: -25.40,
        performanceImpact: 'significant',
        confidence: 88,
        metrics: {
          avgCpu: 75,
          avgMemory: 85,
          avgNetwork: 60,
          peakCpu: 95,
          peakMemory: 92
        },
        recommendation: 'upsize',
        reason: 'High memory utilization with frequent performance bottlenecks'
      },
      {
        id: 'server-3',
        name: 'API Server 01',
        type: 'EC2 Instance',
        currentSize: 't3.small',
        recommendedSize: 't3.small',
        utilizationScore: 65,
        costSavings: 0,
        performanceImpact: 'none',
        confidence: 95,
        metrics: {
          avgCpu: 55,
          avgMemory: 65,
          avgNetwork: 30,
          peakCpu: 80,
          peakMemory: 85
        },
        recommendation: 'maintain',
        reason: 'Optimal resource utilization for current workload'
      },
      {
        id: 'server-4',
        name: 'Worker Node 01',
        type: 'EC2 Instance',
        currentSize: 't3.xlarge',
        recommendedSize: 't3.medium',
        utilizationScore: 28,
        costSavings: 89.60,
        performanceImpact: 'minimal',
        confidence: 90,
        metrics: {
          avgCpu: 20,
          avgMemory: 30,
          avgNetwork: 10,
          peakCpu: 45,
          peakMemory: 55
        },
        recommendation: 'downsize',
        reason: 'Significantly over-provisioned with very low resource usage'
      }
    ];

    setAnalyses(mockAnalyses);
    setTotalSavings(mockAnalyses.reduce((sum, analysis) => sum + analysis.costSavings, 0));
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    // Simulate analysis process
    setTimeout(() => {
      generateAnalyses();
      setIsAnalyzing(false);
    }, 3000);
  };

  const getRecommendationColor = (recommendation: ResourceAnalysis['recommendation']) => {
    switch (recommendation) {
      case 'downsize': return 'bg-green-500';
      case 'upsize': return 'bg-orange-500';
      case 'maintain': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getRecommendationIcon = (recommendation: ResourceAnalysis['recommendation']) => {
    switch (recommendation) {
      case 'downsize': return <TrendingDown className="h-4 w-4" />;
      case 'upsize': return <TrendingUp className="h-4 w-4" />;
      case 'maintain': return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getPerformanceImpactColor = (impact: ResourceAnalysis['performanceImpact']) => {
    switch (impact) {
      case 'none': return 'text-green-600';
      case 'minimal': return 'text-yellow-600';
      case 'moderate': return 'text-orange-600';
      case 'significant': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const utilizationData = analyses.map(analysis => ({
    name: analysis.name,
    cpu: analysis.metrics.avgCpu,
    memory: analysis.metrics.avgMemory,
    network: analysis.metrics.avgNetwork
  }));

  const savingsData = analyses
    .filter(a => a.costSavings > 0)
    .map(analysis => ({
      name: analysis.name,
      savings: analysis.costSavings
    }));

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Right-Sizing Analysis
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Optimize resource allocation based on utilization patterns
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={selectedTimeRange} 
              onChange={(e) => setSelectedTimeRange(e.target.value as '7d' | '30d' | '90d')}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <Button 
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Savings</p>
                <p className="text-2xl font-bold text-green-600">
                  ${totalSavings.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Resources Analyzed</p>
                <p className="text-2xl font-bold">{analyses.length}</p>
              </div>
              <Server className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Downsize Opportunities</p>
                <p className="text-2xl font-bold">
                  {analyses.filter(a => a.recommendation === 'downsize').length}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Avg Utilization</p>
                <p className="text-2xl font-bold">
                  {Math.round(analyses.reduce((sum, a) => sum + a.utilizationScore, 0) / analyses.length)}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          {analyses.map((analysis) => (
            <Card key={analysis.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{analysis.name}</h3>
                      <Badge variant="outline">{analysis.type}</Badge>
                      <Badge className={getRecommendationColor(analysis.recommendation)}>
                        {getRecommendationIcon(analysis.recommendation)}
                        <span className="ml-1 capitalize">{analysis.recommendation}</span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Size</p>
                        <p className="font-medium">{analysis.currentSize}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Recommended Size</p>
                        <p className="font-medium">{analysis.recommendedSize}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Monthly Savings</p>
                        <p className={`font-medium ${analysis.costSavings > 0 ? 'text-green-600' : analysis.costSavings < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {analysis.costSavings > 0 ? '+' : ''}${analysis.costSavings.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Utilization Score</span>
                        <span>{analysis.utilizationScore}%</span>
                      </div>
                      <Progress value={analysis.utilizationScore} className="h-2" />
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Avg CPU</p>
                        <p className="font-medium">{analysis.metrics.avgCpu}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Memory</p>
                        <p className="font-medium">{analysis.metrics.avgMemory}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Confidence</p>
                        <p className="font-medium">{analysis.confidence}%</p>
                      </div>
                    </div>

                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Analysis:</strong> {analysis.reason}
                        <br />
                        <strong>Performance Impact:</strong> 
                        <span className={getPerformanceImpactColor(analysis.performanceImpact)}>
                          {' '}{analysis.performanceImpact}
                        </span>
                      </AlertDescription>
                    </Alert>
                  </div>

                  <div className="ml-4">
                    <Button size="sm" variant="outline">
                      Apply Recommendation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resource Utilization Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={utilizationData}
                  categories={["cpu", "memory", "network"]}
                  index="name"
                  colors={["blue", "green", "purple"]}
                  valueFormatter={(value) => `${value}%`}
                  className="h-64"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Potential Monthly Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={savingsData}
                  categories={["savings"]}
                  index="name"
                  colors={["green"]}
                  valueFormatter={(value) => `$${value}`}
                  className="h-64"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Right-Sizing History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>2024-01-15:</strong> Successfully downsized Worker Node 02 from t3.large to t3.medium. 
                    Monthly savings: $45.20
                  </AlertDescription>
                </Alert>
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>2024-01-10:</strong> Upsized Database Server from db.t3.small to db.t3.medium. 
                    Performance improved by 35%
                  </AlertDescription>
                </Alert>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>2024-01-05:</strong> Recommendation to downsize Web Server 03 was dismissed by user
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RightSizingAnalyzer;
