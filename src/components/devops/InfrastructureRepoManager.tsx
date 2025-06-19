
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  GitBranch, 
  GitCommit, 
  Download, 
  Upload, 
  Folder, 
  FileCode,
  Terminal,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Repository {
  id: string;
  name: string;
  type: 'terraform' | 'ansible';
  url: string;
  branch: string;
  lastSync: string;
  status: 'synced' | 'pending' | 'error';
  files: number;
}

const InfrastructureRepoManager: React.FC = () => {
  const [repositories, setRepositories] = useState<Repository[]>([
    {
      id: 'tf-main',
      name: 'infrastructure-terraform',
      type: 'terraform',
      url: 'https://github.com/company/infrastructure-terraform',
      branch: 'main',
      lastSync: '2025-01-19T10:30:00Z',
      status: 'synced',
      files: 15
    },
    {
      id: 'ansible-main',
      name: 'ansible-playbooks',
      type: 'ansible',
      url: 'https://github.com/company/ansible-playbooks',
      branch: 'main',
      lastSync: '2025-01-19T09:45:00Z',
      status: 'synced',
      files: 8
    }
  ]);

  const [isConnecting, setIsConnecting] = useState(false);
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [newRepoType, setNewRepoType] = useState<'terraform' | 'ansible'>('terraform');
  const { toast } = useToast();

  const connectRepository = async () => {
    if (!newRepoUrl.trim()) {
      toast({
        title: 'Error',
        description: 'Repository URL is required',
        variant: 'destructive'
      });
      return;
    }

    setIsConnecting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newRepo: Repository = {
        id: `repo-${Date.now()}`,
        name: newRepoUrl.split('/').pop() || 'new-repo',
        type: newRepoType,
        url: newRepoUrl,
        branch: 'main',
        lastSync: new Date().toISOString(),
        status: 'synced',
        files: Math.floor(Math.random() * 20) + 5
      };

      setRepositories(prev => [...prev, newRepo]);
      setNewRepoUrl('');
      setIsConnecting(false);
      
      toast({
        title: 'Repository Connected',
        description: `Successfully connected ${newRepo.name}`,
      });
    }, 2000);
  };

  const syncRepository = async (repoId: string) => {
    setRepositories(prev => 
      prev.map(repo => 
        repo.id === repoId 
          ? { ...repo, status: 'pending' }
          : repo
      )
    );

    // Simulate sync
    setTimeout(() => {
      setRepositories(prev => 
        prev.map(repo => 
          repo.id === repoId 
            ? { ...repo, status: 'synced', lastSync: new Date().toISOString() }
            : repo
        )
      );
      
      toast({
        title: 'Repository Synced',
        description: 'Repository has been synchronized successfully',
      });
    }, 3000);
  };

  const getStatusIcon = (status: Repository['status']) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: Repository['status']) => {
    switch (status) {
      case 'synced':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Infrastructure Repository Manager</h2>
          <p className="text-muted-foreground">
            Manage your Terraform and Ansible repositories
          </p>
        </div>
      </div>

      <Tabs defaultValue="repositories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="repositories">Repositories</TabsTrigger>
          <TabsTrigger value="connect">Connect New</TabsTrigger>
          <TabsTrigger value="deploy">Deploy</TabsTrigger>
        </TabsList>

        <TabsContent value="repositories" className="space-y-4">
          <div className="grid gap-4">
            {repositories.map((repo) => (
              <Card key={repo.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {repo.type === 'terraform' ? (
                            <FileCode className="h-5 w-5 text-purple-500" />
                          ) : (
                            <Terminal className="h-5 w-5 text-red-500" />
                          )}
                          <h3 className="text-lg font-semibold">{repo.name}</h3>
                        </div>
                        <Badge variant="outline" className={getStatusColor(repo.status)}>
                          {getStatusIcon(repo.status)}
                          <span className="ml-1 capitalize">{repo.status}</span>
                        </Badge>
                        <Badge variant="secondary">
                          {repo.type.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <GitBranch className="h-4 w-4" />
                          <span>{repo.url}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <GitCommit className="h-4 w-4" />
                          <span>Branch: {repo.branch}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Folder className="h-4 w-4" />
                          <span>{repo.files} files</span>
                        </div>
                        <div className="text-xs">
                          Last sync: {new Date(repo.lastSync).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => syncRepository(repo.id)}
                        disabled={repo.status === 'pending'}
                      >
                        {repo.status === 'pending' ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        Sync
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="connect" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connect New Repository</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Repository Type</label>
                <div className="flex gap-4">
                  <Button
                    variant={newRepoType === 'terraform' ? 'default' : 'outline'}
                    onClick={() => setNewRepoType('terraform')}
                    className="flex items-center gap-2"
                  >
                    <FileCode className="h-4 w-4" />
                    Terraform
                  </Button>
                  <Button
                    variant={newRepoType === 'ansible' ? 'default' : 'outline'}
                    onClick={() => setNewRepoType('ansible')}
                    className="flex items-center gap-2"
                  >
                    <Terminal className="h-4 w-4" />
                    Ansible
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Repository URL</label>
                <Input
                  placeholder="https://github.com/your-org/repo-name"
                  value={newRepoUrl}
                  onChange={(e) => setNewRepoUrl(e.target.value)}
                />
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Make sure your repository contains valid {newRepoType} configurations.
                  {newRepoType === 'terraform' && ' Terraform files should have .tf extension.'}
                  {newRepoType === 'ansible' && ' Ansible playbooks should be in YAML format.'}
                </AlertDescription>
              </Alert>

              <Button 
                onClick={connectRepository}
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <GitBranch className="mr-2 h-4 w-4" />
                )}
                Connect Repository
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deploy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deploy Infrastructure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Repository</label>
                  <select className="w-full p-2 border rounded-md">
                    {repositories.map(repo => (
                      <option key={repo.id} value={repo.id}>
                        {repo.name} ({repo.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Environment</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="dev">Development</option>
                    <option value="staging">Staging</option>
                    <option value="prod">Production</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Deployment Notes</label>
                  <Textarea
                    placeholder="Enter deployment notes (optional)"
                    className="h-20"
                  />
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Upload className="mr-2 h-4 w-4" />
                    Deploy
                  </Button>
                  <Button variant="outline">
                    <Terminal className="mr-2 h-4 w-4" />
                    Plan/Dry Run
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InfrastructureRepoManager;
