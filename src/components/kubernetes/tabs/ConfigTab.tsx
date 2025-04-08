
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Lock, Settings, Key } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateConfigMapForm, CreateSecretForm } from "./config";
import { toast } from "@/components/ui/sonner";

// Mock data for demo
const mockConfigMaps = [
  { 
    id: "cm-1", 
    name: "app-config", 
    namespace: "default",
    cluster: "production-cluster",
    keys: 5,
    age: "5d"
  },
  { 
    id: "cm-2", 
    name: "nginx-conf", 
    namespace: "default",
    cluster: "production-cluster",
    keys: 2,
    age: "5d"
  },
  { 
    id: "cm-3", 
    name: "prometheus-config", 
    namespace: "monitoring",
    cluster: "production-cluster",
    keys: 8,
    age: "2d"
  }
];

const mockSecrets = [
  { 
    id: "secret-1", 
    name: "db-credentials", 
    namespace: "default",
    cluster: "production-cluster",
    type: "Opaque",
    keys: 3,
    age: "5d"
  },
  { 
    id: "secret-2", 
    name: "api-keys", 
    namespace: "default",
    cluster: "production-cluster",
    type: "Opaque",
    keys: 2,
    age: "3d"
  },
  { 
    id: "secret-3", 
    name: "tls-cert", 
    namespace: "default",
    cluster: "production-cluster",
    type: "kubernetes.io/tls",
    keys: 2,
    age: "10d"
  }
];

const ConfigTab: React.FC = () => {
  const [configMaps, setConfigMaps] = useState(mockConfigMaps);
  const [secrets, setSecrets] = useState(mockSecrets);
  const [createConfigMapOpen, setCreateConfigMapOpen] = useState(false);
  const [createSecretOpen, setCreateSecretOpen] = useState(false);

  const handleCreateConfigMap = (data: any) => {
    // In a real app, this would call an API to create the ConfigMap
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
    toast.success("ConfigMap created successfully");
  };

  const handleCreateSecret = (data: any) => {
    // In a real app, this would call an API to create the Secret
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
    toast.success("Secret created successfully");
  };

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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">ConfigMaps</h3>
            <Button onClick={() => setCreateConfigMapOpen(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Create ConfigMap
            </Button>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Namespace</TableHead>
                <TableHead>Cluster</TableHead>
                <TableHead>Keys</TableHead>
                <TableHead>Age</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configMaps.map((config) => (
                <TableRow key={config.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {config.name}
                    </div>
                  </TableCell>
                  <TableCell>{config.namespace}</TableCell>
                  <TableCell>{config.cluster}</TableCell>
                  <TableCell>{config.keys}</TableCell>
                  <TableCell>{config.age}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        
        <TabsContent value="secrets">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Secrets</h3>
            <Button onClick={() => setCreateSecretOpen(true)}>
              <Lock className="h-4 w-4 mr-2" />
              Create Secret
            </Button>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Namespace</TableHead>
                <TableHead>Cluster</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Keys</TableHead>
                <TableHead>Age</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {secrets.map((secret) => (
                <TableRow key={secret.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      {secret.name}
                    </div>
                  </TableCell>
                  <TableCell>{secret.namespace}</TableCell>
                  <TableCell>{secret.cluster}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {secret.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{secret.keys}</TableCell>
                  <TableCell>{secret.age}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      {/* Dialog for creating a new ConfigMap */}
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

      {/* Dialog for creating a new Secret */}
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
    </div>
  );
};

export default ConfigTab;
