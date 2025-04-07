
import React from "react";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { Profile } from "@/types/user";
import UserManagementTable from "./UserManagementTable";
import { UserRole } from "@/services/authService";

interface UserManagementCardProps {
  profiles: Profile[];
  loading: boolean;
  updateUserRole: (id: string, role: UserRole) => Promise<void>;
}

const UserManagementCard: React.FC<UserManagementCardProps> = ({
  profiles,
  loading,
  updateUserRole,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-500" />
          <CardTitle>User Management</CardTitle>
        </div>
        <CardDescription>
          Manage user roles and permissions across the entire application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UserManagementTable
          profiles={profiles}
          loading={loading}
          updateUserRole={updateUserRole}
        />
      </CardContent>
    </Card>
  );
};

export default UserManagementCard;
