
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";
import { Filter, Clock, Tag, Users, BarChart3, Calendar } from "lucide-react";
import { useCostBreakdown } from "@/hooks/cost";

interface HistoricalComparison {
  currentPeriod: {
    startDate: string;
    endDate: string;
    totalCost: number;
  };
  previousPeriod: {
    startDate: string;
    endDate: string;
    totalCost: number;
  };
  change: number;
  changePercentage: number;
  costByDay: {
    date: string;
    currentPeriodCost: number;
    previousPeriodCost: number;
  }[];
}

const CostBreakdownPanel: React.FC = () => {
  const {
    tagCosts,
    teamCosts,
    historicalData,
    isLoading,
    timeRange,
    setTimeRange,
    breakdownType,
    setBreakdownType
  } = useCostBreakdown();
  
  const [activeTab, setActiveTab] = useState("historical");
  const [historicalComparison, setHistoricalComparison] = useState<HistoricalComparison | null>(null);

  // Transform historicalData into historicalComparison format
  useEffect(() => {
    if (historicalData && historicalData.length > 0) {
      // Mock data for now - in real implementation, this would be computed from historicalData
      setHistoricalComparison({
        currentPeriod: {
          startDate: "2023-04-01",
          endDate: "2023-04-30",
          totalCost: 4250.75
        },
        previousPeriod: {
          startDate: "2023-03-01",
          endDate: "2023-03-31",
          totalCost: 3980.25
        },
        change: 270.50,
        changePercentage: 6.8,
        costByDay: historicalData.map(item => ({
          date: item.date,
          currentPeriodCost: item.currentCost || 0,
          previousPeriodCost: item.previousCost || 0
        }))
      });
    }
  }, [historicalData]);

  // Function to load all breakdown data
  const loadAllBreakdowns = () => {
    // This would normally be implemented in the hook
    console.log("Loading all breakdowns for timeRange:", timeRange);
  };

  useEffect(() => {
    loadAllBreakdowns();
  }, [timeRange]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center">
              <BarChart3 className="h-5 w-5 text-primary mr-2" />
              Cost Breakdown & Analysis
            </CardTitle>
            <CardDescription>
              Analyze trends and cost distribution across tags and teams
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={(value: "7d" | "30d" | "90d") => setTimeRange(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="historical">Historical</TabsTrigger>
              <TabsTrigger value="tags">Tags</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
            </TabsList>
            
            <TabsContent value="historical">
              {historicalComparison ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="py-2 px-4">
                        <CardTitle className="text-sm flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Current Period
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {historicalComparison.currentPeriod.startDate} to {historicalComparison.currentPeriod.endDate}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="py-2 px-4">
                        <div className="text-2xl font-bold">
                          ${historicalComparison.currentPeriod.totalCost.toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="py-2 px-4">
                        <CardTitle className="text-sm flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Previous Period
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {historicalComparison.previousPeriod.startDate} to {historicalComparison.previousPeriod.endDate}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="py-2 px-4">
                        <div className="text-2xl font-bold">
                          ${historicalComparison.previousPeriod.totalCost.toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="py-2 px-4">
                        <CardTitle className="text-sm">Change</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 px-4">
                        <div className={`text-2xl font-bold ${
                          historicalComparison.change > 0 ? 'text-red-500' : 'text-green-500'
                        }`}>
                          {historicalComparison.change > 0 ? '+' : ''}
                          {historicalComparison.changePercentage}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${Math.abs(historicalComparison.change).toLocaleString()}
                          {historicalComparison.change > 0 ? ' increase' : ' decrease'}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Period Comparison</CardTitle>
                      <CardDescription>
                        Daily cost comparison between current and previous period
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <LineChart
                        data={historicalComparison.costByDay}
                        index="date"
                        categories={["currentPeriodCost", "previousPeriodCost"]}
                        colors={["blue", "gray"]}
                        valueFormatter={(value) => `$${value}`}
                        className="h-[300px]"
                      />
                    </CardContent>
                  </Card>
                  
                  <div className="bg-muted/40 border rounded-md p-4 flex items-start">
                    <div className="bg-primary/10 p-2 rounded mr-3">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Cost Trend Analysis</h3>
                      <p className="text-sm text-muted-foreground">
                        {historicalComparison.changePercentage > 0 ? 
                          `Your costs have increased by ${historicalComparison.changePercentage}% compared to the previous period.` : 
                          `Your costs have decreased by ${Math.abs(historicalComparison.changePercentage)}% compared to the previous period.`}
                        {' '}Consider investigating the services with the highest changes to understand what's driving this trend.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p>No historical comparison data available</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="tags">
              {tagCosts.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                          <Tag className="h-4 w-4 mr-1" />
                          Cost by Environment
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <PieChart
                          data={tagCosts
                            .filter(tag => tag.tagKey === "environment")
                            .sort((a, b) => b.cost - a.cost)}
                          category="cost"
                          index="tagValue"
                          colors={["blue", "green", "yellow", "purple", "red"]}
                          valueFormatter={(value) => `$${value.toLocaleString()}`}
                          className="h-[220px]"
                        />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                          <Tag className="h-4 w-4 mr-1" />
                          Cost by Department
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <PieChart
                          data={tagCosts
                            .filter(tag => tag.tagKey === "department")
                            .sort((a, b) => b.cost - a.cost)}
                          category="cost"
                          index="tagValue"
                          colors={["blue", "green", "yellow"]}
                          valueFormatter={(value) => `$${value.toLocaleString()}`}
                          className="h-[220px]"
                        />
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center">
                        <Tag className="h-4 w-4 mr-1" />
                        Cost by Project
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BarChart
                        data={tagCosts
                          .filter(tag => tag.tagKey === "project")
                          .sort((a, b) => b.cost - a.cost)}
                        index="tagValue"
                        categories={["cost"]}
                        colors={["blue"]}
                        valueFormatter={(value) => `$${value.toLocaleString()}`}
                        className="h-[300px]"
                      />
                    </CardContent>
                  </Card>
                  
                  <div className="bg-muted p-3 rounded-md">
                    <h3 className="font-medium text-sm mb-2">Top Cost-Driving Tags</h3>
                    <div className="space-y-2">
                      {tagCosts
                        .sort((a, b) => b.cost - a.cost)
                        .slice(0, 3)
                        .map((tag, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Tag className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                              <span>{tag.tagKey}: {tag.tagValue}</span>
                            </div>
                            <div>
                              <span className="font-medium">${tag.cost.toLocaleString()}</span>
                              <span className="text-muted-foreground text-xs ml-1">({tag.percentage}%)</span>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p>No tag cost data available</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="teams">
              {teamCosts.length > 0 ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        Cost by Team
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BarChart
                        data={teamCosts.sort((a, b) => b.cost - a.cost)}
                        index="teamName"
                        categories={["cost"]}
                        colors={["indigo"]}
                        valueFormatter={(value) => `$${value.toLocaleString()}`}
                        className="h-[300px]"
                      />
                    </CardContent>
                  </Card>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Team Cost Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <PieChart
                          data={teamCosts.sort((a, b) => b.cost - a.cost)}
                          category="cost"
                          index="teamName"
                          colors={["blue", "indigo", "purple", "pink", "red"]}
                          valueFormatter={(value) => `$${value.toLocaleString()}`}
                          className="h-[220px]"
                        />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Resources by Team</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <PieChart
                          data={teamCosts}
                          category="resources"
                          index="teamName"
                          colors={["blue", "indigo", "purple", "pink", "red"]}
                          valueFormatter={(value) => `${value} resources`}
                          className="h-[220px]"
                        />
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-medium mb-3">Team Cost Analysis</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 text-sm font-medium pb-1 border-b">
                        <div>Team</div>
                        <div>Cost</div>
                        <div>Cost per Resource</div>
                      </div>
                      {teamCosts
                        .sort((a, b) => b.cost - a.cost)
                        .map((team, index) => (
                          <div key={index} className="grid grid-cols-3 text-sm">
                            <div>{team.teamName}</div>
                            <div>${team.cost.toLocaleString()}</div>
                            <div>${(team.cost / (team.resources || 1)).toFixed(2)}</div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p>No team cost data available</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default CostBreakdownPanel;
