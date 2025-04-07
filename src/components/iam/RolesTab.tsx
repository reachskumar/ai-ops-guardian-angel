
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  RoleCard, 
  RoleHeader, 
  AddRoleDialog, 
  EditRoleDialog 
} from "./role";
import type { Role } from "./role/RoleCard";

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
      <RoleHeader onAddRole={() => setIsAddRoleDialogOpen(true)} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {roles.map((role) => (
          <RoleCard 
            key={role.id} 
            role={role}
            onEdit={openEditDialog}
            onDelete={handleDeleteRole}
          />
        ))}
      </div>

      <AddRoleDialog
        isOpen={isAddRoleDialogOpen}
        onClose={() => setIsAddRoleDialogOpen(false)}
        newRole={newRole}
        setNewRole={setNewRole}
        handleAddRole={handleAddRole}
      />

      <EditRoleDialog
        isOpen={isEditRoleDialogOpen}
        onClose={() => setIsEditRoleDialogOpen(false)}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        handleEditRole={handleEditRole}
      />
    </>
  );
};

export default RolesTab;
