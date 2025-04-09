import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Loader2, DollarSign, TrendingDown, TrendingUp, Timer, Clock, X, Check, AlertTriangle, ExternalLink } from "lucide-react";
import { AreaChart, BarChart } from "@/components/ui/charts";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useCostAnalysis } from "@/hooks/cost";

const CostAnalysisPanel: React.FC = () => {
  const {
    isLoading,
    isApplyingRecommendation,
    timeRange,
    setTimeRange,
    costData,
    serviceCostData,
    optimizationRecommendations,
    totalPotentialSavings,
    costTrend,
    refreshData,
    applyRecommendation,
    dismissRecommendation,
    enableRealTimeUpdates,
    disableRealTimeUpdates,
    isRealTimeEnabled
  } = useCostAnalysis();

  const totalCost = costData.reduce((sum, item) => sum + item.amount, 0);

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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Cost Analysis & Optimization</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="real-time-updates" className="cursor-pointer">
              Real-time updates
            </Label>
            <Switch
              id="real-time-updates"
              checked={isRealTimeEnabled}
              onCheckedChange={(checked) => {
                if (checked) enableRealTimeUpdates();
                else disableRealTimeUpdates();
              }}
            />
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
          >
            <Loader2 className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {costTrend && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">${totalCost.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  Last {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : '90 days'}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Month-to-Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">${costTrend.total.toLocaleString()}</span>
                <span className={`ml-2 flex items-center text-sm ${costTrend.changePercentage > 0 ? 'text-destructive' : 'text-green-600'}`}>
                  {costTrend.changePercentage > 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {Math.abs(costTrend.changePercentage)}% vs last month
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Potential Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-green-600">${totalPotentialSavings.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  /month
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row gap-6">
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
        
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Cost by Service</CardTitle>
            <CardDescription>
              Service cost breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <BarChart
                data={serviceCostData}
                index="name"
                categories={["value"]}
                colors={["blue"]}
                valueFormatter={(value) => `$${value}`}
                className="h-64"
              />
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-primary" />
            Cost Optimization Recommendations
          </CardTitle>
          <CardDescription>
            Potential monthly savings: ${totalPotentialSavings.toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              {optimizationRecommendations
                .filter(rec => rec.status === 'pending')
                .map((tip) => (
                <div key={tip.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-start gap-2">
                      <h3 className="font-medium">{tip.title}</h3>
                      {tip.resourceType && (
                        <Badge variant="outline">{tip.resourceType}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className={getDifficultyColor(tip.difficulty)}>
                              {tip.difficulty.charAt(0).toUpperCase() + tip.difficulty.slice(1)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Implementation difficulty level</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded text-xs font-medium">
                        Save ${tip.potentialSavings}/mo
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{tip.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Updated {new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => dismissRecommendation(tip.id)}
                      >
                        <X className="h-4 w-4 mr-1" /> Dismiss
                      </Button>
                      
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => applyRecommendation(tip.id)}
                        disabled={isApplyingRecommendation}
                      >
                        {isApplyingRecommendation ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 mr-1" />
                        )}
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {optimizationRecommendations.filter(rec => rec.status === 'pending').length === 0 && (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 mb-2">
                    <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">Great job!</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    You've addressed all cost optimization recommendations.
                    We'll notify you when new opportunities are detected.
                  </p>
                </div>
              )}
              
              {optimizationRecommendations
                .filter(rec => rec.status === 'applied')
                .length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Recently Applied Optimizations
                  </h3>
                  <div className="space-y-2">
                    {optimizationRecommendations
                      .filter(rec => rec.status === 'applied')
                      .slice(0, 2)
                      .map(rec => (
                        <div 
                          key={rec.id} 
                          className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded"
                        >
                          <span className="text-sm">{rec.title}</span>
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            ${rec.potentialSavings}/mo saved
                          </Badge>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CostAnalysisPanel;
