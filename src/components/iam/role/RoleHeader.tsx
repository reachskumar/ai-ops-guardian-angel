
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface RoleHeaderProps {
  onAddRole: () => void;
}

const RoleHeader: React.FC<RoleHeaderProps> = ({ onAddRole }) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">Role Management</h2>
      <Button size="sm" onClick={onAddRole}>
        <Plus className="h-4 w-4 mr-2" />
        Add Role
      </Button>
    </div>
  );
};

export default RoleHeader;
