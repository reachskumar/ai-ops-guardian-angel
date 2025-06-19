
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { ResourceNode } from './types';
import { resourceTypes } from './constants';

interface DesignCanvasProps {
  resources: ResourceNode[];
  selectedResource: string | null;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onResourceSelect: (id: string) => void;
  onResourceRemove: (id: string) => void;
}

const DesignCanvas: React.FC<DesignCanvasProps> = ({
  resources,
  selectedResource,
  onDragOver,
  onDrop,
  onResourceSelect,
  onResourceRemove
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Design Canvas</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="relative w-full h-[600px] border-2 border-dashed border-muted-foreground/25 rounded-lg bg-muted/10"
          onDragOver={onDragOver}
          onDrop={onDrop}
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
                onClick={() => onResourceSelect(resource.id)}
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
                    onResourceRemove(resource.id);
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
  );
};

export default DesignCanvas;
