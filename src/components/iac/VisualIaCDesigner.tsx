
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Server, 
  Database, 
  Network, 
  Cloud, 
  Shield, 
  HardDrive,
  Plus,
  Trash2,
  Save,
  Download,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResourceNode {
  id: string;
  type: string;
  name: string;
  position: { x: number; y: number };
  properties: Record<string, any>;
  connections: string[];
}

interface Connection {
  from: string;
  to: string;
  type: 'network' | 'data' | 'dependency';
}

const resourceTypes = [
  { type: 'ec2', label: 'EC2 Instance', icon: Server, color: 'bg-orange-100 text-orange-800' },
  { type: 'rds', label: 'RDS Database', icon: Database, color: 'bg-blue-100 text-blue-800' },
  { type: 'vpc', label: 'VPC Network', icon: Network, color: 'bg-green-100 text-green-800' },
  { type: 's3', label: 'S3 Bucket', icon: Cloud, color: 'bg-purple-100 text-purple-800' },
  { type: 'sg', label: 'Security Group', icon: Shield, color: 'bg-red-100 text-red-800' },
  { type: 'ebs', label: 'EBS Volume', icon: HardDrive, color: 'bg-gray-100 text-gray-800' }
];

const VisualIaCDesigner: React.FC = () => {
  const [resources, setResources] = useState<ResourceNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [draggedType, setDraggedType] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDragStart = (e: React.DragEvent, resourceType: string) => {
    setDraggedType(resourceType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedType) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newResource: ResourceNode = {
      id: `${draggedType}-${Date.now()}`,
      type: draggedType,
      name: `${draggedType}-${resources.length + 1}`,
      position: { x, y },
      properties: {},
      connections: []
    };

    setResources(prev => [...prev, newResource]);
    setDraggedType(null);

    toast({
      title: 'Resource Added',
      description: `${draggedType.toUpperCase()} resource has been added to the canvas`,
    });
  }, [draggedType, resources.length, toast]);

  const removeResource = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
    setConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
    setSelectedResource(null);
  };

  const generateTemplate = () => {
    if (resources.length === 0) {
      toast({
        title: 'No Resources',
        description: 'Add some resources to generate a template',
        variant: 'destructive'
      });
      return;
    }

    // Generate Terraform template based on resources
    let template = `# Generated Terraform Configuration
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

`;

    resources.forEach(resource => {
      const resourceType = resourceTypes.find(t => t.type === resource.type);
      if (resourceType) {
        template += `
resource "aws_${resource.type}" "${resource.name.replace('-', '_')}" {
  # Configure ${resourceType.label}
  name = "${resource.name}"
  
  tags = {
    Environment = "dev"
    ManagedBy   = "terraform"
  }
}

`;
      }
    });

    // Download template
    const element = document.createElement('a');
    const file = new Blob([template], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'infrastructure.tf';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: 'Template Generated',
      description: 'Terraform template has been downloaded',
    });
  };

  const saveDesign = () => {
    const design = {
      resources,
      connections,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('iac-design', JSON.stringify(design));
    
    toast({
      title: 'Design Saved',
      description: 'Your infrastructure design has been saved locally',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Visual Infrastructure Designer</h2>
        <div className="flex gap-2">
          <Button onClick={saveDesign} variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Save Design
          </Button>
          <Button onClick={generateTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Generate Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Resource Palette */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Palette</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {resourceTypes.map((resourceType) => (
                <div
                  key={resourceType.type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, resourceType.type)}
                  className="flex items-center gap-2 p-3 border rounded-lg cursor-move hover:bg-muted/50 transition-colors"
                >
                  <resourceType.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{resourceType.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Design Canvas */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Design Canvas</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="relative w-full h-[600px] border-2 border-dashed border-muted-foreground/25 rounded-lg bg-muted/10"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {resources.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Drag resources from the palette to start designing</p>
                    </div>
                  </div>
                )}

                {resources.map((resource) => {
                  const resourceType = resourceTypes.find(t => t.type === resource.type);
                  if (!resourceType) return null;

                  return (
                    <div
                      key={resource.id}
                      className={`absolute p-3 border rounded-lg bg-white shadow-md cursor-pointer hover:shadow-lg transition-shadow ${
                        selectedResource === resource.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      style={{
                        left: resource.position.x,
                        top: resource.position.y,
                        transform: 'translate(-50%, -50%)'
                      }}
                      onClick={() => setSelectedResource(resource.id)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <resourceType.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{resource.name}</span>
                      </div>
                      <Badge className={resourceType.color} variant="secondary">
                        {resourceType.label}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeResource(resource.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Properties Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Properties</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedResource ? (
              <div className="space-y-4">
                {(() => {
                  const resource = resources.find(r => r.id === selectedResource);
                  const resourceType = resourceTypes.find(t => t.type === resource?.type);
                  if (!resource || !resourceType) return null;

                  return (
                    <>
                      <div>
                        <h4 className="font-medium mb-2">Resource Details</h4>
                        <div className="space-y-2 text-sm">
                          <div><strong>Type:</strong> {resourceType.label}</div>
                          <div><strong>Name:</strong> {resource.name}</div>
                          <div><strong>ID:</strong> {resource.id}</div>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Configuration</h4>
                        <p className="text-sm text-muted-foreground">
                          Resource configuration options will be available here.
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select a resource to view its properties
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Design Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Design Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{resources.length}</div>
              <div className="text-sm text-muted-foreground">Total Resources</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{connections.length}</div>
              <div className="text-sm text-muted-foreground">Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{new Set(resources.map(r => r.type)).size}</div>
              <div className="text-sm text-muted-foreground">Resource Types</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {resources.length > 0 ? 'Ready' : 'Empty'}
              </div>
              <div className="text-sm text-muted-foreground">Design Status</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisualIaCDesigner;
