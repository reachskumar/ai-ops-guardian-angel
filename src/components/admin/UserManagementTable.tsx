
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, UserX } from "lucide-react";
import { Profile } from "@/types/user";
import { LoadingSpinner } from "./LoadingSpinner";
import { EmptyUsers } from "./EmptyUsers";

interface UserManagementTableProps {
  profiles: Profile[];
  loading: boolean;
  makeAdmin: (id: string) => Promise<void>;
  removeAdmin: (id: string) => Promise<void>;
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({
  profiles,
  loading,
  makeAdmin,
  removeAdmin,
}) => {
  if (loading) {
    return <LoadingSpinner />;
  }

  if (profiles.length === 0) {
    return <EmptyUsers />;
  }

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
                {profile.role === "admin" ? (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                    Admin
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-slate-100">
                    User
                  </Badge>
                )}
              </td>
              <td className="py-3 px-4 text-right">
                {profile.role === "admin" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeAdmin(profile.id)}
                    className="flex items-center gap-1 text-red-500 border-red-200 hover:bg-red-50"
                  >
                    <UserX className="h-4 w-4" />
                    Remove Admin
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => makeAdmin(profile.id)}
                    className="flex items-center gap-1"
                  >
                    <UserCheck className="h-4 w-4" />
                    Make Admin
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagementTable;
