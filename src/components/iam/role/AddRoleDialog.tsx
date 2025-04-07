
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";

interface AddRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  newRole: { name: string; description: string };
  setNewRole: React.Dispatch<React.SetStateAction<{ name: string; description: string }>>;
  handleAddRole: () => void;
}

const AddRoleDialog: React.FC<AddRoleDialogProps> = ({
  isOpen,
  onClose,
  newRole,
  setNewRole,
  handleAddRole
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Role</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="roleName">Role Name</Label>
            <Input
              id="roleName"
              placeholder="e.g. Security Analyst"
              value={newRole.name}
              onChange={(e) => setNewRole({...newRole, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roleDescription">Description</Label>
            <Textarea
              id="roleDescription"
              placeholder="Describe the role's responsibilities"
              value={newRole.description}
              onChange={(e) => setNewRole({...newRole, description: e.target.value})}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAddRole} disabled={!newRole.name}>
            Create Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddRoleDialog;
