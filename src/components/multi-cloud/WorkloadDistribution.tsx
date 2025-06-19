
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CloudResource, CloudAccount } from '@/services/cloud/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Cpu, DollarSign, Zap, TrendingUp } from 'lucide-react';

interface WorkloadDistributionProps {
  resources: CloudResource[];
  accounts: CloudAccount[];
}

const WorkloadDistribution: React.FC<WorkloadDistributionProps> = ({ resources, accounts }) => {
  const distributionData = [
    { provider: 'AWS', workload: 45, cost: 2340, performance: 92 },
    { provider: 'Azure', workload: 35, cost: 1890, performance: 88 },
    { provider: 'GCP', workload: 20, cost: 1200, performance: 95 }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workload Balance</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Optimized</div>
            <p className="text-xs text-muted-foreground">Load distribution score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Efficiency</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">Compared to single-cloud</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">Average performance score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-scaling Events</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workload Distribution by Provider</CardTitle>
          <CardDescription>Current distribution of workloads across cloud providers</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="provider" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="workload" fill="#8884d8" name="Workload %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Intelligent Placement</CardTitle>
            <CardDescription>AI-driven workload placement recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Database Workload</h4>
                  <Badge variant="default">Recommendation</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Move to GCP Cloud SQL for 23% cost reduction
                </p>
                <Progress value={75} className="h-2" />
                <div className="flex justify-between text-xs mt-1">
                  <span>Confidence: 75%</span>
                  <span>Savings: $340/mo</span>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Compute Workload</h4>
                  <Badge variant="secondary">Under Review</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Consider Azure for better regional performance
                </p>
                <Progress value={60} className="h-2" />
                <div className="flex justify-between text-xs mt-1">
                  <span>Confidence: 60%</span>
                  <span>Latency: -15ms</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auto-scaling Configuration</CardTitle>
            <CardDescription>Cross-cloud scaling policies and triggers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">CPU Threshold</span>
                  <span className="text-sm">75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Memory Threshold</span>
                  <span className="text-sm">80%</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Network I/O</span>
                  <span className="text-sm">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Scaling Policies</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Min Instances</span>
                    <span>2</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Instances</span>
                    <span>10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Scale-out Cooldown</span>
                    <span>5 min</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkloadDistribution;
