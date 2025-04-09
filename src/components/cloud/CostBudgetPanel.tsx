
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useBudget } from "@/hooks/cost";
import { PlusCircle, AlertCircle, Bell, Calendar, DollarSign, Tag, BarChart3, Settings } from "lucide-react";

const CostBudgetPanel: React.FC = () => {
  const {
    budgets,
    activeBudget,
    setActiveBudget,
    isLoading,
    loadBudgets,
    saveOrUpdateBudget,
    budgetAlerts,
    setAlertStatus
  } = useBudget();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({
    name: '',
    amount: 0,
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const handleCreateBudget = () => {
    saveOrUpdateBudget(newBudget);
    setIsDialogOpen(false);
  };

  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case 'over': return 'bg-red-500';
      case 'near': return 'bg-yellow-500';
      case 'under': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center">
              <DollarSign className="h-5 w-5 text-primary mr-2" />
              Budget Management
            </CardTitle>
            <CardDescription>
              Track and manage cloud spending budgets
            </CardDescription>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} size="sm">
            <PlusCircle className="h-4 w-4 mr-1" />
            New Budget
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
              <DollarSign className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium mb-2">No budgets defined</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Set up budgets to track and manage your cloud spending
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>Create Budget</Button>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {budgets.map((budget) => (
                    <Card 
                      key={budget.id}
                      className={`cursor-pointer border-2 ${activeBudget?.id === budget.id ? 'border-primary' : 'border-border'}`}
                      onClick={() => setActiveBudget(budget)}
                    >
                      <CardContent className="p-3">
                        <div className="font-medium truncate" title={budget.name}>
                          {budget.name}
                        </div>
                        <div className="flex items-baseline mt-1">
                          <span className="text-lg font-bold">${budget.spent.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground ml-1">/ ${budget.amount.toLocaleString()}</span>
                        </div>
                        <Progress 
                          value={budget.percentUsed} 
                          className={`h-2 mt-2 ${getBudgetStatusColor(budget.status)}`} 
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {activeBudget && (
                  <Card className="mt-4">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{activeBudget.name}</CardTitle>
                      <CardDescription>
                        {activeBudget.period.charAt(0).toUpperCase() + activeBudget.period.slice(1)} budget
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-sm text-muted-foreground">Budget Amount</div>
                            <div className="text-2xl font-bold">${activeBudget.amount.toLocaleString()}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Time Period</div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{activeBudget.startDate} - {activeBudget.endDate || 'Ongoing'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-muted p-3 rounded-md">
                          <div className="flex justify-between mb-1">
                            <div className="text-sm font-medium">Budget Usage</div>
                            <div className="text-sm font-medium">{activeBudget.percentUsed}%</div>
                          </div>
                          <Progress 
                            value={activeBudget.percentUsed} 
                            className={`h-2.5 ${getBudgetStatusColor(activeBudget.status)}`} 
                          />
                          <div className="flex justify-between items-center mt-3">
                            <div>
                              <div className="text-sm text-muted-foreground">Spent</div>
                              <div className="font-medium">${activeBudget.spent.toLocaleString()}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">Remaining</div>
                              <div className={`font-medium ${activeBudget.remaining < 0 ? 'text-red-500' : ''}`}>
                                ${activeBudget.remaining.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {activeBudget.services && activeBudget.services.length > 0 && (
                          <div>
                            <div className="text-sm font-medium mb-2">Services Tracked</div>
                            <div className="flex flex-wrap gap-1">
                              {activeBudget.services.map((service) => (
                                <div key={service} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                                  {service}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {activeBudget.tags && Object.keys(activeBudget.tags).length > 0 && (
                          <div>
                            <div className="text-sm font-medium mb-2">Tags</div>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(activeBudget.tags).map(([key, value]) => (
                                <div key={key} className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs">
                                  {key}: {value}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="details">
              {activeBudget ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Budget Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium mb-2">Settings</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Budget Name</span>
                              <span className="text-sm font-medium">{activeBudget.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Amount</span>
                              <span className="text-sm font-medium">${activeBudget.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Period</span>
                              <span className="text-sm font-medium">{activeBudget.period}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Status</span>
                              <span className={`text-sm font-medium ${
                                activeBudget.status === 'over' ? 'text-red-500' : 
                                activeBudget.status === 'near' ? 'text-yellow-500' : 'text-green-500'
                              }`}>
                                {activeBudget.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium mb-2">Timeline</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Start Date</span>
                              <span className="text-sm font-medium">{activeBudget.startDate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">End Date</span>
                              <span className="text-sm font-medium">{activeBudget.endDate || 'Ongoing'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Days Remaining</span>
                              <span className="text-sm font-medium">
                                {activeBudget.endDate ? 
                                  Math.max(0, Math.floor((new Date(activeBudget.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 
                                  'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="flex justify-end">
                    <Button variant="outline" className="mr-2">Edit Budget</Button>
                    <Button variant="destructive">Delete Budget</Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p>Select a budget to view details</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="alerts">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <Bell className="h-4 w-4 mr-1" />
                      Budget Alert Settings
                    </CardTitle>
                    <CardDescription>
                      Get notified when your budget reaches certain thresholds
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {budgetAlerts.map((alert, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`h-2 w-2 rounded-full mr-2 ${
                              alert.threshold >= 100 ? 'bg-red-500' : 
                              alert.threshold >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}></div>
                            <div>
                              <div className="font-medium">
                                {alert.threshold}% of budget reached
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {alert.type === 'notification' ? 'Browser notification' : alert.type}
                              </div>
                            </div>
                          </div>
                          <Switch
                            checked={alert.enabled}
                            onCheckedChange={(checked) => setAlertStatus(index, checked)}
                          />
                        </div>
                      ))}
                      
                      <Button variant="outline" className="w-full mt-2" size="sm">
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Add Alert
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {activeBudget && activeBudget.status === 'over' && (
                  <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Budget exceeded</p>
                      <p className="text-sm">
                        Your {activeBudget.name} budget has exceeded its limit by ${Math.abs(activeBudget.remaining).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                
                {activeBudget && activeBudget.status === 'near' && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-md flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Budget almost reached</p>
                      <p className="text-sm">
                        Your {activeBudget.name} budget is at {activeBudget.percentUsed}% with ${activeBudget.remaining.toLocaleString()} remaining
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>

      {/* New Budget Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Budget</DialogTitle>
            <DialogDescription>
              Set up a budget to track and manage your cloud spending.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                className="col-span-3"
                value={newBudget.name}
                onChange={(e) => setNewBudget({...newBudget, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount ($)
              </Label>
              <Input
                id="amount"
                type="number"
                className="col-span-3"
                value={newBudget.amount}
                onChange={(e) => setNewBudget({...newBudget, amount: parseFloat(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="period" className="text-right">
                Period
              </Label>
              <Select 
                value={newBudget.period} 
                onValueChange={(value) => setNewBudget({...newBudget, period: value as 'monthly' | 'quarterly' | 'annual'})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                className="col-span-3"
                value={newBudget.startDate}
                onChange={(e) => setNewBudget({...newBudget, startDate: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleCreateBudget}>
              Create Budget
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CostBudgetPanel;
