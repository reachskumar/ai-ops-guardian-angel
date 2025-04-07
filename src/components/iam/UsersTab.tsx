
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, ChevronDown, UserMinus } from "lucide-react";
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
import { Profile } from "@/types/user";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">User Management</h2>
        <Button size="sm" onClick={() => setIsAddUserDialogOpen(true)}>
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
                  <th className="text-left p-4">Username</th>
                  <th className="text-left p-4">Role</th>
                  <th className="text-left p-4">Last Login</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                      </div>
                    </td>
                  </tr>
                ) : displayedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : (
                  displayedUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      className={`border-b hover:bg-muted/50 ${deactivatedUsers.has(user.id) ? 'opacity-50' : ''}`}
                    >
                      <td className="p-4">{user.full_name || "No name"}</td>
                      <td className="p-4">{user.username || user.email || "No username"}</td>
                      <td className="p-4">
                        <RoleLabel role={(user.role || 'viewer').toLowerCase() as UserRole} />
                      </td>
                      <td className="p-4">{user.last_login || "Never"}</td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              disabled={updatingUserId === user.id || deactivatedUsers.has(user.id)}
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
                                disabled={user.role === role}
                                className="flex items-center gap-2"
                              >
                                <RoleLabel role={role} size="sm" />
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500"
                          onClick={() => handleDeactivateUser(user.id)}
                          disabled={deactivatedUsers.has(user.id)}
                        >
                          <UserMinus className="h-4 w-4 mr-1" />
                          Deactivate
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddUser} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  placeholder="johndoe"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                placeholder="john.doe@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value as UserRole})}
              >
                {availableRoles.map(role => (
                  <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                ))}
              </select>
            </div>
            <DialogFooter className="sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddUserDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-background rounded-full border-t-transparent" />
                ) : (
                  "Add User"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UsersTab;
