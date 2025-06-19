
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  ResourcePalette, 
  DesignCanvas, 
  PropertiesPanel, 
  DesignStatistics,
  ResourceNode,
  Connection 
} from './designer';

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
      template += `
resource "aws_${resource.type}" "${resource.name.replace('-', '_')}" {
  # Configure ${resource.type.toUpperCase()}
  name = "${resource.name}"
  
  tags = {
    Environment = "dev"
    ManagedBy   = "terraform"
  }
}

`;
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
        <ResourcePalette onDragStart={handleDragStart} />
        
        <div className="lg:col-span-2">
          <DesignCanvas
            resources={resources}
            selectedResource={selectedResource}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onResourceSelect={setSelectedResource}
            onResourceRemove={removeResource}
          />
        </div>

        <PropertiesPanel
          selectedResource={selectedResource}
          resources={resources}
        />
      </div>

      <DesignStatistics resources={resources} connections={connections} />
    </div>
  );
};

export default VisualIaCDesigner;
