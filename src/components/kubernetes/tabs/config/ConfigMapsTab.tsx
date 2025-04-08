
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateConfigMapForm } from "./";
import ConfigMapsTable, { ConfigMap } from "./ConfigMapsTable";
import { toast } from "@/hooks/use-toast";
import { mockConfigMaps } from "./mockData";

const ConfigMapsTab: React.FC = () => {
  const [configMaps, setConfigMaps] = useState<ConfigMap[]>(mockConfigMaps);
  const [createConfigMapOpen, setCreateConfigMapOpen] = useState(false);

  const handleCreateConfigMap = (data: any) => {
    const newConfigMap = {
      id: `cm-${configMaps.length + 1}`,
      name: data.name,
      namespace: data.namespace,
      cluster: "production-cluster",
      keys: data.data.split('\n').filter((line: string) => 
        line.includes('=') && !line.startsWith('#')
      ).length,
      age: "Just now"
    };
    
    setConfigMaps([...configMaps, newConfigMap]);
    setCreateConfigMapOpen(false);
    toast({
      title: "Success",
      description: "ConfigMap created successfully",
      variant: "default",
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">ConfigMaps</h3>
        <Button onClick={() => setCreateConfigMapOpen(true)}>
          <FileText className="h-4 w-4 mr-2" />
          Create ConfigMap
        </Button>
      </div>
      
      <ConfigMapsTable configMaps={configMaps} />

      <Dialog open={createConfigMapOpen} onOpenChange={setCreateConfigMapOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create ConfigMap</DialogTitle>
          </DialogHeader>
          <CreateConfigMapForm
            onSubmit={handleCreateConfigMap}
            onCancel={() => setCreateConfigMapOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConfigMapsTab;
