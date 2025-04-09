
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AreaChart, LineChart } from "@/components/ui/charts";
import { Calendar, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { useCostForecasting } from "@/hooks/cost";
import { useToast } from "@/hooks/use-toast";

const CostForecastPanel: React.FC = () => {
  const {
    forecastData,
    isLoading,
    forecastOptions,
    updateForecastOptions,
    loadForecast,
    trendPercentage
  } = useCostForecasting();
  const { toast } = useToast();

  useEffect(() => {
    loadForecast();
  }, [loadForecast]);

  const handleRefreshForecast = () => {
    loadForecast();
    toast({
      title: "Forecast updated",
      description: "The cost forecast has been refreshed with your settings."
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="h-5 w-5 text-primary mr-2" />
              Cost Forecasting
            </CardTitle>
            <CardDescription>
              Predict future cloud costs based on historical trends
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Tabs defaultValue="forecast" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="forecast">Forecast</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="forecast">
              {forecastData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="py-2 px-4">
                        <CardTitle className="text-sm">Total Forecast</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 px-4">
                        <div className="text-2xl font-bold">${forecastData.totalForecast.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          Next {forecastOptions.months} month{forecastOptions.months > 1 ? 's' : ''}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="py-2 px-4">
                        <CardTitle className="text-sm">Monthly Average</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 px-4">
                        <div className="text-2xl font-bold">${forecastData.averageMonthly.toLocaleString()}</div>
                        <div className="flex items-center text-xs mt-1">
                          {trendPercentage > 0 ? (
                            <>
                              <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
                              <span className="text-red-500">{Math.abs(trendPercentage).toFixed(1)}% increase</span>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
                              <span className="text-green-500">{Math.abs(trendPercentage).toFixed(1)}% decrease</span>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="py-2 px-4">
                        <CardTitle className="text-sm">Confidence Range</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 px-4">
                        <div className="text-2xl font-bold">${forecastData.minEstimate.toLocaleString()} - ${forecastData.maxEstimate.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {forecastData.confidenceInterval}% confidence interval
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Cost Forecast Chart</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AreaChart
                        data={forecastData.forecastedCosts}
                        index="date"
                        categories={["amount"]}
                        colors={["indigo"]}
                        valueFormatter={(value) => `$${value.toLocaleString()}`}
                        className="h-[300px]"
                      />
                    </CardContent>
                  </Card>
                  
                  <div className="bg-muted p-3 rounded-md">
                    <div className="flex items-start">
                      <Zap className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium mb-1">Cost-saving projections</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {forecastOptions.includeRecommendations ? 
                            "This forecast includes potential savings from applying all optimization recommendations." : 
                            "This forecast does not include potential savings from optimization recommendations."}
                        </p>
                        <p className="text-sm">
                          {forecastOptions.includeRecommendations ?
                            "By applying all optimization recommendations, you could save approximately 15% on your cloud costs." :
                            "Enable optimization recommendations in settings to see potential savings."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p>No forecast data available. Please refresh or adjust settings.</p>
                  <Button onClick={handleRefreshForecast} className="mt-2">
                    Generate Forecast
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Forecast Parameters</CardTitle>
                  <CardDescription>
                    Adjust settings to customize your cost forecast
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Forecast Period</Label>
                        <span className="text-sm">{forecastOptions.months} month{forecastOptions.months > 1 ? 's' : ''}</span>
                      </div>
                      <Select 
                        value={forecastOptions.months.toString()} 
                        onValueChange={(value) => updateForecastOptions({ months: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select months" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 month</SelectItem>
                          <SelectItem value="3">3 months</SelectItem>
                          <SelectItem value="6">6 months</SelectItem>
                          <SelectItem value="12">12 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Confidence Interval</Label>
                        <span className="text-sm">{forecastOptions.confidenceInterval}%</span>
                      </div>
                      <Slider
                        value={[forecastOptions.confidenceInterval]}
                        min={50}
                        max={95}
                        step={5}
                        onValueChange={(values) => updateForecastOptions({ confidenceInterval: values[0] })}
                        className="py-4"
                      />
                      <p className="text-xs text-muted-foreground">
                        Higher values provide a wider range of potential outcomes but with more certainty.
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Include Optimization Recommendations</Label>
                        <div className="text-xs text-muted-foreground">
                          Apply projected savings from all recommendations
                        </div>
                      </div>
                      <Switch
                        checked={forecastOptions.includeRecommendations}
                        onCheckedChange={(checked) => updateForecastOptions({ includeRecommendations: checked })}
                      />
                    </div>
                    
                    <Button onClick={handleRefreshForecast} className="w-full">
                      Apply Settings & Generate Forecast
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default CostForecastPanel;
