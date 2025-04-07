
import React, { useState } from "react";
import { SidebarWithProvider } from "@/components/Sidebar";
import Header from "@/components/Header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";

import { AnalyticsHeader } from "@/components/analytics";
import { 
  PerformanceTab, 
  CostAnalysisTab, 
  UsagePatternsTab, 
  ErrorsLogsTab 
} from "@/components/analytics/tabs";

const AnalyticsPage: React.FC = () => {
  // Set up default date range for last 7 days
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  return (
    <SidebarWithProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 p-6">
          <AnalyticsHeader 
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />

          <Tabs defaultValue="performance">
            <TabsList className="mb-6">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="cost">Cost Analysis</TabsTrigger>
              <TabsTrigger value="usage">Usage Patterns</TabsTrigger>
              <TabsTrigger value="errors">Errors & Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="performance">
              <PerformanceTab />
            </TabsContent>

            <TabsContent value="cost">
              <CostAnalysisTab />
            </TabsContent>

            <TabsContent value="usage">
              <UsagePatternsTab />
            </TabsContent>

            <TabsContent value="errors">
              <ErrorsLogsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SidebarWithProvider>
  );
};

export default AnalyticsPage;
