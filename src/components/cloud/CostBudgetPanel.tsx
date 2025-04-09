
import React, { useState, useEffect } from 'react';
import { PlusCircle, AlertCircle, BellRing } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Budget, BudgetAlert, useBudget } from "@/hooks/cost/useBudget";

const CostBudgetPanel: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { budgets, activeBudget, setActiveBudget, loadBudgets, isLoading, saveOrUpdateBudget, budgetAlerts, setAlertStatus } = useBudget();
  const [newBudget, setNewBudget] = useState<Omit<Budget, 'id' | 'spent' | 'remaining' | 'percentUsed' | 'status'>>({
    name: '',
    amount: 0,
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
  });
  const { toast } = useToast();

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const handleCreateBudget = () => {
    if (!newBudget.name) {
      toast({
        title: "Validation Error",
        description: "Budget name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (newBudget.amount <= 0) {
      toast({
        title: "Validation Error",
        description: "Budget amount must be greater than zero",
        variant: "destructive"
      });
      return;
    }

    saveOrUpdateBudget(newBudget as any);
    setNewBudget({
      name: '',
      amount: 0,
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
    });
    setIsDialogOpen(false);
  };

  const getBadgeVariant = (status: Budget['status']) => {
    switch (status) {
      case 'under': return 'success';
      case 'near': return 'warning';
      case 'over': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Budget Management</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Budget
        </Button>
      </div>

      {budgets.length === 0 ? (
        <div className="bg-muted rounded-lg p-8 text-center space-y-4">
          <h3 className="text-lg font-medium">No budgets configured</h3>
          <p className="text-muted-foreground">Create a budget to track and manage your cloud spending</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Budget
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <Card key={budget.id} className="hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <div>
                  <CardTitle className="text-xl">{budget.name}</CardTitle>
                  <CardDescription>{budget.period} budget</CardDescription>
                </div>
                <Badge variant={getBadgeVariant(budget.status) as any}>
                  {budget.status === 'under' ? 'Under Budget' : 
                   budget.status === 'near' ? 'Near Limit' : 'Over Budget'}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Budget</span>
                    <span className="font-medium">${budget.amount.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Spent</span>
                    <span className="font-medium">${budget.spent.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className={`font-medium ${budget.status === 'over' ? 'text-destructive' : ''}`}>
                      ${budget.remaining.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        budget.status === 'under' ? 'bg-success' : 
                        budget.status === 'near' ? 'bg-warning' : 'bg-destructive'
                      }`}
                      style={{ width: `${Math.min(100, budget.percentUsed)}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-sm text-right">
                    {budget.percentUsed.toFixed(1)}% used
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 space-y-4">
        <h3 className="text-xl font-bold">Budget Alerts</h3>
        <p className="text-muted-foreground">Configure when to receive notifications about your budget usage</p>

        <div className="space-y-4">
          {budgetAlerts.map((alert, index) => (
            <Alert key={index}>
              <AlertCircle className="h-4 w-4" />
              <div className="flex w-full items-center justify-between">
                <div>
                  <AlertTitle>
                    {alert.threshold}% threshold {alert.enabled ? 'active' : 'inactive'}
                  </AlertTitle>
                  <AlertDescription>
                    You'll {alert.enabled ? '' : 'not '} receive a notification when your spending reaches {alert.threshold}% of your budget
                  </AlertDescription>
                </div>
                <Button
                  variant={alert.enabled ? "outline" : "default"}
                  onClick={() => setAlertStatus(index, !alert.enabled)}
                >
                  {alert.enabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </Alert>
          ))}
        </div>
      </div>

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
                onValueChange={(value: 'monthly' | 'quarterly' | 'annual') => setNewBudget({...newBudget, period: value})}
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
    </div>
  );
};

export default CostBudgetPanel;
