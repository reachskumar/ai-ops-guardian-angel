
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateSecretForm } from "./";
import SecretsTable, { Secret } from "./SecretsTable";
import { toast } from "@/hooks/use-toast";
import { mockSecrets } from "./mockData";

const SecretsTab: React.FC = () => {
  const [secrets, setSecrets] = useState<Secret[]>(mockSecrets);
  const [createSecretOpen, setCreateSecretOpen] = useState(false);

  const handleCreateSecret = (data: any) => {
    const newSecret = {
      id: `secret-${secrets.length + 1}`,
      name: data.name,
      namespace: data.namespace,
      cluster: "production-cluster",
      type: data.type,
      keys: data.data.split('\n').filter((line: string) => 
        line.includes('=') && !line.startsWith('#')
      ).length,
      age: "Just now"
    };
    
    setSecrets([...secrets, newSecret]);
    setCreateSecretOpen(false);
    toast({
      title: "Success", 
      description: "Secret created successfully",
      variant: "default",
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Secrets</h3>
        <Button onClick={() => setCreateSecretOpen(true)}>
          <Lock className="h-4 w-4 mr-2" />
          Create Secret
        </Button>
      </div>
      
      <SecretsTable secrets={secrets} />

      <Dialog open={createSecretOpen} onOpenChange={setCreateSecretOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create Secret</DialogTitle>
          </DialogHeader>
          <CreateSecretForm
            onSubmit={handleCreateSecret}
            onCancel={() => setCreateSecretOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SecretsTab;
