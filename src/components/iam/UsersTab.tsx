
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, ChevronDown } from "lucide-react";
import { RoleLabel } from "@/components/teams";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { UserRole } from "@/services/authService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
}

interface UsersTabProps {
  filteredUsers: User[];
  refreshUsers?: () => void;
}

const UsersTab: React.FC<UsersTabProps> = ({ filteredUsers, refreshUsers }) => {
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const availableRoles: UserRole[] = ['admin', 'developer', 'operator', 'viewer'];
  
  const handleRoleUpdate = async (userId: string, role: UserRole) => {
    setUpdatingUserId(userId);
    try {
      // In a real implementation, this would update the user's role in Supabase
      // For now, we'll just show a success toast
      toast({
        title: "Role updated",
        description: `User's role has been updated to ${role}.`,
      });
      
      if (refreshUsers) {
        refreshUsers();
      }
    } catch (error: any) {
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };
  
  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">User Management</h2>
        <Button size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Role</th>
                  <th className="text-left p-4">Last Login</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">{user.name}</td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">
                        <RoleLabel role={user.role.toLowerCase() as UserRole} />
                      </td>
                      <td className="p-4">{user.lastLogin}</td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              disabled={updatingUserId === user.id}
                            >
                              {updatingUserId === user.id ? (
                                <div className="animate-spin h-4 w-4 border-2 border-foreground/50 rounded-full border-t-transparent" />
                              ) : (
                                <>
                                  Change Role <ChevronDown className="ml-1 h-3 w-3" />
                                </>
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {availableRoles.map((role) => (
                              <DropdownMenuItem 
                                key={role}
                                onClick={() => handleRoleUpdate(user.id, role)}
                                disabled={user.role.toLowerCase() === role}
                                className="flex items-center gap-2"
                              >
                                <RoleLabel role={role} size="sm" />
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="ghost" size="sm" className="text-red-500">Deactivate</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default UsersTab;
