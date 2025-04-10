
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { CostTool } from "./types";

interface ToolIntegrationProps {
  tool: CostTool;
}

const ToolIntegration: React.FC<ToolIntegrationProps> = ({ tool }) => {
  const isIntegrationReady = tool.name === "Infracost" || tool.name === "Komiser";
  
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">{tool.name} Integration</h3>
        <Badge variant="outline" className={isIntegrationReady ? "bg-green-100 text-green-800" : ""}>
          {isIntegrationReady ? "Ready to integrate" : "Coming soon"}
        </Badge>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="border rounded p-3 flex items-center gap-2">
            <div className={isIntegrationReady ? "text-green-600" : "text-muted-foreground"}>
              {isIntegrationReady ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </div>
            <span className="text-sm">API Integration</span>
          </div>
          <div className="border rounded p-3 flex items-center gap-2">
            <div className={tool.name === "Infracost" ? "text-green-600" : "text-muted-foreground"}>
              {tool.name === "Infracost" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </div>
            <span className="text-sm">CI/CD Pipeline</span>
          </div>
          <div className="border rounded p-3 flex items-center gap-2">
            <div className={tool.name === "Komiser" ? "text-green-600" : "text-muted-foreground"}>
              {tool.name === "Komiser" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </div>
            <span className="text-sm">Dashboard Embed</span>
          </div>
          <div className="border rounded p-3 flex items-center gap-2">
            <div className="text-muted-foreground">
              <X className="h-4 w-4" />
            </div>
            <span className="text-sm">Real-time Sync</span>
          </div>
        </div>
        
        {isIntegrationReady && (
          <Button className="w-full mt-2">
            Configure {tool.name} Integration
          </Button>
        )}
        
        {!isIntegrationReady && (
          <Button variant="outline" className="w-full mt-2" disabled>
            Integration Coming Soon
          </Button>
        )}
      </div>
    </div>
  );
};

export default ToolIntegration;
