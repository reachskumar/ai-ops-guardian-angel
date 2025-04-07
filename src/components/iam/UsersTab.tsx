
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UserRole } from "@/services/authService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/types/user";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead 
} from "@/components/ui/table";
import { UserHeader, UserTable, AddUserDialog } from "./user";

interface UsersTabProps {
  filteredUsers: any[];
  refreshUsers?: () => void;
}

const UsersTab: React.FC<UsersTabProps> = ({ filteredUsers, refreshUsers }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deactivatedUsers, setDeactivatedUsers] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  
  const availableRoles: UserRole[] = ['admin', 'developer', 'operator', 'viewer'];

  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    fullName: '',
    username: '',
    role: 'viewer' as UserRole
  });
  
  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*");

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      console.error("Error fetching profiles:", error);
      toast({
        title: "Error loading users",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleRoleUpdate = async (userId: string, role: UserRole) => {
    setUpdatingUserId(userId);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId)
        .select("username, full_name");

      if (error) throw error;

      toast({
        title: "Role updated",
        description: `${data?.[0]?.full_name || data?.[0]?.username || "User"}'s role has been updated to ${role}.`,
      });
      
      fetchProfiles();
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

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            full_name: newUser.fullName,
            username: newUser.username,
            role: newUser.role
          }
        }
      });

      if (authError) throw authError;

      toast({
        title: "User added",
        description: "The user has been successfully invited to the platform.",
      });

      setIsAddUserDialogOpen(false);
      fetchProfiles();
      
    } catch (error: any) {
      toast({
        title: "Error adding user",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      // Instead of updating a non-existent 'active' field, we'll use our client-side state
      // to track deactivated users and modify how they are displayed
      setDeactivatedUsers(prev => {
        const updated = new Set(prev);
        updated.add(userId);
        return updated;
      });

      toast({
        title: "User deactivated",
        description: "The user has been visually marked as deactivated. In a production app, you would update the user status in the database.",
      });
      
      // Note: In a real implementation, you would update a status field in the database
      // e.g., await supabase.from("profiles").update({ status: 'inactive' }).eq("id", userId);
      
    } catch (error: any) {
      toast({
        title: "Error deactivating user",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const displayedUsers = profiles.length > 0 ? profiles : filteredUsers;
  
  return (
    <>
      <UserHeader onAddUser={() => setIsAddUserDialogOpen(true)} />
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <UserTable 
                  displayedUsers={displayedUsers}
                  updatingUserId={updatingUserId}
                  deactivatedUsers={deactivatedUsers}
                  handleRoleUpdate={handleRoleUpdate}
                  handleDeactivateUser={handleDeactivateUser}
                  availableRoles={availableRoles}
                  loading={loading}
                />
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddUserDialog
        isOpen={isAddUserDialogOpen}
        onClose={() => setIsAddUserDialogOpen(false)}
        onSubmit={handleAddUser}
        newUser={newUser}
        setNewUser={setNewUser}
        availableRoles={availableRoles}
        loading={loading}
      />
    </>
  );
};

export default UsersTab;
