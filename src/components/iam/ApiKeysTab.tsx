
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Key, 
  Plus, 
  Copy, 
  MoreVertical, 
  Trash2, 
  RefreshCcw,
  Eye,
  EyeOff
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ApiKey {
  id: string;
  name: string;
  created: string;
  expires: string;
  status: string;
  key?: string;
}

interface ApiKeysTabProps {
  filteredApiKeys: ApiKey[];
}

const ApiKeysTab: React.FC<ApiKeysTabProps> = ({ filteredApiKeys }) => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(filteredApiKeys);
  const [isCreateKeyDialogOpen, setIsCreateKeyDialogOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState({ name: '', expiryDays: '365' });
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const { toast } = useToast();

  const handleCreateApiKey = () => {
    // In a real app, this would call an API to create a key
    const now = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(now.getDate() + parseInt(newApiKey.expiryDays));
    
    const mockKey = `ak_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
    const newKey = {
      id: `key-${Date.now()}`,
      name: newApiKey.name,
      created: now.toISOString().split('T')[0],
      expires: expiryDate.toISOString().split('T')[0],
      status: 'Active',
      key: mockKey
    };
    
    setApiKeys([...apiKeys, newKey]);
    setGeneratedKey(mockKey);
  };

  const handleCopyKey = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      toast({
        title: "API key copied",
        description: "The API key has been copied to your clipboard."
      });
    }
  };

  const handleDoneCreating = () => {
    setIsCreateKeyDialogOpen(false);
    setGeneratedKey(null);
    setNewApiKey({ name: '', expiryDays: '365' });
    setShowKey(false);
  };

  const handleRevokeKey = (id: string) => {
    // In a real app, this would call an API to revoke the key
    setApiKeys(apiKeys.map(key => 
      key.id === id ? { ...key, status: 'Revoked' } : key
    ));
    
    toast({
      title: "API key revoked",
      description: "The API key has been revoked successfully."
    });
  };

  const handleDeleteKey = (id: string) => {
    // In a real app, this would call an API to delete the key
    setApiKeys(apiKeys.filter(key => key.id !== id));
    
    toast({
      title: "API key deleted",
      description: "The API key has been deleted successfully."
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return "border-green-500 text-green-500";
      case 'expiring soon':
        return "border-amber-500 text-amber-500";
      case 'expired':
      case 'revoked':
        return "border-red-500 text-red-500";
      default:
        return "border-gray-500 text-gray-500";
    }
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">API Key Management</h2>
        <Button size="sm" onClick={() => setIsCreateKeyDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create API Key
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Created</th>
                  <th className="text-left p-4">Expires</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">
                      No API keys found
                    </td>
                  </tr>
                ) : (
                  apiKeys.map((apiKey) => (
                    <tr key={apiKey.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4 text-primary" />
                          {apiKey.name}
                        </div>
                      </td>
                      <td className="p-4">{apiKey.created}</td>
                      <td className="p-4">{apiKey.expires}</td>
                      <td className="p-4">
                        <Badge
                          variant="outline"
                          className={getStatusColor(apiKey.status)}
                        >
                          {apiKey.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {apiKey.status === 'Active' && (
                              <DropdownMenuItem onClick={() => handleRevokeKey(apiKey.id)}>
                                <RefreshCcw className="h-4 w-4 mr-2" />
                                Revoke Key
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteKey(apiKey.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Key
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create API Key Dialog */}
      <Dialog open={isCreateKeyDialogOpen} onOpenChange={setIsCreateKeyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{generatedKey ? 'API Key Created' : 'Create API Key'}</DialogTitle>
          </DialogHeader>
          
          {!generatedKey ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="keyName">Key Name</Label>
                <Input
                  id="keyName"
                  placeholder="e.g. Production API Key"
                  value={newApiKey.name}
                  onChange={(e) => setNewApiKey({...newApiKey, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDays">Expires After (days)</Label>
                <Input
                  id="expiryDays"
                  type="number"
                  value={newApiKey.expiryDays}
                  onChange={(e) => setNewApiKey({...newApiKey, expiryDays: e.target.value})}
                  min="1"
                />
              </div>
              <DialogFooter className="sm:justify-end">
                <Button variant="outline" onClick={() => setIsCreateKeyDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateApiKey} 
                  disabled={!newApiKey.name}
                >
                  Create Key
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-center block">Your API key has been generated</Label>
                <p className="text-sm text-muted-foreground text-center">
                  Please copy this key now. You won't be able to see it again.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Input
                    value={generatedKey}
                    type={showKey ? "text" : "password"}
                    readOnly
                    className="pr-10 font-mono"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  type="button"
                  size="icon"
                  onClick={handleCopyKey}
                  className="h-10 w-10"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <DialogFooter className="sm:justify-end">
                <Button onClick={handleDoneCreating}>
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApiKeysTab;
