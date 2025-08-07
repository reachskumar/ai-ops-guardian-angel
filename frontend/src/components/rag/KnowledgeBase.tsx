import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { BookOpen, Search, Upload, Settings } from 'lucide-react';

const KnowledgeBase: React.FC = () => {
  const documents = [
    {
      id: 1,
      name: 'AWS Best Practices Guide',
      type: 'PDF',
      size: '2.3 MB',
      uploaded: '2024-01-15',
      status: 'processed'
    },
    {
      id: 2,
      name: 'Infrastructure Documentation',
      type: 'Markdown',
      size: '1.8 MB',
      uploaded: '2024-01-14',
      status: 'processing'
    },
    {
      id: 3,
      name: 'Security Policies',
      type: 'PDF',
      size: '3.1 MB',
      uploaded: '2024-01-13',
      status: 'processed'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processed':
        return <Badge variant="default" className="bg-green-500">Processed</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground">Manage and search your AI knowledge repository</p>
        </div>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      <div className="grid gap-4">
        {documents.map((doc) => (
          <Card key={doc.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <div>
                    <CardTitle className="text-lg">{doc.name}</CardTitle>
                    <CardDescription>Uploaded: {doc.uploaded}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(doc.status)}
                  <Badge variant="outline">{doc.type}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <p className="font-medium">{doc.type}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Size:</span>
                  <p className="font-medium">{doc.size}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="font-medium capitalize">{doc.status}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Actions:</span>
                  <div className="flex items-center space-x-1">
                    <Button size="sm" variant="outline">
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
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

export default KnowledgeBase; 