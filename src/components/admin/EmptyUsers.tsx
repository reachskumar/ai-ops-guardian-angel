
import React from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyUsersProps {
  onAddUser?: () => void;
}

export const EmptyUsers: React.FC<EmptyUsersProps> = ({ onAddUser }) => (
  <div className="flex flex-col items-center justify-center py-10">
    <div className="bg-muted/50 p-4 rounded-full mb-4">
      <UserPlus className="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-medium mb-2">No users found</h3>
    <p className="text-muted-foreground text-center mb-4 max-w-md">
      Start by adding users to manage their roles and permissions across the entire application.
    </p>
    {onAddUser && (
      <Button onClick={onAddUser} size="sm">
        <UserPlus className="h-4 w-4 mr-2" />
        Add User
      </Button>
    )}
  </div>
);
