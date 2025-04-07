
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { UserCheck, UserX, Shield, ChevronDown } from "lucide-react";
import { Profile } from "@/types/user";
import { LoadingSpinner } from "./LoadingSpinner";
import { EmptyUsers } from "./EmptyUsers";
import { RoleLabel } from "@/components/teams";
import { UserRole } from "@/services/authService";

interface UserManagementTableProps {
  profiles: Profile[];
  loading: boolean;
  updateUserRole: (id: string, role: UserRole) => Promise<void>;
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({
  profiles,
  loading,
  updateUserRole,
}) => {
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const handleRoleUpdate = async (userId: string, role: UserRole) => {
    setUpdatingUserId(userId);
    try {
      await updateUserRole(userId, role);
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (profiles.length === 0) {
    return <EmptyUsers />;
  }

  const availableRoles: UserRole[] = ['admin', 'developer', 'operator', 'viewer'];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-4">Name</th>
            <th className="text-left py-2 px-4">Username</th>
            <th className="text-left py-2 px-4">Role</th>
            <th className="text-right py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((profile) => (
            <tr key={profile.id} className="border-b hover:bg-muted/50">
              <td className="py-3 px-4">
                {profile.full_name || "No name"}
              </td>
              <td className="py-3 px-4">
                {profile.username || "No username"}
              </td>
              <td className="py-3 px-4">
                <RoleLabel role={(profile.role || 'viewer') as UserRole} />
              </td>
              <td className="py-3 px-4 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-2"
                      disabled={updatingUserId === profile.id}
                    >
                      {updatingUserId === profile.id ? (
                        <div className="animate-spin h-4 w-4 border-2 border-foreground/50 rounded-full border-t-transparent" />
                      ) : (
                        <>
                          Change Role <ChevronDown className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {availableRoles.map((role) => (
                      <DropdownMenuItem 
                        key={role}
                        onClick={() => handleRoleUpdate(profile.id, role)}
                        disabled={profile.role === role}
                        className="flex items-center gap-2"
                      >
                        <RoleLabel role={role} size="sm" />
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagementTable;
