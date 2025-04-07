
import React from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface UserHeaderProps {
  onAddUser: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({ onAddUser }) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">User Management</h2>
      <Button size="sm" onClick={onAddUser}>
        <UserPlus className="h-4 w-4 mr-2" />
        Add User
      </Button>
    </div>
  );
};

export default UserHeader;
