
import React from "react";
import { Helmet } from "react-helmet-async";
import { SidebarWithProvider } from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ReportsPage: React.FC = () => {
  return (
    <SidebarWithProvider>
      <Helmet>
        <title>Reports - AI Ops Guardian</title>
      </Helmet>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Reports</h1>
          <p className="text-muted-foreground">
            Generate and view infrastructure reports and analytics
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Infrastructure Reports</CardTitle>
            <CardDescription>
              Comprehensive reports on your infrastructure performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Reports dashboard coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </SidebarWithProvider>
  );
};

export default ReportsPage;
