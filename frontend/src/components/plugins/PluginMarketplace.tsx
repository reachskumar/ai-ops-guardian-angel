import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Search, Download, Star, Users } from 'lucide-react';

const PluginMarketplace: React.FC = () => {
  const plugins = [
    {
      id: 1,
      name: 'AWS Cost Optimizer',
      description: 'Automatically optimize AWS costs and identify savings opportunities',
      author: 'AI Ops Team',
      downloads: 1250,
      rating: 4.8,
      category: 'Cost Management',
      price: 'Free'
    },
    {
      id: 2,
      name: 'Multi-Cloud Monitor',
      description: 'Monitor resources across AWS, Azure, and GCP from a single dashboard',
      author: 'CloudGuard',
      downloads: 890,
      rating: 4.6,
      category: 'Monitoring',
      price: '$29/month'
    },
    {
      id: 3,
      name: 'Security Compliance Checker',
      description: 'Automated security compliance checks for cloud resources',
      author: 'SecureOps',
      downloads: 2100,
      rating: 4.9,
      category: 'Security',
      price: '$49/month'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Plugin Marketplace</h1>
          <p className="text-muted-foreground">Discover and install powerful plugins to extend your AI Ops capabilities</p>
        </div>
        <Button>
          <Search className="mr-2 h-4 w-4" />
          Search Plugins
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plugins.map((plugin) => (
          <Card key={plugin.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plugin.name}</CardTitle>
                <Badge variant="secondary">{plugin.category}</Badge>
              </div>
              <CardDescription>{plugin.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>By {plugin.author}</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{plugin.rating}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Download className="h-4 w-4" />
                    <span>{plugin.downloads}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>Active users</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg">{plugin.price}</span>
                  <Button size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Install
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PluginMarketplace; 