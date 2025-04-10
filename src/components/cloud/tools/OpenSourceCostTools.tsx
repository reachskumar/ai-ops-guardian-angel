
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Github } from "lucide-react";
import { costTools } from "./cost-tools-data";
import ToolItem from "./ToolItem";
import ToolDocumentation from "./ToolDocumentation";
import ToolIntegration from "./ToolIntegration";

const OpenSourceCostTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  
  const toggleToolExpansion = (toolName: string) => {
    setExpandedTool(expandedTool === toolName ? null : toolName);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5 text-primary" />
          Open Source Cost Analysis Tools
        </CardTitle>
        <CardDescription>
          Free and open-source tools for monitoring and optimizing cloud costs - integrated directly into your workflow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
            <TabsTrigger value="integration">Integration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {costTools.map((tool) => (
              <ToolItem 
                key={tool.name}
                tool={tool}
                isExpanded={expandedTool === tool.name}
                onToggle={() => toggleToolExpansion(tool.name)}
              />
            ))}
          </TabsContent>
          
          <TabsContent value="documentation" className="space-y-6">
            {costTools.map((tool) => (
              <ToolDocumentation key={tool.name} tool={tool} />
            ))}
          </TabsContent>
          
          <TabsContent value="integration" className="space-y-4">
            <div className="bg-muted/50 border rounded-lg p-4 mb-4">
              <h3 className="font-medium text-lg mb-1">Integration Options</h3>
              <p className="text-sm text-muted-foreground">
                These open-source tools can be integrated with our platform. Select your preferred integration approach below.
              </p>
            </div>
            
            {costTools.map((tool) => (
              <ToolIntegration key={tool.name} tool={tool} />
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default OpenSourceCostTools;
