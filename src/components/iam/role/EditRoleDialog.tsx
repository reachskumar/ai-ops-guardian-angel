
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
import { Role } from "./RoleCard";

interface EditRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRole: Role | null;
  setSelectedRole: React.Dispatch<React.SetStateAction<Role | null>>;
  handleEditRole: () => void;
}

const EditRoleDialog: React.FC<EditRoleDialogProps> = ({
  isOpen,
  onClose,
  selectedRole,
  setSelectedRole,
  handleEditRole
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
        </DialogHeader>
        {selectedRole && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editRoleName">Role Name</Label>
              <Input
                id="editRoleName"
                value={selectedRole.name}
                onChange={(e) => setSelectedRole({...selectedRole, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editRoleDescription">Description</Label>
              <Textarea
                id="editRoleDescription"
                value={selectedRole.description}
                onChange={(e) => setSelectedRole({...selectedRole, description: e.target.value})}
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleEditRole}>
            Update Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditRoleDialog;
