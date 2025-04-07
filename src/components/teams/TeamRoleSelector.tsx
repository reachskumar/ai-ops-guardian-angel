
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { UserRole } from "@/services/authService";
import RoleLabel from "./RoleLabel";

interface TeamRoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
}

const TeamRoleSelector: React.FC<TeamRoleSelectorProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const roles: UserRole[] = ["admin", "developer", "operator", "viewer"];
  
  const handleChange = (newRole: string) => {
    onChange(newRole as UserRole);
  };
  
  return (
    <Select 
      value={value} 
      onValueChange={handleChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        {roles.map(role => (
          <SelectItem key={role} value={role}>
            <div className="flex items-center">
              <RoleLabel role={role} size="sm" />
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TeamRoleSelector;
