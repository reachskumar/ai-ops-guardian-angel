
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Loader2, DollarSign, TrendingDown } from "lucide-react";
import { AreaChart, BarChart, LineChart } from "@/components/ui/charts";

interface CostData {
  date: string;
  amount: number;
  service?: string;
}

interface OptimizationTip {
  id: string;
  title: string;
  description: string;
  potentialSavings: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

const mockCostData: CostData[] = [
  { date: "Apr 1", amount: 245 },
  { date: "Apr 2", amount: 267 },
  { date: "Apr 3", amount: 258 },
  { date: "Apr 4", amount: 290 },
  { date: "Apr 5", amount: 305 },
  { date: "Apr 6", amount: 275 },
  { date: "Apr 7", amount: 268 },
];

const mockServiceCostData = [
  { name: "EC2", value: 540 },
  { name: "RDS", value: 320 },
  { name: "S3", value: 180 },
  { name: "Lambda", value: 90 },
  { name: "Other", value: 120 },
];

const mockOptimizationTips: OptimizationTip[] = [
  {
    id: "tip-1",
    title: "Right-size underutilized EC2 instances",
    description: "Several t2.large instances are showing <20% CPU utilization. Consider downgrading to t2.medium.",
    potentialSavings: 120,
    difficulty: 'easy'
  },
  {
    id: "tip-2",
    title: "Use Reserved Instances for stable workloads",
    description: "Convert 5 on-demand EC2 instances to reserved instances for 1-year term.",
    potentialSavings: 450,
    difficulty: 'medium'
  },
  {
    id: "tip-3",
    title: "Clean up unused EBS volumes",
    description: "3 EBS volumes are unattached and can be removed.",
    potentialSavings: 35,
    difficulty: 'easy'
  },
  {
    id: "tip-4",
    title: "Move cold data to cheaper storage tiers",
    description: "Transfer rarely accessed S3 data to Glacier storage class.",
    potentialSavings: 85,
    difficulty: 'medium'
  },
];

const CostAnalysisPanel: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("7d");
  const [costData, setCostData] = useState<CostData[]>(mockCostData);
  const [serviceCostData, setServiceCostData] = useState(mockServiceCostData);
  const [optimizationTips, setOptimizationTips] = useState<OptimizationTip[]>(mockOptimizationTips);
  
  // Calculate total costs for the period
  const totalCost = costData.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate total potential savings
  const totalPotentialSavings = optimizationTips.reduce((sum, tip) => sum + tip.potentialSavings, 0);
  
  // Function to simulate loading new data based on time range
  const loadCostData = (range: string) => {
    setIsLoading(true);
    
    // In a real app, this would be an API call with the selected time range
    setTimeout(() => {
      // Generate some varied mock data based on the range
      const multiplier = range === "30d" ? 30 : range === "90d" ? 90 : 7;
      const newData = Array.from({ length: Math.min(multiplier, 30) }, (_, i) => ({
        date: `Apr ${i + 1}`,
        amount: Math.floor(Math.random() * 100) + 200
      }));
      
      setCostData(newData);
      setIsLoading(false);
    }, 800);
  };
  
  // Load data when time range changes
  useEffect(() => {
    loadCostData(timeRange);
  }, [timeRange]);
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Cost Trend Chart */}
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Cost Trend
              </CardTitle>
              <Select value={timeRange} onValueChange={(value) => setTimeRange(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardDescription>
              Total spend: ${totalCost.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <AreaChart
                data={costData}
                index="date"
                categories={["amount"]}
                colors={["blue"]}
                valueFormatter={(value) => `$${value}`}
                className="h-64"
              />
            )}
          </CardContent>
        </Card>
        
        {/* Cost by Service */}
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Cost by Service</CardTitle>
            <CardDescription>
              Service cost breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={serviceCostData}
              index="name"
              categories={["value"]}
              colors={["blue"]}
              valueFormatter={(value) => `$${value}`}
              className="h-64"
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-primary" />
            Cost Optimization Recommendations
          </CardTitle>
          <CardDescription>
            Potential savings: ${totalPotentialSavings.toLocaleString()}/month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimizationTips.map((tip) => (
              <div key={tip.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{tip.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className={getDifficultyColor(tip.difficulty)}>
                      {tip.difficulty.charAt(0).toUpperCase() + tip.difficulty.slice(1)}
                    </span>
                    <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded text-xs font-medium">
                      Save ${tip.potentialSavings}/mo
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{tip.description}</p>
                <div className="mt-2">
                  <Button variant="outline" size="sm">Apply</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostAnalysisPanel;
