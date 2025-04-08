
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Lock } from "lucide-react";
import { ConfigMapsTab, SecretsTab } from "./config";

const ConfigTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="configmaps">
        <TabsList className="mb-4">
          <TabsTrigger value="configmaps" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>ConfigMaps</span>
          </TabsTrigger>
          <TabsTrigger value="secrets" className="flex items-center gap-1">
            <Lock className="h-4 w-4" />
            <span>Secrets</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="configmaps">
          <ConfigMapsTab />
        </TabsContent>
        
        <TabsContent value="secrets">
          <SecretsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfigTab;
