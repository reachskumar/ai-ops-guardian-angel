
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";

type RoleRequirement = 'admin' | 'developer' | 'operator' | 'viewer' | undefined;

interface AdminRouteProps {
  children: React.ReactNode;
  requiredRole?: RoleRequirement;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children, 
  requiredRole = 'admin' 
}) => {
  const { user, loading, profile } = useAuth();

  // Check user role against required role
  const hasRequiredRole = () => {
    const roleHierarchy = ['viewer', 'operator', 'developer', 'admin'];
    
    if (!profile?.role || !requiredRole) {
      return false;
    }
    
    const userRoleIndex = roleHierarchy.indexOf(profile.role);
    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
    
    return userRoleIndex >= requiredRoleIndex;
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !hasRequiredRole()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
