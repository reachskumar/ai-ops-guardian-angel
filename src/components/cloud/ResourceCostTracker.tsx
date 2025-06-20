
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CloudResource } from '@/services/cloud/types';
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ResourceCostTrackerProps {
  resource: CloudResource;
}

const ResourceCostTracker: React.FC<ResourceCostTrackerProps> = ({ resource }) => {
  // Mock cost data - in a real app, this would come from your cost tracking service
  const costData = [
    { date: '2024-01-01', cost: 15.20 },
    { date: '2024-01-02', cost: 16.45 },
    { date: '2024-01-03', cost: 14.80 },
    { date: '2024-01-04', cost: 17.30 },
    { date: '2024-01-05', cost: 18.90 },
    { date: '2024-01-06', cost: 16.20 },
    { date: '2024-01-07', cost: 15.75 },
  ];

  const dailyCost = resource.cost_per_day || 15.50;
  const monthlyCost = dailyCost * 30;
  const yearlyProjection = monthlyCost * 12;

  return (
    <div className="space-y-6">
      {/* Cost Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dailyCost.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +2.5% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Est.</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyCost.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              -1.2% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yearly Projection</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${yearlyProjection.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">
              Based on current usage
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Trend (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value) => [`$${value}`, 'Cost']}
              />
              <Line 
                type="monotone" 
                dataKey="cost" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ fill: '#8884d8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Compute</span>
              <span className="text-sm font-medium">${(dailyCost * 0.6).toFixed(2)}/day</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Storage</span>
              <span className="text-sm font-medium">${(dailyCost * 0.25).toFixed(2)}/day</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Network</span>
              <span className="text-sm font-medium">${(dailyCost * 0.15).toFixed(2)}/day</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceCostTracker;
