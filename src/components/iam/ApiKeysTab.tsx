
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  ApiKeyHeader,
  ApiKeysList,
  CreateApiKeyDialog
} from "./apiKey";

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

  return (
    <>
      <ApiKeyHeader onCreateKey={() => setIsCreateKeyDialogOpen(true)} />
      
      <div className="mt-4">
        <ApiKeysList 
          apiKeys={apiKeys}
          onRevokeKey={handleRevokeKey}
          onDeleteKey={handleDeleteKey}
        />
      </div>

      <CreateApiKeyDialog
        isOpen={isCreateKeyDialogOpen}
        onClose={() => setIsCreateKeyDialogOpen(false)}
        newApiKey={newApiKey}
        setNewApiKey={setNewApiKey}
        generatedKey={generatedKey}
        showKey={showKey}
        setShowKey={setShowKey}
        handleCreateApiKey={handleCreateApiKey}
        handleCopyKey={handleCopyKey}
        handleDoneCreating={handleDoneCreating}
      />
    </>
  );
};

export default ApiKeysTab;
