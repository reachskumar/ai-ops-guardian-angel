
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AreaChart, BarChart } from '@/components/ui/charts';
import { Button } from '@/components/ui/button';
import { AlertCircle, DollarSign, TrendingDown, TrendingUp, RefreshCw, Filter } from 'lucide-react';
import { 
  getCostBreakdown,
  getCostForecast,
  getOptimizationSuggestions 
} from '@/services/cloud/cost';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const CostAnalysisTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);
  const [costData, setCostData] = useState<any>({
    overview: [],
    breakdown: { services: [], regions: [] },
    forecast: [],
    optimizations: []
  });
  const { toast } = useToast();

  const fetchCostData = async () => {
    setIsLoading(true);
    try {
      // Fetch cost data
      const [breakdownData, forecastData, optimizationsData] = await Promise.all([
        getCostBreakdown(timeRange),
        getCostForecast(timeRange),
        getOptimizationSuggestions()
      ]);
      
      setCostData({
        overview: breakdownData.dailyCosts || [],
        breakdown: {
          services: breakdownData.byService || [],
          regions: breakdownData.byRegion || []
        },
        forecast: forecastData.forecast || [],
        optimizations: optimizationsData.suggestions || []
      });
    } catch (error) {
      console.error('Error fetching cost data:', error);
      toast({
        title: 'Error fetching cost data',
        description: 'Could not retrieve cloud cost information',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on initial render
  React.useEffect(() => {
    fetchCostData();
  }, [timeRange]);

  // Sample data for visualization
  const mockOverviewData = [
    { date: 'Apr 01', cost: 12.45 },
    { date: 'Apr 05', cost: 14.20 },
    { date: 'Apr 10', cost: 10.80 },
    { date: 'Apr 15', cost: 15.30 },
    { date: 'Apr 20', cost: 18.75 },
    { date: 'Apr 25', cost: 16.90 },
    { date: 'Apr 30', cost: 19.20 }
  ];
  
  const mockForecastData = [
    { date: 'May 05', cost: 18.40, forecasted: true },
    { date: 'May 10', cost: 19.90, forecasted: true },
    { date: 'May 15', cost: 21.30, forecasted: true },
    { date: 'May 20', cost: 22.70, forecasted: true },
    { date: 'May 25', cost: 23.10, forecasted: true },
    { date: 'May 30', cost: 24.50, forecasted: true }
  ];
  
  const mockServiceBreakdown = [
    { name: 'Compute', cost: 125.45 },
    { name: 'Storage', cost: 45.20 },
    { name: 'Networking', cost: 18.80 },
    { name: 'Other', cost: 7.30 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Cost Analysis</h2>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="ytd">Year to date</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon"
            onClick={fetchCostData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            <span>Breakdown</span>
          </TabsTrigger>
          <TabsTrigger value="forecast" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span>Forecast</span>
          </TabsTrigger>
          <TabsTrigger value="optimize" className="flex items-center gap-1">
            <TrendingDown className="h-4 w-4" />
            <span>Optimize</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">Cost Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <AreaChart
                  data={costData.overview.length > 0 ? costData.overview : mockOverviewData}
                  index="date"
                  categories={["cost"]}
                  colors={["blue"]}
                  valueFormatter={(value) => `$${value.toFixed(2)}`}
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">Current Month</p>
                  <p className="text-2xl font-bold">$196.75</p>
                </div>
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">Previous Month</p>
                  <p className="text-2xl font-bold">$178.20</p>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <TrendingUp className="h-3 w-3 text-red-500 mr-1" /> +10.4%
                  </p>
                </div>
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">Forecasted</p>
                  <p className="text-2xl font-bold">$210.55</p>
                </div>
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="text-2xl font-bold">$250.00</p>
                  <Progress value={78} className="h-1 mt-1" />
                  <p className="text-xs text-muted-foreground">78% used</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">Cost by Service</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <BarChart
                  data={costData.breakdown.services.length > 0 ? costData.breakdown.services : mockServiceBreakdown}
                  index="name"
                  categories={["cost"]}
                  colors={["blue"]}
                  valueFormatter={(value) => `$${value.toFixed(2)}`}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">Cost by Region</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <BarChart
                  data={costData.breakdown.regions.length > 0 ? costData.breakdown.regions : [
                    { name: 'us-central1', cost: 85.45 },
                    { name: 'us-east1', cost: 65.20 },
                    { name: 'europe-west1', cost: 38.80 },
                    { name: 'asia-east1', cost: 7.30 }
                  ]}
                  index="name"
                  categories={["cost"]}
                  colors={["blue"]}
                  valueFormatter={(value) => `$${value.toFixed(2)}`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">Cost Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <AreaChart
                  data={[...mockOverviewData, ...mockForecastData]}
                  index="date"
                  categories={["cost"]}
                  colors={["blue"]}
                  valueFormatter={(value) => `$${value.toFixed(2)}`}
                />
              </div>
              
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Forecast Details</AlertTitle>
                <AlertDescription>
                  Projected cost for next month: <strong>$210.55</strong> (based on current usage patterns)
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimize" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-md font-medium">Cost Optimization Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-md">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-2">
                      <TrendingDown className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium">Right-size VM instances</h4>
                        <p className="text-sm text-muted-foreground">
                          2 instances have low CPU utilization (&lt;10%) over the last 2 weeks
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Save ~$45/mo</Badge>
                  </div>
                </div>
                
                <div className="p-4 border rounded-md">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-2">
                      <TrendingDown className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium">Delete unattached persistent disks</h4>
                        <p className="text-sm text-muted-foreground">
                          3 persistent disks are not attached to any instance
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Save ~$15/mo</Badge>
                  </div>
                </div>
                
                <div className="p-4 border rounded-md">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-2">
                      <TrendingDown className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium">Use committed use discounts</h4>
                        <p className="text-sm text-muted-foreground">
                          Stable VM usage pattern detected, consider committed use for 1-3 years
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Save ~$35/mo</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CostAnalysisTab;
