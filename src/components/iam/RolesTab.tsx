
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Shield, Plus, MoreVertical, Edit2, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Role {
  id: string;
  name: string;
  description: string;
  users: number;
  permissions: number;
}

interface RolesTabProps {
  filteredRoles: Role[];
}

const RolesTab: React.FC<RolesTabProps> = ({ filteredRoles }) => {
  const [roles, setRoles] = useState<Role[]>(filteredRoles);
  const [isAddRoleDialogOpen, setIsAddRoleDialogOpen] = useState(false);
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState({ name: '', description: '' });
  const { toast } = useToast();

  const handleAddRole = () => {
    // In a real app, this would save to the database
    const id = `role-${Date.now()}`;
    const role = {
      id,
      name: newRole.name,
      description: newRole.description,
      users: 0,
      permissions: 0
    };
    
    setRoles([...roles, role]);
    setNewRole({ name: '', description: '' });
    setIsAddRoleDialogOpen(false);
    
    toast({
      title: "Role created",
      description: `${newRole.name} role has been created successfully.`
    });
  };

  const handleEditRole = () => {
    if (!selectedRole) return;
    
    // In a real app, this would update the database
    setRoles(roles.map(role => 
      role.id === selectedRole.id ? selectedRole : role
    ));
    
    setIsEditRoleDialogOpen(false);
    setSelectedRole(null);
    
    toast({
      title: "Role updated",
      description: `${selectedRole.name} role has been updated successfully.`
    });
  };

  const handleDeleteRole = (id: string) => {
    // In a real app, this would delete from the database
    setRoles(roles.filter(role => role.id !== id));
    
    toast({
      title: "Role deleted",
      description: "The role has been deleted successfully."
    });
  };

  const openEditDialog = (role: Role) => {
    setSelectedRole(role);
    setIsEditRoleDialogOpen(true);
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Role Management</h2>
        <Button size="sm" onClick={() => setIsAddRoleDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {roles.map((role) => (
          <Card key={role.id} className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="absolute right-4 top-4">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEditDialog(role)}>
                  <Edit2 className="h-4 w-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => handleDeleteRole(role.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <CardHeader>
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <CardTitle>{role.name}</CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Users:</span>
                  <Badge variant="outline">{role.users}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Permissions:</span>
                  <Badge variant="outline">{role.permissions}</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" size="sm" className="w-full">
                Manage Permissions
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Add Role Dialog */}
      <Dialog open={isAddRoleDialogOpen} onOpenChange={setIsAddRoleDialogOpen}>
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
            <Button variant="outline" onClick={() => setIsAddRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRole} disabled={!newRole.name}>
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={isEditRoleDialogOpen} onOpenChange={setIsEditRoleDialogOpen}>
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
            <Button variant="outline" onClick={() => setIsEditRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditRole}>
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RolesTab;
