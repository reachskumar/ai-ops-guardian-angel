
import { UserRole } from "@/services/authService";

// Permission levels for resources
export type ResourcePermissionLevel = 'view' | 'edit' | 'manage' | 'admin';

// Mapping of roles to permission levels
const rolePermissionMap: Record<UserRole, ResourcePermissionLevel> = {
  'admin': 'admin',
  'developer': 'edit',
  'operator': 'manage',
  'viewer': 'view'
};

// Check if user has permission to perform an action on a resource
export const hasResourcePermission = (
  userRole: UserRole | undefined,
  requiredLevel: ResourcePermissionLevel
): boolean => {
  if (!userRole) return false;
  
  const permissionLevels = ['view', 'edit', 'manage', 'admin'];
  const userPermissionLevel = rolePermissionMap[userRole];
  
  const userLevelIndex = permissionLevels.indexOf(userPermissionLevel);
  const requiredLevelIndex = permissionLevels.indexOf(requiredLevel);
  
  // User has permission if their level is equal or higher than required
  return userLevelIndex >= requiredLevelIndex;
};

// Check if user is a team admin
export const isTeamAdmin = (userRole: UserRole | undefined): boolean => {
  return userRole === 'admin';
};

// Get permissions for UI display
export const getUserResourcePermissions = (userRole: UserRole | undefined): {
  canView: boolean;
  canEdit: boolean;
  canManage: boolean;
  canAdmin: boolean;
} => {
  return {
    canView: hasResourcePermission(userRole, 'view'),
    canEdit: hasResourcePermission(userRole, 'edit'),
    canManage: hasResourcePermission(userRole, 'manage'),
    canAdmin: hasResourcePermission(userRole, 'admin')
  };
};
