
import React from "react";
import { Helmet } from "react-helmet-async";
import { SidebarWithProvider } from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SettingsPage: React.FC = () => {
  return (
    <SidebarWithProvider>
      <Helmet>
        <title>Settings - AI Ops Guardian</title>
      </Helmet>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Configure your preferences and system settings
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Manage your general application settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Settings panel coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </SidebarWithProvider>
  );
};

export default SettingsPage;
