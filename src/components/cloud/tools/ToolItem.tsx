
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ExternalLink, Github, ChevronDown, ChevronRight } from "lucide-react";
import { CostTool } from "./types";

interface ToolItemProps {
  tool: CostTool;
  isExpanded: boolean;
  onToggle: () => void;
}

const ToolItem: React.FC<ToolItemProps> = ({ tool, isExpanded, onToggle }) => {
  return (
    <Collapsible 
      key={tool.name} 
      open={isExpanded}
      onOpenChange={onToggle}
      className="border rounded-lg"
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{tool.name}</h3>
              <div className="flex gap-1">
                {tool.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{tool.description}</p>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>
      
      <CollapsibleContent>
        <div className="px-4 pb-4 pt-0 border-t">
          <div className="mt-3">
            <h4 className="text-sm font-medium mb-1">Key Features:</h4>
            <ul className="text-xs text-muted-foreground list-disc pl-5 mb-3">
              {tool.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
          
          <div className="mt-3">
            <h4 className="text-sm font-medium mb-1">Compatible Clouds:</h4>
            <div className="flex gap-1 flex-wrap mb-3">
              {tool.compatibleClouds.map((cloud) => (
                <Badge key={cloud} variant="secondary" className="text-xs">
                  {cloud}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" asChild>
              <a href={tool.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                <ExternalLink className="h-3.5 w-3.5" />
                Website
              </a>
            </Button>
            {tool.github && (
              <Button variant="outline" size="sm" asChild>
                <a href={tool.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                  <Github className="h-3.5 w-3.5" />
                  GitHub
                </a>
              </Button>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ToolItem;
