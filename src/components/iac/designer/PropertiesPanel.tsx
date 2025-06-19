
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ResourceNode } from './types';
import { resourceTypes } from './constants';

interface PropertiesPanelProps {
  selectedResource: string | null;
  resources: ResourceNode[];
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedResource, resources }) => {
  if (!selectedResource) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a resource to view its properties
          </p>
        </CardContent>
      </Card>
    );
  }

  const resource = resources.find(r => r.id === selectedResource);
  const resourceType = resourceTypes.find(t => t.type === resource?.type);

  if (!resource || !resourceType) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Resource not found
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Properties</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertiesPanel;
