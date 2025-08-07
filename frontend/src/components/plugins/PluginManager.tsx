import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Settings, Trash2, Power, AlertCircle } from 'lucide-react';

const PluginManager: React.FC = () => {
  const installedPlugins = [
    {
      id: 1,
      name: 'AWS Cost Optimizer',
      version: '1.2.0',
      status: 'active',
      description: 'Automatically optimize AWS costs and identify savings opportunities',
      lastUpdated: '2024-01-15',
      size: '2.3 MB'
    },
    {
      id: 2,
      name: 'Multi-Cloud Monitor',
      version: '1.0.5',
      status: 'active',
      description: 'Monitor resources across AWS, Azure, and GCP from a single dashboard',
      lastUpdated: '2024-01-10',
      size: '1.8 MB'
    },
    {
      id: 3,
      name: 'Security Compliance Checker',
      version: '2.1.0',
      status: 'inactive',
      description: 'Automated security compliance checks for cloud resources',
      lastUpdated: '2024-01-05',
      size: '3.1 MB'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Plugin Manager</h1>
          <p className="text-muted-foreground">Manage your installed plugins and their configurations</p>
        </div>
        <Button>
          <Settings className="mr-2 h-4 w-4" />
          Plugin Settings
        </Button>
      </div>

      <div className="grid gap-4">
        {installedPlugins.map((plugin) => (
          <Card key={plugin.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div>
                    <CardTitle className="text-lg">{plugin.name}</CardTitle>
                    <CardDescription>{plugin.description}</CardDescription>
                  </div>
                  <Badge variant={plugin.status === 'active' ? 'default' : 'secondary'}>
                    {plugin.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={plugin.status === 'active'} 
                    onCheckedChange={() => {}}
                  />
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Version:</span>
                  <p className="font-medium">{plugin.version}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Updated:</span>
                  <p className="font-medium">{plugin.lastUpdated}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Size:</span>
                  <p className="font-medium">{plugin.size}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div className="flex items-center space-x-1">
                    {plugin.status === 'active' ? (
                      <Power className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="font-medium capitalize">{plugin.status}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PluginManager; 