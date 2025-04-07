
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/services/authService";

interface RoleLabelProps {
  role: UserRole;
  size?: 'sm' | 'md';
}

const RoleLabel: React.FC<RoleLabelProps> = ({ role, size = 'md' }) => {
  const getRoleConfig = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return { label: 'Admin', classes: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'developer':
        return { label: 'Developer', classes: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'operator':
        return { label: 'Operator', classes: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'viewer':
        return { label: 'Viewer', classes: 'bg-slate-100 text-slate-800 border-slate-300' };
      default:
        return { label: role, classes: 'bg-gray-100 text-gray-800 border-gray-300' };
    }
  };

  const { label, classes } = getRoleConfig(role);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs';

  return (
    <Badge variant="outline" className={`${classes} ${sizeClasses}`}>
      {label}
    </Badge>
  );
};

export default RoleLabel;
