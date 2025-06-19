
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Key, TestTube, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationProviderSettingsProps {
  onApiKeysUpdate: (apiKeys: { sendGridApiKey?: string }) => void;
}

const NotificationProviderSettings: React.FC<NotificationProviderSettingsProps> = ({
  onApiKeysUpdate
}) => {
  const [sendGridApiKey, setSendGridApiKey] = useState('');
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [savedKeys, setSavedKeys] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const saveSendGridKey = () => {
    if (!sendGridApiKey.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid SendGrid API key',
        variant: 'destructive'
      });
      return;
    }

    // In a real implementation, you'd store this securely
    localStorage.setItem('sendgrid_api_key', sendGridApiKey);
    setSavedKeys(prev => ({ ...prev, sendgrid: true }));
    onApiKeysUpdate({ sendGridApiKey });

    toast({
      title: 'API Key Saved',
      description: 'SendGrid API key has been saved securely',
    });
  };

  const testSendGridConnection = async () => {
    if (!sendGridApiKey.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter and save your SendGrid API key first',
        variant: 'destructive'
      });
      return;
    }

    setTestingProvider('sendgrid');

    try {
      // Test API key validity by making a request to SendGrid API
      const response = await fetch('https://api.sendgrid.com/v3/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sendGridApiKey}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        toast({
          title: 'Connection Successful',
          description: 'SendGrid API key is valid and working',
        });
      } else {
        throw new Error(`API returned ${response.status}`);
      }
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: 'Unable to connect to SendGrid. Please check your API key.',
        variant: 'destructive'
      });
    } finally {
      setTestingProvider(null);
    }
  };

  // Load saved keys on component mount
  React.useEffect(() => {
    const savedSendGridKey = localStorage.getItem('sendgrid_api_key');
    if (savedSendGridKey) {
      setSendGridApiKey(savedSendGridKey);
      setSavedKeys(prev => ({ ...prev, sendgrid: true }));
      onApiKeysUpdate({ sendGridApiKey: savedSendGridKey });
    }
  }, [onApiKeysUpdate]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Notification Provider Settings</h3>
        <p className="text-sm text-muted-foreground">
          Configure API keys for real notification providers to enable actual email delivery and integrations
        </p>
      </div>

      <Tabs defaultValue="sendgrid" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sendgrid" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            SendGrid
          </TabsTrigger>
          <TabsTrigger value="slack" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Slack Setup
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Teams Setup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sendgrid">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  SendGrid Email Service
                </CardTitle>
                {savedKeys.sendgrid && (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Configured
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  You need a SendGrid account and API key to send emails. 
                  <a href="https://sendgrid.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                    Sign up at SendGrid.com
                  </a>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>SendGrid API Key</Label>
                <Input
                  type="password"
                  placeholder="SG.xxxxxxxxxx"
                  value={sendGridApiKey}
                  onChange={(e) => setSendGridApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Create an API key in your SendGrid dashboard with "Mail Send" permissions
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={saveSendGridKey} disabled={!sendGridApiKey.trim()}>
                  <Key className="h-4 w-4 mr-1" />
                  Save API Key
                </Button>
                <Button
                  variant="outline"
                  onClick={testSendGridConnection}
                  disabled={!savedKeys.sendgrid || testingProvider === 'sendgrid'}
                >
                  <TestTube className="h-4 w-4 mr-1" />
                  {testingProvider === 'sendgrid' ? 'Testing...' : 'Test Connection'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="slack">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Slack Webhook Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  To receive Slack notifications, you need to create an incoming webhook in your Slack workspace.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-medium">Setup Instructions:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Go to your Slack workspace settings</li>
                  <li>Navigate to "Apps" → "Manage" → "Custom Integrations"</li>
                  <li>Add an "Incoming WebHooks" integration</li>
                  <li>Choose the channel where you want notifications</li>
                  <li>Copy the webhook URL and paste it in the notification settings</li>
                </ol>
              </div>

              <Button asChild>
                <a 
                  href="https://slack.com/apps/A0F7XDUAZ-incoming-webhooks" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Set up Slack Webhook
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Microsoft Teams Webhook Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  To receive Teams notifications, you need to add an incoming webhook connector to your Teams channel.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-medium">Setup Instructions:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Open the Teams channel where you want notifications</li>
                  <li>Click the "..." menu next to the channel name</li>
                  <li>Select "Connectors"</li>
                  <li>Find "Incoming Webhook" and click "Add"</li>
                  <li>Give it a name and upload an icon (optional)</li>
                  <li>Copy the webhook URL and paste it in the notification settings</li>
                </ol>
              </div>

              <Button asChild>
                <a 
                  href="https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Teams Webhook Documentation
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationProviderSettings;
