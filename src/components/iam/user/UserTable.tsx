
import React from "react";
import { UserMinus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { RoleLabel } from "@/components/teams";
import { UserRole } from "@/services/authService";
import { Profile } from "@/types/user";

interface UserTableProps {
  displayedUsers: Profile[];
  updatingUserId: string | null;
  deactivatedUsers: Set<string>;
  handleRoleUpdate: (userId: string, role: UserRole) => void;
  handleDeactivateUser: (userId: string) => void;
  availableRoles: UserRole[];
  loading: boolean;
}

const UserTable: React.FC<UserTableProps> = ({
  displayedUsers,
  updatingUserId,
  deactivatedUsers,
  handleRoleUpdate,
  handleDeactivateUser,
  availableRoles,
  loading,
}) => {
  if (loading) {
    return (
      <tr>
        <td colSpan={5} className="text-center py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
          </div>
        </td>
      </tr>
    );
  }

  if (displayedUsers.length === 0) {
    return (
      <tr>
        <td colSpan={5} className="text-center py-8 text-muted-foreground">
          No users found
        </td>
      </tr>
    );
  }

  return (
    <>
      {displayedUsers.map((user) => (
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
      ))}
    </>
  );
};

export default UserTable;
