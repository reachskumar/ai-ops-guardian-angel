
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Bell } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { 
  ProvisioningRequest, 
  ApprovalWorkflow, 
  AuditLog 
} from './provisioning';
import SecureNotificationSettings from './provisioning/SecureNotificationSettings';
import DashboardOverview from './provisioning/DashboardOverview';
import TemplatesTab from './provisioning/TemplatesTab';
import SettingsTab from './provisioning/SettingsTab';
import { useProvisioningState } from './provisioning/useProvisioningState';
import { useProvisioningActions } from './provisioning/useProvisioningActions';
import { type SecureNotificationChannel } from '@/services/secureProvisioningService';

const EnhancedResourceProvisioner: React.FC = () => {
  const { user, loading, permissions } = useAuth();
  
  const {
    provisioningRequests,
    setProvisioningRequests,
    auditEntries,
    setAuditEntries,
    budgetRemaining,
    quotaStatus,
    notifications
  } = useProvisioningState();

  const [notificationChannels, setNotificationChannels] = useState<SecureNotificationChannel[]>([
    {
      type: 'email',
      enabled: true,
      config: {
        email: {
          recipients: ['admin@company.com', 'devops@company.com']
        }
      }
    },
    {
      type: 'slack',
      enabled: true,
      config: {
        slack: {
          webhookUrl: 'https://hooks.slack.com/services/...',
          channel: '#devops'
        }
      }
    },
    {
      type: 'teams',
      enabled: false,
      config: {
        teams: {
          webhookUrl: ''
        }
      }
    },
    {
      type: 'webhook',
      enabled: false,
      config: {
        webhook: {
          url: ''
        }
      }
    }
  ]);

  const {
    handleProvisioningRequest,
    handleApproval,
    handleRejection,
    handleExportAudit,
    currentUser
  } = useProvisioningActions(
    provisioningRequests,
    setProvisioningRequests,
    setAuditEntries,
    notificationChannels
  );

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show authentication required message for unauthenticated users
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-muted-foreground">Please sign in to access the provisioning system.</p>
        </div>
      </div>
    );
  }

  // Show permission denied for users without proper access (viewers don't have access)
  if (!permissions.canEdit) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground">You need developer access or higher to use the provisioning system.</p>
        </div>
      </div>
    );
  }

  const pendingApprovals = provisioningRequests.filter(r => r.status === 'pending').length;
  const activeResources = Object.values(quotaStatus).reduce((sum, quota) => sum + quota.used, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Resource Provisioning</h2>
          <p className="text-muted-foreground">
            Enterprise-grade cloud resource provisioning with approval workflows and compliance
          </p>
        </div>
        
        {notifications.length > 0 && (
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-1" />
            {notifications.length} Notification{notifications.length > 1 ? 's' : ''}
          </Button>
        )}
      </div>

      <DashboardOverview
        pendingApprovals={pendingApprovals}
        budgetRemaining={budgetRemaining}
        activeResources={activeResources}
      />

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Logged in as <strong>{currentUser.name}</strong> with <strong>{currentUser.role}</strong> privileges.
          All actions are authenticated and logged for security compliance.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="provision" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="provision">Provision</TabsTrigger>
          <TabsTrigger value="approvals">
            Approvals
            {pendingApprovals > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingApprovals}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="provision">
          <ProvisioningRequest
            onSubmit={handleProvisioningRequest}
            userRole={currentUser.role}
            budgetRemaining={budgetRemaining}
            quotaStatus={quotaStatus}
          />
        </TabsContent>

        <TabsContent value="approvals">
          <ApprovalWorkflow
            requests={provisioningRequests}
            userRole={currentUser.role}
            onApprove={handleApproval}
            onReject={handleRejection}
          />
        </TabsContent>

        <TabsContent value="templates">
          <TemplatesTab />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLog
            entries={auditEntries}
            onExport={(format) => handleExportAudit(format, auditEntries)}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Secure Notification Channels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SecureNotificationSettings
                channels={notificationChannels}
                onUpdateChannels={setNotificationChannels}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedResourceProvisioner;
