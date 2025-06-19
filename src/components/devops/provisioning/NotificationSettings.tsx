
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  MessageSquare, 
  Users, 
  Webhook,
  TestTube,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { NotificationChannel } from '@/services/provisioningNotificationService';

interface NotificationSettingsProps {
  channels: NotificationChannel[];
  onUpdateChannels: (channels: NotificationChannel[]) => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  channels,
  onUpdateChannels
}) => {
  const [testingChannel, setTestingChannel] = useState<string | null>(null);
  const { toast } = useToast();

  const updateChannel = (type: 'email' | 'slack' | 'teams' | 'webhook', updates: Partial<NotificationChannel>) => {
    const updatedChannels = channels.map(channel =>
      channel.type === type ? { ...channel, ...updates } : channel
    );
    onUpdateChannels(updatedChannels);
  };

  const testNotification = async (channelType: string) => {
    setTestingChannel(channelType);
    
    // Simulate testing the notification channel
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: 'Test Notification Sent',
      description: `Successfully sent test notification to ${channelType}`,
    });
    
    setTestingChannel(null);
  };

  const getChannel = (type: 'email' | 'slack' | 'teams' | 'webhook') => {
    return channels.find(c => c.type === type) || {
      type,
      enabled: false,
      config: {}
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Notification Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure how you want to receive provisioning updates and approval notifications
        </p>
      </div>

      <Tabs defaultValue="email" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="slack" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Slack
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="webhook" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhook
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Notifications
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={getChannel('email').enabled}
                    onCheckedChange={(enabled) => updateChannel('email', { enabled })}
                  />
                  {getChannel('email').enabled && (
                    <Badge variant="default" className="bg-green-500">Active</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Recipients (comma-separated)</Label>
                <Input
                  placeholder="admin@company.com, devops@company.com"
                  value={getChannel('email').config.email?.recipients?.join(', ') || ''}
                  onChange={(e) => updateChannel('email', {
                    config: {
                      ...getChannel('email').config,
                      email: {
                        recipients: e.target.value.split(',').map(email => email.trim()).filter(Boolean)
                      }
                    }
                  })}
                  disabled={!getChannel('email').enabled}
                />
              </div>
              
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Email notifications will be sent for approval requests, status updates, and completion notifications.
                </AlertDescription>
              </Alert>

              <Button
                variant="outline"
                size="sm"
                onClick={() => testNotification('email')}
                disabled={!getChannel('email').enabled || testingChannel === 'email'}
              >
                <TestTube className="h-4 w-4 mr-1" />
                {testingChannel === 'email' ? 'Testing...' : 'Test Email'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="slack">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Slack Integration
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={getChannel('slack').enabled}
                    onCheckedChange={(enabled) => updateChannel('slack', { enabled })}
                  />
                  {getChannel('slack').enabled && (
                    <Badge variant="default" className="bg-green-500">Active</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input
                  placeholder="https://hooks.slack.com/services/..."
                  value={getChannel('slack').config.slack?.webhookUrl || ''}
                  onChange={(e) => updateChannel('slack', {
                    config: {
                      ...getChannel('slack').config,
                      slack: {
                        ...getChannel('slack').config.slack,
                        webhookUrl: e.target.value
                      }
                    }
                  })}
                  disabled={!getChannel('slack').enabled}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Channel</Label>
                <Input
                  placeholder="#devops"
                  value={getChannel('slack').config.slack?.channel || ''}
                  onChange={(e) => updateChannel('slack', {
                    config: {
                      ...getChannel('slack').config,
                      slack: {
                        ...getChannel('slack').config.slack,
                        channel: e.target.value
                      }
                    }
                  })}
                  disabled={!getChannel('slack').enabled}
                />
              </div>

              <Alert>
                <MessageSquare className="h-4 w-4" />
                <AlertDescription>
                  Create a Slack webhook in your workspace and paste the URL above. Messages will include rich formatting with action buttons.
                </AlertDescription>
              </Alert>

              <Button
                variant="outline"
                size="sm"
                onClick={() => testNotification('slack')}
                disabled={!getChannel('slack').enabled || testingChannel === 'slack'}
              >
                <TestTube className="h-4 w-4 mr-1" />
                {testingChannel === 'slack' ? 'Testing...' : 'Test Slack'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Microsoft Teams
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={getChannel('teams').enabled}
                    onCheckedChange={(enabled) => updateChannel('teams', { enabled })}
                  />
                  {getChannel('teams').enabled && (
                    <Badge variant="default" className="bg-green-500">Active</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input
                  placeholder="https://outlook.office.com/webhook/..."
                  value={getChannel('teams').config.teams?.webhookUrl || ''}
                  onChange={(e) => updateChannel('teams', {
                    config: {
                      ...getChannel('teams').config,
                      teams: {
                        webhookUrl: e.target.value
                      }
                    }
                  })}
                  disabled={!getChannel('teams').enabled}
                />
              </div>

              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  Configure an incoming webhook connector in your Teams channel and paste the URL above.
                </AlertDescription>
              </Alert>

              <Button
                variant="outline"
                size="sm"
                onClick={() => testNotification('teams')}
                disabled={!getChannel('teams').enabled || testingChannel === 'teams'}
              >
                <TestTube className="h-4 w-4 mr-1" />
                {testingChannel === 'teams' ? 'Testing...' : 'Test Teams'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhook">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  Custom Webhook
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={getChannel('webhook').enabled}
                    onCheckedChange={(enabled) => updateChannel('webhook', { enabled })}
                  />
                  {getChannel('webhook').enabled && (
                    <Badge variant="default" className="bg-green-500">Active</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input
                  placeholder="https://your-api.com/webhook"
                  value={getChannel('webhook').config.webhook?.url || ''}
                  onChange={(e) => updateChannel('webhook', {
                    config: {
                      ...getChannel('webhook').config,
                      webhook: {
                        ...getChannel('webhook').config.webhook,
                        url: e.target.value
                      }
                    }
                  })}
                  disabled={!getChannel('webhook').enabled}
                />
              </div>

              <Alert>
                <Webhook className="h-4 w-4" />
                <AlertDescription>
                  Webhook will receive POST requests with JSON payload containing event type, request details, and timestamp.
                </AlertDescription>
              </Alert>

              <Button
                variant="outline"
                size="sm"
                onClick={() => testNotification('webhook')}
                disabled={!getChannel('webhook').enabled || testingChannel === 'webhook'}
              >
                <TestTube className="h-4 w-4 mr-1" />
                {testingChannel === 'webhook' ? 'Testing...' : 'Test Webhook'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationSettings;
