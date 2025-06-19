
import React from "react";
import { Helmet } from "react-helmet-async";
import { SidebarWithProvider } from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const LogsPage: React.FC = () => {
  return (
    <SidebarWithProvider>
      <Helmet>
        <title>Logs - AI Ops Guardian</title>
      </Helmet>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">System Logs</h1>
          <p className="text-muted-foreground">
            View and analyze system logs and events
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Logs</CardTitle>
            <CardDescription>
              Latest system events and application logs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Log viewer coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </SidebarWithProvider>
  );
};

export default LogsPage;
