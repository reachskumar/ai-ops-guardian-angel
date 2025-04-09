
import React from 'react';
import { SidebarWithProvider } from '@/components/Sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CostAnalysisPanel from '@/components/cloud/CostAnalysisPanel';
import CostBudgetPanel from '@/components/cloud/CostBudgetPanel';
import CostForecastPanel from '@/components/cloud/CostForecastPanel';
import CostBreakdownPanel from '@/components/cloud/CostBreakdownPanel';
import OpenSourceCostTools from '@/components/cloud/OpenSourceCostTools';

const CostAnalysisPage: React.FC = () => {
  return (
    <SidebarWithProvider>
      <div className="container mx-auto py-6 px-4 space-y-6">
        <h1 className="text-3xl font-bold mb-4">Cloud Cost Management</h1>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview & Optimization</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
            <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <CostAnalysisPanel />
            <OpenSourceCostTools />
          </TabsContent>
          
          <TabsContent value="budgets" className="space-y-6">
            <CostBudgetPanel />
          </TabsContent>
          
          <TabsContent value="forecasting" className="space-y-6">
            <CostForecastPanel />
          </TabsContent>
          
          <TabsContent value="breakdown" className="space-y-6">
            <CostBreakdownPanel />
          </TabsContent>
        </Tabs>
      </div>
    </SidebarWithProvider>
  );
};

export default CostAnalysisPage;
