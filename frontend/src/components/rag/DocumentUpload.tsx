import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const DocumentUpload: React.FC = () => {
  const uploadHistory = [
    {
      id: 1,
      name: 'AWS Architecture Guide.pdf',
      status: 'completed',
      size: '2.3 MB',
      uploaded: '2024-01-15 10:30 AM'
    },
    {
      id: 2,
      name: 'Security Policies.md',
      status: 'processing',
      size: '1.8 MB',
      uploaded: '2024-01-15 09:15 AM'
    },
    {
      id: 3,
      name: 'Infrastructure Documentation.pdf',
      status: 'failed',
      size: '3.1 MB',
      uploaded: '2024-01-14 02:45 PM'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <FileText className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>;
      default:
        return <Badge variant="destructive">Failed</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Document Upload</h1>
          <p className="text-muted-foreground">Upload documents to your knowledge base</p>
        </div>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Files
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Area</CardTitle>
          <CardDescription>Drag and drop files here or click to browse</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Upload Documents</p>
            <p className="text-muted-foreground mb-4">Support for PDF, Markdown, and text files</p>
            <Button>Choose Files</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <h2 className="text-xl font-semibold">Upload History</h2>
        {uploadHistory.map((file) => (
          <Card key={file.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(file.status)}
                  <div>
                    <CardTitle className="text-lg">{file.name}</CardTitle>
                    <CardDescription>Uploaded: {file.uploaded}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(file.status)}
                  <Badge variant="outline">{file.size}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="font-medium capitalize">{file.status}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Size:</span>
                  <p className="font-medium">{file.size}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Uploaded:</span>
                  <p className="font-medium">{file.uploaded}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Actions:</span>
                  <div className="flex items-center space-x-1">
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      Delete
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

export default DocumentUpload; 