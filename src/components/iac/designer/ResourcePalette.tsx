
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { resourceTypes } from './constants';

interface ResourcePaletteProps {
  onDragStart: (e: React.DragEvent, resourceType: string) => void;
}

const ResourcePalette: React.FC<ResourcePaletteProps> = ({ onDragStart }) => {
  return (
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
              onDragStart={(e) => onDragStart(e, resourceType.type)}
              className="flex items-center gap-2 p-3 border rounded-lg cursor-move hover:bg-muted/50 transition-colors"
            >
              <resourceType.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{resourceType.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourcePalette;
