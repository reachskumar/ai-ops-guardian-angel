
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  GitBranch, 
  GitCommit, 
  GitMerge, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock,
  Settings,
  Webhook,
  Shield,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Pipeline {
  id: string;
  name: string;
  status: 'running' | 'success' | 'failed' | 'pending';
  branch: string;
  commit: string;
  author: string;
  duration: string;
  timestamp: string;
}

const GitOpsWorkflow: React.FC = () => {
  const [pipelines] = useState<Pipeline[]>([
    {
      id: '1',
      name: 'Production Deploy',
      status: 'success',
      branch: 'main',
      commit: 'abc123f',
      author: 'john.doe',
      duration: '4m 32s',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      name: 'Staging Deploy',
      status: 'running',
      branch: 'develop',
      commit: 'def456a',
      author: 'jane.smith',
      duration: '2m 15s',
      timestamp: '10 minutes ago'
    },
    {
      id: '3',
      name: 'Feature Branch',
      status: 'failed',
      branch: 'feature/new-vpc',
      commit: 'ghi789b',
      author: 'bob.wilson',
      duration: '1m 45s',
      timestamp: '1 hour ago'
    }
  ]);

  const [repoUrl, setRepoUrl] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [autoApprove, setAutoApprove] = useState(false);
  const { toast } = useToast();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const triggerPipeline = (pipelineId: string) => {
    toast({
      title: 'Pipeline Triggered',
      description: `Pipeline ${pipelineId} has been manually triggered`,
    });
  };

  const saveConfiguration = () => {
    toast({
      title: 'Configuration Saved',
      description: 'GitOps workflow configuration has been saved',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">GitOps Workflow Integration</h2>
        <Badge variant="outline">CI/CD Pipeline</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="repo-url">Repository URL</Label>
              <Input
                id="repo-url"
                placeholder="https://github.com/user/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://your-webhook-url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="auto-approve">Auto-approve deployments</Label>
              <Switch
                id="auto-approve"
                checked={autoApprove}
                onCheckedChange={setAutoApprove}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Trigger Events</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Switch defaultChecked />
                  <span>Push to main branch</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch defaultChecked />
                  <span>Pull request merge</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch />
                  <span>Manual trigger</span>
                </div>
              </div>
            </div>

            <Button onClick={saveConfiguration} className="w-full">
              <Settings className="mr-2 h-4 w-4" />
              Save Configuration
            </Button>
          </CardContent>
        </Card>

        {/* Pipeline Status */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pipelines.map((pipeline) => (
                  <div
                    key={pipeline.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon(pipeline.status)}
                      <div>
                        <div className="font-medium">{pipeline.name}</div>
                        <div className="text-sm text-muted-foreground">
                          <GitBranch className="inline h-3 w-3 mr-1" />
                          {pipeline.branch} • {pipeline.commit} • {pipeline.author}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-sm">
                        <div>{pipeline.duration}</div>
                        <div className="text-muted-foreground">{pipeline.timestamp}</div>
                      </div>
                      <Badge className={getStatusColor(pipeline.status)}>
                        {pipeline.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => triggerPipeline(pipeline.id)}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <GitCommit className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium">Code Commit</h4>
              <p className="text-sm text-muted-foreground">Push to repository</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield className="h-6 w-6 text-yellow-600" />
              </div>
              <h4 className="font-medium">Validation</h4>
              <p className="text-sm text-muted-foreground">Terraform plan & validate</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium">Review</h4>
              <p className="text-sm text-muted-foreground">Manual approval</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Play className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="font-medium">Deploy</h4>
              <p className="text-sm text-muted-foreground">Terraform apply</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium">Complete</h4>
              <p className="text-sm text-muted-foreground">Deployment success</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>GitHub Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Integrate with GitHub Actions for automated deployments
            </p>
            <Button variant="outline" className="w-full">
              <Webhook className="mr-2 h-4 w-4" />
              Connect GitHub
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GitLab CI/CD</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Set up GitLab pipelines for infrastructure deployment
            </p>
            <Button variant="outline" className="w-full">
              <Webhook className="mr-2 h-4 w-4" />
              Connect GitLab
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jenkins</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configure Jenkins jobs for continuous deployment
            </p>
            <Button variant="outline" className="w-full">
              <Webhook className="mr-2 h-4 w-4" />
              Connect Jenkins
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GitOpsWorkflow;
