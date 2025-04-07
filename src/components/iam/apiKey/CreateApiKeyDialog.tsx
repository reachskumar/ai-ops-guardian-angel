
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Copy, Eye, EyeOff } from "lucide-react";

interface CreateApiKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  newApiKey: { name: string; expiryDays: string };
  setNewApiKey: React.Dispatch<React.SetStateAction<{ name: string; expiryDays: string }>>;
  generatedKey: string | null;
  showKey: boolean;
  setShowKey: React.Dispatch<React.SetStateAction<boolean>>;
  handleCreateApiKey: () => void;
  handleCopyKey: () => void;
  handleDoneCreating: () => void;
}

const CreateApiKeyDialog: React.FC<CreateApiKeyDialogProps> = ({
  isOpen,
  onClose,
  newApiKey,
  setNewApiKey,
  generatedKey,
  showKey,
  setShowKey,
  handleCreateApiKey,
  handleCopyKey,
  handleDoneCreating
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              <Button variant="outline" onClick={onClose}>
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
  );
};

export default CreateApiKeyDialog;
