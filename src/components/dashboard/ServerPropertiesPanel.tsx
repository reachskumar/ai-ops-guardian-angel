
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

interface ServerProperty {
  label: string;
  value: string;
}

interface ServerPropertiesPanelProps {
  properties: ServerProperty[];
}

const ServerPropertiesPanel: React.FC<ServerPropertiesPanelProps> = ({
  properties
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">Server Properties</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {properties.map((prop, i) => (
            <div key={i} className="flex items-center">
              <span className="text-sm font-medium text-muted-foreground w-32">{prop.label}:</span>
              <span>{prop.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServerPropertiesPanel;
