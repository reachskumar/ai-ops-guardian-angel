
import React from "react";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { Profile } from "@/types/user";
import UserManagementTable from "./UserManagementTable";

interface UserManagementCardProps {
  profiles: Profile[];
  loading: boolean;
  makeAdmin: (id: string) => Promise<void>;
  removeAdmin: (id: string) => Promise<void>;
}

const UserManagementCard: React.FC<UserManagementCardProps> = ({
  profiles,
  loading,
  makeAdmin,
  removeAdmin,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-500" />
          <CardTitle>User Management</CardTitle>
        </div>
        <CardDescription>
          Manage user roles and permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UserManagementTable
          profiles={profiles}
          loading={loading}
          makeAdmin={makeAdmin}
          removeAdmin={removeAdmin}
        />
      </CardContent>
    </Card>
  );
};

export default UserManagementCard;
