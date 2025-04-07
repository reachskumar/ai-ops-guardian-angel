
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  MoreVertical, 
  RefreshCcw,
  Trash2
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface ApiKeyActionsProps {
  keyId: string;
  status: string;
  onRevokeKey: (id: string) => void;
  onDeleteKey: (id: string) => void;
}

const ApiKeyActions: React.FC<ApiKeyActionsProps> = ({ 
  keyId, 
  status, 
  onRevokeKey, 
  onDeleteKey 
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {status === 'Active' && (
          <DropdownMenuItem onClick={() => onRevokeKey(keyId)}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Revoke Key
          </DropdownMenuItem>
        )}
        <DropdownMenuItem 
          className="text-destructive focus:text-destructive"
          onClick={() => onDeleteKey(keyId)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Key
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ApiKeyActions;
