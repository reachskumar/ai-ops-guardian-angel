
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Key, Clock, Users } from 'lucide-react';
import MFASetup from '@/components/auth/MFASetup';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import SessionTimeoutDialog from '@/components/auth/SessionTimeoutDialog';
import { useAuth } from '@/providers/AuthProvider';

const SecuritySettingsPage: React.FC = () => {
  const { signOut } = useAuth();
  const { showWarning, warningTimeLeft, extendSession, handleTimeout } = useSessionTimeout({
    timeoutDuration: 30 * 60 * 1000, // 30 minutes
    warningDuration: 5 * 60 * 1000,  // 5 minute warning
  });

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Security Settings</h1>
          <p className="text-muted-foreground">
            Manage your account security and authentication preferences
          </p>
        </div>

        <Tabs defaultValue="mfa" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="mfa" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              MFA
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Social Accounts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mfa">
            <MFASetup />
          </TabsContent>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Session Management
                </CardTitle>
                <CardDescription>
                  Configure session timeout and activity monitoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Session Timeout</h4>
                    <p className="text-sm text-muted-foreground">
                      Your session will automatically expire after 30 minutes of inactivity
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Activity Monitoring</h4>
                    <p className="text-sm text-muted-foreground">
                      We monitor mouse, keyboard, and scroll activity to keep your session active
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api-keys">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Keys
                </CardTitle>
                <CardDescription>
                  Manage API keys for programmatic access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  API key management functionality will be available in the IAM section.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Connected Accounts
                </CardTitle>
                <CardDescription>
                  Manage your connected social media accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View and manage accounts connected through Google, GitHub, and other providers.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <SessionTimeoutDialog
          isOpen={showWarning}
          onExtendSession={extendSession}
          onSignOut={handleTimeout}
          warningTimeLeft={warningTimeLeft}
        />
      </div>
    </ProtectedRoute>
  );
};

export default SecuritySettingsPage;
